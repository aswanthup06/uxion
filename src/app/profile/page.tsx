"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  Plus,
  UserRound,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const sectionClass =
  "rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-subtle";
const labelClass =
  "text-xs font-medium uppercase tracking-[0.12em] text-text-muted";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  // 1. If not logged in and auth finished loading, redirect to /login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-surface-page">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 size={24} className="animate-spin text-brand" />
          <p className="text-xs font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const name =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Candidate";

  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";

  const email = user.email || profile?.email || "";
  const headline = profile?.headline;
  const location = profile?.location;
  const summary = profile?.summary;
  const resumeUrl = profile?.resume_url;
  const resumeName = profile?.resume_name;
  const skills = profile?.skills || [];
  const linkedin = profile?.linkedin_url;
  const github = profile?.github_url;
  const portfolio = profile?.portfolio_url;

  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-text-muted"
        >
          <Link
            href="/"
            className="cursor-pointer transition-colors hover:text-brand"
          >
            Home
          </Link>
          <span aria-hidden="true" className="text-border-strong">
            /
          </span>
          <span
            aria-current="page"
            className="font-medium text-text-secondary"
          >
            My Profile
          </span>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main Column */}
          <div className="min-w-0 space-y-6">
            {/* Header Identity Card */}
            <section className="overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-subtle">
              <div className="h-24 bg-gradient-to-r from-brand-soft via-white to-surface-muted sm:h-28" />
              <div className="px-5 pb-6 sm:px-7">
                <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="h-24 w-24 rounded-card border-4 border-surface-card bg-surface-muted object-cover shadow-subtle sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-card border-4 border-surface-card bg-brand-soft text-2xl font-bold text-brand shadow-subtle sm:h-28 sm:w-28">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                          {name}
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand">
                          <CheckCircle2 className="h-3 w-3" /> Google verified
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {headline || (
                          <span className="italic text-text-muted">
                            No headline added yet
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/candidate-profile"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 py-2 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-brand"
                  >
                    <Pencil size={13} /> Edit Profile
                  </Link>
                </div>

                {/* Location & Status Tag */}
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand" />
                    {location || "Location not set"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4 text-brand" />
                    Open to opportunities
                  </span>
                </div>

                {/* Resume Action Bar */}
                <div className="mt-5 border-t border-border-subtle pt-4">
                  {resumeUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <FileText size={16} className="text-brand" />
                        <span className="font-medium text-text-primary">
                          {resumeName || "Uploaded Resume.pdf"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                        >
                          <Download size={13} /> View Resume
                        </a>
                        <Link
                          href="/candidate-profile"
                          className="text-xs text-text-muted underline-offset-2 hover:text-brand hover:underline"
                        >
                          Update
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 rounded-card border border-dashed border-border-default bg-surface-subtle/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText size={18} className="text-text-muted" />
                        <div>
                          <p className="text-xs font-semibold text-text-primary">
                            Upload your Resume
                          </p>
                          <p className="text-[11px] text-text-muted">
                            Employers review your resume first when considering applications.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/candidate-profile"
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-brand px-3.5 py-1.5 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover"
                      >
                        <Plus size={13} /> Add Resume (PDF)
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Professional Summary Section (if added) */}
            {summary && (
              <section className={sectionClass}>
                <div className="mb-3">
                  <p className={labelClass}>About</p>
                  <h2 className="mt-1 text-sm font-semibold text-text-primary">
                    Professional Summary
                  </h2>
                </div>
                <p className="text-sm leading-6 text-text-secondary whitespace-pre-line">
                  {summary}
                </p>
              </section>
            )}

            {/* Skills Section (if added) */}
            {skills.length > 0 && (
              <section className={sectionClass}>
                <div className="mb-3">
                  <p className={labelClass}>Skills</p>
                  <h2 className="mt-1 text-sm font-semibold text-text-primary">
                    Technologies & Proficiencies
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
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

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Account Information Card */}
            <div className={sectionClass}>
              <p className={labelClass}>Account Info</p>
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <p className="text-text-muted">Google Email</p>
                  <p className="mt-0.5 font-medium text-text-primary break-all">
                    {email}
                  </p>
                </div>
                {profile?.phone && (
                  <div>
                    <p className="text-text-muted">Phone</p>
                    <p className="mt-0.5 font-medium text-text-primary">
                      {profile.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-text-muted">Account Type</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                    <UserRound size={11} /> Candidate
                  </span>
                </div>
              </div>
            </div>

            {/* Online Links (if added) */}
            {(linkedin || github || portfolio) && (
              <div className={sectionClass}>
                <p className={labelClass}>Connected Links</p>
                <div className="mt-3 space-y-2 text-xs">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {portfolio && (
                    <a
                      href={portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary transition hover:border-brand hover:text-brand"
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

