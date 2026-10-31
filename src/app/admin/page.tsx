
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Layers3,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
  Users,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
};

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

function formatDate(value?: string) {
  const date = parseDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(value?: string) {
  return (
    value
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

type Timeframe =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "this_month"
  | "all";

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "all", label: "All time" },
];

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

function isJob(value: unknown): value is Job {
  if (!value || typeof value !== "object") return false;

  const job = value as Record<string, unknown>;

  return (
    typeof job.id === "string" &&
    typeof job.title === "string" &&
    typeof job.company === "string" &&
    typeof job.location === "string" &&
    typeof job.postedDate === "string"
  );
}

function Stat({
  label,
  value,
  description,
  icon: Icon,
  loading,
  control,
}: {
  label: React.ReactNode;
  value: number;
  description: React.ReactNode;
  icon: typeof BriefcaseBusiness;
  loading: boolean;
  control?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-b border-border-subtle py-5 sm:border-b-0 sm:border-r sm:border-border-subtle sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          {typeof label === "string" ? (
            <p className="text-[13px] font-medium text-text-muted truncate">
              {label}
            </p>
          ) : (
            label
          )}
          {control}
        </div>
        <Icon size={17} strokeWidth={1.7} className="text-brand shrink-0" />
      </div>

      {loading ? (
        <div className="mt-3 h-9 w-16 animate-pulse rounded-control bg-surface-subtle" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-text-primary">
          {value.toLocaleString("en-IN")}
        </p>
      )}

      <div className="mt-2 text-xs text-text-muted">{description}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const [tableDateFilter, setTableDateFilter] = useState<"all" | Timeframe>("all");

  const loadJobs = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const [response, pendingResponse] = await Promise.all([
        fetch("/api/jobs", { cache: "no-store", signal }),
        fetch("/api/jobs?status=pending", { cache: "no-store", signal }).catch(() => null),
      ]);

      if (!response.ok) {
        throw new Error("Unable to load jobs. Please try again.");
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The jobs API returned an unexpected response.");
      }

      if (pendingResponse && pendingResponse.ok) {
        const pendingData = await pendingResponse.json().catch(() => []);
        setPendingCount(Array.isArray(pendingData) ? pendingData.length : 0);
      }

      const validJobs = data.filter(isJob);

      validJobs.sort((a, b) => {
        const dateA = parseDate(a.postedDate)?.getTime() ?? 0;
        const dateB = parseDate(b.postedDate)?.getTime() ?? 0;
        return dateB - dateA;
      });

      setJobs(validJobs);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading jobs."
      );
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadJobs(controller.signal);

    return () => controller.abort();
  }, [loadJobs, retryKey]);

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

  const timeframeDescriptions = useMemo<Record<Timeframe, string>>(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    const yesterdayStr = yesterday.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    const monthStr = now.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });

    const count = timeframeCounts[timeframe];
    const jobWord = count === 1 ? "job" : "jobs";

    return {
      today:
        count > 0
          ? `${count} ${jobWord} posted today (${todayStr})`
          : `No jobs posted today (${todayStr})`,
      yesterday:
        count > 0
          ? `${count} ${jobWord} posted yesterday (${yesterdayStr})`
          : `No jobs posted yesterday (${yesterdayStr})`,
      "7days":
        count > 0
          ? `${count} ${jobWord} posted in the last 7 days`
          : "No jobs posted in the last 7 days",
      "30days":
        count > 0
          ? `${count} ${jobWord} posted in the last 30 days`
          : "No jobs posted in the last 30 days",
      this_month:
        count > 0
          ? `${count} ${jobWord} posted in ${monthStr}`
          : `No jobs posted in ${monthStr}`,
      all: "All-time available listings",
    };
  }, [timeframeCounts, timeframe]);

  const companiesCount = useMemo(
    () =>
      new Set(
        jobs
          .map((job) => job.company.trim().toLowerCase())
          .filter(Boolean)
      ).size,
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (tableDateFilter !== "all") {
      result = result.filter((job) =>
        isDateInTimeframe(job.postedDate, tableDateFilter)
      );
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((job) =>
        [job.title, job.company, job.location].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }

    return result;
  }, [jobs, search, tableDateFilter]);

  const latestJob = jobs[0];

  return (
    <div className="min-h-full bg-surface-page text-text-primary">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <span>Admin</span>
              <ChevronRight size={13} />
              <span className="text-text-secondary">Overview</span>
            </div>

            <h1 className="text-[30px] font-semibold tracking-[-0.05em] text-text-primary sm:text-[36px]">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Manage your job listings in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 text-sm font-medium text-text-secondary shadow-xs transition hover:bg-surface-subtle hover:text-text-primary disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/admin/candidates"
              className="inline-flex h-10 items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 text-sm font-medium text-text-secondary shadow-xs transition hover:bg-surface-subtle hover:text-text-primary"
            >
              <Users size={15} />
              Candidates
            </Link>

            <Link
              href="/admin/jobs/add"
              className="inline-flex h-10 items-center gap-2 rounded-control bg-brand px-4 text-sm font-medium text-text-inverse shadow-xs transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Plus size={16} />
              Add a job
            </Link>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mt-8 flex flex-col gap-3 rounded-panel border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Could not load dashboard data
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="self-start text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Pending Submissions Alert Banner */}
        {pendingCount > 0 && (
          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-card border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {pendingCount === 1
                    ? "1 public job submission awaits review"
                    : `${pendingCount} public job submissions await review`}
                </p>
                <p className="text-xs text-text-muted">
                  New listings posted via /post-job need admin approval before appearing live.
                </p>
              </div>
            </div>
            <Link
              href="/admin/submissions"
              className="inline-flex h-9 items-center gap-1.5 rounded-control bg-amber-500 px-4 text-xs font-semibold text-white shadow-subtle hover:bg-amber-600 transition"
            >
              <span>Review Submissions</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        )}

        {/* Overview statistics */}
        <section className="mt-9 border-y border-border-subtle sm:mt-11">
          <div className="flex flex-col justify-between gap-1 border-b border-border-subtle py-4 sm:flex-row sm:items-center">
            <h2 className="text-sm font-semibold text-text-primary">Platform overview</h2>
            <p className="text-xs text-text-muted">
              Based on available job listings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-border-subtle">
            <Stat
              label="Total job listings"
              value={jobs.length}
              description="All available listings"
              icon={BriefcaseBusiness}
              loading={loading}
            />
            <Stat
              label="Posted"
              control={
                <div className="relative inline-flex items-center">
                  <select
                    id="admin-posted-timeframe"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                    aria-label="Filter posted timeframe"
                    className="h-6 cursor-pointer appearance-none rounded-control border border-border-default bg-surface-card pl-2 pr-5 text-xs font-semibold text-text-secondary shadow-2xs transition hover:border-brand hover:text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {TIMEFRAME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-1.5 text-text-muted"
                  />
                </div>
              }
              value={timeframeCounts[timeframe]}
              description={
                <span className="flex flex-wrap items-center justify-between gap-1">
                  <span>{timeframeDescriptions[timeframe]}</span>
                  {timeframeCounts[timeframe] > 0 && tableDateFilter !== timeframe && (
                    <button
                      type="button"
                      onClick={() => {
                        setTableDateFilter(timeframe);
                        document
                          .getElementById("job-listings-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-[11px] font-medium text-brand hover:underline"
                    >
                      View in list ↓
                    </button>
                  )}
                </span>
              }
              icon={CalendarDays}
              loading={loading}
            />
            <Stat
              label="Companies represented"
              value={companiesCount}
              description="Unique company names"
              icon={Building2}
              loading={loading}
            />
          </div>
        </section>

        {/* Latest job */}
        {!loading && !error && latestJob && (
          <section className="mt-9 border-b border-border-subtle pb-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Latest posting
              </p>
            </div>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold tracking-[-0.035em] text-text-primary sm:text-2xl">
                  {latestJob.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={14} />
                    {latestJob.company}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} />
                    {latestJob.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {formatDate(latestJob.postedDate)}
                  </span>
                </div>
              </div>

              <Link
                href={`/admin/jobs/${latestJob.id}`}
                className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-brand transition hover:text-brand-hover sm:self-center"
              >
                Edit job
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* Job listings */}
        <section id="job-listings-section" className="mt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.025em] text-text-primary">
                Job listings
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Search and update your published jobs.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-[240px]">
                <span className="sr-only">Search jobs</span>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search jobs..."
                  className="h-10 w-full rounded-control border border-border-default bg-surface-card pl-9 pr-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring"
                />
              </label>

              <div className="relative inline-flex items-center">
                <select
                  value={tableDateFilter}
                  onChange={(event) =>
                    setTableDateFilter(event.target.value as "all" | Timeframe)
                  }
                  aria-label="Filter jobs table by date"
                  className="h-10 cursor-pointer appearance-none rounded-control border border-border-default bg-surface-card pl-3 pr-8 text-xs font-medium text-text-secondary shadow-xs transition hover:bg-surface-subtle hover:text-text-primary focus:border-brand focus:outline-none"
                >
                  <option value="all">All dates</option>
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

              <Link
                href="/admin/jobs"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 text-sm font-medium text-text-secondary shadow-xs transition hover:bg-surface-subtle hover:text-text-primary"
              >
                All jobs
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="mt-5 border-t border-border-subtle">
            {loading ? (
              <div className="space-y-5 py-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-control bg-surface-subtle" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/3 rounded-pill bg-surface-subtle" />
                      <div className="h-3 w-1/2 rounded-pill bg-surface-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center text-sm text-text-muted">
                Job listings are unavailable until the request succeeds.
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                  {search ? <Search size={19} /> : <BriefcaseBusiness size={19} />}
                </div>

                <h3 className="mt-4 text-sm font-semibold text-text-primary">
                  {search || tableDateFilter !== "all"
                    ? "No matching jobs"
                    : "No jobs posted yet"}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
                  {search || tableDateFilter !== "all"
                    ? "No jobs found for the selected filter or search term."
                    : "Your job listings will appear here when you add your first job."}
                </p>

                {tableDateFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setTableDateFilter("all")}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    Reset date filter
                  </button>
                )}

                {!search && tableDateFilter === "all" && (
                  <Link
                    href="/admin/jobs/add"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
                  >
                    <Plus size={15} />
                    Add your first job
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead className="border-b border-border-subtle text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                      <tr>
                        <th className="py-4 pr-4">Job details</th>
                        <th className="px-4 py-4">Location</th>
                        <th className="px-4 py-4">Date posted</th>
                        <th className="py-4 pl-4 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border-subtle">
                      {filteredJobs.slice(0, 8).map((job) => (
                        <tr key={job.id} className="group transition-colors hover:bg-surface-subtle">
                          <td className="py-4 pr-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-xs font-semibold text-brand">
                                {getInitials(job.company)}
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-sm truncate text-sm font-medium text-text-primary">
                                  {job.title}
                                </p>
                                <p className="mt-1 text-xs text-text-muted">
                                  {job.company}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-text-secondary">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} className="shrink-0 text-text-muted" />
                              {job.location}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-text-secondary">
                            {formatDate(job.postedDate)}
                          </td>

                          <td className="py-4 pl-4 text-right">
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              aria-label={`Edit ${job.title}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-brand"
                            >
                              <Pencil size={14} />
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile list */}
                <div className="divide-y divide-border-subtle md:hidden">
                  {filteredJobs.slice(0, 8).map((job) => (
                    <div key={job.id} className="flex gap-3 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-xs font-semibold text-brand">
                        {getInitials(job.company)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium text-text-primary">
                          {job.title}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {job.company}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {job.location}
                          </span>
                          <span>{formatDate(job.postedDate)}</span>
                        </div>

                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover"
                        >
                          <Pencil size={13} />
                          Edit job
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-border-subtle py-4 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      Showing {Math.min(filteredJobs.length, 8)} of{" "}
                      {filteredJobs.length} matching jobs
                    </span>
                    {tableDateFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setTableDateFilter("all")}
                        className="font-medium text-brand hover:underline"
                      >
                        (Clear date filter)
                      </button>
                    )}
                  </div>
                  <Link
                    href="/admin/jobs"
                    className="inline-flex items-center gap-1 self-start font-semibold text-brand hover:text-brand-hover sm:self-auto"
                  >
                    Manage all jobs
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="mt-12 border-t border-border-subtle pt-5 text-xs text-text-muted">
          Zenoway Admin
        </footer>
      </div>
    </div>
  );
}
