"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  Pencil,
  RefreshCw,
  Clock,
  Building2,
  MapPin,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ShieldAlert,
  Inbox,
  AlertCircle,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import LoadingSpinner from "../comp/LoadingSpinner";

function formatDate(iso?: string) {
  if (!iso) return "Date unavailable";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadSubmissions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/jobs?status=pending", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load pending submissions");
      }

      const data: Job[] = await res.json();
      setSubmissions(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending submissions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const handleApprove = async (id: string, title: string) => {
    setActionInProgress(id);
    try {
      const res = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.error || "Approval failed");
      }

      setSubmissions((prev) => prev.filter((j) => j.id !== id));
      toast.success(`"${title}" approved and published live! 🎉`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error approving job";
      toast.error(msg);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to reject and delete the submission "${title}"?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      const res = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.error || "Rejection failed");
      }

      setSubmissions((prev) => prev.filter((j) => j.id !== id));
      toast.success(`Submission "${title}" rejected.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error rejecting job";
      toast.error(msg);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-full bg-surface-page text-text-primary">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            border: "1px solid var(--color-border-default)",
            borderRadius: "8px",
            fontSize: "13px",
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-9">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition hover:text-brand">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/jobs" className="transition hover:text-brand">
            Job management
          </Link>
          <span>/</span>
          <span className="font-medium text-text-primary">Public submissions</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-border-subtle pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Moderation Queue
            </p>

            <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-text-primary sm:text-[32px]">
              Public Job Submissions
            </h1>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Review and approve recruiter postings before they appear live on the Zenoway job board.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadSubmissions(true)}
              disabled={refreshing}
              aria-label="Refresh submissions"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border-default text-text-secondary transition hover:bg-surface-subtle disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>

            <Link
              href="/admin/jobs"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary"
            >
              <span>View Published Jobs</span>
            </Link>

            <Link
              href="/admin/jobs/add"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover shadow-subtle"
            >
              <span>Add Job Directly</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-border-subtle pt-4 text-sm font-medium">
          <Link
            href="/admin/jobs"
            className="border-b-2 border-transparent pb-3 text-text-muted transition hover:text-text-primary"
          >
            Published Listings
          </Link>
          <span className="flex items-center gap-2 border-b-2 border-brand pb-3 text-brand font-semibold">
            <span>Pending Review</span>
            <span className="rounded-control bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              {submissions.length}
            </span>
          </span>
        </div>

        {/* Content Section */}
        <section className="pt-6">
          {submissions.length === 0 ? (
            <div className="rounded-card border border-border-default bg-surface-card py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-control bg-brand-soft text-brand">
                <Inbox size={22} strokeWidth={1.8} />
              </span>
              <h2 className="mt-4 text-base font-semibold text-text-primary">
                No pending submissions
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-text-muted">
                All recruiter job postings have been reviewed. When recruiters submit listings via /post-job, they will appear here for your moderation.
              </p>
              <Link
                href="/admin/jobs"
                className="mt-5 inline-flex items-center gap-1.5 rounded-control bg-surface-subtle border border-border-default px-4 py-2 text-xs font-semibold text-text-primary transition hover:bg-border-default"
              >
                <span>Back to Published Listings</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((job) => {
                const isExpanded = expandedId === job.id;
                const isBusy = actionInProgress === job.id;

                return (
                  <div
                    key={job.id}
                    className="overflow-hidden rounded-card border border-border-default bg-surface-card transition hover:border-border-strong"
                  >
                    {/* Card Header & Summary */}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-control bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Pending Approval
                            </span>
                            <span className="rounded-control bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                              {job.workMode || "Onsite"}
                            </span>
                            {job.employmentType && (
                              <span className="rounded-control border border-border-default px-2 py-0.5 text-[11px] font-medium text-text-muted">
                                {job.employmentType.replace("_", " ")}
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-text-muted">
                              ID: {job.id}
                            </span>
                          </div>

                          <h2 className="mt-2 text-lg font-bold text-text-primary sm:text-xl">
                            {job.title}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                            <span className="flex items-center gap-1 font-semibold text-text-primary">
                              <Building2 size={13} className="text-text-muted" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-text-muted" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} className="text-text-muted" />
                              Submitted {formatDate(job.postedDate)}
                            </span>
                          </div>
                        </div>

                        {/* 1-Click Moderation Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleApprove(job.id, job.title)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-emerald-600 px-3.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 shadow-subtle"
                          >
                            <CheckCircle2 size={14} />
                            <span>{isBusy ? "Approving..." : "Approve & Publish"}</span>
                          </button>

                          <Link
                            href={`/admin/jobs/${job.id}`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary"
                          >
                            <Pencil size={13} />
                            <span>Edit in Wizard</span>
                          </Link>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleReject(job.id, job.title)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-control border border-status-error/30 bg-status-error/10 px-3 text-xs font-semibold text-status-error transition hover:bg-status-error/20 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      {/* Recruiter Details Row */}
                      <div className="mt-4 grid grid-cols-1 gap-3 rounded-control border border-border-default/60 bg-surface-subtle/50 p-3.5 text-xs sm:grid-cols-4">
                        <div>
                          <span className="block text-[10px] font-semibold uppercase text-text-muted">
                            Salary / Budget
                          </span>
                          <span className="mt-0.5 block font-semibold text-brand">
                            {job.salary || "Not Disclosed"}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-semibold uppercase text-text-muted">
                            Experience
                          </span>
                          <span className="mt-0.5 block font-medium text-text-primary">
                            {job.experience || "Fresher"}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-semibold uppercase text-text-muted">
                            Recruiter Contact
                          </span>
                          {job.mail ? (
                            <a
                              href={`mailto:${job.mail}`}
                              className="mt-0.5 flex items-center gap-1 truncate font-medium text-brand hover:underline"
                            >
                              <Mail size={12} className="shrink-0" />
                              <span className="truncate">{job.mail}</span>
                            </a>
                          ) : (
                            <span className="mt-0.5 block text-text-muted">—</span>
                          )}
                        </div>

                        <div>
                          <span className="block text-[10px] font-semibold uppercase text-text-muted">
                            Company Link
                          </span>
                          {job.companyLink ? (
                            <a
                              href={job.companyLink.startsWith("http") ? job.companyLink : `https://${job.companyLink}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-0.5 flex items-center gap-1 truncate font-medium text-brand hover:underline"
                            >
                              <Globe size={12} className="shrink-0" />
                              <span className="truncate">{job.companyLink}</span>
                            </a>
                          ) : (
                            <span className="mt-0.5 block text-text-muted">—</span>
                          )}
                        </div>
                      </div>

                      {/* Description Toggle */}
                      <div className="mt-4 border-t border-border-default/40 pt-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : job.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
                        >
                          <span>{isExpanded ? "Hide Description" : "Read Full Description & Requirements"}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 rounded-control border border-border-default bg-surface-card p-4 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {job.description || "No description provided."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
