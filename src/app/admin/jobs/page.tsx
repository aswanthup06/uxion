"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobTable from "../comp/JobTable";
import LoadingSpinner from "../comp/LoadingSpinner";
import JobPosterModal from "../comp/JobPosterModal";
import { Job } from "../../types/job";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ImageDown,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posterJob, setPosterJob] = useState<Job | null>(null);

  const loadJobs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data: Job[] = await res.json();
      setJobs(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data: Job[] = await res.json();
        if (!ignore) setJobs(data);
      } catch (error) {
        console.error(error);
        if (!ignore) toast.error("Failed to load jobs.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void fetchJobs();
    return () => {
      ignore = true;
    };
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

  return (
    <div className="min-h-screen bg-white text-text-primary">
      <div className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
        {/* Header */}
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
                <span className="text-2xs font-bold uppercase tracking-wider text-brand">
                  Admin Console
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-xs text-text-muted">Job Management</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Manage Jobs
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Review, update, and manage published job postings across the platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadJobs(true)}
                disabled={refreshing || loading}
                aria-label="Refresh job listings"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border-default bg-white text-text-secondary shadow-2xs transition hover:border-border-strong hover:text-text-primary disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin text-brand" : ""}
                />
              </button>

              <a
                href="/job-posters"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-control border border-border-default bg-white px-3.5 text-xs font-semibold text-text-primary shadow-2xs transition hover:border-border-strong hover:bg-surface-subtle"
              >
                <ImageDown size={14} className="text-brand" />
                <span>Job Posters</span>
                <ArrowUpRight size={13} className="text-text-muted" />
              </a>

              <Link
                href="/admin/jobs/add"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-control bg-brand px-3.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover"
              >
                <Plus size={15} />
                <span>Add new job</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Existing job table */}
        <section>
          {loading ? (
            <div className="rounded-card border border-border-subtle bg-white p-8">
              <LoadingSpinner label="Loading published jobs..." className="py-12" />
            </div>
          ) : jobs.length > 0 ? (
            <JobTable
              jobs={jobs}
              onDelete={handleDelete}
              onViewPoster={(job) => setPosterJob(job)}
            />
          ) : (
            <div className="rounded-card border border-border-subtle bg-white py-16 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-control bg-brand-soft text-brand">
                <BriefcaseBusiness size={20} strokeWidth={1.7} />
              </span>

              <h2 className="mt-4 text-base font-semibold text-text-primary">
                No job listings yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-text-muted">
                Your job postings will appear here once you add your first
                listing.
              </p>

              <Link
                href="/admin/jobs/add"
                className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-control bg-brand px-4 text-xs font-semibold text-white transition hover:bg-brand-hover"
              >
                <Plus size={14} />
                <span>Add your first job</span>
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Admin Job Poster Modal */}
      <JobPosterModal
        job={posterJob}
        isOpen={Boolean(posterJob)}
        onClose={() => setPosterJob(null)}
      />
    </div>
  );
}
