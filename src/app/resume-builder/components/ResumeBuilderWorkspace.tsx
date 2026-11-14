"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Cloud,
  Download,
  Eye,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  PenLine,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  DEFAULT_SECTION_ORDER,
  FRESHER_SECTION_ORDER,
  type ResumeData,
  type ResumeFontFamily,
  type ResumeSectionKey,
  type SavedResumeRecord,
  SECTION_LABELS,
  createEmptyResumeData,
  createId,
} from "@/lib/resume/types";
import {
  buildResumeFilename,
  hasCertificationContent,
  hasEducationContent,
  hasExperienceContent,
  hasOptionalSectionContent,
  hasProjectContent,
  sanitizeResumeData,
  validateResumeData,
} from "@/lib/resume/validation";
import ResumePreview from "./ResumePreview";
import AtsCheckerPanel from "./AtsCheckerPanel";
import RecruiterReviewModal from "./RecruiterReviewModal";
import AiSidekickDrawer from "./AiSidekickDrawer";
import AiReviewCard, { type AiPendingSuggestion } from "./AiReviewCard";
import SavedResumesModal from "./SavedResumesModal";
import ResumeUploadModal from "./ResumeUploadModal";
import {
  OrderedSectionEditor,
  PersonalSectionEditor,
} from "./SectionEditors";
import Modal from "@/app/components/Modal";
import {
  analyzeResumeForAts,
  applyAtsCorrectionToResume,
  type AtsCheckAction,
} from "@/lib/resume/ats-checker";

const LOCAL_DRAFT_KEY = "zenoway_ats_resume_draft_v1";

type DesktopTab = "build" | "ats";
type MobileTab = "build" | "ats" | "preview";

interface StoredLocalDraft {
  title: string;
  targetJobDescription: string;
  data: ResumeData;
  activeResumeId: string | null;
  updatedAt: string;
}

const SECTION_SHORT_LABELS: Record<"personal" | ResumeSectionKey, string> = {
  personal: "Personal",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  optional: "Additional",
};

