import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { CandidateProfile } from "@/context/AuthContext";

const sectionClass =
  "rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-subtle";
const labelClass =
  "text-xs font-medium uppercase tracking-[0.12em] text-text-muted";

interface CandidatePageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatePublicProfilePage({
  params,
}: CandidatePageProps) {
  const { id } = await params;

  const supabase = getServiceSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const candidate = profile as CandidateProfile;
  const name = candidate.full_name || "Candidate";

  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-muted transition hover:text-brand"
          >
            <ArrowLeft size={14} /> Back to Jobs
          </Link>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main Column */}
          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-subtle">
              <div className="h-24 bg-gradient-to-r from-brand-soft via-white to-surface-muted sm:h-28" />
              <div className="px-5 pb-6 sm:px-7">
                <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    {candidate.avatar_url ? (
                      <img
                        src={candidate.avatar_url}
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
                          <CheckCircle2 className="h-3 w-3" /> Verified Candidate
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {candidate.headline || "UI/UX & Frontend Professional"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand" />
                    {candidate.location || "India"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4 text-brand" />
                    Candidate
                  </span>
                </div>

                {/* Contact & Resume Actions */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href={`mailto:${candidate.email}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Mail size={14} /> Contact Candidate
                  </a>

                  {candidate.resume_url && (
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-xs font-semibold text-text-primary transition hover:border-brand hover:bg-brand-soft"
                    >
                      <Download size={14} /> View Resume PDF
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Summary */}
            {candidate.summary && (
              <section className={sectionClass}>
                <div className="mb-3">
                  <p className={labelClass}>About</p>
                  <h2 className="mt-1 text-sm font-semibold text-text-primary">
                    Professional Summary
                  </h2>
                </div>
                <p className="text-sm leading-6 text-text-secondary whitespace-pre-line">
                  {candidate.summary}
                </p>
              </section>
            )}

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <section className={sectionClass}>
                <div className="mb-3">
                  <p className={labelClass}>Skills</p>
                  <h2 className="mt-1 text-sm font-semibold text-text-primary">
                    Technologies & Proficiencies
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
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
            <div className={sectionClass}>
              <p className={labelClass}>Direct Contact</p>
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <p className="text-text-muted">Verified Email</p>
                  <p className="mt-0.5 font-medium text-text-primary break-all">
                    {candidate.email}
                  </p>
                </div>
                {candidate.phone && (
                  <div>
                    <p className="text-text-muted">Phone Number</p>
                    <p className="mt-0.5 font-medium text-text-primary">
                      {candidate.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Social / Portfolio Links */}
            {(candidate.linkedin_url ||
              candidate.github_url ||
              candidate.portfolio_url) && (
              <div className={sectionClass}>
                <p className={labelClass}>Online Presence</p>
                <div className="mt-3 space-y-2 text-xs">
                  {candidate.linkedin_url && (
                    <a
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {candidate.github_url && (
                    <a
                      href={candidate.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default p-2.5 text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {candidate.portfolio_url && (
                    <a
                      href={candidate.portfolio_url}
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

