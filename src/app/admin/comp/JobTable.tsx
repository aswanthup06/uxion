"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Job } from "../../types/job";
import JobRow from "./JobRow";
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";

type Props = {
  jobs: Job[];
  onDelete: (id: string) => void;
  onViewPoster?: (job: Job) => void;
};

type Timeframe =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "this_month"
  | "all";

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const input = value.trim();

  // Support DD/MM/YYYY and DD-MM-YYYY.
  const dmy = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  // Parse date-only ISO values locally to avoid timezone shifts.
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isDateInTimeframe(
  value: string | undefined,
  timeframe: Timeframe,
  now: Date = new Date()
): boolean {
  if (timeframe === "all") return true;

  const date = parseDate(value);
  if (!date) return false;

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  const jobDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.round(
    (startOfToday.getTime() - jobDay.getTime()) / (24 * 60 * 60 * 1000)
  );

  switch (timeframe) {
    case "today":
      return jobDay.getTime() === startOfToday.getTime();
    case "yesterday":
      return jobDay.getTime() === startOfYesterday.getTime();
    case "7days":
      return diffDays >= 0 && diffDays < 7;
    case "30days":
      return diffDays >= 0 && diffDays < 30;
    case "this_month":
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    default:
      return true;
  }
}

const PAGE_SIZE = 20;

export default function JobTable({ jobs, onDelete, onViewPoster }: Props) {
  const [search, setSearch] = useState("");
  const [tableDateFilter, setTableDateFilter] = useState<"all" | Timeframe>("all");
  const [page, setPage] = useState(1);

  const timeframeCounts = useMemo<Record<Timeframe, number>>(() => {
    const now = new Date();
    const counts: Record<Timeframe, number> = {
      today: 0,
      yesterday: 0,
      "7days": 0,
      "30days": 0,
      this_month: 0,
      all: jobs.length,
    };

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );

    for (const job of jobs) {
      const date = parseDate(job.postedDate);
      if (!date) continue;

      const jobDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const diffDays = Math.round(
        (startOfToday.getTime() - jobDay.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (jobDay.getTime() === startOfToday.getTime()) {
        counts.today++;
      }
      if (jobDay.getTime() === startOfYesterday.getTime()) {
        counts.yesterday++;
      }
      if (diffDays >= 0 && diffDays < 7) {
        counts["7days"]++;
      }
      if (diffDays >= 0 && diffDays < 30) {
        counts["30days"]++;
      }
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      ) {
        counts.this_month++;
      }
    }

    return counts;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (tableDateFilter !== "all") {
      result = result.filter((job) =>
        isDateInTimeframe(job.postedDate, tableDateFilter)
      );
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((job) =>
        [job.title, job.company, job.location, job.experience].some((val) =>
          String(val ?? "").toLowerCase().includes(query)
        )
      );
    }

    result.sort((a, b) => {
      const dateA = parseDate(a.postedDate)?.getTime() ?? 0;
      const dateB = parseDate(b.postedDate)?.getTime() ?? 0;
      return dateB - dateA;
    });

    return result;
  }, [jobs, search, tableDateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  const [prevFilterKey, setPrevFilterKey] = useState(`${search}-${tableDateFilter}`);
  const currentFilterKey = `${search}-${tableDateFilter}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setPage(1);
  }

  const [prevTotalPages, setPrevTotalPages] = useState(totalPages);
  if (totalPages !== prevTotalPages) {
    setPrevTotalPages(totalPages);
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }

  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleJobs = filteredJobs.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section className="overflow-hidden rounded-card border border-border-subtle bg-white shadow-2xs">
      {/* Card Top Toolbar (Identical to Dashboard) */}
      <div className="flex flex-col justify-between gap-4 border-b border-border-subtle p-5 sm:flex-row sm:items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-soft text-brand font-semibold shrink-0">
            <BriefcaseBusiness size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text-primary">
                Job Listings
              </h3>
              <span className="rounded-control bg-white border border-border-default px-2 py-0.5 text-2xs font-semibold text-text-secondary">
                {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Search, inspect performance, and update published listings.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search role, company, city..."
              className="h-9 w-full rounded-control border border-border-default bg-white pl-9 pr-8 text-xs text-text-primary placeholder:text-text-muted outline-none transition hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-focus-ring"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-control p-0.5 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative inline-flex items-center">
            <select
              value={tableDateFilter}
              onChange={(event) =>
                setTableDateFilter(event.target.value as "all" | Timeframe)
              }
              aria-label="Filter jobs table by date"
              className="h-9 cursor-pointer appearance-none rounded-control border border-border-default bg-white pl-3 pr-8 text-xs font-medium text-text-secondary shadow-2xs transition hover:bg-surface-subtle hover:text-text-primary focus:border-brand focus:outline-none"
            >
              <option value="all">All dates ({jobs.length})</option>
              <option value="today">Today ({timeframeCounts.today})</option>
              <option value="yesterday">Yesterday ({timeframeCounts.yesterday})</option>
              <option value="7days">Last 7 days ({timeframeCounts["7days"]})</option>
              <option value="30days">Last 30 days ({timeframeCounts["30days"]})</option>
              <option value="this_month">This month ({timeframeCounts.this_month})</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      {filteredJobs.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand">
            {search ? <Search size={20} /> : <BriefcaseBusiness size={20} />}
          </div>

          <h3 className="mt-4 text-sm font-semibold text-text-primary">
            {search || tableDateFilter !== "all"
              ? "No matching jobs found"
              : "No jobs posted yet"}
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-text-muted">
            {search || tableDateFilter !== "all"
              ? "Try adjusting your search keywords or date filter to see more listings."
              : "Your job listings will appear here when you add your first job."}
          </p>

          {tableDateFilter !== "all" && (
            <button
              type="button"
              onClick={() => setTableDateFilter("all")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              Reset date filter
            </button>
          )}

          {!search && tableDateFilter === "all" && (
            <Link
              href="/admin/jobs/add"
              className="mt-4 inline-flex items-center gap-1.5 rounded-control bg-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-hover shadow-xs"
            >
              <Plus size={14} />
              <span>Add your first job</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border-subtle bg-white text-2xs font-semibold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">Role & Company</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Date Posted</th>
                  <th className="px-4 py-3.5">Telemetry</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle/70">
                {visibleJobs.map((job, idx) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDelete={onDelete}
                    onViewPoster={onViewPoster}
                    isLatest={page === 1 && idx === 0 && tableDateFilter === "all" && !search}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-border-subtle px-6 py-3 sm:flex-row sm:items-center sm:justify-between bg-white">
            <p className="text-xs text-text-muted">
              Showing{" "}
              <span className="font-medium text-text-primary">
                {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredJobs.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-text-primary">
                {filteredJobs.length}
              </span>{" "}
              jobs
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex h-8 items-center gap-1 rounded-control border border-border-default bg-white px-2.5 text-xs font-medium text-text-secondary shadow-2xs transition hover:bg-surface-subtle hover:text-text-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="min-w-16 text-center text-xs tabular-nums text-text-secondary">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-8 items-center gap-1 rounded-control border border-border-default bg-white px-2.5 text-xs font-medium text-text-secondary shadow-2xs transition hover:bg-surface-subtle hover:text-text-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
