"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Lock,
  Sparkles,
  FileText,
  Download,
  Loader2,
  Check,
  Eye,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/app/components/Modal";

const LINK_ICONS: Record<string, React.ReactNode> = {
  Portfolio: <Globe size={13} strokeWidth={1.8} />,
  LinkedIn: <Linkedin size={13} strokeWidth={1.8} />,
  GitHub: <Github size={13} strokeWidth={1.8} />,
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </h2>
  );
}

export default function FullCandidateProfile() {
  const { user, profile, isLoading, refreshProfile, signOut } = useAuth();

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Form State for editing candidate profile
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    location: "",
    phone: "",
    summary: "",
    resumeUrl: "",
    resumeName: "",
    skillsString: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
  });

  // Populate form on opening edit modal
  const handleOpenEdit = () => {
    setForm({
      fullName:
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        "",
      headline: profile?.headline || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
      summary: profile?.summary || "",
      resumeUrl: profile?.resume_url || "",
      resumeName: profile?.resume_name || "Candidate_Resume.pdf",
      skillsString: (profile?.skills || []).join(", "),
      portfolioUrl: profile?.portfolio_url || "",
      linkedinUrl: profile?.linkedin_url || "",
      githubUrl: profile?.github_url || "",
    });
    setIsEditModalOpen(true);
  };

  // Save profile to Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const parsedSkills = form.skillsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name: form.fullName.trim() || null,
          headline: form.headline.trim() || null,
          location: form.location.trim() || null,
          phone: form.phone.trim() || null,
          summary: form.summary.trim() || null,
          resume_url: form.resumeUrl.trim() || null,
          resume_name: form.resumeName.trim() || null,
          skills: parsedSkills,
          portfolio_url: form.portfolioUrl.trim() || null,
          linkedin_url: form.linkedinUrl.trim() || null,
          github_url: form.githubUrl.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      console.error("Profile save error:", err);
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy helper
  const copyToClipboard = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Copy public candidate share link
  const handleCopyPublicLink = async () => {
    if (!user) return;
    const publicUrl = `${window.location.origin}/candidates/${user.id}`;
    await copyToClipboard(publicUrl, "Public profile link copied!");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully.");
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: unknown) {
      console.error("Account deletion error:", err);
      const msg =
        err instanceof Error ? err.message : "Error deleting account";
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  // Profile data
  const name =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const initials =
    name
      .split(" ")
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const email = user?.email || profile?.email || "";
  const headline = profile?.headline;
  const location = profile?.location || "";
  const phone = profile?.phone;
  const summary = profile?.summary;
  const resumeUrl = profile?.resume_url;
  const resumeName = profile?.resume_name || "Candidate_Resume.pdf";
  const skills = useMemo(() => profile?.skills || [], [profile?.skills]);
  const linkedin = profile?.linkedin_url;
  const github = profile?.github_url;
  const portfolio = profile?.portfolio_url;

  // Active links list
  const activeLinks = useMemo(() => {
    const list: { label: string; href: string }[] = [];
    if (portfolio) list.push({ label: "Portfolio", href: portfolio });
    if (linkedin) list.push({ label: "LinkedIn", href: linkedin });
    if (github) list.push({ label: "GitHub", href: github });
    return list;
  }, [portfolio, linkedin, github]);

  // Profile Completion calculation (0 - 100%)
  const completion = useMemo(() => {
    const checks = [
      { label: "Avatar", passed: Boolean(avatarUrl), weight: 15 },
      { label: "Full name", passed: Boolean(name && name !== "Candidate"), weight: 15 },
      { label: "Headline", passed: Boolean(headline), weight: 15 },
      { label: "Location", passed: Boolean(location), weight: 10 },
      { label: "About summary", passed: Boolean(summary), weight: 20 },
      { label: "Skills", passed: skills.length > 0, weight: 15 },
      { label: "Resume attached", passed: Boolean(resumeUrl), weight: 10 },
    ];
    const total = checks.reduce(
      (acc, item) => acc + (item.passed ? item.weight : 0),
      0
    );
    return { total };
  }, [avatarUrl, name, headline, location, summary, skills, resumeUrl]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 size={24} className="animate-spin text-brand" />
          <p className="text-xs font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-control border border-border-default bg-surface-base px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none";

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-base text-text-primary antialiased selection:bg-brand-soft selection:text-brand">
      <style>{`
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-in {
          opacity: 0;
          animation: hero-in 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          animation-delay: var(--d, 0ms);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-in { opacity: 1; animation: none; }
        }
      `}</style>

      {/* TOP STATUS BAR: Private Indicator + Switcher */}
      <div className="border-b border-border-subtle/60 bg-surface-base/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-8">
          <div className="inline-flex items-center gap-2 text-2xs font-medium text-text-muted">
            <Lock size={12} className="text-text-muted" />
            <span>Private Candidate Account</span>
          </div>

          <div className="flex items-center gap-3 text-2xs">
            <Link
              href={`/candidates/${user.id}`}
              className="inline-flex items-center gap-1 font-medium text-text-secondary transition hover:text-brand"
            >
              <Eye size={12} />
              <span>Public View</span>
            </Link>
            <span className="text-border-default">·</span>
            <Link
              href="/profile/dummy"
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              <Sparkles size={11} />
              <span>Dummy Showcase</span>
            </Link>
          </div>
        </div>
      </div>

      {/* HERO: Concentric rings behind the avatar */}
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
          <header>
            {/* Avatar with concentric radial rings */}
            <div
              className="hero-in relative h-24 w-24"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(56rem,90vw)] w-[min(56rem,90vw)] -translate-x-1/2 -translate-y-1/2 text-brand"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle closest-side, black 20%, transparent 100%)",
                  maskImage:
                    "radial-gradient(circle closest-side, black 20%, transparent 100%)",
                }}
              >
                {[
                  { size: "20%", o: 0.22 },
                  { size: "34%", o: 0.17 },
                  { size: "50%", o: 0.13 },
                  { size: "70%", o: 0.09 },
                  { size: "100%", o: 0.06 },
                ].map((r) => (
                  <span
                    key={r.size}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current"
                    style={{ width: r.size, height: r.size, opacity: r.o }}
                  />
                ))}
              </div>

              {avatarUrl && !avatarError ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={96}
                  height={96}
                  priority
                  unoptimized
                  onError={() => setAvatarError(true)}
                  className="relative h-24 w-24 rounded-full object-cover ring-4 ring-surface-base shadow-subtle"
                />
              ) : (
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white ring-4 ring-surface-base shadow-subtle">
                  {initials}
                </div>
              )}
            </div>

            {/* Active Status Badge */}
            <div
              className="hero-in mt-4 inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-surface-base px-3 py-1 text-xs font-medium text-text-secondary sm:mt-5"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new roles
            </div>

            {/* Candidate Title & Headline */}
            <h1
              className="hero-in mt-3.5 text-3xl font-bold tracking-tight sm:mt-4 sm:text-5xl lg:text-6xl break-words"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              {name}
            </h1>
            <p
              className="hero-in mt-2 text-base text-text-secondary sm:text-lg lg:text-xl leading-snug sm:leading-normal"
              style={{ "--d": "240ms" } as React.CSSProperties}
            >
              {headline || (
                <span className="italic text-text-muted">
                  No headline set yet · Click &quot;Edit profile&quot; to describe your role
                </span>
              )}
            </p>

            {/* Location & Links Bar */}
            <div
              className="hero-in mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:mt-5 sm:gap-x-5 sm:text-sm"
              style={{ "--d": "320ms" } as React.CSSProperties}
            >
              {location ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
                  <MapPin size={14} strokeWidth={1.8} className="text-brand" />
                  {location}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex cursor-pointer items-center gap-1 text-text-muted hover:text-brand hover:underline"
                >
                  <MapPin size={13} />
                  <span>+ Add location</span>
                </button>
              )}

              {activeLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-text-secondary transition hover:text-brand"
                >
                  {LINK_ICONS[l.label] || <ExternalLink size={13} />}
                  {l.label}
                </a>
              ))}

              {activeLinks.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex cursor-pointer items-center gap-1 text-text-muted hover:text-brand hover:underline"
                >
                  <Plus size={12} /> Add links (Portfolio, LinkedIn, GitHub)
                </button>
              )}
            </div>

            {/* Mobile-Friendly Action Buttons */}
            <div
              className="hero-in mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3"
              style={{ "--d": "400ms" } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-6 text-sm font-semibold text-text-inverse transition hover:bg-brand-hover active:scale-[0.98] sm:flex-initial"
              >
                <Pencil size={14} />
                <span>Edit profile</span>
              </button>

              <Link
                href={`/candidates/${user.id}`}
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-base px-5 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand sm:flex-initial"
              >
                <Eye size={14} />
                <span>Public view</span>
              </Link>

              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-base px-4 text-sm font-semibold text-text-secondary transition hover:border-brand hover:text-brand"
                title="Copy public link"
              >
                {copiedLink ? (
                  <Check size={14} className="text-status-success" />
                ) : (
                  <Share2 size={14} />
                )}
                <span className="hidden sm:inline">Share</span>
              </button>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  download={resumeName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-base px-5 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                >
                  <Download size={14} />
                  <span>Resume PDF</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-control border border-dashed border-border-strong bg-surface-base px-5 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand-soft/30"
                >
                  <Plus size={14} />
                  <span>Attach Resume</span>
                </button>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* MAIN CONTAINER: 2-COLUMN EDITORIAL (Sticky facts left + story right) */}
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8 sm:pb-20">
        <div className="grid gap-6 pt-4 sm:gap-10 sm:pt-6 lg:grid-cols-[17rem_1fr] lg:gap-14">
          
          {/* ---------- LEFT: Recruiter Facts & Account Details ---------- */}
          <aside className="space-y-4 sm:space-y-6 lg:sticky lg:top-8 lg:self-start lg:space-y-8">
            
            {/* At a glance (Mobile responsive 2-column or desktop stack) */}
            <section className="space-y-3 rounded-panel border border-border-subtle/80 bg-surface-card/40 p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <div className="flex items-center justify-between">
                <Heading>At a glance</Heading>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-2xs font-semibold text-brand hover:underline lg:hidden"
                >
                  Edit
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs sm:text-sm lg:block lg:space-y-3.5">
                <div className="min-w-0">
                  <dt className="text-2xs text-text-muted">Account</dt>
                  <dd className="mt-0.5 font-semibold text-text-primary truncate">
                    Verified Candidate
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="text-2xs text-text-muted">Profile strength</dt>
                  <dd className="mt-0.5 font-semibold text-brand truncate">
                    {completion.total}% Complete
                  </dd>
                </div>

                {headline && (
                  <div className="min-w-0">
                    <dt className="text-2xs text-text-muted">Role focus</dt>
                    <dd className="mt-0.5 text-text-secondary truncate sm:whitespace-normal">
                      {headline}
                    </dd>
                  </div>
                )}

                {location && (
                  <div className="min-w-0">
                    <dt className="text-2xs text-text-muted">Location</dt>
                    <dd className="mt-0.5 text-text-secondary truncate">{location}</dd>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="min-w-0">
                    <dt className="text-2xs text-text-muted">Skills</dt>
                    <dd className="mt-0.5 text-text-secondary truncate">{skills.length} listed</dd>
                  </div>
                )}

                <div className="min-w-0">
                  <dt className="text-2xs text-text-muted">Resume</dt>
                  <dd className="mt-0.5 text-brand font-medium truncate">
                    {resumeUrl ? "Attached & active" : "None uploaded"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Contact Details */}
            <section className="space-y-3 rounded-panel border border-border-subtle/80 bg-surface-card/40 p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <Heading>Contact</Heading>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <a
                  href={`mailto:${email}`}
                  className="block break-all text-text-secondary transition hover:text-brand"
                >
                  {email}
                </a>
                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="block text-text-secondary transition hover:text-brand"
                  >
                    {phone}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="block text-2xs italic text-text-muted hover:text-brand"
                  >
                    + Add phone number
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => copyToClipboard(email, "Email copied")}
                  className="cursor-pointer text-xs font-medium text-brand transition hover:underline"
                >
                  Copy email
                </button>
              </div>
            </section>

            {/* Account & Security (Private Actions) */}
            <section className="space-y-3 rounded-panel border border-border-subtle/80 bg-surface-card/40 p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <Heading>Account & Security</Heading>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-3xs text-text-muted uppercase">Google Email</span>
                  <p className="font-medium text-text-primary break-all">{email}</p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-base py-2 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-brand"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 py-1 text-2xs font-medium text-status-error hover:underline"
                  >
                    <Trash2 size={11} />
                    <span>Delete account</span>
                  </button>
                </div>
              </div>
            </section>
          </aside>

          {/* ---------- RIGHT: Editorial Story & Credentials ---------- */}
          <main className="min-w-0 divide-y divide-border-subtle">
            
            {/* Stats Bar */}
            <section className="grid grid-cols-2 gap-3 pb-6 sm:gap-6 sm:grid-cols-4 sm:pb-8">
              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {completion.total}%
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Profile strength</p>
              </div>

              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {skills.length}
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Skills listed</p>
              </div>

              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {resumeUrl ? "1 File" : "None"}
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Resume status</p>
              </div>

              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight text-brand sm:text-2xl">
                  Active
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Visibility</p>
              </div>
            </section>

            {/* About / Summary Section */}
            <section className="space-y-3.5 py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <Heading>About</Heading>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-2xs font-semibold text-brand hover:underline"
                >
                  {summary ? "Edit summary" : "+ Add summary"}
                </button>
              </div>

              {summary ? (
                <div className="space-y-3 text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                  {summary}
                </div>
              ) : (
                <div className="rounded-card border border-dashed border-border-default bg-surface-card/40 p-5 text-center">
                  <p className="text-xs text-text-muted">
                    No summary written yet. Describe your craft, accomplishments, and target roles to attract recruiters.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 py-1.5 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
                  >
                    <Plus size={13} />
                    <span>Write Summary</span>
                  </button>
                </div>
              )}

              {/* Superpowers / Strengths extracted from skills */}
              {skills.length > 0 && (
                <ul className="grid gap-x-6 gap-y-1.5 pt-2 text-sm text-text-secondary sm:grid-cols-2">
                  {skills.slice(0, 4).map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-brand">—</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Skills Section */}
            <section className="space-y-4 py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <Heading>Skills</Heading>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-2xs font-semibold text-brand hover:underline"
                >
                  Edit skills
                </button>
              </div>

              {skills.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-pill border border-border-default bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand hover:text-brand"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-card border border-dashed border-border-default bg-surface-card/40 p-5 text-center">
                  <p className="text-xs text-text-muted">
                    No skills added. Add tools like Figma, Next.js, Design Systems, React, or TypeScript.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 py-1.5 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
                  >
                    <Plus size={13} />
                    <span>Add Skills</span>
                  </button>
                </div>
              )}
            </section>

            {/* Resume Section */}
            <section className="space-y-4 py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <Heading>Resume & Documents</Heading>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-2xs font-semibold text-brand hover:underline"
                >
                  {resumeUrl ? "Update resume" : "+ Attach resume"}
                </button>
              </div>

              {resumeUrl ? (
                <div className="flex flex-col gap-4 rounded-card border border-border-subtle bg-surface-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                      <FileText size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary truncate max-w-[220px] sm:max-w-xs">
                        {resumeName}
                      </h3>
                      <p className="text-xs text-text-muted">
                        ATS-ready candidate resume
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <button
                      type="button"
                      onClick={() => setIsResumePreviewOpen(true)}
                      className="cursor-pointer text-text-secondary transition hover:text-brand"
                    >
                      Preview
                    </button>
                    <a
                      href={resumeUrl}
                      download={resumeName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand underline-offset-4 hover:underline"
                    >
                      Download PDF ↓
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-card border border-dashed border-border-default bg-surface-card/40 p-5 text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-brand">
                    <FileText size={18} />
                  </span>
                  <p className="mt-2 text-xs font-semibold text-text-primary">
                    No resume linked yet
                  </p>
                  <p className="mt-1 text-2xs text-text-muted">
                    Profiles with resumes receive 3x more views from hiring teams.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 py-1.5 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
                  >
                    <Plus size={13} />
                    <span>Attach Resume URL</span>
                  </button>
                </div>
              )}
            </section>

            {/* Portfolios & Online Links */}
            <section className="space-y-4 py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <Heading>Online Portfolios & Links</Heading>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-2xs font-semibold text-brand hover:underline"
                >
                  Edit links
                </button>
              </div>

              {activeLinks.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {activeLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default bg-surface-card p-3 text-xs text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <span className="flex items-center gap-2">
                        {LINK_ICONS[l.label] || <ExternalLink size={13} />}
                        <span className="font-semibold">{l.label}</span>
                      </span>
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-card border border-dashed border-border-default bg-surface-card/40 p-4 text-center">
                  <p className="text-xs text-text-muted">
                    Connect your portfolio, GitHub, or LinkedIn to showcase your work.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="mt-2 text-xs font-semibold text-brand hover:underline"
                  >
                    + Add links
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: EDIT PROFILE MODAL
         ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!isSaving) setIsEditModalOpen(false);
        }}
        maxWidth="xl"
        variant="auto"
        bodyClassName="p-5 sm:p-6"
        title="Edit Candidate Profile"
        description="Update your credentials, bio, skills, and links."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Full Name <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, India or Remote"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Target Role / Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Product Designer"
                value={form.headline}
                onChange={(e) =>
                  setForm({ ...form, headline: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Phone Number (Private)
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
              About / Professional Bio
            </label>
            <textarea
              rows={4}
              placeholder="Tell hiring teams about your design craft, leadership, and accomplishments..."
              value={form.summary}
              onChange={(e) =>
                setForm({ ...form, summary: e.target.value })
              }
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Skills & Proficiencies (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="Figma, Design Systems, Next.js, Prototyping, TypeScript"
              value={form.skillsString}
              onChange={(e) =>
                setForm({ ...form, skillsString: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div className="rounded-card border border-border-default bg-surface-card/40 p-3.5">
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Resume Document Link
            </span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                type="url"
                placeholder="Google Drive, Dropbox, or PDF URL"
                value={form.resumeUrl}
                onChange={(e) =>
                  setForm({ ...form, resumeUrl: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Display Name (e.g. Resume.pdf)"
                value={form.resumeName}
                onChange={(e) =>
                  setForm({ ...form, resumeName: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Online Profiles & Portfolio
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                type="url"
                placeholder="Portfolio URL"
                value={form.portfolioUrl}
                onChange={(e) =>
                  setForm({ ...form, portfolioUrl: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={form.linkedinUrl}
                onChange={(e) =>
                  setForm({ ...form, linkedinUrl: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={form.githubUrl}
                onChange={(e) =>
                  setForm({ ...form, githubUrl: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex items-center justify-end gap-2.5 border-t border-border-default bg-surface-card px-5 py-3.5 sm:-mx-6 sm:-mb-6 sm:px-6">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsEditModalOpen(false)}
              className="cursor-pointer rounded-control border border-border-default px-4 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-5 py-2 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: RESUME PREVIEW MODAL
         ========================================================================= */}
      <Modal
        isOpen={isResumePreviewOpen}
        onClose={() => setIsResumePreviewOpen(false)}
        maxWidth="2xl"
        variant="auto"
        bodyClassName="p-5 sm:p-6"
        title={resumeName}
        description="ATS-optimized resume preview."
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-card border border-border-default bg-white p-5 sm:p-6 text-xs text-text-primary">
          <div className="border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <p className="font-semibold text-brand">{headline || "Candidate"}</p>
            <p className="mt-1 text-2xs text-gray-500">
              {location} · {email} {phone ? `· ${phone}` : ""}
            </p>
          </div>
          {summary && (
            <div>
              <h3 className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                Summary
              </h3>
              <p className="mt-1.5 leading-relaxed text-gray-600 whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <h3 className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                Skills & Proficiencies
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-gray-100 px-2 py-0.5 text-2xs font-medium text-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: DELETE ACCOUNT CONFIRMATION MODAL
         ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) setIsDeleteModalOpen(false);
        }}
        maxWidth="sm"
        showCloseButton={false}
        bodyClassName="p-6"
        labelledBy="delete-modal-title"
        describedBy="delete-modal-desc"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-error-bg text-status-error ring-8 ring-status-error-bg/60">
            <Trash2 className="h-5 w-5" />
          </div>

          <h3
            id="delete-modal-title"
            className="mt-4 text-base font-bold text-text-primary"
          >
            Delete your account?
          </h3>

          <p
            id="delete-modal-desc"
            className="mt-2 text-xs leading-relaxed text-text-secondary"
          >
            Are you sure you want to permanently delete your account? All candidate profile information, resume records, and saved applications will be permanently removed.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 inline-flex h-9.5 cursor-pointer items-center justify-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary shadow-subtle transition hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className="flex-1 inline-flex h-9.5 cursor-pointer items-center justify-center gap-2 rounded-control bg-status-error px-4 text-xs font-semibold text-white shadow-subtle transition hover:bg-red-700 disabled:opacity-50 active:scale-[0.99]"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Account</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
