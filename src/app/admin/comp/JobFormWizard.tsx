"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Banknote,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  X,
  Check,
  Sparkles,
  Wand2,
  ChevronDown,
  Zap,
  MapPin,
  RotateCcw,
  Pencil,
  Eye,
  LogIn,
  UserRound,
  Eraser,
  ArrowUpRight,
} from "lucide-react";
import FormattedDescription from "@/app/components/jobs/FormattedDescription";
import Modal from "@/app/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { JOB_CATEGORIES, matchJobCategory } from "@/data/categories";
import {
  CANONICAL_CITIES,
  normalizeWorkMode,
  type RemoteEligibilityType,
} from "@/lib/supabase/locations-data";
import type { Job } from "@/app/types/job";
import {
  type CandidatePreference,
  type OfficeLocation,
  type PreferredTarget,
  type JobFormState,
  type JobFormWizardProps,
} from "./job-wizard/types";
import {
  fetchCscCities,
  getCachedCscCities,
  resolveOfficeState,
  getOfficeStates,
  formatExperienceLabel,
  parseExperienceFromJob,
  formatSalaryBadge,
  calculateNumericSalary,
  parseSalaryFromJob,
  dateForInput,
  computeSubmitPostedDate,
  WIZARD_STEPS,
  cleanDescriptionText,
  SAMPLE_JOB_DESCRIPTION,
  inputClass,
  labelClass,
} from "./job-wizard/wizard-utils";
import { Field } from "./job-wizard/Field";
import {
  CompanyCitySelector,
  type CompanyCitySelectorHandle,
} from "./job-wizard/CompanyCitySelector";
import {
  CandidateScopeSelector,
  type CandidateScopeSelectorHandle,
} from "./job-wizard/CandidateScopeSelector";
import { HeroVisual } from "./job-wizard/HeroVisual";
import SalarySection from "./job-wizard/SalarySection";
import {
  WizardLoadingScreen,
  WizardErrorScreen,
  WizardSuccessScreen,
} from "./job-wizard/WizardScreens";

export type {
  CandidatePreference,
  OfficeLocation,
  PreferredTarget,
  JobFormState,
  JobFormWizardProps,
};
export {
  fetchCscCities,
  resolveOfficeState,
  getOfficeStates,
  CompanyCitySelector,
  CandidateScopeSelector,
};

