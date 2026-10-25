
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
} from "lucide-react";

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        cache: "no-store",
      });

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
    <main className="min-h-full bg-white text-[#172820]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            border: "1px solid #E1E8E2",
            borderRadius: "8px",
            fontSize: "13px",
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8 sm:pt-9">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#849087]">
          <Link
            href="/admin"
            className="transition hover:text-[#087F50]"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-[#35463A]">Job listings</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-[#E7ECE8] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#087F50]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0FA968]" />
              Job management
            </p>

            <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#172820] sm:text-[32px]">
              Job listings
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#7B867E]">
              Manage, review and update your published job postings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadJobs(true)}
              disabled={refreshing}
              aria-label="Refresh job listings"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-[#E1E8E2] text-[#58665B] transition hover:bg-[#F5F8F5] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <Link
              href="/admin/jobs/add"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-[#087F50] px-4 text-sm font-medium text-white transition hover:bg-[#066640]"
            >
              <Plus size={16} />
              Add new job
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* Summary */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7ECE8] py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-[#EFF7F0] text-[#087F50]">
              <BriefcaseBusiness size={17} strokeWidth={1.7} />
            </span>

            <div>
              <p className="text-xs text-[#849087]">Total job listings</p>
              <p className="mt-0.5 text-xl font-semibold tracking-tight text-[#172820]">
                {jobs.length}
              </p>
            </div>
          </div>

          <span className="text-xs text-[#849087]">
            {jobs.length === 1 ? "1 listing" : `${jobs.length} listings`}
          </span>
        </section>

        {/* Existing job table */}
        <section className="pt-6">
          {jobs.length > 0 ? (
            <JobTable jobs={jobs} onDelete={handleDelete} />
          ) : (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-control bg-[#EFF7F0] text-[#087F50]">
                <BriefcaseBusiness size={20} strokeWidth={1.7} />
              </span>

              <h2 className="mt-4 text-base font-semibold text-[#172820]">
                No job listings yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7B867E]">
                Your job postings will appear here once you add your first
                listing.
              </p>

              <Link
                href="/admin/jobs/add"
                className="mt-5 inline-flex items-center gap-2 rounded-control bg-[#087F50] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#066640]"
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
