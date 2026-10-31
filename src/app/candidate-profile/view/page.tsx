"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Mail,
  Pencil,
  Sparkles,
  UserRound,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

const sampleCandidate = {
  name: "Aarav Menon",
  headline: "Frontend Developer | React & Next.js",
  location: "Kochi, Kerala, India",
  email: "aarav.menon@example.com",
  phone: "+91 98765 43210",
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&h=320&q=85",
  summary:
    "Frontend developer focused on building accessible, responsive web experiences with React, Next.js and TypeScript. I enjoy turning complex requirements into clear, reliable interfaces and working closely with design and product teams to ship thoughtful products.",
  experienceLevel: "3 years experience",
  skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML & CSS", "REST APIs", "Git", "Accessibility", "Responsive UI"],
  resume: "#",
  linkedin: "https://www.linkedin.com/",
  github: "https://github.com/",
  portfolio: "https://example.com",
};

const sectionClass = "rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-subtle";
const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-text-muted";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className={labelClass}>{eyebrow}</p>
      <h2 className="mt-1.5 text-base font-semibold tracking-tight text-text-primary">{title}</h2>
    </div>
  );
}

function CandidateProfileContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id");
  const { user, profile: myProfile, isLoading: authLoading } = useAuth();

  const [candidateData, setCandidateData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const isOwnProfile = !profileId || (user && user.id === profileId);

  useEffect(() => {
    if (!profileId) return;

    let isMounted = true;
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();

        if (data && isMounted) {
          setCandidateData({
            name: data.full_name || "Candidate",
            headline: data.headline || "UI/UX & Frontend Professional",
            location: data.location || "India",
            email: data.email,
            phone: data.phone || "",
            avatarUrl: data.avatar_url || "",
            summary: data.summary || "",
            experienceLevel: "Candidate",
            skills: data.skills || [],
            resume: data.resume_url || "",
            linkedin: data.linkedin_url || "",
            github: data.github_url || "",
            portfolio: data.portfolio_url || "",
          });
        }
      } catch (err) {
        console.warn("Could not load candidate profile:", err);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  // Determine current active profile to display
  let currentCandidate = sampleCandidate;
  let isSample = false;

  if (profileId && candidateData) {
    currentCandidate = candidateData;
  } else if (user) {
    currentCandidate = {
      name: myProfile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Candidate",
      headline: myProfile?.headline || "Product & Frontend Enthusiast",
      location: myProfile?.location || "India",
      email: user.email || "",
      phone: myProfile?.phone || "",
      avatarUrl: myProfile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
      summary: myProfile?.summary || "Add a summary to introduce yourself to employers.",
      experienceLevel: "Candidate",
      skills: myProfile?.skills && myProfile.skills.length > 0 ? myProfile.skills : ["Design", "Frontend", "Creative UI"],
      resume: myProfile?.resume_url || "",
      linkedin: myProfile?.linkedin_url || "",
      github: myProfile?.github_url || "",
      portfolio: myProfile?.portfolio_url || "",
    };
  } else {
    isSample = true;
  }

  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {/* Sample notice banner if not signed in */}
        {isSample && !authLoading && (
          <div className="mb-6 flex flex-col gap-3 rounded-card border border-brand/20 bg-brand-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-brand shrink-0" />
              <p className="text-xs text-text-secondary">
                You are viewing a sample profile preview. Sign in to view and customize your own profile.
              </p>
            </div>
            <Link
              href="/login?redirect=/candidate-profile/view"
              className="inline-flex shrink-0 items-center justify-center rounded-control bg-brand px-3.5 py-1.5 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
            >
              Sign in with Google
            </Link>
          </div>
        )}

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="cursor-pointer transition-colors hover:text-brand">Home</Link>
          <span aria-hidden="true" className="text-border-strong">/</span>
          <Link href="/jobs" className="cursor-pointer transition-colors hover:text-brand">Jobs</Link>
          <span aria-hidden="true" className="text-border-strong">/</span>
          <span aria-current="page" className="font-medium text-text-secondary">Candidate profile</span>
        </nav>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0 space-y-5">
            {/* Header Card */}
            <section className="overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-subtle">
              <div className="h-24 bg-gradient-to-r from-brand-soft via-white to-surface-muted sm:h-32" />
              <div className="px-5 pb-6 sm:px-7">
                <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    {currentCandidate.avatarUrl ? (
                      <img
                        src={currentCandidate.avatarUrl}
                        alt={currentCandidate.name}
                        className="h-24 w-24 rounded-card border-4 border-surface-card bg-surface-muted object-cover shadow-subtle sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-card border-4 border-surface-card bg-brand-soft text-2xl font-bold text-brand shadow-subtle sm:h-28 sm:w-28">
                        {currentCandidate.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                          {currentCandidate.name}
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified profile
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{currentCandidate.headline}</p>
                    </div>
                  </div>

                  {isOwnProfile && user && (
                    <Link
                      href="/candidate-profile"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 py-2 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <Pencil size={13} /> Edit Profile
                    </Link>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand" />
                    {currentCandidate.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4 text-brand" />
                    {currentCandidate.experienceLevel}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${currentCandidate.email}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <Mail className="h-4 w-4" /> Contact candidate
                  </a>

                  {currentCandidate.resume && currentCandidate.resume !== "#" ? (
                    <a
                      href={currentCandidate.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    >
                      <Download className="h-4 w-4" /> View resume
                    </a>
                  ) : isOwnProfile && user ? (
                    <Link
                      href="/candidate-profile"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-dashed border-border-default px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:border-brand hover:text-brand"
                    >
                      <FileText className="h-4 w-4" /> Upload Resume PDF
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Overview / Summary */}
            <section className={sectionClass}>
              <SectionHeading eyebrow="01 / Overview" title="Professional summary" />
              <p className="max-w-3xl text-sm leading-7 text-text-secondary">
                {currentCandidate.summary}
              </p>
            </section>

            {/* Skills */}
            {currentCandidate.skills && currentCandidate.skills.length > 0 && (
              <section className={sectionClass}>
                <SectionHeading eyebrow="02 / Skills" title="Key Skills & Technologies" />
                <div className="flex flex-wrap gap-2">
                  {currentCandidate.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-control border border-border-default bg-surface-subtle px-3 py-1.5 text-xs font-medium text-text-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className={sectionClass}>
              <p className={labelClass}>Contact & Verification</p>
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <p className="text-text-muted">Email</p>
                  <p className="font-semibold text-text-primary mt-0.5 break-all">{currentCandidate.email}</p>
                </div>
                {currentCandidate.phone && (
                  <div>
                    <p className="text-text-muted">Phone</p>
                    <p className="font-semibold text-text-primary mt-0.5">{currentCandidate.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-text-muted">Account Status</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                    Active candidate
                  </span>
                </div>
              </div>
            </div>

            {(currentCandidate.linkedin || currentCandidate.github || currentCandidate.portfolio) && (
              <div className={sectionClass}>
                <p className={labelClass}>Online Profiles</p>
                <div className="mt-3 space-y-2 text-xs">
                  {currentCandidate.linkedin && (
                    <a
                      href={currentCandidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary hover:border-brand hover:text-brand"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {currentCandidate.github && (
                    <a
                      href={currentCandidate.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary hover:border-brand hover:text-brand"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {currentCandidate.portfolio && (
                    <a
                      href={currentCandidate.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary hover:border-brand hover:text-brand"
                    >
                      <span>Portfolio</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}


export default function CandidatePublicProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-page" />}>
      <CandidateProfileContent />
    </Suspense>
  );
}
