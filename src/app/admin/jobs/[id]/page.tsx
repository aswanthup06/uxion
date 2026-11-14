"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  ImageDown,
  Mail,
  MapPin,
  Pencil,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";

import { Job } from "@/app/types/job";
import LoadingSpinner from "@/app/admin/comp/LoadingSpinner";
import JobPosterModal from "@/app/admin/comp/JobPosterModal";
import FormattedDescription from "@/app/components/jobs/FormattedDescription";
import { formatLocationLabel } from "@/lib/supabase/locations-data";

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminJobDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params?.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch job details");
      }

      const data: Job = await res.json();
      setJob(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load job details";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void fetchJob();
  }, [fetchJob]);

  const handleCopy = async (key: string, text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}" at ${job.company}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message || errorData?.error || "Delete failed"
        );
      }

      toast.success("Job deleted successfully");
      router.push("/admin/jobs");
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong while deleting"
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-full bg-surface-page text-text-primary">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <LoadingSpinner label="Loading job details..." />
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-full bg-surface-page text-text-primary">
        <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-control bg-status-error/10 text-status-error">
            <AlertCircle size={24} />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-text-primary">
            {error || "Job not found"}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            The job listing with ID <code className="font-mono text-xs">{jobId}</code> could not be located.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void fetchJob()}
              className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle"
            >
              <RefreshCw size={14} />
              Try again
            </button>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center gap-1.5 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover"
            >
              <ArrowLeft size={14} />
              Back to jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const locationDisplay = formatLocationLabel(job);
  const status = job.status || "published";

  return (
    <main className="min-h-full bg-surface-page text-text-primary">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-9">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition hover:text-brand">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/jobs" className="transition hover:text-brand">
            Job listings
          </Link>
          <span>/</span>
          <span className="max-w-[200px] truncate font-medium text-text-primary sm:max-w-md">
            {job.title}
          </span>
        </nav>

        {/* Page Header */}
        <header className="flex flex-col gap-6 border-b border-border-subtle pb-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            {/* Status & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {status === "published" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success-border bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  Published
                </span>
              ) : status === "draft" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-status-warning-border bg-status-warning-bg px-2.5 py-0.5 text-xs font-semibold text-status-warning">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-warning" />
                  Draft
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-subtle px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )}

              {job.category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border-default bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                  <Tag size={11} className="text-text-muted" />
                  {job.category}
                </span>
              )}

              {job.isTestData && (
                <span className="inline-flex items-center gap-1 rounded-full border border-status-warning-border bg-status-warning-bg px-2.5 py-0.5 text-xs font-semibold text-status-warning">
                  <ShieldAlert size={12} />
                  Test Data
                </span>
              )}

              {job.requiresReview && (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  <Sparkles size={12} />
                  Pending Review
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {job.title}
            </h1>

            {/* Company & Meta subtitle */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                <Building2 size={16} className="text-text-muted" />
                {job.company}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} className="text-text-muted" />
                {locationDisplay || job.location || "Location not specified"}
              </span>

              <span className="inline-flex items-center gap-1.5 text-text-muted">
                <CalendarDays size={15} />
                Posted {formatDate(job.postedDate)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View live public listing in new tab */}
            <a
              href={`/jobs/${job.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-primary shadow-subtle transition hover:bg-surface-subtle"
            >
              <span>View Live Listing</span>
              <ExternalLink size={13} className="text-text-muted" />
            </a>

            {/* View / Download Job Poster (Option A: In-Admin Modal) */}
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-primary shadow-subtle transition hover:bg-surface-subtle"
            >
              <ImageDown size={14} className="text-brand" />
              <span>Job Poster</span>
            </button>

            {/* Edit Job link */}
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover shadow-subtle"
            >
              <Pencil size={14} />
              <span>Edit Job</span>
              <ArrowUpRight size={13} />
            </Link>

            {/* Delete button */}
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex h-10 items-center gap-1.5 rounded-control border border-status-error-border bg-status-error-bg px-3.5 text-xs font-semibold text-status-error shadow-subtle transition hover:bg-status-error hover:text-text-inverse hover:border-status-error disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>{deleting ? "Deleting..." : "Delete Job"}</span>
            </button>
          </div>
        </header>

        {/* Key Metrics Row */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-card border border-border-default bg-surface-card p-4.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Total Views</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand">
                <Eye size={15} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {job.views ?? 0}
            </p>
          </div>

          <div className="rounded-card border border-border-default bg-surface-card p-4.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Email / Copy Clicks</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand">
                <Copy size={15} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {job.emailCopyCount ?? 0}
            </p>
          </div>

          <div className="rounded-card border border-border-default bg-surface-card p-4.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Work Mode</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand">
                <Globe size={15} />
              </span>
            </div>
            <p className="mt-2 text-lg font-bold tracking-tight text-text-primary truncate">
              {job.workMode || "Onsite"}
            </p>
          </div>

          <div className="rounded-card border border-border-default bg-surface-card p-4.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Experience</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand">
                <BriefcaseBusiness size={15} />
              </span>
            </div>
            <p className="mt-2 text-lg font-bold tracking-tight text-text-primary truncate">
              {job.experience || "Fresher"}
            </p>
          </div>
        </section>

        {/* 2-Column Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Column (2 cols on lg) */}
          <div className="space-y-8 lg:col-span-2">
            {/* Job Description Card */}
            <section className="rounded-card border border-border-default bg-surface-card p-6 sm:p-7 shadow-subtle">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                  <FileText size={17} className="text-brand" />
                  Job Description
                </h2>
                <span className="text-xs text-text-muted">
                  Formatted Markdown preview
                </span>
              </div>
              <div className="mt-6 prose prose-neutral max-w-none">
                <FormattedDescription content={job.description} />
              </div>
            </section>

            {/* Application Channels Card */}
            <section className="rounded-card border border-border-default bg-surface-card p-6 sm:p-7 shadow-subtle">
              <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary border-b border-border-subtle pb-4">
                <Share2 size={17} className="text-brand" />
                Application Methods
              </h2>

              <div className="mt-5 space-y-4">
                {/* Apply URL */}
                <div>
                  <label className="text-xs font-medium text-text-muted">
                    External Application URL
                  </label>
                  {job.apply ? (
                    <div className="mt-1.5 flex items-center justify-between rounded-control border border-border-default bg-surface-base px-3.5 py-2.5">
                      <a
                        href={job.apply}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-xs font-mono text-brand hover:underline"
                      >
                        {job.apply}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy("apply", job.apply)}
                        className="ml-3 shrink-0 rounded p-1 text-text-muted hover:text-text-primary"
                        title="Copy application link"
                      >
                        {copiedKey === "apply" ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-text-muted italic">
                      None provided (applicants apply via email)
                    </p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label className="text-xs font-medium text-text-muted">
                    Recruiter / HR Contact Email
                  </label>
                  {job.mail ? (
                    <div className="mt-1.5 flex items-center justify-between rounded-control border border-border-default bg-surface-base px-3.5 py-2.5">
                      <a
                        href={`mailto:${job.mail}`}
                        className="truncate text-xs font-medium text-text-primary hover:text-brand"
                      >
                        {job.mail}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy("email", job.mail)}
                        className="ml-3 shrink-0 rounded p-1 text-text-muted hover:text-text-primary"
                        title="Copy email address"
                      >
                        {copiedKey === "email" ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-text-muted italic">
                      None provided
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Location & Remote Eligibility Card */}
            {(job.primaryCity ||
              job.primaryCountry ||
              job.remoteEligibilityType ||
              job.rawLocation) && (
              <section className="rounded-card border border-border-default bg-surface-card p-6 sm:p-7 shadow-subtle">
                <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary border-b border-border-subtle pb-4">
                  <MapPin size={17} className="text-brand" />
                  Structured Location & Eligibility
                </h2>

                <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Display Location</dt>
                    <dd className="mt-1 text-xs font-medium text-text-primary">
                      {locationDisplay || "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-text-muted">Remote Eligibility</dt>
                    <dd className="mt-1 text-xs font-medium text-text-primary">
                      {job.remoteEligibilityType || "Not configured"}
                    </dd>
                  </div>

                  {job.primaryCity && (
                    <div>
                      <dt className="text-xs font-medium text-text-muted">Primary City</dt>
                      <dd className="mt-1 text-xs font-medium text-text-primary">
                        {job.primaryCity}
                      </dd>
                    </div>
                  )}

                  {job.primaryCountry && (
                    <div>
                      <dt className="text-xs font-medium text-text-muted">Primary Country</dt>
                      <dd className="mt-1 text-xs font-medium text-text-primary">
                        {job.primaryCountry}{" "}
                        {job.primaryCountryCode ? `(${job.primaryCountryCode})` : ""}
                      </dd>
                    </div>
                  )}

                  {job.rawLocation && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-text-muted">Raw Location Input</dt>
                      <dd className="mt-1 font-mono text-xs text-text-secondary">
                        {job.rawLocation}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Company Card */}
            <section className="rounded-card border border-border-default bg-surface-card p-6 shadow-subtle">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-3">
                Company Details
              </h3>
              <div className="mt-4 space-y-3.5">
                <div>
                  <span className="text-xs text-text-muted">Company Name</span>
                  <p className="mt-0.5 text-sm font-semibold text-text-primary">
                    {job.company}
                  </p>
                </div>

                {job.companyLink && (
                  <div>
                    <span className="text-xs text-text-muted">Company Website</span>
                    <a
                      href={job.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                    >
                      <span className="truncate">{job.companyLink}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Compensation & Contract Card */}
            <section className="rounded-card border border-border-default bg-surface-card p-6 shadow-subtle">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-3">
                Role Overview
              </h3>
              <dl className="mt-4 space-y-3.5">
                <div>
                  <dt className="text-xs text-text-muted">Salary / Compensation</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-text-primary">
                    {job.salary || "Not Disclosed"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Employment Type</dt>
                  <dd className="mt-0.5 text-xs font-medium text-text-primary">
                    {job.employmentType || "FULL_TIME"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Experience Level</dt>
                  <dd className="mt-0.5 text-xs font-medium text-text-primary">
                    {job.experience || "Fresher"}
                  </dd>
                </div>

                {job.validThrough && (
                  <div>
                    <dt className="text-xs text-text-muted">Valid Through / Expiry</dt>
                    <dd className="mt-0.5 text-xs font-medium text-text-primary">
                      {formatDate(job.validThrough)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Admin Metadata & Audit Card */}
            <section className="rounded-card border border-border-default bg-surface-card p-6 shadow-subtle">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-3">
                System & Audit Information
              </h3>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-xs text-text-muted">Listing ID</dt>
                  <dd className="mt-1 flex items-center justify-between rounded-control border border-border-default bg-surface-base px-2.5 py-1.5">
                    <span className="font-mono text-xs text-text-secondary truncate">
                      {job.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy("jobId", job.id)}
                      className="ml-2 text-text-muted hover:text-text-primary"
                      title="Copy Job ID"
                    >
                      {copiedKey === "jobId" ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Database Status</dt>
                  <dd className="mt-0.5 text-xs font-medium capitalize text-text-primary">
                    {status}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Posted Date</dt>
                  <dd className="mt-0.5 text-xs font-medium text-text-primary">
                    {formatDate(job.postedDate)}
                  </dd>
                </div>

                {job.workModeNotes && (
                  <div>
                    <dt className="text-xs text-text-muted">Work Mode Notes</dt>
                    <dd className="mt-0.5 text-xs text-text-secondary">
                      {job.workModeNotes}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>
      </div>

      {/* Admin Job Poster Preview & Download Modal */}
      <JobPosterModal
        job={job}
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />
    </main>
  );
}