export default function JobFormWizard({
  mode,
  jobId,
  initialJob,
}: JobFormWizardProps) {
  const router = useRouter();

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState<JobFormState>({
    title: "",
    company: "",
    category: "UI/UX & Product Design",
    employmentType: "FULL_TIME",
    workMode: "Onsite",
    location: "",
    selectedOffices: [],
    candidatePreference: "COMPANY_STATE",
    preferredTargets: [],
    remoteEligibilityType: "COUNTRIES",
    remoteEligibilityCountries: ["IN"],
    hqLocation: "",
    experienceMin: "",
    experienceMax: "",
    postedDate: getToday(),
    salary: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "INR",
    salaryPeriod: "YEAR",
    salaryType: "RANGE",
    salaryIsDisclosed: false,
    mail: "",
    companyLink: "",
    description: "",
  });

  const [loadingInitial, setLoadingInitial] = useState(mode === "edit" && !initialJob);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedJobData, setSubmittedJobData] = useState<Partial<Job> | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailVerifiedDomain, setEmailVerifiedDomain] = useState<string | null>(null);
  const [isCheckingNext, setIsCheckingNext] = useState(false);
  const wizardContainerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const formRefState = useRef<JobFormState>(form);
  useEffect(() => {
    formRefState.current = form;
  }, [form]);
  useEffect(() => {
    fetchCscCities();
  }, []);
  const lastVerifiedEmailRef = useRef<string>("");
  const isNavigatingRef = useRef<boolean>(false);
  const citySelectorRef = useRef<CompanyCitySelectorHandle | null>(null);
  const scopeSelectorRef = useRef<CandidateScopeSelectorHandle | null>(null);
  const handleSubmitRef = useRef<((e?: React.FormEvent<HTMLFormElement>) => Promise<void>) | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasStartedWizard, setHasStartedWizard] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const { user } = useAuth();

  // Daily posting limit tracking (anti-spam quota)
  const [userLimitInfo, setUserLimitInfo] = useState<{
    dailyLimit: number;
    used: number;
    remaining: number;
    canPost: boolean;
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function checkLimit() {
      if (mode !== "public" || !user) return;
      try {
        const authHeaders: Record<string, string> = {};
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          authHeaders["Authorization"] = `Bearer ${sessionData.session.access_token}`;
        }
        const res = await fetch("/api/jobs?user_limit=true", {
          headers: authHeaders,
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setUserLimitInfo(data);
        }
      } catch (e) {
        console.warn("Could not check user job post limit:", e);
      }
    }
    void checkLimit();
    return () => {
      ignore = true;
    };
  }, [mode, user]);

  // Clear any existing legacy saved draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("zenoway_post_job_draft");
      } catch { }
    }
  }, []);

  const handleSaveDraftAndRedirectToLogin = useCallback(() => {
    router.push("/login?redirect=/post-job");
  }, [router]);

  const scrollToForm = useCallback(() => {
    if (typeof window === "undefined") return;

    const performScroll = () => {
      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

      if (wizardContainerRef.current) {
        const topOffset =
          wizardContainerRef.current.getBoundingClientRect().top +
          window.scrollY -
          78;
        window.scrollTo({ top: Math.max(0, topOffset), behavior });
      } else {
        window.scrollTo({ top: 0, behavior });
      }
    };

    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        setTimeout(performScroll, 10);
      });
    } else {
      setTimeout(performScroll, 10);
    }
  }, []);

  const prevStepRef = useRef<number>(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      scrollToForm();
    }
  }, [currentStep, scrollToForm]);

  // AI Tools State
  const [showAiModal, setShowAiModal] = useState(false);
  const [rawAiText, setRawAiText] = useState("");
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [previousDescription, setPreviousDescription] = useState<string | null>(null);
  const [descriptionTab, setDescriptionTab] = useState<"edit" | "preview">("edit");
  const [showAiDescDrawer, setShowAiDescDrawer] = useState(false);
  const [aiCustomInstruction, setAiCustomInstruction] = useState("");

  // Auto-resizing refs for content-height textareas
  const descriptionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustDescriptionHeight = useCallback(() => {
    const el = descriptionTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 220)}px`;
  }, []);

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const textarea = e.currentTarget;
      const selStart = textarea.selectionStart;
      const textBeforeCursor = textarea.value.slice(0, selStart);
      const currentLine = textBeforeCursor.split("\n").pop() || "";

      // Match bullet point prefixes like "• " or "- "
      const bulletMatch = currentLine.match(/^([•\-\*]\s*)/);
      if (bulletMatch) {
        if (currentLine.trim() === "•" || currentLine.trim() === "-" || currentLine.trim() === "*") {
          e.preventDefault();
          const lineStart = selStart - currentLine.length;
          const newText = textarea.value.slice(0, lineStart) + textarea.value.slice(selStart);
          setForm((prev) => ({ ...prev, description: newText }));
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
            adjustDescriptionHeight();
          });
          return;
        }

        e.preventDefault();
        const nextBullet = "\n• ";
        const newText = textarea.value.slice(0, selStart) + nextBullet + textarea.value.slice(textarea.selectionEnd);
        setForm((prev) => ({ ...prev, description: newText }));
        requestAnimationFrame(() => {
          const newCursor = selStart + nextBullet.length;
          textarea.selectionStart = textarea.selectionEnd = newCursor;
          adjustDescriptionHeight();
        });
      }
    }
  };

  const adjustAiTextareaHeight = useCallback(() => {
    const el = aiTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    if (currentStep === 4) {
      requestAnimationFrame(() => {
        adjustDescriptionHeight();
      });
    }
  }, [currentStep, form.description, adjustDescriptionHeight]);

  useEffect(() => {
    if (showAiModal) {
      requestAnimationFrame(() => {
        adjustAiTextareaHeight();
      });
    }
  }, [showAiModal, rawAiText, adjustAiTextareaHeight]);

  const handleLoadSample = () => {
    setRawAiText(SAMPLE_JOB_DESCRIPTION);
    setShowAiModal(true);
    setTimeout(() => {
      adjustAiTextareaHeight();
      aiTextareaRef.current?.focus();
    }, 50);
  };

  const handleToggleAiModal = () => {
    setShowAiModal((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          adjustAiTextareaHeight();
          aiTextareaRef.current?.focus();
        }, 50);
      }
      return next;
    });
  };

  const handleParseWithAi = async () => {
    if (!rawAiText.trim()) {
      toast.error("Please paste the job description first.");
      return;
    }
    setIsParsingAi(true);
    try {
      const res = await fetch("/api/ai-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: rawAiText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to extract job details");
      }
      const parsed = typeof data.data === "string" ? JSON.parse(data.data) : data.data;

      const cat = parsed.category || matchJobCategory(parsed.title || "");

      let expMin = String(parsed.experienceMin || "");
      let expMax = String(parsed.experienceMax || "");
      if (!expMin && parsed.experience) {
        const digits = (String(parsed.experience).match(/\d+/g) || []).map(Number);
        if (digits.length >= 2) {
          expMin = String(digits[0]);
          expMax = String(digits[1]);
        } else if (digits.length === 1) {
          expMin = String(digits[0]);
        }
      }

      const empUpper = String(parsed.employmentType || "").toUpperCase();
      let empType: JobFormState["employmentType"] = "FULL_TIME";
      if (empUpper.includes("PART")) empType = "PART_TIME";
      else if (empUpper.includes("INTERN")) empType = "INTERN";
      else if (empUpper.includes("CONTRACT")) empType = "CONTRACTOR";
      else if (empUpper.includes("OTHER")) empType = "OTHER";

      // Resolve office location
      const extractedCity = (parsed.city || parsed.location || "").trim();
      let resolvedOffices: OfficeLocation[] = [];
      if (extractedCity && !/^(remote|worldwide|pan-india|anywhere)$/i.test(extractedCity)) {
        const list = getCachedCscCities();
        const found = CANONICAL_CITIES.find(
          (c) => c.name.toLowerCase() === extractedCity.toLowerCase()
        ) || list.find(
          (c: { name: string; state: string; countryCode: string }) => c.name.toLowerCase() === extractedCity.toLowerCase()
        );
        resolvedOffices = [
          {
            city: found ? found.name : extractedCity,
            state: found?.state || parsed.state || "",
            country: "India",
            countryCode: "IN",
          },
        ];
      }

      const wm: JobFormState["workMode"] =
        parsed.workMode === "Remote" || parsed.workMode === "Hybrid"
          ? parsed.workMode
          : normalizeWorkMode("", parsed.location || extractedCity);

      const parsedSal = parseSalaryFromJob({
        salary: parsed.salary,
        salaryMin: parsed.salaryMin,
        salaryMax: parsed.salaryMax,
        salaryCurrency: parsed.salaryCurrency,
        salaryPeriod: parsed.salaryPeriod,
      });

      setForm((prev) => ({
        ...prev,
        title: parsed.title || prev.title,
        company: parsed.company || prev.company,
        category: cat || prev.category,
        salary: parsedSal.formatted || prev.salary,
        salaryMin: parsedSal.min || prev.salaryMin,
        salaryMax: parsedSal.max || prev.salaryMax,
        salaryCurrency: parsedSal.currency || prev.salaryCurrency,
        salaryPeriod: parsedSal.period || prev.salaryPeriod,
        salaryType: parsedSal.type || prev.salaryType,
        salaryIsDisclosed: parsedSal.isDisclosed ?? prev.salaryIsDisclosed,
        mail: parsed.email || parsed.mail || prev.mail,
        workMode: wm,
        experienceMin: expMin || prev.experienceMin,
        experienceMax: expMax || prev.experienceMax,
        selectedOffices: resolvedOffices.length > 0 ? resolvedOffices : prev.selectedOffices,
        description: parsed.description || rawAiText,
        employmentType: empType,
      }));

      // Clear any field errors that might have been visible
      setFieldErrors({});

      toast.success(
        data.isAiPowered
          ? "Gemini AI extracted and auto-filled all steps!"
          : "Job details extracted and auto-filled!"
      );
      setShowAiModal(false);
      setRawAiText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "AI extraction failed");
    } finally {
      setIsParsingAi(false);
    }
  };

  const handleGenerateDescription = async (overrideInstruction?: string) => {
    if (!form.title.trim()) {
      toast.error("Please enter a Job Title in Step 1 first.");
      return;
    }
    if (form.description.trim()) {
      setPreviousDescription(form.description);
    }
    setIsGeneratingDesc(true);
    const instructionToSend = overrideInstruction !== undefined ? overrideInstruction : aiCustomInstruction;
    try {
      const res = await fetch("/api/ai-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-description",
          title: form.title,
          company: form.company,
          category: form.category,
          experience: form.experienceMin
            ? `${form.experienceMin}-${form.experienceMax || form.experienceMin} years`
            : undefined,
          workMode: form.workMode,
          instruction: instructionToSend.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate description");
      }
      setForm((prev) => ({ ...prev, description: data.description }));
      setFieldErrors((prev) => {
        if (!prev.description) return prev;
        const cp = { ...prev };
        delete cp.description;
        return cp;
      });
      setShowAiDescDrawer(false);
      toast.success(data.isAiPowered ? "AI description generated!" : "Professional description generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleEnhanceDescription = async (overrideInstruction?: string) => {
    if (!form.description.trim()) {
      toast.error("Please write or paste a description first to enhance it.");
      return;
    }
    setPreviousDescription(form.description);
    setIsEnhancingDesc(true);
    const instructionToSend = overrideInstruction !== undefined ? overrideInstruction : aiCustomInstruction;
    try {
      const res = await fetch("/api/ai-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enhance-description",
          currentDescription: form.description,
          title: form.title,
          company: form.company,
          category: form.category,
          experience: formatExperienceLabel(form.experienceMin, form.experienceMax),
          workMode: form.workMode,
          instruction: instructionToSend.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to enhance description");
      }
      setForm((prev) => ({ ...prev, description: data.description }));
      setFieldErrors((prev) => {
        if (!prev.description) return prev;
        const cp = { ...prev };
        delete cp.description;
        return cp;
      });
      setShowAiDescDrawer(false);
      toast.success(
        data.isAiPowered
          ? "Description enhanced & structured! You can revert anytime."
          : "Description structured and polished! You can revert anytime."
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to enhance description");
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const handleCleanDescription = () => {
    if (!form.description.trim()) {
      toast.error("No description text to clean.");
      return;
    }
    const cleaned = cleanDescriptionText(form.description);
    if (cleaned === form.description.trim()) {
      toast.success("Description is already clean!");
      return;
    }
    setPreviousDescription(form.description);
    setForm((prev) => ({ ...prev, description: cleaned }));
    toast.success("Cleaned! Icons, * and # formatting removed.");
  };

  const handleRevertDescription = () => {
    if (previousDescription === null) return;
    const current = form.description;
    setForm((prev) => ({ ...prev, description: previousDescription }));
    setPreviousDescription(current);
    toast.success("Restored previous description.");
  };

  const populateFromJob = useCallback((job: Job) => {
    const rawLoc = job.location || "";
    const wm = normalizeWorkMode(job.workMode, rawLoc);

    // Parse offices
    let offices: OfficeLocation[] = [];
    if (job.physicalLocations && job.physicalLocations.length > 0) {
      offices = job.physicalLocations
        .filter((p) => Boolean(p.city))
        .map((p) => ({
          city: p.city!,
          state: p.state || "",
          country: "India",
          countryCode: p.countryCode || "IN",
        }));
    } else if (job.primaryCity) {
      offices = [
        {
          city: job.primaryCity,
          state: job.primaryState || "",
          country: job.primaryCountry || "India",
          countryCode: job.primaryCountryCode || "IN",
        },
      ];
    } else if (rawLoc && !rawLoc.toLowerCase().includes("remote")) {
      const parts = rawLoc.split(",").map((s) => s.trim()).filter(Boolean);
      offices = parts.map((p) => {
        const matched = CANONICAL_CITIES.find(
          (c) => c.name.toLowerCase() === p.toLowerCase()
        );
        return {
          city: p,
          state: matched ? matched.state : "",
          country: "India",
          countryCode: "IN",
        };
      });
    }

    // Parse preferred targets
    const targets: PreferredTarget[] = [];
    if (Array.isArray(job.remoteEligibilityCities)) {
      for (const c of job.remoteEligibilityCities) {
        if (c.city) targets.push({ name: c.city, type: "city", state: c.region });
      }
    }
    if (Array.isArray(job.remoteEligibilityRegions)) {
      for (const r of job.remoteEligibilityRegions) {
        if (r.region) targets.push({ name: r.region, type: "state" });
      }
    }

    // Determine preference
    const remType = job.remoteEligibilityType || "COUNTRIES";
    const notes = String(job.workModeNotes || "");
    const rawLocLower = rawLoc.toLowerCase();
    const officeStates = getOfficeStates(offices);
    const officeStateSet = new Set(officeStates.map((s) => s.toLowerCase()));
    let candPref: CandidatePreference = "COMPANY_STATE";

    if (
      remType === "WORLDWIDE" ||
      notes.toLowerCase().includes("global") ||
      notes.toLowerCase().includes("worldwide")
    ) {
      candPref = "WORLDWIDE";
    } else if (
      notes.toLowerCase().includes("local only") ||
      notes.toLowerCase().includes("must reside in office") ||
      rawLocLower.includes("local only")
    ) {
      candPref = "EXACT_LOCATION";
    } else if (
      remType === "REGIONS" &&
      Array.isArray(job.remoteEligibilityRegions) &&
      job.remoteEligibilityRegions.length > 0 &&
      job.remoteEligibilityRegions.every((r) => r.region && officeStateSet.has(r.region.toLowerCase()))
    ) {
      candPref = "COMPANY_STATE";
      targets.length = 0;
    } else if (targets.length > 0 || remType === "REGIONS") {
      candPref = "SPECIFIC_LOCATION";
    } else if (
      rawLocLower.includes("pan-india") ||
      notes.toLowerCase().includes("anywhere in india") ||
      (remType === "COUNTRIES" && job.remoteEligibilityCountries?.includes("IN"))
    ) {
      candPref = "ALL_INDIA";
    } else {
      candPref = "COMPANY_STATE";
    }

    const exp = parseExperienceFromJob(job);
    const parsedSal = parseSalaryFromJob(job);

    const empType = (job.employmentType || "FULL_TIME").toUpperCase();
    const validEmpType: JobFormState["employmentType"] =
      empType === "PART_TIME"
        ? "PART_TIME"
        : empType === "CONTRACTOR"
          ? "CONTRACTOR"
          : empType === "INTERN"
            ? "INTERN"
            : empType === "OTHER"
              ? "OTHER"
              : "FULL_TIME";

    setForm({
      title: job.title || "",
      company: job.company || "",
      category: job.category || matchJobCategory(job.title || ""),
      employmentType: validEmpType,
      workMode: wm,
      location: rawLoc,
      selectedOffices: offices,
      candidatePreference: candPref,
      preferredTargets: targets,
      remoteEligibilityType: remType,
      remoteEligibilityCountries: job.remoteEligibilityCountries || ["IN"],
      hqLocation: job.hqLocationId || "",
      experienceMin: exp.min,
      experienceMax: exp.max,
      postedDate: dateForInput(job.postedDate) || getToday(),
      salary: parsedSal.formatted,
      salaryMin: parsedSal.min,
      salaryMax: parsedSal.max,
      salaryCurrency: parsedSal.currency,
      salaryPeriod: parsedSal.period,
      salaryType: parsedSal.type,
      salaryIsDisclosed: parsedSal.isDisclosed,
      mail: job.mail || "",
      companyLink: job.companyLink || "",
      description: job.description || "",
    });
  }, []);

  useEffect(() => {
    if (initialJob) {
      let ignore = false;
      Promise.resolve().then(() => {
        if (!ignore) {
          populateFromJob(initialJob);
          setLoadingInitial(false);
        }
      });
      return () => {
        ignore = true;
      };
    }

    if (mode === "edit" && jobId) {
      let cancelled = false;

      fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load job listing.");
          return res.json();
        })
        .then((data: Job) => {
          if (!cancelled) {
            populateFromJob(data);
            setLoadingInitial(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error(err);
            setLoadError(err instanceof Error ? err.message : "Failed to load job.");
            setLoadingInitial(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }
  }, [mode, jobId, initialJob, populateFromJob]);

  const validateStep = (
    stepNumber: number,
    currentForm: JobFormState = formRefState.current,
    shouldSetErrors = true
  ): boolean => {
    const errors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!currentForm.title.trim()) {
        errors.title = "Please enter a job title.";
      }
      if (!currentForm.company.trim()) {
        errors.company = "Please enter the company name.";
      }
    } else if (stepNumber === 2) {
      if (currentForm.selectedOffices.length === 0) {
        errors.selectedOffices = "Please add at least one company office location.";
      }
      if (
        currentForm.candidatePreference === "SPECIFIC_LOCATION" &&
        currentForm.preferredTargets.length === 0
      ) {
        errors.preferredTargets = "Please select at least one allowed candidate city or state.";
      }
      if (currentForm.candidatePreference === "COMPANY_STATE" && currentForm.selectedOffices.length > 0) {
        const states = getOfficeStates(currentForm.selectedOffices);
        if (states.length === 0) {
          errors.selectedOffices = "Please choose a recognized city with an identifiable state.";
        }
      }
    } else if (stepNumber === 3) {
      if (!currentForm.experienceMin.trim()) {
        errors.experienceMin = "Please enter minimum experience required (0 for fresher).";
      } else {
        const min = Number(currentForm.experienceMin);
        if (isNaN(min) || min < 0) {
          errors.experienceMin = "Please enter a valid minimum experience (0 or higher).";
        }
      }

      if (currentForm.experienceMax.trim() !== "") {
        const max = Number(currentForm.experienceMax);
        const min = Number(currentForm.experienceMin) || 0;
        if (isNaN(max) || max < 0) {
          errors.experienceMax = "Please enter a valid maximum experience.";
        } else if (max < min) {
          errors.experienceMax = "Maximum experience cannot be less than minimum experience.";
        }
      }

      if (currentForm.salaryIsDisclosed && currentForm.salaryType === "RANGE") {
        if (currentForm.salaryMin && currentForm.salaryMax) {
          const sMin = parseFloat(currentForm.salaryMin.replace(/,/g, ""));
          const sMax = parseFloat(currentForm.salaryMax.replace(/,/g, ""));
          if (!isNaN(sMin) && !isNaN(sMax) && sMax < sMin) {
            errors.salary = "Maximum salary cannot be less than minimum salary.";
          }
        }
      }

      const trimmedMail = currentForm.mail.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedMail) {
        errors.mail = "Please enter an application email.";
      } else if (!emailRegex.test(trimmedMail)) {
        errors.mail = "Please enter a valid email address (e.g. hr@company.com).";
      }
    } else if (stepNumber === 4) {
      if (!currentForm.description.trim()) {
        errors.description = "Please provide a job description.";
      }
    }

    if (shouldSetErrors) {
      setFieldErrors(errors);
    }

    if (Object.keys(errors).length > 0) {
      if (shouldSetErrors) setError("");
      return false;
    }

    if (shouldSetErrors) setError("");
    return true;
  };

  const verifyEmailDomain = async (emailToVerify: string): Promise<boolean> => {
    const trimmed = (emailToVerify || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setFieldErrors((prev) => ({ ...prev, mail: "Please enter an application email." }));
      setEmailVerifiedDomain(null);
      lastVerifiedEmailRef.current = "";
      return false;
    }
    if (!emailRegex.test(trimmed)) {
      setFieldErrors((prev) => ({
        ...prev,
        mail: "Please enter a valid email address (e.g. hr@company.com).",
      }));
      setEmailVerifiedDomain(null);
      lastVerifiedEmailRef.current = "";
      return false;
    }

    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (
      lastVerifiedEmailRef.current.toLowerCase() === trimmed.toLowerCase() ||
      (emailVerifiedDomain && domain && emailVerifiedDomain.toLowerCase() === domain)
    ) {
      lastVerifiedEmailRef.current = trimmed;
      return true;
    }

    setIsValidatingEmail(true);
    try {
      const res = await fetch(`/api/validate-email?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setFieldErrors((prev) => ({
          ...prev,
          mail: data.reason || "The domain has no active mail server (MX records).",
        }));
        setEmailVerifiedDomain(null);
        lastVerifiedEmailRef.current = "";
        return false;
      }

      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.mail;
        return next;
      });
      const resolvedDomain = data.domain || domain;
      setEmailVerifiedDomain(resolvedDomain);
      lastVerifiedEmailRef.current = trimmed;
      return true;
    } catch {
      // In case of network errors during checking, avoid hard blocking the wizard
      lastVerifiedEmailRef.current = trimmed;
      return true;
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleEmailBlur = () => {
    if (isNavigatingRef.current) return;
    const trimmed = form.mail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) return;

    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (
      lastVerifiedEmailRef.current.toLowerCase() === trimmed.toLowerCase() ||
      (emailVerifiedDomain && domain && emailVerifiedDomain.toLowerCase() === domain)
    ) {
      return;
    }

    verifyEmailDomain(trimmed);
  };

  const isCurrentStepValid = useMemo(() => {
    return validateStep(currentStep, form, false);
  }, [currentStep, form]);

  const handleNext = async () => {
    if (isCheckingNext) return;

    if (currentStep === 2) {
      citySelectorRef.current?.commit();
      if (formRefState.current.candidatePreference === "SPECIFIC_LOCATION") {
        scopeSelectorRef.current?.commit();
      }
    }

    if (!validateStep(currentStep, formRefState.current)) {
      isNavigatingRef.current = false;
      setTimeout(() => {
        const firstErrorEl = formRef.current?.querySelector<HTMLElement>(
          'input[aria-invalid="true"], input.border-status-error, select.border-status-error, [data-error="true"]'
        );
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
          firstErrorEl.focus();
        }
      }, 50);
      return;
    }

    if (currentStep === 3) {
      const trimmed = formRefState.current.mail.trim();
      const domain = trimmed.split("@")[1]?.toLowerCase();
      const alreadyValid =
        lastVerifiedEmailRef.current.toLowerCase() === trimmed.toLowerCase() ||
        Boolean(emailVerifiedDomain && domain && emailVerifiedDomain.toLowerCase() === domain);

      if (!alreadyValid) {
        setIsCheckingNext(true);
        try {
          const isDomainValid = await verifyEmailDomain(formRefState.current.mail);
          if (!isDomainValid) {
            isNavigatingRef.current = false;
            return;
          }
        } finally {
          setIsCheckingNext(false);
        }
      }
    }

    isNavigatingRef.current = false;
    setHasStartedWizard(true);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    scrollToForm();
  };

  const handleBack = () => {
    isNavigatingRef.current = false;
    setError("");
    setHasStartedWizard(true);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    scrollToForm();
  };

  const handleStepClick = (targetStep: number) => {
    isNavigatingRef.current = false;
    if (targetStep < currentStep) {
      setError("");
      setHasStartedWizard(true);
      setCurrentStep(targetStep);
      scrollToForm();
    } else if (targetStep > currentStep) {
      for (let s = currentStep; s < targetStep; s++) {
        if (s === 2) {
          citySelectorRef.current?.commit();
          if (formRefState.current.candidatePreference === "SPECIFIC_LOCATION") {
            scopeSelectorRef.current?.commit();
          }
        }
        if (!validateStep(s, formRefState.current)) {
          setCurrentStep(s);
          scrollToForm();
          return;
        }
      }
      setHasStartedWizard(true);
      setCurrentStep(targetStep);
      scrollToForm();
    }
  };

  const getStepFocusableElements = (): HTMLElement[] => {
    if (!formRef.current) return [];
    const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled])';
    const elements = Array.from(formRef.current.querySelectorAll<HTMLElement>(selector));
    return elements.filter((el) => {
      return el.offsetParent !== null && !el.classList.contains("pointer-events-none");
    });
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    // 1. ArrowDown: Move to NEXT input field in 2D grid or linear
    if (e.key === "ArrowDown" && !e.altKey) {
      if (tagName === "textarea") return;

      if (tagName === "input" || tagName === "select") {
        const inputName = target.getAttribute("name");

        // Step 1 2D navigation:
        if (currentStep === 1) {
          if (inputName === "title") {
            const catEl = formRef.current?.querySelector<HTMLElement>('[name="category"]');
            if (catEl) { e.preventDefault(); catEl.focus(); return; }
          } else if (inputName === "company") {
            const linkEl = formRef.current?.querySelector<HTMLElement>('[name="companyLink"]');
            if (linkEl) { e.preventDefault(); linkEl.focus(); return; }
          } else if (inputName === "category" || inputName === "companyLink") {
            const empGroup = formRef.current?.querySelector<HTMLElement>('[aria-label="Employment Type"]');
            if (empGroup) { e.preventDefault(); empGroup.focus(); return; }
          }
        }

        // Step 3 2D navigation:
        if (currentStep === 3) {
          if (inputName === "experienceMin") {
            const salMin = formRef.current?.querySelector<HTMLElement>('[name="salaryMin"]');
            if (salMin) { e.preventDefault(); salMin.focus(); return; }
          } else if (inputName === "experienceMax") {
            const salMax = formRef.current?.querySelector<HTMLElement>('[name="salaryMax"]');
            if (salMax) { e.preventDefault(); salMax.focus(); return; }
          } else if (inputName === "salaryMin" || inputName === "salaryMax") {
            const mailEl = formRef.current?.querySelector<HTMLElement>('[name="mail"]');
            if (mailEl) { e.preventDefault(); mailEl.focus(); return; }
          }
        }

        const focusables = getStepFocusableElements();
        const currentIndex = focusables.indexOf(target);
        if (currentIndex !== -1 && currentIndex < focusables.length - 1) {
          e.preventDefault();
          const nextEl = focusables[currentIndex + 1];
          nextEl.focus();
          if (nextEl instanceof HTMLInputElement && nextEl.type !== "select-one") {
            nextEl.select();
          }
          return;
        }
      }
    }

    // 2. ArrowUp: Move to PREVIOUS input field in 2D grid or linear
    if (e.key === "ArrowUp" && !e.altKey) {
      if (tagName === "textarea") return;

      if (tagName === "input" || tagName === "select") {
        const inputName = target.getAttribute("name");

        // Step 1 2D navigation:
        if (currentStep === 1) {
          if (inputName === "category") {
            const titleEl = formRef.current?.querySelector<HTMLElement>('[name="title"]');
            if (titleEl) { e.preventDefault(); titleEl.focus(); return; }
          } else if (inputName === "companyLink") {
            const compEl = formRef.current?.querySelector<HTMLElement>('[name="company"]');
            if (compEl) { e.preventDefault(); compEl.focus(); return; }
          }
        }

        // Step 3 2D navigation:
        if (currentStep === 3) {
          if (inputName === "salaryMin") {
            const expMin = formRef.current?.querySelector<HTMLElement>('[name="experienceMin"]');
            if (expMin) { e.preventDefault(); expMin.focus(); return; }
          } else if (inputName === "salaryMax") {
            const expMax = formRef.current?.querySelector<HTMLElement>('[name="experienceMax"]');
            if (expMax) { e.preventDefault(); expMax.focus(); return; }
          } else if (inputName === "mail") {
            const salMin = formRef.current?.querySelector<HTMLElement>('[name="salaryMin"]');
            if (salMin) { e.preventDefault(); salMin.focus(); return; }
          }
        }

        const focusables = getStepFocusableElements();
        const currentIndex = focusables.indexOf(target);
        if (currentIndex > 0) {
          e.preventDefault();
          const prevEl = focusables[currentIndex - 1];
          prevEl.focus();
          if (prevEl instanceof HTMLInputElement && prevEl.type !== "select-one") {
            prevEl.select();
          }
          return;
        }
      }
    }

    // 3. Enter key: Acts as "OK / Continue to next step" (or moves to next field if current step not yet valid)
    if (e.key === "Enter") {
      // In textarea:
      if (tagName === "textarea") {
        if ((e.metaKey || e.ctrlKey) && currentStep === 4) {
          e.preventDefault();
          handleSubmitRef.current?.();
        }
        return;
      }

      // If user is inside an action button (Back, Remove chip, Modal button), let native click proceed
      if (tagName === "button") {
        const btn = target as HTMLButtonElement;
        const ariaLabel = btn.getAttribute("aria-label") || "";
        const text = btn.textContent || "";
        if (
          ariaLabel.startsWith("Remove") ||
          text.includes("Back") ||
          text.includes("How it works") ||
          text.includes("Revert")
        ) {
          return;
        }
      }

      // Inside an input or select:
      if (tagName === "input" || tagName === "select") {
        const isStepValid = validateStep(currentStep, formRefState.current, false);
        if (isStepValid) {
          e.preventDefault();
          if (currentStep < 4) {
            handleNext();
          } else if (currentStep === 4) {
            handleSubmitRef.current?.();
          }
          return;
        }

        // If not fully valid yet, advance to next empty/needed input field
        const focusables = getStepFocusableElements();
        const currentIndex = focusables.indexOf(target);
        if (currentIndex !== -1 && currentIndex < focusables.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          const nextEl = focusables[currentIndex + 1];
          nextEl.focus();
          if (nextEl instanceof HTMLInputElement && nextEl.type !== "select-one") {
            nextEl.select();
          }
          return;
        }
      }

      // Inside any other element (card button, radiogroup, etc.):
      e.preventDefault();
      if (currentStep < 4) {
        handleNext();
      } else if (currentStep === 4) {
        handleSubmitRef.current?.();
      }
      return;
    }

    // 4. Alt + Arrow Left/Right to jump steps
    if (e.altKey) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentStep < 4) handleNext();
        return;
      }
      if (e.key === "ArrowLeft") {
        if (currentStep > 1) {
          e.preventDefault();
          handleBack();
          return;
        }
      }
    }
  };

  const handleNextRef = useRef(handleNext);
  const handleBackRef = useRef(handleBack);
  const handleStepClickRef = useRef(handleStepClick);

  useEffect(() => {
    handleNextRef.current = handleNext;
    handleBackRef.current = handleBack;
    handleStepClickRef.current = handleStepClick;
  });

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (showAiModal || showHowItWorksModal) return;

      // Direct Step Switching: Alt + 1, 2, 3, 4
      if (e.altKey && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const targetStep = parseInt(e.key, 10);
        handleStepClickRef.current(targetStep);
        return;
      }

      // Ctrl + Enter or Cmd + Enter: submit / continue anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (currentStep < 4) {
          handleNextRef.current();
        } else if (currentStep === 4) {
          handleSubmitRef.current?.();
        }
        return;
      }

      // Alt + ArrowLeft / ArrowRight
      if (e.altKey) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (currentStep < 4) handleNextRef.current();
          return;
        }
        if (e.key === "ArrowLeft") {
          if (currentStep > 1) {
            e.preventDefault();
            handleBackRef.current();
            return;
          }
        }
      }

      const isTextarea = target.tagName === "TEXTAREA";
      if (isTextarea) return;

      // Enter key globally acts as Continue / Submit
      if (e.key === "Enter") {
        if (target.tagName === "BUTTON") {
          const btn = target as HTMLButtonElement;
          const ariaLabel = btn.getAttribute("aria-label") || "";
          const text = btn.textContent || "";
          if (
            ariaLabel.startsWith("Remove") ||
            text.includes("Back") ||
            text.includes("How it works") ||
            text.includes("Revert")
          ) {
            return;
          }
        }
        e.preventDefault();
        if (currentStep < 4) {
          handleNextRef.current();
        } else if (currentStep === 4) {
          handleSubmitRef.current?.();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentStep, showAiModal, showHowItWorksModal]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title" && value.trim()) {
        const detected = matchJobCategory(value);
        if (detected) {
          updated.category = detected;
        }
      }
      return updated;
    });
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    if (name === "mail") {
      const nextDomain = value.trim().split("@")[1]?.toLowerCase();
      if (!nextDomain || nextDomain !== emailVerifiedDomain) {
        setEmailVerifiedDomain(null);
        lastVerifiedEmailRef.current = "";
      }
    }
    if (error) setError("");
  };

  const handleAddOffice = (office: OfficeLocation) => {
    setFieldErrors((prev) => { const cp = { ...prev }; delete cp.selectedOffices; return cp; });
    const enrichedOffice: OfficeLocation = {
      ...office,
      state: office.state || resolveOfficeState(office.city),
    };
    setForm((prev) => {
      const exists = prev.selectedOffices.some(
        (o) => o.city.toLowerCase() === enrichedOffice.city.toLowerCase()
      );
      if (exists) return prev;
      const updated = {
        ...prev,
        selectedOffices: [...prev.selectedOffices, enrichedOffice],
      };
      formRefState.current = updated;
      return updated;
    });
    if (error) setError("");
  };

  const handleRemoveOffice = (cityName: string) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        selectedOffices: prev.selectedOffices.filter(
          (o) => o.city.toLowerCase() !== cityName.toLowerCase()
        ),
      };
      formRefState.current = updated;
      return updated;
    });
  };

  const handleAddPreferredTarget = (target: PreferredTarget) => {
    setFieldErrors((prev) => {
      if (!prev.preferredTargets) return prev;
      const copy = { ...prev };
      delete copy.preferredTargets;
      return copy;
    });
    setForm((prev) => {
      const exists = prev.preferredTargets.some(
        (t) => t.name.toLowerCase() === target.name.toLowerCase()
      );
      if (exists) return prev;
      const updated = {
        ...prev,
        preferredTargets: [...prev.preferredTargets, target],
      };
      formRefState.current = updated;
      return updated;
    });
    if (error) setError("");
  };

  const handleRemovePreferredTarget = (targetName: string) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        preferredTargets: prev.preferredTargets.filter(
          (t) => t.name.toLowerCase() !== targetName.toLowerCase()
        ),
      };
      formRefState.current = updated;
      return updated;
    });
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (mode === "public" && !user) {
      handleSaveDraftAndRedirectToLogin();
      return;
    }

    if (mode === "public" && userLimitInfo && userLimitInfo.remaining <= 0) {
      const limitMsg = `Daily limit reached: You can submit up to ${userLimitInfo.dailyLimit} jobs per day. Please try again tomorrow.`;
      setError(limitMsg);
      toast.error(limitMsg);
      scrollToForm();
      return;
    }

    if (!validateStep(1, formRefState.current)) {
      setCurrentStep(1);
      scrollToForm();
      return;
    }
    if (!validateStep(2, formRefState.current)) {
      setCurrentStep(2);
      scrollToForm();
      return;
    }
    if (!validateStep(3, formRefState.current)) {
      setCurrentStep(3);
      scrollToForm();
      return;
    }
    if (!validateStep(4, formRefState.current)) {
      setCurrentStep(4);
      scrollToForm();
      return;
    }

    const minExperience = Number(form.experienceMin);
    const maxExperience =
      form.experienceMax.trim() === "" ? null : Number(form.experienceMax);

    setIsSubmitting(true);
    setError("");

    try {
      let experience = "";
      if (minExperience === 0 && (maxExperience === null || maxExperience === 0)) {
        experience = "Fresher";
      } else if (maxExperience !== null && maxExperience > minExperience) {
        experience = `${minExperience}–${maxExperience} years`;
      } else if (maxExperience !== null && maxExperience === minExperience) {
        experience = `${minExperience} year${minExperience === 1 ? "" : "s"}`;
      } else {
        experience = `${minExperience}+ years`;
      }

      const isRemote = form.workMode === "Remote";
      const isHybrid = form.workMode === "Hybrid";

      const primaryOffice = form.selectedOffices[0];
      const primaryCity = primaryOffice?.city || "";
      const primaryState = primaryOffice?.state || resolveOfficeState(primaryCity) || "";
      const primaryCountry = primaryOffice?.country || "India";
      const primaryCountryCode = primaryOffice?.countryCode || "IN";
      const officeNames = form.selectedOffices.map((o) => o.city);
      const officeSummary = officeNames.join(", ");
      const officeStates = getOfficeStates(form.selectedOffices);
      const officeStatesSummary = officeStates.join(", ");

      const targetCities = form.preferredTargets.filter((t) => t.type === "city");
      const targetStates = form.preferredTargets.filter((t) => t.type === "state");
      const prefNames = form.preferredTargets.map((t) => t.name);
      const prefSummary = prefNames.join(", ");

      let computedLocation = "";
      let workModeNotes: string | undefined;
      let remoteEligibilityType: RemoteEligibilityType | undefined;
      let remoteEligibilityCountries: string[] | undefined;
      let remoteEligibilityRegions: Array<{ countryCode: string; region: string }> | undefined;
      let remoteEligibilityCities: Array<{ countryCode: string; region: string; city: string }> | undefined;

      if (isRemote) {
        if (form.candidatePreference === "COMPANY_STATE") {
          computedLocation = officeStatesSummary ? `Remote · ${officeStatesSummary}` : "Remote · Pan-India";
          workModeNotes = officeStatesSummary ? `Remote (Must reside in ${officeStatesSummary})` : "Candidates in company's state only";
          remoteEligibilityType = "REGIONS";
          remoteEligibilityRegions = officeStates.map((s) => ({ countryCode: "IN", region: s }));
        } else if (form.candidatePreference === "WORLDWIDE") {
          computedLocation = "Remote · Worldwide";
          workModeNotes = "Open to global applicants";
          remoteEligibilityType = "WORLDWIDE";
        } else if (form.candidatePreference === "ALL_INDIA") {
          computedLocation = "Remote · Pan-India";
          workModeNotes = "Open to candidates anywhere in India";
          remoteEligibilityType = "COUNTRIES";
          remoteEligibilityCountries = ["IN"];
        } else if (form.candidatePreference === "EXACT_LOCATION") {
          computedLocation = `Remote · ${officeSummary}`;
          workModeNotes = `Remote (Must reside in ${officeSummary})`;
          remoteEligibilityType = "CITIES";
          remoteEligibilityCities = form.selectedOffices.map((o) => ({
            countryCode: o.countryCode || "IN",
            region: o.state,
            city: o.city,
          }));
        } else if (form.candidatePreference === "SPECIFIC_LOCATION") {
          computedLocation = `Remote · ${prefSummary}`;
          workModeNotes = `Must reside in ${prefSummary}`;
          if (targetCities.length > 0) {
            remoteEligibilityCities = targetCities.map((c) => ({
              countryCode: "IN",
              region: c.state || "",
              city: c.name,
            }));
          }
          if (targetStates.length > 0) {
            remoteEligibilityRegions = targetStates.map((s) => ({
              countryCode: "IN",
              region: s.name,
            }));
          }
          if (targetCities.length > 0 && targetStates.length === 0) {
            remoteEligibilityType = "CITIES";
          } else if (targetStates.length > 0 && targetCities.length === 0) {
            remoteEligibilityType = "REGIONS";
          } else {
            remoteEligibilityType = "CITIES";
          }
        }
      } else {
        // Onsite or Hybrid
        const prefix = isHybrid ? "Hybrid · " : "";
        if (form.candidatePreference === "COMPANY_STATE") {
          computedLocation = officeStatesSummary
            ? `${prefix}${officeSummary} (${officeStatesSummary} only)`
            : `${prefix}${officeSummary}`;
          workModeNotes = officeStatesSummary
            ? `Candidates in ${officeStatesSummary} only`
            : "Candidates in company's state only";
          remoteEligibilityType = "REGIONS";
          remoteEligibilityRegions = officeStates.map((s) => ({ countryCode: "IN", region: s }));
        } else if (form.candidatePreference === "EXACT_LOCATION") {
          computedLocation = `${prefix}${officeSummary} (Local only)`;
          workModeNotes = "Local candidates only";
          remoteEligibilityType = "CITIES";
          remoteEligibilityCities = form.selectedOffices.map((o) => ({
            countryCode: o.countryCode || "IN",
            region: o.state,
            city: o.city,
          }));
        } else if (form.candidatePreference === "ALL_INDIA") {
          computedLocation = `${prefix}${officeSummary}`;
          workModeNotes = "Open to candidates anywhere in India";
          remoteEligibilityType = "COUNTRIES";
          remoteEligibilityCountries = ["IN"];
        } else if (form.candidatePreference === "WORLDWIDE") {
          computedLocation = `${prefix}${officeSummary} (Worldwide)`;
          workModeNotes = "Open to global applicants";
          remoteEligibilityType = "WORLDWIDE";
        } else if (form.candidatePreference === "SPECIFIC_LOCATION") {
          workModeNotes = `${prefSummary} candidates preferred`;
          computedLocation = `${prefix}${officeSummary} (${prefSummary} preferred)`;
          if (targetCities.length > 0) {
            remoteEligibilityCities = targetCities.map((c) => ({
              countryCode: "IN",
              region: c.state || "",
              city: c.name,
            }));
          }
          if (targetStates.length > 0) {
            remoteEligibilityRegions = targetStates.map((s) => ({
              countryCode: "IN",
              region: s.name,
            }));
          }
          if (targetCities.length > 0 && targetStates.length === 0) {
            remoteEligibilityType = "CITIES";
          } else {
            remoteEligibilityType = "REGIONS";
          }
        }
      }

      if (!computedLocation) {
        computedLocation = isRemote ? "Remote · Pan-India" : officeSummary;
      }

      const numericSal = calculateNumericSalary({
        isDisclosed: form.salaryIsDisclosed,
        min: form.salaryMin,
        max: form.salaryMax,
        period: form.salaryPeriod,
        currency: form.salaryCurrency,
        type: form.salaryType,
      });

      const payload: Partial<Job> = {
        title: form.title.trim(),
        company: form.company.trim(),
        category: form.category || "UI/UX & Product Design",
        location: computedLocation,
        workMode: form.workMode,
        employmentType: form.employmentType,
        primaryCity: primaryCity || undefined,
        primaryState: primaryState || undefined,
        primaryCountry: primaryCountry,
        primaryCountryCode: primaryCountryCode,
        isMultiLocation: form.selectedOffices.length > 1,
        physicalLocations: form.selectedOffices.map((o) => ({
          city: o.city,
          state: o.state,
          countryCode: o.countryCode,
        })),
        experience,
        postedDate: computeSubmitPostedDate(form.postedDate, getToday(), mode, initialJob?.postedDate),
        salary: form.salary.trim() || "Not Disclosed",
        salaryMin: form.salaryIsDisclosed ? numericSal.salaryMin : undefined,
        salaryMax: form.salaryIsDisclosed ? numericSal.salaryMax : undefined,
        salaryCurrency: form.salaryCurrency || "INR",
        salaryPeriod: form.salaryPeriod || "YEAR",
        salaryIsDisclosed: Boolean(form.salaryIsDisclosed),
        mail: form.mail.trim(),
        companyLink: form.companyLink.trim(),
        description: cleanDescriptionText(form.description),
        workModeNotes: workModeNotes || undefined,
        remoteEligibilityType: remoteEligibilityType || (isRemote ? "COUNTRIES" : undefined),
        remoteEligibilityCountries: remoteEligibilityCountries || (isRemote ? ["IN"] : undefined),
        remoteEligibilityRegions: remoteEligibilityRegions || [],
        remoteEligibilityCities: remoteEligibilityCities || [],
      };

      if (mode === "edit" && jobId) {
        payload.id = jobId;
        const res = await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || "Failed to update job listing.");
        }

        toast.success("Job updated successfully!");
        router.push(jobId ? `/admin/jobs/${jobId}` : "/admin/jobs");
        router.refresh();
      } else if (mode === "public") {
        payload.status = "draft";
        payload.requiresReview = true;

        const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            authHeaders["Authorization"] = `Bearer ${session.access_token}`;
          }
        } catch (e) {
          console.warn("Could not retrieve session token:", e);
        }

        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || "Failed to submit job listing.");
        }

        const data = await res.json().catch(() => null);
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("zenoway_post_job_draft");
          }
        } catch { }

        if (typeof data?.remainingDailyPosts === "number") {
          setUserLimitInfo((prev) =>
            prev
              ? {
                ...prev,
                used: prev.dailyLimit - data.remainingDailyPosts,
                remaining: data.remainingDailyPosts,
                canPost: data.remainingDailyPosts > 0,
              }
              : null
          );
        }

        setSubmittedJobData(data?.job || payload);
        setIsSubmittedSuccess(true);
        setIsSubmitting(false);
        toast.success("Job submitted for review!");
        return;
      } else {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || "Failed to publish job listing.");
        }

        toast.success("Job published successfully!");
        router.push("/admin/jobs");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setError(errMsg);
      toast.error(errMsg);
      if (
        errMsg.toLowerCase().includes("mail") ||
        errMsg.toLowerCase().includes("email") ||
        errMsg.toLowerCase().includes("domain")
      ) {
        setFieldErrors((prev) => ({ ...prev, mail: errMsg }));
        setCurrentStep(3);
        scrollToForm();
      }
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  const previewExperience = formatExperienceLabel(
    form.experienceMin,
    form.experienceMax
  );

  const previewLocation = useMemo(() => {
    const isRemote = form.workMode === "Remote";
    const isHybrid = form.workMode === "Hybrid";
    const officeNames = form.selectedOffices.map((o) => o.city);
    const officeSummary = officeNames.join(", ") || "City not set";
    const officeStates = getOfficeStates(form.selectedOffices);
    const stateSummary = officeStates.join(", ");
    const prefNames = form.preferredTargets.map((t) => t.name).join(", ");

    if (isRemote) {
      if (form.candidatePreference === "COMPANY_STATE") {
        return stateSummary ? `Remote · ${stateSummary}` : "Remote · Company State";
      }
      if (form.candidatePreference === "ALL_INDIA") return "Remote · Pan-India";
      if (form.candidatePreference === "WORLDWIDE") return "Remote · Worldwide";
      if (form.candidatePreference === "EXACT_LOCATION") return `Remote · ${officeSummary}`;
      if (form.candidatePreference === "SPECIFIC_LOCATION") return `Remote · ${prefNames || "Specific areas"}`;
      return "Remote · Pan-India";
    }

    const prefix = isHybrid ? "Hybrid · " : "";
    if (form.candidatePreference === "COMPANY_STATE") {
      return stateSummary
        ? `${prefix}${officeSummary} (${stateSummary} only)`
        : `${prefix}${officeSummary}`;
    }
    if (form.candidatePreference === "EXACT_LOCATION") return `${prefix}${officeSummary} (Local only)`;
    if (form.candidatePreference === "SPECIFIC_LOCATION") return `${prefix}${officeSummary} (${prefNames || "Preferred areas"})`;
    return `${prefix}${officeSummary}`;
  }, [form.workMode, form.selectedOffices, form.candidatePreference, form.preferredTargets]);

  const handleResetPublicSubmission = () => {
    setForm({
      title: "",
      company: "",
      category: "UI/UX & Product Design",
      employmentType: "FULL_TIME",
      workMode: "Onsite",
      location: "",
      selectedOffices: [],
      candidatePreference: "COMPANY_STATE",
      preferredTargets: [],
      remoteEligibilityType: "COUNTRIES",
      remoteEligibilityCountries: ["IN"],
      hqLocation: "",
      experienceMin: "",
      experienceMax: "",
      postedDate: getToday(),
      salary: "",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "INR",
      salaryPeriod: "YEAR",
      salaryType: "RANGE",
      salaryIsDisclosed: false,
      mail: "",
      companyLink: "",
      description: "",
    });
    setCurrentStep(1);
    setIsSubmittedSuccess(false);
    setSubmittedJobData(null);
    setEmailVerifiedDomain(null);
    lastVerifiedEmailRef.current = "";
    setIsCheckingNext(false);
  };

  if (loadingInitial) {
    return <WizardLoadingScreen />;
  }

  if (loadError) {
    return <WizardErrorScreen error={loadError} />;
  }

  if (mode === "public" && isSubmittedSuccess) {
    return (
      <WizardSuccessScreen
        submittedJobData={submittedJobData}
        form={form}
        previewLocation={previewLocation}
        onPostAnother={handleResetPublicSubmission}
      />
    );
  }

  return (
    <div className="min-h-full bg-surface-base text-text-primary">
      <div ref={wizardContainerRef} className="mx-auto max-w-7xl px-6 pb-16 pt-4 sm:px-10 sm:pt-6 lg:px-12">
        {/* Public Hero vs Admin Header */}
        {mode === "public" ? (
          currentStep === 1 && !hasStartedWizard ? (
            <div className="mb-10 overflow-hidden border-b border-border-default/40 pb-12">
              <div className="grid items-center gap-8 lg:min-h-[510px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
                <div className="relative z-10 py-5 lg:py-8">
                  {/* Eyebrow */}
                  <div className="mb-6 flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-pill bg-brand" />
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                      Zenoway for Employers
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="max-w-[590px] text-[40px] font-medium leading-[1.12] tracking-[-0.045em] sm:text-[48px] lg:text-[54px] text-text-primary">
                    Hire India&apos;s best tech &amp; design talent.{" "}
                    <br className="hidden sm:inline" />
                    <span className="text-brand">Without the middlemen.</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-5 max-w-[480px] text-base-compact leading-7 text-text-secondary sm:text-base">
                    Publish openings to verified engineers, designers and tech leads. Candidates
                    apply straight to your official HR email. No agency fees, no delays.
                  </p>

                  {/* How it works button & CTA */}
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowHowItWorksModal(true)}
                      className="group inline-flex h-9 items-center gap-2.5 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer"
                    >
                      <span>How it works</span>
                      <ArrowUpRight
                        size={15}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </button>
                    <span className="text-xs text-text-muted">
                      Meet your next great hire · 100% free
                    </span>
                  </div>

                  {/* Trust points */}
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                    {["Reach creative talent", "Direct applications", "Zero brokerage"].map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-1.5 text-xs text-text-secondary"
                      >
                        <Check size={13} className="text-brand" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <HeroVisual />
              </div>

              {/* Feature row, full width with clean responsive card styling */}
              <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-0 lg:divide-x lg:divide-border-default/40 border-t border-border-default/40 pt-8">
                {[
                  { icon: Mail, title: "Direct applications", body: "Resumes land directly in your official HR email." },
                  { icon: Sparkles, title: "AI auto-fill", body: "Paste a draft JD and Gemini fills every step." },
                  { icon: MapPin, title: "Pan-India & remote", body: "Target Bengaluru, NCR, Kochi, or go remote." },
                  { icon: Zap, title: "Live in 2 minutes", body: "Four-step wizard with live markdown preview." },
                ].map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-card border border-border-default/60 bg-surface-card/60 p-4 sm:p-5 lg:rounded-none lg:border-none lg:bg-transparent lg:p-0 lg:px-6 lg:first:pl-0 lg:last:pr-0"
                  >
                    <dt className="flex items-center gap-2 text-xs font-semibold text-text-primary sm:text-sm sm:font-medium">
                      <Icon size={16} strokeWidth={1.75} className="shrink-0 text-brand" />
                      {title}
                    </dt>
                    <dd className="mt-1.5 text-xs leading-relaxed text-text-muted">{body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <header className="mb-6 flex flex-col gap-1 border-b border-border-default/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">
                  Post a Tech Opening
                </h1>
                <p className="text-xs text-text-muted">
                  Step {currentStep} of 4 • {WIZARD_STEPS[currentStep - 1]?.label}: {WIZARD_STEPS[currentStep - 1]?.brief}
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted">
                {user && userLimitInfo && (
                  <>
                    <span className={userLimitInfo.remaining <= 3 ? "font-semibold text-amber-600" : "text-text-secondary"}>
                      {userLimitInfo.remaining} of {userLimitInfo.dailyLimit} posts left today
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="font-semibold text-brand">Direct Applications</span>
                <span>•</span>
                <span className="text-text-secondary">Zero Brokerage</span>
              </div>
            </header>
          )
        ) : (
          /* Admin / Edit Header */
          <header className="mb-8 border-b border-border-default/40 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              {mode === "edit" ? "Edit Job Listing" : "Add New Job"}
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {mode === "edit" && jobId
                ? `Listing ID: ${jobId}`
                : "Fill in role details and publish to the Zenoway catalog."}
            </p>
          </header>
        )}

        {/* Guest Reminder Banner for Public Mode */}
        {mode === "public" && !user && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-control border border-border-default bg-surface-card p-3.5 sm:px-4 shadow-subtle">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
                <UserRound size={15} />
              </span>
              <p className="text-xs text-text-secondary leading-normal">
                You can fill out all job details now. Please{" "}
                <button
                  type="button"
                  onClick={handleSaveDraftAndRedirectToLogin}
                  className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand cursor-pointer"
                >
                  log in
                </button>{" "}
                to submit and publish your job listing.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveDraftAndRedirectToLogin}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-primary shadow-subtle transition hover:border-brand hover:bg-brand-soft hover:text-brand cursor-pointer"
            >
              <LogIn size={14} className="text-brand" />
              <span>Log in</span>
            </button>
          </div>
        )}

        {/* Daily Post Limit Warning for Public Logged-in User */}
        {mode === "public" && user && userLimitInfo && userLimitInfo.remaining <= 0 && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-control border border-amber-500/30 bg-amber-500/10 p-3.5 sm:px-4 shadow-subtle">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-amber-500/20 text-amber-600">
                <AlertCircle size={15} />
              </span>
              <p className="text-xs text-text-secondary leading-normal">
                <strong className="font-semibold text-text-primary">Daily posting limit reached:</strong> You have submitted {userLimitInfo.dailyLimit}/{userLimitInfo.dailyLimit} jobs today. You can prepare drafts now, but new submissions will reopen tomorrow.
              </p>
            </div>
          </div>
        )}

        {/* Upgraded AI Auto-Fill Section */}
        {currentStep === 1 && (
          <div className="mb-8 rounded-control border border-brand/25 bg-gradient-to-br from-brand-soft/60 via-surface-card to-brand-soft/20 p-4 sm:p-5 shadow-subtle transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand text-text-inverse shadow-subtle">
                  <Sparkles size={17} fill="currentColor" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold text-text-primary">
                      Gemini AI Smart Importer
                    </h2>
                    <span className="rounded-control bg-brand/10 border border-brand/20 px-2 py-0.5 text-3xs font-bold text-brand uppercase tracking-wider">
                      All 4 Steps
                    </span>
                  </div>
                  <p className="mt-0.5 text-2xs sm:text-xs text-text-secondary">
                    Paste raw text from a draft, PDF, or email. Gemini AI automatically parses and fills all 4 steps.
                  </p>
                </div>
              </div>

              {!showAiModal && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-secondary shadow-subtle transition hover:border-brand/40 hover:text-text-primary cursor-pointer"
                  >
                    <span>Try Sample JD</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleAiModal}
                    className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-inverse shadow-subtle transition hover:bg-brand-hover shrink-0 cursor-pointer"
                  >
                    <Wand2 size={14} fill="currentColor" />
                    <span>Paste Draft with AI</span>
                  </button>
                </div>
              )}
            </div>

            {showAiModal && (
              <div className="mt-4 border-t border-brand/15 pt-4 space-y-3.5 animate-in fade-in duration-200">
                {/* Extraction tags preview */}
                <div className="flex flex-wrap items-center gap-1.5 text-3xs text-text-muted">
                  <span className="font-semibold text-text-secondary">Auto-extracts:</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">Role & Category</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">Company & City</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">Work Mode & Type</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">Experience & Salary</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">Contact Email</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">Description</span>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    ref={aiTextareaRef}
                    value={rawAiText}
                    disabled={isParsingAi}
                    maxLength={25000}
                    onChange={(e) => {
                      setRawAiText(e.target.value);
                      adjustAiTextareaHeight();
                    }}
                    onInput={adjustAiTextareaHeight}
                    placeholder="Paste job title, requirements, company info, or raw job text here...&#10;&#10;e.g. 'Senior UI/UX Designer at TechCorp in Bengaluru (Hybrid), 3-5 years experience, ₹15-20 LPA, contact hiring@techcorp.com...'"
                    style={{ minHeight: "130px", overflow: "hidden", resize: "none" }}
                    className={`${inputClass} text-xs leading-relaxed font-sans placeholder:text-text-muted/70 bg-surface-card`}
                  />
                </div>

                {/* Footer action bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-2 text-2xs text-text-muted">
                    <span className="font-mono">{rawAiText.length} characters</span>
                    {rawAiText.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-brand font-medium">Ready for AI extraction</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {rawAiText.length === 0 ? (
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="rounded-control px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition"
                      >
                        Insert Sample
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRawAiText("");
                          setTimeout(adjustAiTextareaHeight, 0);
                        }}
                        className="rounded-control px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-rose-600 transition"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiModal(false);
                      }}
                      className="rounded-control px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={isParsingAi || !rawAiText.trim()}
                      onClick={handleParseWithAi}
                      className="inline-flex items-center gap-2 rounded-control bg-brand px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-inverse shadow-subtle transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isParsingAi ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Extracting & Auto-Filling...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} fill="currentColor" />
                          <span>Auto-Fill All Steps</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Wizard Layout: Left Progress Stepper + Right Form Step */}
        <div className="flex flex-col md:flex-row md:items-start gap-10 lg:gap-14">
          {/* Progress Section (Left Sidebar on Desktop, Compact Stepper on Mobile) */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0">
            {/* Mobile Stepper (< md) */}
            <div className="md:hidden mb-6 rounded-control border border-border-default/60 bg-surface-card p-3.5 shadow-subtle">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-2xs font-bold text-brand shrink-0">
                    {WIZARD_STEPS[currentStep - 1].tag}
                  </span>
                  <span className="font-semibold text-text-primary shrink-0">
                    {WIZARD_STEPS[currentStep - 1].label}
                  </span>
                  <span className="text-text-muted shrink-0">·</span>
                  <span className="text-text-muted truncate text-2xs">
                    {WIZARD_STEPS[currentStep - 1].brief}
                  </span>
                </div>
                <span className="font-mono text-2xs text-text-muted shrink-0 ml-2">
                  {currentStep} / 4
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop Left Stepper (md+) - Clean Light White Cards with Right-Side Checkmark */}
            <div className="hidden md:block md:sticky md:top-8">
              <nav className="space-y-2.5" aria-label="Wizard Steps">
                {WIZARD_STEPS.map((step) => {
                  const isActive = currentStep === step.num;
                  const isPast = currentStep > step.num;

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => handleStepClick(step.num)}
                      className={`group flex w-full items-center justify-between gap-3 rounded-control border p-3.5 text-left transition-all duration-150 ${isPast
                        ? "border-brand/30 bg-brand-soft/40 text-brand shadow-subtle hover:bg-brand-soft/60"
                        : isActive
                          ? "border-brand/40 bg-surface-card shadow-subtle ring-1 ring-brand/20"
                          : "border-border-default/50 bg-surface-card/70 text-text-muted hover:border-border-strong hover:bg-surface-card hover:text-text-secondary"
                        }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-bold ${isPast
                              ? "text-brand"
                              : isActive
                                ? "text-brand"
                                : "text-text-muted"
                              }`}
                          >
                            {step.tag}
                          </span>
                          <span
                            className={`text-sm font-bold tracking-tight ${isPast
                              ? "text-brand"
                              : isActive
                                ? "text-text-primary"
                                : "text-text-muted group-hover:text-text-secondary"
                              }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        <p
                          className={`mt-0.5 text-xs truncate ${isPast
                            ? "text-brand/80"
                            : isActive
                              ? "text-text-secondary"
                              : "text-text-muted/70 group-hover:text-text-muted"
                            }`}
                        >
                          {step.brief}
                        </p>
                      </div>

                      {/* Right side tick mark for completed tasks */}
                      {isPast ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center text-brand">
                          <Check size={14} className="stroke-[2.5]" />
                        </div>
                      ) : isActive ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-brand ring-4 ring-brand/15" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Form Content */}
          <div className="flex-1 min-w-0">
            <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
              {error && (
                <div className="mb-6 flex items-start gap-2.5 rounded-control border border-status-error/30 bg-status-error/10 p-3.5 text-xs text-status-error">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* STEP 1: ROLE */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Job Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Senior Frontend Engineer"
                      icon={BriefcaseBusiness}
                      error={fieldErrors.title}
                      required
                    />

                    <Field
                      label="Company Name"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="e.g. Acme Inc."
                      icon={Building2}
                      error={fieldErrors.company}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className={labelClass}>
                        Job Category
                        <span className="ml-1 text-status-error">*</span>
                      </label>
                      <div className="group relative">
                        <select
                          id="category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className={`${inputClass} cursor-pointer appearance-none pr-10`}
                          required
                        >
                          {JOB_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          strokeWidth={1.8}
                          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand"
                        />
                      </div>
                    </div>

                    <Field
                      label="Company Website (Optional)"
                      name="companyLink"
                      value={form.companyLink}
                      onChange={handleChange}
                      placeholder="https://company.com"
                      icon={Globe}
                      type="url"
                    />
                  </div>

                  {/* Employment Type Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`${labelClass} mb-0`}>Employment Type</label>
                      <span className="hidden sm:inline-flex text-3xs text-text-muted font-mono">1-5 or ← / → to switch</span>
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="Employment Type"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        const types: JobFormState["employmentType"][] = [
                          "FULL_TIME",
                          "PART_TIME",
                          "CONTRACTOR",
                          "INTERN",
                          "OTHER",
                        ];
                        const currentIdx = types.indexOf(form.employmentType);
                        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextType = types[(currentIdx + 1) % types.length];
                          setForm((prev) => {
                            const updated = { ...prev, employmentType: nextType };
                            formRefState.current = updated;
                            return updated;
                          });
                        } else if (e.key === "ArrowLeft") {
                          e.preventDefault();
                          const prevType = types[(currentIdx - 1 + types.length) % types.length];
                          setForm((prev) => {
                            const updated = { ...prev, employmentType: prevType };
                            formRefState.current = updated;
                            return updated;
                          });
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const catEl = formRef.current?.querySelector<HTMLElement>('[name="category"]');
                          if (catEl) {
                            catEl.focus();
                            return;
                          }
                        } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
                          e.preventDefault();
                          const selectedType = types[parseInt(e.key, 10) - 1];
                          if (selectedType) {
                            setForm((prev) => {
                              const updated = { ...prev, employmentType: selectedType };
                              formRefState.current = updated;
                              return updated;
                            });
                          }
                        }
                      }}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/30 rounded-control"
                    >
                      {(
                        [
                          { id: "FULL_TIME" as const, label: "Full-time" },
                          { id: "PART_TIME" as const, label: "Part-time" },
                          { id: "CONTRACTOR" as const, label: "Contract" },
                          { id: "INTERN" as const, label: "Internship" },
                          { id: "OTHER" as const, label: "Other" },
                        ] as const
                      ).map((typeOption) => {
                        const isSelected = form.employmentType === typeOption.id;
                        return (
                          <button
                            key={typeOption.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => {
                              setForm((prev) => {
                                const updated = { ...prev, employmentType: typeOption.id };
                                formRefState.current = updated;
                                return updated;
                              });
                              if (error) setError("");
                            }}
                            className={`flex items-center justify-center gap-1.5 rounded-control border py-2.5 text-xs font-medium transition-all focus:outline-none ${isSelected
                              ? "border-brand bg-brand-soft text-brand shadow-subtle ring-1 ring-brand/30"
                              : "border-transparent bg-surface-subtle/70 text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
                              }`}
                          >
                            <span>{typeOption.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        isNavigatingRef.current = true;
                        e.preventDefault();
                      }}
                      onClick={handleNext}
                      className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-all duration-200 hover:bg-brand-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                      title={isCurrentStepValid ? "Continue to Location" : "Fill required fields to continue"}
                    >
                      <span>Continue to Location</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Work Mode Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`${labelClass} mb-0`}>Work Mode</label>
                      <span className="hidden sm:inline-flex text-3xs text-text-muted font-mono">1-3 or ← / → to switch</span>
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="Work Mode"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        const modes: JobFormState["workMode"][] = ["Onsite", "Hybrid", "Remote"];
                        const currentIdx = modes.indexOf(form.workMode);
                        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextMode = modes[(currentIdx + 1) % modes.length];
                          setForm((prev) => ({ ...prev, workMode: nextMode }));
                        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                          e.preventDefault();
                          const prevMode = modes[(currentIdx - 1 + modes.length) % modes.length];
                          setForm((prev) => ({ ...prev, workMode: prevMode }));
                        } else if (["1", "2", "3"].includes(e.key)) {
                          e.preventDefault();
                          const nextMode = modes[parseInt(e.key, 10) - 1];
                          if (nextMode) {
                            setForm((prev) => ({ ...prev, workMode: nextMode }));
                          }
                        }
                      }}
                      className="grid grid-cols-3 gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/30 rounded-control"
                    >
                      {(["Onsite", "Hybrid", "Remote"] as const).map((modeOption) => {
                        const isSelected = form.workMode === modeOption;
                        return (
                          <button
                            key={modeOption}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                workMode: modeOption,
                              }));
                              if (error) setError("");
                            }}
                            className={`flex items-center justify-center gap-2 rounded-control border py-2.5 text-xs font-medium transition-all focus:outline-none ${isSelected
                              ? "border-brand bg-brand-soft text-brand shadow-subtle ring-1 ring-brand/30"
                              : "border-transparent bg-surface-subtle/70 text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
                              }`}
                          >
                            {modeOption === "Onsite" && <Building2 size={13} />}
                            {modeOption === "Hybrid" && <Building2 size={13} />}
                            {modeOption === "Remote" && <Globe size={13} />}
                            <span>{modeOption === "Onsite" ? "On-site" : modeOption}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1. Company Office / Branches Picker */}
                  <div className="space-y-3">
                    <label className={labelClass}>
                      Company Office Locations / Hubs
                      <span className="ml-1 text-status-error">*</span>
                    </label>

                    <CompanyCitySelector
                      ref={citySelectorRef}
                      onSelect={handleAddOffice}
                      placeholder="Search city (e.g. Bengaluru, Kochi, Mumbai)..."
                    />
                    {fieldErrors.selectedOffices && (
                      <p className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-status-error animate-in fade-in duration-150">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{fieldErrors.selectedOffices}</span>
                      </p>
                    )}

                    {/* Selected office chips */}
                    {form.selectedOffices.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {form.selectedOffices.map((office) => (
                          <span
                            key={office.city}
                            className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-primary"
                          >
                            <span className="font-semibold">{office.city}</span>
                            {office.state && (
                              <span className="text-2xs text-text-muted">
                                ({office.state})
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveOffice(office.city)}
                              className="ml-1 text-text-muted hover:text-status-error"
                              aria-label={`Remove ${office.city}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Candidate Residency / Eligibility Scope */}
                  <div className="space-y-3 border-t border-border-default/40 pt-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`${labelClass} mb-0`}>Candidate Residency & Eligibility</label>
                      <span className="hidden sm:inline-flex text-3xs text-text-muted font-mono">1-5 or ← / → to switch</span>
                    </div>

                    <div
                      role="radiogroup"
                      aria-label="Candidate Residency & Eligibility"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        const prefs: CandidatePreference[] = [
                          "COMPANY_STATE",
                          "ALL_INDIA",
                          "EXACT_LOCATION",
                          "SPECIFIC_LOCATION",
                          "WORLDWIDE",
                        ];
                        const currentIdx = prefs.indexOf(form.candidatePreference);
                        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextPref = prefs[(currentIdx + 1) % prefs.length];
                          setForm((prev) => ({ ...prev, candidatePreference: nextPref }));
                        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                          e.preventDefault();
                          const prevPref = prefs[(currentIdx - 1 + prefs.length) % prefs.length];
                          setForm((prev) => ({ ...prev, candidatePreference: prevPref }));
                        } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
                          e.preventDefault();
                          const nextPref = prefs[parseInt(e.key, 10) - 1];
                          if (nextPref) {
                            setForm((prev) => ({ ...prev, candidatePreference: nextPref }));
                          }
                        }
                      }}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/30 rounded-control"
                    >
                      {(() => {
                        const officeStates = getOfficeStates(form.selectedOffices);
                        const stateDesc = officeStates.join(", ");
                        const officeCities = form.selectedOffices.map((o) => o.city);
                        const officeSummary = officeCities.join(", ");

                        const residencyOptions: Array<{
                          id: CandidatePreference;
                          title: string;
                          desc: string;
                          fullWidth?: boolean;
                        }> = [
                            {
                              id: "COMPANY_STATE",
                              title: "Company State",
                              desc: stateDesc
                                ? (form.workMode === "Remote" ? `Remote, within ${stateDesc}` : `Candidates in ${stateDesc} only`)
                                : (form.workMode === "Remote" ? "Remote, within company state" : "Candidates in company's state only"),
                            },
                            {
                              id: "ALL_INDIA",
                              title: "Pan-India",
                              desc: form.workMode === "Remote"
                                ? "Anywhere in India (Remote · Pan-India)"
                                : "Anywhere in India",
                            },
                            {
                              id: "EXACT_LOCATION",
                              title: "Office Location Only",
                              desc: officeSummary
                                ? (form.workMode === "Remote" ? `Remote, within ${officeSummary}` : `Local candidates in ${officeSummary} only`)
                                : (form.workMode === "Remote" ? "Remote, but candidate must reside in office city" : "Local candidates only"),
                            },
                            {
                              id: "SPECIFIC_LOCATION",
                              title: "Specific States / Cities",
                              desc: "Limit eligible applicants to chosen regions or cities",
                            },
                            {
                              id: "WORLDWIDE",
                              title: "Worldwide",
                              desc: form.workMode === "Remote"
                                ? "Open to global international candidates"
                                : "International applicants",
                              fullWidth: true,
                            },
                          ];

                        return residencyOptions.map((pref) => {
                          const isSelected = form.candidatePreference === pref.id;
                          return (
                            <button
                              key={pref.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  candidatePreference: pref.id,
                                }));
                                setFieldErrors((prev) => {
                                  if (!prev.preferredTargets) return prev;
                                  const copy = { ...prev };
                                  delete copy.preferredTargets;
                                  return copy;
                                });
                                if (error) setError("");
                              }}
                              className={`flex flex-col rounded-control border p-3 text-left transition-all ${pref.fullWidth ? "sm:col-span-2" : ""
                                } ${isSelected
                                  ? "border-brand bg-brand-soft/60 shadow-subtle ring-1 ring-brand/30"
                                  : "border-border-default bg-surface-card hover:border-border-strong"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold ${isSelected ? "text-brand" : "text-text-primary"
                                    }`}
                                >
                                  {pref.title}
                                </span>
                                {isSelected && <Check size={14} className="text-brand" />}
                              </div>
                              <span className="mt-1 text-2xs leading-4 text-text-muted">
                                {pref.desc}
                              </span>
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Feedback helper when COMPANY_STATE is selected */}
                    {form.candidatePreference === "COMPANY_STATE" && (
                      <div className="rounded-control border border-border-default/60 bg-surface-subtle/50 px-3 py-2 text-xs text-text-secondary">
                        {(() => {
                          const states = getOfficeStates(form.selectedOffices);
                          if (states.length > 0) {
                            return (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="shrink-0 text-brand" />
                                <span>
                                  Candidates residing in <strong className="text-text-primary">{states.join(", ")}</strong> will be eligible to apply.
                                </span>
                              </span>
                            );
                          }
                          return (
                            <span className="text-2xs text-text-muted">
                              Add your company office location above to automatically limit applicant eligibility to your company&apos;s state.
                            </span>
                          );
                        })()}
                      </div>
                    )}

                    {/* Feedback helper when EXACT_LOCATION is selected */}
                    {form.candidatePreference === "EXACT_LOCATION" && (
                      <div className="rounded-control border border-border-default/60 bg-surface-subtle/50 px-3 py-2 text-xs text-text-secondary">
                        {form.selectedOffices.length > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="shrink-0 text-brand" />
                            <span>
                              Only candidates residing in <strong className="text-text-primary">{form.selectedOffices.map((o) => o.city).join(", ")}</strong> will be eligible to apply.
                            </span>
                          </span>
                        ) : (
                          <span className="text-2xs text-text-muted">
                            Add your company office location above to automatically limit applicant eligibility to your office city.
                          </span>
                        )}
                      </div>
                    )}

                    {/* Specific targets selector if chosen */}
                    {form.candidatePreference === "SPECIFIC_LOCATION" && (
                      <div className="mt-3 space-y-2 rounded-control border border-border-default bg-surface-subtle/40 p-3.5">
                        <label className={labelClass}>
                          Add Allowed Cities or States
                        </label>
                        <CandidateScopeSelector
                          ref={scopeSelectorRef}
                          onAdd={handleAddPreferredTarget}
                          placeholder="Search allowed city or state..."
                        />
                        {fieldErrors.preferredTargets && (
                          <p className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-status-error animate-in fade-in duration-150">
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{fieldErrors.preferredTargets}</span>
                          </p>
                        )}

                        {form.preferredTargets.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {form.preferredTargets.map((target) => (
                              <span
                                key={target.name}
                                className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-card px-2 py-0.5 text-xs text-text-primary"
                              >
                                <span>{target.name}</span>
                                <span className="text-3xs text-text-muted">
                                  ({target.type})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePreferredTarget(target.name)}
                                  className="ml-1 text-text-muted hover:text-status-error"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleBack}
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary shadow-subtle transition-all hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary active:scale-[0.99]"
                    >
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        isNavigatingRef.current = true;
                        e.preventDefault();
                      }}
                      onClick={handleNext}
                      className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-all duration-200 hover:bg-brand-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                      title={isCurrentStepValid ? "Continue to Compensation" : "Add office location to continue"}
                    >
                      <span>Continue to Compensation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: COMPENSATION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Experience fields */}
                  <div>
                    <label className={labelClass}>
                      Experience Requirement (Years)
                      <span className="ml-1 text-status-error">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Minimum (0 for Fresher)"
                        name="experienceMin"
                        value={form.experienceMin}
                        onChange={handleChange}
                        placeholder="0"
                        type="number"
                        min="0"
                        max="30"
                        error={fieldErrors.experienceMin}
                        required
                      />

                      <Field
                        label="Maximum (Optional)"
                        name="experienceMax"
                        value={form.experienceMax}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        type="number"
                        min="0"
                        max="30"
                        error={fieldErrors.experienceMax}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                      <span>Formatted display:</span>
                      <span className="rounded-control bg-surface-subtle px-2 py-0.5 font-semibold text-text-primary">
                        {previewExperience}
                      </span>
                    </div>
                  </div>

                  {/* Compensation & Salary Section */}
                  <SalarySection form={form} setForm={setForm} error={fieldErrors.salary} />

                  {/* Application Email & Posting Date */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Field
                        label="Application Email"
                        name="mail"
                        value={form.mail}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        placeholder="careers@company.com"
                        icon={Mail}
                        type="email"
                        error={fieldErrors.mail}
                        required
                      />
                      <div className="min-h-[22px]">
                        {isValidatingEmail && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-2xs font-medium text-text-muted animate-in fade-in duration-150">
                            <LoaderCircle size={12} className="animate-spin text-brand shrink-0" />
                            <span>Verifying mail server & MX records...</span>
                          </p>
                        )}
                        {!isValidatingEmail && !fieldErrors.mail && emailVerifiedDomain && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-2xs font-medium text-text-muted animate-in fade-in duration-150">
                            <CheckCircle2 size={12} className="shrink-0 text-brand" />
                            <span>Active email domain (@{emailVerifiedDomain})</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Field
                        label="Posting Date"
                        name="postedDate"
                        value={form.postedDate}
                        onChange={handleChange}
                        placeholder="YYYY-MM-DD"
                        type="date"
                        icon={CalendarDays}
                        required
                      />
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleBack}
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary shadow-subtle transition-all hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary active:scale-[0.99]"
                    >
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        isNavigatingRef.current = true;
                        e.preventDefault();
                      }}
                      onClick={handleNext}
                      disabled={isCheckingNext}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-all duration-200 hover:bg-brand-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${isCheckingNext ? "cursor-wait opacity-70" : ""
                        }`}
                      title={isCurrentStepValid ? "Continue to Review" : "Fill experience and valid email to continue"}
                    >
                      {isCheckingNext ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />
                          <span>Verifying & Continuing...</span>
                        </>
                      ) : (
                        <span>Continue to Review</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <label htmlFor="description" className={`${labelClass} mb-0`}>
                          Job Description & Requirements
                          <span className="ml-1 text-status-error">*</span>
                        </label>
                      </div>

                      {/* Top Action Buttons: Revert, Clean Text, AI Assistant */}
                      <div className="flex flex-wrap items-center gap-2">
                        {previousDescription !== null && previousDescription !== form.description && (
                          <button
                            type="button"
                            onClick={handleRevertDescription}
                            title="Revert to previous description"
                            className="inline-flex items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-secondary transition hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary shadow-subtle cursor-pointer"
                          >
                            <RotateCcw size={14} />
                            <span>Revert</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={!form.description.trim()}
                          onClick={handleCleanDescription}
                          title="Remove icons, emojis, and raw markdown (*, #) without changing your words"
                          className="inline-flex items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-secondary transition hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary shadow-subtle disabled:opacity-40 cursor-pointer"
                        >
                          <Eraser size={14} />
                          <span>Clean Text</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowAiDescDrawer((prev) => !prev)}
                          className={`inline-flex items-center gap-2 rounded-control px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium transition shadow-subtle cursor-pointer ${showAiDescDrawer
                            ? "bg-brand text-text-inverse ring-1 ring-brand/30"
                            : "border border-brand/30 bg-brand-soft/60 text-brand hover:bg-brand-soft"
                            }`}
                        >
                          <Sparkles size={14} fill="currentColor" />
                          <span>AI Assistant & Prompt</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Assistant Drawer for custom instructions & expansion */}
                    {showAiDescDrawer && (
                      <div className="rounded-control border border-brand/25 bg-gradient-to-br from-brand-soft/60 via-surface-card to-brand-soft/25 p-3.5 sm:p-4 shadow-subtle animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-brand/15">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-control bg-brand text-text-inverse">
                              <Sparkles size={11} fill="currentColor" />
                            </span>
                            <span className="text-xs font-bold text-text-primary">
                              AI Description Assistant
                            </span>
                            <span className="text-3xs text-text-muted">
                              • Custom prompts, expansion &amp; polishing
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAiDescDrawer(false)}
                            className="text-text-muted hover:text-text-primary transition p-0.5 cursor-pointer"
                            title="Close AI Assistant"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          <div className="relative">
                            <input
                              type="text"
                              value={aiCustomInstruction}
                              maxLength={1000}
                              onChange={(e) => setAiCustomInstruction(e.target.value)}
                              placeholder="Give instructions (e.g. 'Expand with 8 responsibilities', 'Focus on Figma & mobile design', 'Make it detailed')..."
                              className="w-full rounded-control border border-border-default bg-surface-card px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/70 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-subtle"
                            />
                          </div>

                          {/* Preset Instruction Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 text-2xs">
                            <span className="text-3xs font-semibold text-text-muted mr-0.5">Quick chips:</span>
                            {[
                              "Expand into full detailed JD",
                              "Add 6-8 key responsibilities",
                              "Focus on design systems & Figma",
                              "Structure with clean bullet points",
                              "Add tech requirements & nice-to-haves",
                            ].map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setAiCustomInstruction(chip)}
                                className="rounded-control border border-border-default/80 bg-surface-card px-2 py-0.5 text-[10.5px] font-medium text-text-secondary hover:border-brand/40 hover:bg-brand-soft hover:text-brand transition cursor-pointer"
                              >
                                + {chip}
                              </button>
                            ))}
                          </div>

                          {/* Actions inside Drawer */}
                          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-brand/15">
                            <button
                              type="button"
                              disabled={isGeneratingDesc || !form.title.trim()}
                              onClick={() => handleGenerateDescription()}
                              className="inline-flex items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition shadow-subtle disabled:opacity-40 cursor-pointer"
                            >
                              {isGeneratingDesc ? (
                                <>
                                  <LoaderCircle size={14} className="animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} fill="currentColor" />
                                  <span>Generate From Title</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isEnhancingDesc || !form.description.trim()}
                              onClick={() => handleEnhanceDescription()}
                              className="inline-flex items-center gap-2 rounded-control bg-brand px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-text-inverse hover:bg-brand-hover shadow-subtle transition disabled:opacity-40 cursor-pointer"
                            >
                              {isEnhancingDesc ? (
                                <>
                                  <LoaderCircle size={14} className="animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 size={14} fill="currentColor" />
                                  <span>
                                    {aiCustomInstruction.trim()
                                      ? "Apply Custom Instructions"
                                      : form.description.trim().length < 150
                                        ? "Expand & Polish Draft"
                                        : "Enhance & Polish Draft"}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Unified Description Editor / Preview Container */}
                    <div
                      className={`rounded-control border bg-surface-card p-4 sm:p-5 shadow-subtle min-h-[260px] transition-[border-color,box-shadow] ${fieldErrors.description
                        ? "border-status-error ring-1 ring-status-error/30"
                        : "border-border-default focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
                        }`}
                    >
                      {/* Fixed Header: Title on Left, Edit & Preview on Right */}
                      <div className="mb-3.5 flex items-center justify-between border-b border-border-default/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                            {descriptionTab === "edit" ? "Edit Description" : "Live Candidate View"}
                          </span>
                        </div>

                        {/* Edit & Preview Toggle (Stays fixed on the right, no border, no total bg) */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDescriptionTab("edit");
                              requestAnimationFrame(() => {
                                adjustDescriptionHeight();
                                descriptionTextareaRef.current?.focus();
                              });
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-xs font-medium transition cursor-pointer bg-transparent ${descriptionTab === "edit"
                              ? "text-brand"
                              : "text-text-muted hover:text-text-primary"
                              }`}
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <span className="text-border-default/60 text-xs select-none">/</span>
                          <button
                            type="button"
                            onClick={() => setDescriptionTab("preview")}
                            className={`inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-xs font-medium transition cursor-pointer bg-transparent ${descriptionTab === "preview"
                              ? "text-brand"
                              : "text-text-muted hover:text-text-primary"
                              }`}
                          >
                            <Eye size={12} />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      {descriptionTab === "edit" ? (
                        <div>
                          <textarea
                            ref={descriptionTextareaRef}
                            id="description"
                            name="description"
                            value={form.description}
                            maxLength={35000}
                            onChange={(e) => {
                              handleChange(e);
                              adjustDescriptionHeight();
                            }}
                            onKeyDown={handleDescriptionKeyDown}
                            onInput={adjustDescriptionHeight}
                            placeholder="Paste or write the complete role description, responsibilities, and requirements..."
                            style={{
                              minHeight: "220px",
                              overflow: "hidden",
                              resize: "none",
                            }}
                            className="w-full bg-transparent p-0 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/70 outline-none border-0 ring-0 focus:outline-none focus:ring-0"
                            required
                          />
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-border-default/30 pt-2 text-2xs text-text-muted">
                            <span>
                              Tip: Press Enter on a bullet (<code className="rounded bg-surface-subtle px-1 py-0.5 text-text-secondary font-mono">•</code>) to automatically insert the next one.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {form.description.trim() ? (
                            <FormattedDescription content={form.description} hideInitialHeading={false} />
                          ) : (
                            <div className="py-8 text-center text-xs text-text-muted">
                              No description entered yet. Switch back to Edit or click &ldquo;Generate Description&rdquo;.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {fieldErrors.description && (
                      <p className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-status-error animate-in fade-in duration-150">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{fieldErrors.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Live Preview Summary Card */}
                  <div className="rounded-card border border-border-default bg-surface-subtle/50 p-5">
                    <div className="flex items-center justify-between border-b border-border-default/50 pb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Listing Preview
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-control bg-surface-subtle px-2 py-0.5 text-2xs font-medium text-text-secondary border border-border-default/40">
                          {form.category || "UI/UX & Product Design"}
                        </span>
                        <span className="rounded-control bg-brand-soft px-2 py-0.5 text-2xs font-semibold text-brand">
                          {form.workMode}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-lg font-bold text-text-primary">
                        {form.title || "Untitled Role"}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-text-secondary">
                        {form.company || "Company not specified"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-default/40 pt-3 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-text-muted block text-3xs uppercase font-semibold">
                          Location
                        </span>
                        <span className="mt-0.5 font-medium text-text-primary truncate block">
                          {previewLocation}
                        </span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-3xs uppercase font-semibold">
                          Experience
                        </span>
                        <span className="mt-0.5 font-medium text-text-primary block">
                          {previewExperience}
                        </span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-3xs uppercase font-semibold">
                          Salary
                        </span>
                        <span className="mt-0.5 font-semibold text-brand block">
                          {form.salary || "Not Disclosed"}
                        </span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-3xs uppercase font-semibold">
                          Contact
                        </span>
                        <span className="mt-0.5 font-medium text-text-primary truncate block">
                          {form.mail || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account required notice on Step 4 */}
                  {mode === "public" && !user && (
                    <div className="mt-4 rounded-control border border-brand/25 bg-brand-soft/25 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand text-text-inverse shadow-subtle">
                            <LogIn size={16} />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-text-primary">
                              Log in required to submit
                            </h4>
                            <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
                              Your job details are ready! Sign in to submit this job for review. Your entered details will be preserved.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveDraftAndRedirectToLogin}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-brand px-4 py-2 text-xs font-medium text-text-inverse shadow-subtle transition hover:bg-brand-hover cursor-pointer"
                        >
                          <LogIn size={14} />
                          <span>Log in to Post Job</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Daily limit reached notice on Step 4 */}
                  {mode === "public" && user && userLimitInfo && userLimitInfo.remaining <= 0 && (
                    <div className="mt-4 rounded-control border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                        <div>
                          <p className="font-semibold text-text-primary">
                            Daily posting limit reached (20/20 jobs posted today)
                          </p>
                          <p className="mt-0.5 text-text-secondary leading-relaxed">
                            To ensure platform quality and prevent spam, users can submit up to 20 job listings per 24 hours. Your entries remain saved, and submissions will reopen tomorrow.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Submit Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-xs font-medium text-text-secondary shadow-subtle transition-all hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary disabled:opacity-50 cursor-pointer"
                    >
                      <span>Back</span>
                    </button>

                    {mode === "public" && !user ? (
                      <button
                        type="button"
                        onClick={handleSaveDraftAndRedirectToLogin}
                        className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-xs font-medium text-text-inverse shadow-subtle transition-all duration-200 hover:bg-brand-hover ring-1 ring-brand/30 cursor-pointer"
                        title="Log in to submit your job listing"
                      >
                        <LogIn size={15} />
                        <span>Log In to Post Job</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || (mode === "public" && Boolean(userLimitInfo && userLimitInfo.remaining <= 0))}
                        className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-all duration-200 hover:bg-brand-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${mode === "public" && userLimitInfo && userLimitInfo.remaining <= 0
                            ? "cursor-not-allowed opacity-50 bg-border-strong text-text-muted shadow-none"
                            : isSubmitting
                              ? "cursor-wait opacity-70"
                              : ""
                          }`}
                        title={
                          mode === "public" && userLimitInfo && userLimitInfo.remaining <= 0
                            ? "Daily posting limit of 20 jobs reached. Submissions reopen tomorrow."
                            : isCurrentStepValid
                              ? "Publish job listing"
                              : "Enter job description to publish"
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle size={15} className="animate-spin" />
                            <span>
                              {mode === "edit"
                                ? "Saving..."
                                : mode === "public"
                                  ? "Submitting..."
                                  : "Publishing..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>
                              {mode === "edit"
                                ? "Save Changes"
                                : mode === "public"
                                  ? "Submit for Review"
                                  : "Publish Job Listing"}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* How It Works Modal */}
        <Modal
          isOpen={showHowItWorksModal}
          onClose={() => setShowHowItWorksModal(false)}
          maxWidth="2xl"
          bodyClassName="p-5 sm:p-6"
          title={
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-text-primary sm:text-lg">
                How Posting Works
              </span>
              <span className="rounded-control bg-brand-soft px-2 py-0.5 text-3xs font-semibold text-brand">
                4 Quick Steps
              </span>
            </div>
          }
          description="Direct candidate reach to your HR email. Zero agency fees, zero middlemen."
        >
          <div className="space-y-4">
            {/* Step list */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                    1
                  </span>
                  <h3 className="text-xs font-semibold text-text-primary">
                    Role & AI Auto-Fill
                  </h3>
                </div>
                <p className="text-2xs leading-relaxed text-text-muted">
                  Add job title and role type, or paste raw notes and let Gemini AI fill all 4 steps.
                </p>
              </div>

              <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                    2
                  </span>
                  <h3 className="text-xs font-semibold text-text-primary">
                    Work Mode & City
                  </h3>
                </div>
                <p className="text-2xs leading-relaxed text-text-muted">
                  Select Onsite, Hybrid, or Remote and pick your office branch or pan-India.
                </p>
              </div>

              <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                    3
                  </span>
                  <h3 className="text-xs font-semibold text-text-primary">
                    Salary & Direct HR Email
                  </h3>
                </div>
                <p className="text-2xs leading-relaxed text-text-muted">
                  Set salary and your official HR email. Candidate resumes land straight in your inbox.
                </p>
              </div>

              <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                    4
                  </span>
                  <h3 className="text-xs font-semibold text-text-primary">
                    Review & Go Live
                  </h3>
                </div>
                <p className="text-2xs leading-relaxed text-text-muted">
                  Quick preview and publish. Your opening goes live immediately with ₹0 commission.
                </p>
              </div>
            </div>

            {/* Key Advantages Banner */}
            <div className="rounded-control border border-brand/20 bg-brand-soft/40 p-3">
              <h4 className="text-xs font-bold text-text-primary mb-1.5 flex items-center gap-2">
                <Sparkles size={13} className="text-brand" />
                <span>Direct Employer Benefits</span>
              </h4>
              <div className="grid gap-2 text-2xs text-text-secondary sm:grid-cols-3">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-brand shrink-0" />
                  <span>Direct to your HR email</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-brand shrink-0" />
                  <span>₹0 Commission & no hidden fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-brand shrink-0" />
                  <span>Top tech & design talent</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowHowItWorksModal(false)}
                className="rounded-control bg-brand px-5 py-2 text-xs font-medium text-text-inverse shadow-subtle transition hover:bg-brand-hover"
              >
                Got it, let's post
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
