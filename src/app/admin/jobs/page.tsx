
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobTable from "../comp/JobTable";
import LoadingSpinner from "../comp/LoadingSpinner";
import { Job } from "../../types/job";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [jobsRes, pendingRes] = await Promise.all([
        fetch("/api/jobs", { cache: "no-store" }),
        fetch("/api/jobs?status=pending", { cache: "no-store" }),
      ]);

      if (!jobsRes.ok) throw new Error("Failed to fetch jobs");

      const data: Job[] = await jobsRes.json();
      setJobs(data);

      if (pendingRes.ok) {
        const pendingData: Job[] = await pendingRes.json();
        setPendingCount(pendingData.length);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast.error(
          `Delete failed: ${errorData?.message || errorData?.error || "Unknown error"}`
        );
        return;
      }

      setJobs((previous) =>
        previous.filter((job) => String(job.id) !== String(id))
      );

      toast.success("Job deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting the job.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-full bg-surface-page text-text-primary">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            border: "1px solid var(--color-border-default)",
            borderRadius: "8px",
            fontSize: "13px",
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8 sm:pt-9">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link
            href="/admin"
            className="transition hover:text-brand"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-text-primary">Job listings</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-border-subtle pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Job management
            </p>

            <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-text-primary sm:text-[32px]">
              Job listings
            </h1>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Manage, review and update your published job postings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadJobs(true)}
              disabled={refreshing}
              aria-label="Refresh job listings"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border-default text-text-secondary transition hover:bg-surface-subtle disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <Link
              href="/admin/jobs/add"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-brand px-4 text-sm font-medium text-text-inverse transition hover:bg-brand-hover"
            >
              <Plus size={16} />
              Add new job
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-border-subtle pt-4 text-sm font-medium">
          <span className="flex items-center gap-2 border-b-2 border-brand pb-3 text-brand font-semibold">
            <span>Published Listings</span>
            <span className="rounded-control bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
              {jobs.length}
            </span>
          </span>
          <Link
            href="/admin/submissions"
            className="flex items-center gap-2 border-b-2 border-transparent pb-3 text-text-muted transition hover:text-text-primary"
          >
            <span>Submissions for Review</span>
            {pendingCount > 0 && (
              <span className="rounded-control bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/candidates"
            className="flex items-center gap-2 border-b-2 border-transparent pb-3 text-text-muted transition hover:text-text-primary"
          >
            <Users size={15} />
            <span>Candidates</span>
          </Link>
        </div>

        {/* Summary */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-soft text-brand">
              <BriefcaseBusiness size={17} strokeWidth={1.7} />
            </span>

            <div>
              <p className="text-xs text-text-muted">Total job listings</p>
              <p className="mt-0.5 text-xl font-semibold tracking-tight text-text-primary">
                {jobs.length}
              </p>
            </div>
          </div>

          <span className="text-xs text-text-muted">
            {jobs.length === 1 ? "1 listing" : `${jobs.length} listings`}
          </span>
        </section>

        {/* Existing job table */}
        <section className="pt-6">
          {jobs.length > 0 ? (
            <JobTable jobs={jobs} onDelete={handleDelete} />
          ) : (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-control bg-brand-soft text-brand">
                <BriefcaseBusiness size={20} strokeWidth={1.7} />
              </span>

              <h2 className="mt-4 text-base font-semibold text-text-primary">
                No job listings yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
                Your job postings will appear here once you add your first
                listing.
              </p>

              <Link
                href="/admin/jobs/add"
                className="mt-5 inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse transition hover:bg-brand-hover"
              >
                <Plus size={15} />
                Add your first job
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