export default function ResumeBuilderWorkspace() {
  const { user, profile } = useAuth();

  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [resumeData, setResumeData] = useState<ResumeData>(createEmptyResumeData);
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [desktopTab, setDesktopTab] = useState<DesktopTab>("build");
  const [mobileTab, setMobileTab] = useState<MobileTab>("build");
  const [activeNavSection, setActiveNavSection] = useState<"personal" | ResumeSectionKey>("personal");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    optional: true,
  });

  // Validation & Export states
  const [showExportErrors, setShowExportErrors] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSidekickOpen, setIsSidekickOpen] = useState(false);
  const [dismissedCheckIds, setDismissedCheckIds] = useState<Set<string>>(new Set());

  // Cloud persistence states
  const [savedResumes, setSavedResumes] = useState<SavedResumeRecord[]>([]);
  const [loadingSavedList, setLoadingSavedList] = useState(false);
  const [savedListError, setSavedListError] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<string | null>(null);

  // AI states
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiLoadingKey, setAiLoadingKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] =
    useState<AiPendingSuggestion | null>(null);

  const editorScrollRef = useRef<HTMLDivElement>(null);

  // 1. Hydrate local browser draft once on mount
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<StoredLocalDraft>;
          const sanitized = sanitizeResumeData(parsed.data);
          if (sanitized.ok) {
            setResumeData(sanitized.data);
            if (typeof parsed.title === "string" && parsed.title.trim()) {
              setResumeTitle(parsed.title.slice(0, 120));
            }
            if (typeof parsed.targetJobDescription === "string") {
              setTargetJobDescription(parsed.targetJobDescription.slice(0, 8000));
            }
            if (typeof parsed.activeResumeId === "string" || parsed.activeResumeId === null) {
              setActiveResumeId(parsed.activeResumeId);
            }
          }
        }
      } catch {
        // Ignore invalid localStorage payload
      } finally {
        if (active) setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // 2. Persist local draft automatically
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: StoredLocalDraft = {
        title: resumeTitle,
        targetJobDescription,
        data: resumeData,
        activeResumeId,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
    } catch {
      // localStorage quota exceeded or disabled
    }
  }, [hydrated, resumeTitle, targetJobDescription, resumeData, activeResumeId]);

  // 3. Check server AI capability
  useEffect(() => {
    fetch("/api/resume/ai")
      .then((res) => res.json())
      .then((json: { configured?: boolean }) => {
        setAiConfigured(Boolean(json?.configured));
      })
      .catch(() => {
        setAiConfigured(false);
      });
  }, []);

  // 4. Fetch cloud-saved resumes when signed in
  const fetchSavedResumes = useCallback(async () => {
    await Promise.resolve();
    if (!user) {
      setSavedResumes([]);
      setSavedListError(null);
      setMigrationRequired(false);
      return;
    }

    setLoadingSavedList(true);
    setSavedListError(null);
    try {
      const res = await fetch("/api/resumes", { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as {
        resumes?: SavedResumeRecord[];
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (json.code === "MIGRATION_REQUIRED") {
          setMigrationRequired(true);
        } else {
          setSavedListError(json.error || "Could not load saved resumes.");
        }
        return;
      }

      setMigrationRequired(false);
      setSavedResumes(Array.isArray(json.resumes) ? json.resumes : []);
    } catch {
      setSavedListError("Network error while loading saved resumes.");
    } finally {
      setLoadingSavedList(false);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        void fetchSavedResumes();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchSavedResumes]);

  // Real-time validation & ATS check
  const validation = useMemo(
    () =>
      validateResumeData(resumeData, {
        requireContactForExport: showExportErrors,
      }),
    [resumeData, showExportErrors]
  );

  const atsAnalysis = useMemo(
    () => analyzeResumeForAts(resumeData, targetJobDescription),
    [resumeData, targetJobDescription]
  );

  // Section completion & progress calculation
  const sectionStates = useMemo(() => {
    const personalReady = Boolean(
      resumeData.personal.firstName.trim() &&
        resumeData.personal.lastName.trim() &&
        resumeData.personal.email.trim()
    );
    const states: Record<"personal" | ResumeSectionKey, boolean> = {
      personal: personalReady,
      summary: Boolean(resumeData.summary.trim()),
      experience: resumeData.experience.some(hasExperienceContent),
      education: resumeData.education.some(hasEducationContent),
      skills: resumeData.skills.some((g) => g.items.length > 0),
      projects: resumeData.projects.some(hasProjectContent),
      certifications: resumeData.certifications.some(hasCertificationContent),
      optional: resumeData.optionalSections.some(hasOptionalSectionContent),
    };
    const coreCount = [
      states.personal,
      states.summary,
      states.experience || states.projects,
      states.education,
      states.skills,
    ].filter(Boolean).length;
    const progressPct = Math.round((coreCount / 5) * 100);
    return { states, coreCount, progressPct };
  }, [resumeData]);

  const hasExistingData = useMemo(
    () =>
      Boolean(
        resumeData.personal.firstName.trim() ||
          resumeData.personal.lastName.trim() ||
          resumeData.personal.email.trim() ||
          resumeData.summary.trim() ||
          resumeData.experience.length > 0 ||
          resumeData.education.length > 0 ||
          resumeData.skills.length > 0
      ),
    [resumeData]
  );

  const updateResumeData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setResumeData((prev) => updater(prev));
    setIsDirty(true);
  }, []);

  const jumpToSection = useCallback((section: "personal" | ResumeSectionKey) => {
    setDesktopTab("build");
    setMobileTab("build");
    setActiveNavSection(section);
    setOpenSections((prev) => ({ ...prev, [section]: true }));

    setTimeout(() => {
      const target = document.getElementById(`section-${section}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  }, []);

  const moveTopSection = (index: number, dir: -1 | 1) => {
    updateResumeData((prev) => {
      const nextIndex = index + dir;
      if (nextIndex < 0 || nextIndex >= prev.sectionOrder.length) return prev;
      const order = [...prev.sectionOrder];
      const [moved] = order.splice(index, 1);
      order.splice(nextIndex, 0, moved);
      return { ...prev, sectionOrder: order };
    });
  };

  const isFresherOrder = useMemo(() => {
    const order = resumeData.sectionOrder;
    const eduIdx = order.indexOf("education");
    const expIdx = order.indexOf("experience");
    return eduIdx !== -1 && expIdx !== -1 && eduIdx < expIdx;
  }, [resumeData.sectionOrder]);

  const applyProfileOrder = (profileType: "experienced" | "fresher") => {
    const targetOrder =
      profileType === "fresher" ? FRESHER_SECTION_ORDER : DEFAULT_SECTION_ORDER;
    updateResumeData((prev) => ({
      ...prev,
      sectionOrder: [...targetOrder],
    }));
    toast.success(
      profileType === "fresher"
        ? "Applied Student / Fresher structure (Education & Projects prioritized)"
        : "Applied Standard structure (Summary, Skills & Experience prioritized)"
    );
  };

  const handleFontChange = (fontFamily: ResumeFontFamily) => {
    setResumeData((prev) => ({ ...prev, fontFamily }));
    setIsDirty(true);
  };

  // Prefill from Zenoway candidate profile (only fills blank fields)
  const handlePrefillFromProfile = () => {
    if (!user) return;
    const rawName =
      profile?.full_name ||
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "") ||
      "";
    const nameParts = rawName.trim().split(/\s+/).filter(Boolean);
    const first = nameParts[0] || "";
    const last = nameParts.slice(1).join(" ");

    updateResumeData((prev) => {
      const existingLinks = [...prev.personal.links];
      const existingUrls = new Set(existingLinks.map((l) => l.url.trim().toLowerCase()));
      const maybeAddLink = (label: string, url?: string | null) => {
        if (url?.trim() && !existingUrls.has(url.trim().toLowerCase())) {
          existingLinks.push({ id: createId("lnk"), label, url: url.trim() });
          existingUrls.add(url.trim().toLowerCase());
        }
      };
      maybeAddLink("LinkedIn", profile?.linkedin_url);
      maybeAddLink("GitHub", profile?.github_url);
      maybeAddLink("Portfolio", profile?.portfolio_url);

      const nextSkills = [...prev.skills];
      if (
        profile?.skills &&
        profile.skills.length > 0 &&
        !nextSkills.some((g) => g.items.length > 0)
      ) {
        nextSkills.push({
          id: createId("skill"),
          category: "Core Skills",
          items: profile.skills.filter(Boolean),
        });
      }

      return {
        ...prev,
        personal: {
          ...prev.personal,
          firstName: prev.personal.firstName || first,
          lastName: prev.personal.lastName || last,
          headline: prev.personal.headline || profile?.headline || "",
          email: prev.personal.email || profile?.email || user.email || "",
          phone: prev.personal.phone || profile?.phone || "",
          city: prev.personal.city || profile?.location || "",
          links: existingLinks,
        },
        summary: prev.summary || profile?.summary || "",
        skills: nextSkills,
      };
    });

    toast.success("Imported available details from your Zenoway profile.");
  };

  const handleApplyAtsCorrection = (action: AtsCheckAction) => {
    updateResumeData((prev) => applyAtsCorrectionToResume(prev, action));
    toast.success(`Applied: ${action.label}`);
  };

  const handleDismissCheck = (checkId: string) => {
    setDismissedCheckIds((prev) => new Set([...prev, checkId]));
  };

  const handleUndismissCheck = (checkId: string) => {
    setDismissedCheckIds((prev) => {
      const next = new Set(prev);
      next.delete(checkId);
      return next;
    });
  };

  // Download selectable A4 PDF directly (unblocked by ATS warnings)
  const handleDownloadPdf = async () => {
    setShowExportErrors(true);
    const exportCheck = validateResumeData(resumeData, {
      requireContactForExport: true,
    });

    if (!exportCheck.valid) {
      const firstIssue = exportCheck.issues[0];
      toast.error(firstIssue.message);
      jumpToSection(firstIssue.section);
      return;
    }

    await executeDownloadPdf();
  };

  const [isRecheckingAudit, setIsRecheckingAudit] = useState(false);
  const handleManualAuditRecheck = () => {
    setIsRecheckingAudit(true);
    setTimeout(() => {
      setIsRecheckingAudit(false);
      const errors = atsAnalysis.counts.errors;
      const warnings = atsAnalysis.counts.warnings;
      if (errors === 0 && warnings === 0) {
        toast.success("Resume audit up to date: No issues found!", { id: "recheck-toast" });
      } else {
        toast(
          `Resume audit up to date: Found ${autoFixCount} quick fix(es) and ${errors + warnings} recommendation(s).`,
          { icon: "🔍", id: "recheck-toast" }
        );
      }
    }, 350);
  };

  const executeDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resumeTitle,
          data: resumeData,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(errJson?.error || "Could not export PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildResumeFilename(resumeData.personal, resumeTitle);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Recruiter-grade ATS PDF downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Save to authenticated Supabase account
  const handleSaveCloud = async () => {
    if (!user) {
      toast.error("Sign in with Google to save resumes to your Zenoway account.");
      return;
    }

    setIsSavingCloud(true);
    try {
      const endpoint = activeResumeId
        ? `/api/resumes/${activeResumeId}`
        : "/api/resumes";
      const method = activeResumeId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resumeTitle.trim() || "Untitled Resume",
          template: "classic-ats",
          data: resumeData,
          targetJobDescription,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        resume?: SavedResumeRecord;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (json.code === "MIGRATION_REQUIRED") {
          setMigrationRequired(true);
        }
        throw new Error(json.error || "Could not save resume.");
      }

      if (json.resume) {
        setActiveResumeId(json.resume.id);
        setResumeTitle(json.resume.title);
        setIsDirty(false);
        setLastCloudSavedAt(json.resume.updatedAt);
        setMigrationRequired(false);
        await fetchSavedResumes();
        toast.success("Resume saved to your Zenoway account.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save resume.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Delete cloud resume or reset local draft
  const handleDeleteCloudResume = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete resume.");
      }

      if (activeResumeId === id) {
        setActiveResumeId(null);
        setLastCloudSavedAt(null);
      }
      await fetchSavedResumes();
      toast.success("Saved resume deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadSavedResume = (record: SavedResumeRecord) => {
    setActiveResumeId(record.id);
    setResumeTitle(record.title);
    setResumeData(record.data);
    setTargetJobDescription(record.targetJobDescription);
    setLastCloudSavedAt(record.updatedAt);
    setIsDirty(false);
    setShowExportErrors(false);
    setPendingSuggestion(null);
    toast.success(`Loaded "${record.title}".`);
  };

  const handleCreateNewBlank = () => {
    setActiveResumeId(null);
    setResumeTitle("Untitled Resume");
    setResumeData(createEmptyResumeData());
    setTargetJobDescription("");
    setLastCloudSavedAt(null);
    setIsDirty(false);
    setShowExportErrors(false);
    setPendingSuggestion(null);
    setAiError(null);
    try {
      localStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch {
      // Ignore
    }
  };

  const handleApplyUploadedResume = (
    parsedData: ResumeData,
    detectedTitle?: string,
    mode: "replace" | "merge" = "replace"
  ) => {
    if (mode === "replace") {
      setResumeData(parsedData);
      if (detectedTitle?.trim()) {
        setResumeTitle(detectedTitle.trim());
      }
      setActiveResumeId(null);
      setLastCloudSavedAt(null);
      setIsDirty(true);
      setShowExportErrors(false);
      setPendingSuggestion(null);
      setAiError(null);
      toast.success("Resume imported successfully! All sections are ready to review and edit.");
    } else {
      updateResumeData((prev) => {
        const next: ResumeData = {
          ...prev,
          personal: {
            ...prev.personal,
            firstName: prev.personal.firstName.trim() || parsedData.personal.firstName,
            lastName: prev.personal.lastName.trim() || parsedData.personal.lastName,
            headline: prev.personal.headline.trim() || parsedData.personal.headline,
            email: prev.personal.email.trim() || parsedData.personal.email,
            phone: prev.personal.phone.trim() || parsedData.personal.phone,
            city: prev.personal.city.trim() || parsedData.personal.city,
            links: [...prev.personal.links],
          },
          experience: [...prev.experience],
          education: [...prev.education],
          skills: [...prev.skills],
          projects: [...prev.projects],
          certifications: [...prev.certifications],
          optionalSections: [...prev.optionalSections],
          sectionOrder: [...prev.sectionOrder],
        };

        const existingUrls = new Set(next.personal.links.map((l) => l.url.trim().toLowerCase()));
        parsedData.personal.links.forEach((link) => {
          if (link.url && !existingUrls.has(link.url.trim().toLowerCase())) {
            next.personal.links.push(link);
            existingUrls.add(link.url.trim().toLowerCase());
          }
        });

        if (!next.summary.trim() && parsedData.summary.trim()) {
          next.summary = parsedData.summary;
        }

        if (parsedData.experience.length > 0) {
          next.experience.push(...parsedData.experience);
        }

        if (parsedData.education.length > 0) {
          next.education.push(...parsedData.education);
        }

        parsedData.skills.forEach((g) => {
          const match = next.skills.find(
            (eg) => eg.category.trim().toLowerCase() === g.category.trim().toLowerCase()
          );
          if (match) {
            const itemSet = new Set(match.items.map((i) => i.trim().toLowerCase()));
            g.items.forEach((item) => {
              if (item.trim() && !itemSet.has(item.trim().toLowerCase())) {
                match.items.push(item);
                itemSet.add(item.trim().toLowerCase());
              }
            });
          } else if (g.items.length > 0) {
            next.skills.push(g);
          }
        });

        if (parsedData.projects.length > 0) {
          next.projects.push(...parsedData.projects);
        }

        if (parsedData.certifications.length > 0) {
          next.certifications.push(...parsedData.certifications);
        }

        if (parsedData.optionalSections.length > 0) {
          next.optionalSections.push(...parsedData.optionalSections);
        }

        return next;
      });
      toast.success("Resume merged into current draft!");
    }

    setDesktopTab("build");
    setMobileTab("build");
    setActiveNavSection("personal");
    setOpenSections({
      personal: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      optional: true,
    });

    setTimeout(() => {
      editorScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  };

  // AI Assistance Handler
  const callAiAssistant = async (
    action: "improve-summary" | "rewrite-bullets" | "suggest-skills" | "tailor-to-jd",
    extra: { experienceId?: string; roleLabel?: string } = {}
  ) => {
    const loadingKey =
      action === "rewrite-bullets" && extra.experienceId
        ? `rewrite:${extra.experienceId}`
        : action;

    setAiLoadingKey(loadingKey);
    setAiError(null);

    try {
      const res = await fetch("/api/resume/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          data: resumeData,
          experienceId: extra.experienceId,
          jobDescription: targetJobDescription,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        suggestion?: Record<string, unknown>;
      };

      if (!res.ok || !json.success || !json.suggestion) {
        throw new Error(json.error || "AI suggestion request failed.");
      }

      if (action === "improve-summary") {
        setPendingSuggestion({
          type: "improve-summary",
          suggestedSummary: String(json.suggestion.suggestedSummary || ""),
          rationale: String(json.suggestion.rationale || ""),
        });
      } else if (action === "rewrite-bullets" && extra.experienceId) {
        setPendingSuggestion({
          type: "rewrite-bullets",
          experienceId: extra.experienceId,
          roleLabel: extra.roleLabel || "Experience",
          bullets: Array.isArray(json.suggestion.bullets)
            ? json.suggestion.bullets.map(String)
            : [],
          note: String(json.suggestion.note || ""),
        });
      } else if (action === "suggest-skills") {
        setPendingSuggestion({
          type: "suggest-skills",
          suggestedSkills: Array.isArray(json.suggestion.suggestedSkills)
            ? json.suggestion.suggestedSkills.map(String)
            : [],
          rationale: String(json.suggestion.rationale || ""),
        });
      } else if (action === "tailor-to-jd") {
        setPendingSuggestion({
          type: "tailor-to-jd",
          summarySuggestion: String(json.suggestion.summarySuggestion || ""),
          experienceSuggestions: Array.isArray(json.suggestion.experienceSuggestions)
            ? (json.suggestion.experienceSuggestions as Array<{
                experienceId: string;
                roleLabel: string;
                suggestedBullets: string[];
              }>)
            : [],
          alignmentNotes: Array.isArray(json.suggestion.alignmentNotes)
            ? json.suggestion.alignmentNotes.map(String)
            : [],
          missingRequirementsToVerify: Array.isArray(
            json.suggestion.missingRequirementsToVerify
          )
            ? json.suggestion.missingRequirementsToVerify.map(String)
            : [],
        });
        setDesktopTab("build");
        setMobileTab("build");
      }

      editorScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not reach AI assistant.";
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoadingKey(null);
    }
  };

  const atsBadgeCount = atsAnalysis.counts.errors + atsAnalysis.counts.warnings;
  const autoFixCount = atsAnalysis.checks.filter(
    (c) =>
      c.action?.type === "replace-text" &&
      typeof c.action.replacementText === "string"
  ).length;

  return (
    <div className="min-h-full bg-surface-page text-text-primary lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
      {/* Top Workspace Toolbar */}
      <div className="shrink-0 border-b border-border-default bg-surface-card px-4 py-3 sm:px-6">
        <div className="mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Title & Storage Status */}
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                <FileText size={16} />
              </span>
              <input
                type="text"
                value={resumeTitle}
                maxLength={120}
                onChange={(e) => {
                  setResumeTitle(e.target.value);
                  setIsDirty(true);
                }}
                aria-label="Resume document title"
                placeholder="Untitled Resume"
                className="min-w-0 max-w-[240px] rounded-control border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-text-primary outline-none transition-colors hover:border-border-default focus:border-brand focus:bg-surface-base"
              />
            </div>

            {user ? (
              migrationRequired ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-status-warning-border bg-status-warning-bg px-2.5 py-1 text-[11px] font-medium text-status-warning">
                  <HardDrive size={12} />
                  Local draft (DB migration pending)
                </span>
              ) : activeResumeId && !isDirty ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-status-success-border bg-status-success-bg px-2.5 py-1 text-[11px] font-medium text-brand">
                  <Cloud size={12} />
                  Saved to account
                  {lastCloudSavedAt ? "" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-border-default bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                  <HardDrive size={12} />
                  {activeResumeId ? "Unsaved changes (local backup)" : "Local draft · not synced"}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-border-default bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                <HardDrive size={12} />
                Saved in this browser
              </span>
            )}
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:text-brand"
            >
              <Upload size={13} className="text-brand" />
              <span className="hidden sm:inline">Upload Resume</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {user && profile && (
              <button
                type="button"
                onClick={handlePrefillFromProfile}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
              >
                <UserCheck size={13} className="text-brand" />
                <span className="hidden sm:inline">Import Profile</span>
                <span className="sm:hidden">Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSavedModalOpen(true)}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <FolderOpen size={13} />
              <span>
                Saved{user && savedResumes.length > 0 ? ` (${savedResumes.length})` : ""}
              </span>
            </button>

            {user ? (
              <button
                type="button"
                disabled={isSavingCloud}
                onClick={handleSaveCloud}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-strong bg-surface-card px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingCloud ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>{activeResumeId ? "Save" : "Save to Account"}</span>
              </button>
            ) : (
              <Link
                href="/login?redirect=/resume-builder"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
              >
                <Cloud size={13} />
                <span>Sign in to save</span>
              </Link>
            )}

            {activeResumeId ? (
              <button
                type="button"
                disabled={deletingId === activeResumeId}
                onClick={() => handleDeleteCloudResume(activeResumeId)}
                aria-label="Delete active saved resume"
                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 text-xs font-medium text-text-muted transition-colors hover:border-status-error-border hover:bg-status-error-bg hover:text-status-error disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span className="hidden xl:inline">Delete</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                aria-label="Reset draft"
                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 text-xs font-medium text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
              >
                <RotateCcw size={13} />
                <span className="hidden xl:inline">Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleManualAuditRecheck}
              aria-label="Recheck resume"
              title="Recheck resume for spelling, dates, impact and layout"
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 text-xs font-medium text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <RefreshCw size={13} className={isRecheckingAudit ? "animate-spin text-brand" : ""} />
              <span className="hidden xl:inline">Recheck</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSidekickOpen((prev) => !prev)}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border px-3 text-xs font-semibold transition-colors ${
                isSidekickOpen
                  ? "border-brand bg-brand-soft text-brand shadow-2xs"
                  : "border-border-default bg-surface-card text-text-primary hover:border-brand hover:text-brand"
              }`}
              title="Toggle AI Sidekick, 1-Click Fixes & ATS Analysis"
            >
              <Sparkles size={14} className="text-brand" />
              <span className="hidden sm:inline">AI Sidekick</span>
              <span className="sm:hidden">Sidekick</span>
              <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
                {atsAnalysis.overallScore}%
              </span>
              {autoFixCount > 0 && (
                <span className="rounded-pill bg-brand px-1.5 py-0.5 text-[10px] font-bold text-text-inverse animate-pulse">
                  {autoFixCount} fix{autoFixCount > 1 ? "es" : ""}
                </span>
              )}
            </button>

            <button
              type="button"
              disabled={isExportingPdf}
              onClick={() => handleDownloadPdf()}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExportingPdf ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>{isExportingPdf ? "Exporting..." : "Download PDF"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Mode Switcher */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-control border border-border-default bg-surface-subtle p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("build")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-control py-2 text-xs font-semibold transition-colors ${
              mobileTab === "build"
                ? "bg-surface-card text-brand shadow-subtle"
                : "text-text-secondary"
            }`}
          >
            <PenLine size={13} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("ats")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-control py-2 text-xs font-semibold transition-colors ${
              mobileTab === "ats"
                ? "bg-surface-card text-brand shadow-subtle"
                : "text-text-secondary"
            }`}
          >
            <ShieldCheck size={13} />
            <span>ATS ({atsAnalysis.overallScore}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-control py-2 text-xs font-semibold transition-colors ${
              mobileTab === "preview"
                ? "bg-surface-card text-brand shadow-subtle"
                : "text-text-secondary"
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(440px,50%)_1fr] lg:overflow-hidden">
        {/* LEFT PANE: Form Editor & ATS Checker */}
        <div
          className={`${
            mobileTab === "preview" ? "hidden lg:flex" : "flex"
          } min-h-0 flex-col border-border-default bg-surface-base lg:border-r`}
        >
          {/* Desktop Sub-Tabs & Progress Header */}
          <div className="shrink-0 border-b border-border-subtle bg-surface-card px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Desktop Tabs */}
              <div className="hidden items-center gap-1 rounded-control border border-border-default bg-surface-subtle p-0.5 lg:inline-flex">
                <button
                  type="button"
                  onClick={() => setDesktopTab("build")}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-control px-3 py-1.5 text-xs font-semibold transition-colors ${
                    desktopTab === "build"
                      ? "bg-surface-card text-brand shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <PenLine size={13} />
                  Resume Editor
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopTab("ats")}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-control px-3 py-1.5 text-xs font-semibold transition-colors ${
                    desktopTab === "ats"
                      ? "bg-surface-card text-brand shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ShieldCheck size={13} />
                  Recruiter Review &amp; ATS
                  <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
                    {atsAnalysis.overallScore}%
                  </span>
                </button>
              </div>

              {/* Progress Readout */}
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-text-muted">Core sections</span>
                <div
                  className="h-1.5 w-24 overflow-hidden rounded-pill bg-surface-muted"
                  role="progressbar"
                  aria-valuenow={sectionStates.progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Core resume sections progress"
                >
                  <div
                    className="h-full bg-brand transition-all duration-200"
                    style={{ width: `${sectionStates.progressPct}%` }}
                  />
                </div>
                <span className="font-semibold text-text-primary">
                  {sectionStates.coreCount}/5
                </span>
              </div>
            </div>

            {/* Career Profile Preset Selector */}
            {(desktopTab === "build" || mobileTab === "build") && (
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-muted">
                <span>Section layout:</span>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyProfileOrder("experienced")}
                    className={`cursor-pointer rounded-pill px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      !isFresherOrder
                        ? "border border-border-default bg-surface-subtle font-semibold text-brand"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    title="Summary → Skills → Experience → Projects → Education"
                  >
                    Experienced
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => applyProfileOrder("fresher")}
                    className={`cursor-pointer rounded-pill px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      isFresherOrder
                        ? "border border-border-default bg-surface-subtle font-semibold text-brand"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    title="Summary → Education → Projects → Skills → Experience"
                  >
                    Student / Fresher
                  </button>
                </div>
              </div>
            )}

            {/* Section Jump Pills (visible when in Build mode) */}
            {(desktopTab === "build" || mobileTab === "build") && (
              <nav
                aria-label="Resume sections"
                className={`mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar ${
                  mobileTab === "ats" ? "hidden lg:flex" : ""
                } ${desktopTab === "ats" ? "lg:hidden" : ""}`}
              >
                {(["personal", ...resumeData.sectionOrder] as const).map((sec) => {
                  const filled = sectionStates.states[sec];
                  const hasIssue = validation.issues.some((i) => i.section === sec);
                  const active = activeNavSection === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => jumpToSection(sec)}
                      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          hasIssue
                            ? "bg-status-error"
                            : filled
                              ? "bg-brand"
                              : "bg-border-strong"
                        }`}
                      />
                      <span>{SECTION_SHORT_LABELS[sec]}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Left Pane Scrollable Body */}
          <div
            ref={editorScrollRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          >
            <div className="mx-auto max-w-2xl space-y-4 pb-8">
              {/* Quick Start / Upload Existing Resume Banner for fresh drafts */}
              {!hasExistingData && (
                <div className="rounded-card border border-brand/30 bg-brand-soft/40 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand text-text-inverse shadow-2xs">
                        <Upload size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">
                          Have an existing resume?
                        </h3>
                        <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
                          Upload your PDF, Word (.docx), or text resume to auto-fill your contact info, work history, and skills in seconds.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse shadow-subtle hover:bg-brand-hover transition-colors"
                    >
                      <Upload size={14} />
                      <span>Upload Resume</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Validation summary banner (only when triggered or explicit field error exists) */}
              {showExportErrors && !validation.valid && (
                <div
                  role="alert"
                  className="rounded-panel border border-status-error-border bg-status-error-bg p-3.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        size={15}
                        className="mt-0.5 shrink-0 text-status-error"
                      />
                      <div>
                        <p className="font-semibold text-status-error">
                          Fix these items before downloading your PDF:
                        </p>
                        <ul className="mt-1.5 space-y-1 text-text-primary">
                          {validation.issues.slice(0, 5).map((issue, idx) => (
                            <li key={idx}>
                              •{" "}
                              <button
                                type="button"
                                onClick={() => jumpToSection(issue.section)}
                                className="cursor-pointer underline underline-offset-2 hover:text-brand"
                              >
                                {issue.message}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExportErrors(false)}
                      aria-label="Dismiss validation notice"
                      className="cursor-pointer text-text-muted hover:text-text-primary"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* AI Error Banner */}
              {aiError && (
                <div
                  role="alert"
                  className="flex items-start justify-between gap-2 rounded-panel border border-status-error-border bg-status-error-bg p-3.5 text-xs text-status-error"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiError(null)}
                    aria-label="Dismiss AI error"
                    className="cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Pending AI Suggestion Review */}
              {pendingSuggestion && (
                <AiReviewCard
                  suggestion={pendingSuggestion}
                  onApplySummary={(summary) =>
                    updateResumeData((prev) => ({ ...prev, summary }))
                  }
                  onApplyExperienceBullets={(experienceId, bullets) =>
                    updateResumeData((prev) => ({
                      ...prev,
                      experience: prev.experience.map((exp) =>
                        exp.id === experienceId ? { ...exp, bullets } : exp
                      ),
                    }))
                  }
                  onApplySkills={(skillsToAdd) =>
                    updateResumeData((prev) => {
                      const existingLower = new Set(
                        prev.skills.flatMap((g) =>
                          g.items.map((s) => s.trim().toLowerCase())
                        )
                      );
                      const unique = skillsToAdd.filter(
                        (s) => !existingLower.has(s.toLowerCase())
                      );
                      if (unique.length === 0) return prev;
                      if (prev.skills.length === 0) {
                        return {
                          ...prev,
                          skills: [
                            {
                              id: createId("skill"),
                              category: "Technical & Professional Skills",
                              items: unique,
                            },
                          ],
                        };
                      }
                      const [first, ...rest] = prev.skills;
                      return {
                        ...prev,
                        skills: [
                          { ...first, items: [...first.items, ...unique] },
                          ...rest,
                        ],
                      };
                    })
                  }
                  onDismiss={() => setPendingSuggestion(null)}
                />
              )}

              {/* BUILD MODE */}
              <div
                className={
                  mobileTab === "ats"
                    ? "hidden lg:block"
                    : desktopTab === "ats"
                      ? "lg:hidden"
                      : "block"
                }
              >
                <div className="space-y-4">
                  {/* Privacy & AI Disclosure */}
                  <div className="flex items-start gap-2.5 rounded-card border border-border-subtle bg-surface-subtle px-3.5 py-2.5 text-[11px] leading-relaxed text-text-secondary">
                    <Sparkles size={13} className="mt-0.5 shrink-0 text-brand" />
                    <span>
                      {aiConfigured ? (
                        <>
                          <strong>Privacy & AI:</strong> Your edits stay in your browser
                          {user ? " (or your private account when saved)" : ""}. Resume
                          content is only sent to Google Gemini when you explicitly click
                          an AI button, and suggestions require your approval.
                        </>
                      ) : (
                        <>
                          <strong>Privacy:</strong> Your edits stay in your browser
                          {user ? " (or your private account when saved)" : ""}. You do
                          not need an account to build and download an ATS-friendly PDF.
                        </>
                      )}
                    </span>
                  </div>

                  <PersonalSectionEditor
                    data={resumeData}
                    onChange={updateResumeData}
                    errorsByKey={validation.byKey}
                    isOpen={openSections.personal ?? true}
                    onToggle={() =>
                      setOpenSections((p) => ({
                        ...p,
                        personal: !(p.personal ?? true),
                      }))
                    }
                  />

                  {resumeData.sectionOrder.map((sectionKey, index) => (
                    <OrderedSectionEditor
                      key={sectionKey}
                      sectionKey={sectionKey}
                      sectionIndex={index}
                      data={resumeData}
                      onChange={updateResumeData}
                      errorsByKey={validation.byKey}
                      openSections={openSections}
                      onToggleSection={(key) =>
                        setOpenSections((p) => ({
                          ...p,
                          [key]: !(p[key] ?? true),
                        }))
                      }
                      onMoveSection={moveTopSection}
                      aiConfigured={aiConfigured}
                      aiLoadingKey={aiLoadingKey}
                      onAiImproveSummary={() => callAiAssistant("improve-summary")}
                      onAiRewriteBullets={(experienceId) => {
                        const target = resumeData.experience.find(
                          (e) => e.id === experienceId
                        );
                        callAiAssistant("rewrite-bullets", {
                          experienceId,
                          roleLabel:
                            target?.jobTitle ||
                            target?.company ||
                            SECTION_LABELS.experience,
                        });
                      }}
                      onAiSuggestSkills={() => callAiAssistant("suggest-skills")}
                      atsChecks={atsAnalysis.checks}
                      onApplyCorrection={handleApplyAtsCorrection}
                    />
                  ))}
                </div>
              </div>

              {/* ATS CHECK MODE */}
              <div
                className={
                  mobileTab === "ats"
                    ? "block"
                    : desktopTab === "ats"
                      ? "hidden lg:block"
                      : "hidden"
                }
              >
                <AtsCheckerPanel
                  analysis={atsAnalysis}
                  jobDescription={targetJobDescription}
                  onJobDescriptionChange={(value) => {
                    setTargetJobDescription(value);
                    setIsDirty(true);
                  }}
                  onJumpToSection={jumpToSection}
                  onApplyCorrection={handleApplyAtsCorrection}
                  dismissedCheckIds={dismissedCheckIds}
                  onDismissCheck={handleDismissCheck}
                  onUndismissCheck={handleUndismissCheck}
                  aiConfigured={aiConfigured}
                  aiLoading={aiLoadingKey === "tailor-to-jd"}
                  onTailorWithAi={() => callAiAssistant("tailor-to-jd")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Live A4 Preview */}
        <div
          className={`${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          } min-h-0 h-full overflow-hidden`}
        >
          <ResumePreview
            data={resumeData}
            documentTitle={resumeTitle}
            onFontChange={handleFontChange}
          />
        </div>
      </div>

      {/* Recruiter Review Pre-Download Modal */}
      <RecruiterReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        analysis={atsAnalysis}
        onDownloadPdf={() => executeDownloadPdf()}
        isExportingPdf={isExportingPdf}
        onJumpToSection={jumpToSection}
        onApplyCorrection={handleApplyAtsCorrection}
      />

      {/* Saved Resumes Modal */}
      <SavedResumesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        isAuthenticated={Boolean(user)}
        isLoading={loadingSavedList}
        error={savedListError}
        migrationRequired={migrationRequired}
        resumes={savedResumes}
        activeResumeId={activeResumeId}
        deletingId={deletingId}
        onSelectResume={handleLoadSavedResume}
        onDeleteResume={handleDeleteCloudResume}
        onCreateNew={handleCreateNewBlank}
        onUploadResume={() => setIsUploadModalOpen(true)}
      />

      {/* Upload Existing Resume Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyResume={handleApplyUploadedResume}
        hasExistingData={hasExistingData}
      />

      {/* Reset Local Draft Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Reset resume draft?"
        description="This clears your current unsaved browser draft so you can start fresh."
        maxWidth="sm"
        bodyClassName="p-5"
      >
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setIsClearModalOpen(false)}
            className="inline-flex h-9 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              handleCreateNewBlank();
              setIsClearModalOpen(false);
              toast.success("Started a new blank resume draft.");
            }}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control bg-status-error px-4 text-xs font-semibold text-white hover:bg-red-700"
          >
            <Check size={13} />
            Reset draft
          </button>
        </div>
      </Modal>
      {/* AI Recruiter Sidekick Drawer */}
      <AiSidekickDrawer
        isOpen={isSidekickOpen}
        onClose={() => setIsSidekickOpen(false)}
        data={resumeData}
        onUpdateResumeData={updateResumeData}
        atsAnalysis={atsAnalysis}
        onJumpToSection={jumpToSection}
        onApplyCorrection={handleApplyAtsCorrection}
        targetJobDescription={targetJobDescription}
        onJobDescriptionChange={(text) => {
          setTargetJobDescription(text);
          setIsDirty(true);
        }}
        aiConfigured={aiConfigured}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        isExportingPdf={isExportingPdf}
      />
    </div>
  );
}

