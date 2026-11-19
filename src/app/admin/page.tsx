"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  ImageDown,
  MapPin,
  MousePointerClick,
  Pencil,
  Plus,
  Search,
  AlertCircle,
  Users,
  ExternalLink,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  views?: number;
  emailCopyCount?: number;
};

type Candidate = {
  id: string;
  email?: string;
  full_name?: string | null;
  created_at?: string;
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

type Timeframe =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "this_month"
  | "all";

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string; shortLabel: string }[] = [
  { value: "today", label: "Today", shortLabel: "Today" },
  { value: "yesterday", label: "Yesterday", shortLabel: "Yest" },
  { value: "7days", label: "Last 7 days", shortLabel: "7D" },
  { value: "30days", label: "Last 30 days", shortLabel: "30D" },
  { value: "this_month", label: "This month", shortLabel: "Month" },
  { value: "all", label: "All time", shortLabel: "All" },
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

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  loading,
  href,
  action,
}: {
  label: string;
  value: number | string;
  subtext: React.ReactNode;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  loading: boolean;
  href?: string;
  action?: React.ReactNode;
}) {
  const content = (
    <div
      className="group relative flex h-full flex-col justify-between rounded-card border border-border-subtle bg-surface-card p-5 shadow-2xs transition duration-150 hover:border-border-strong hover:shadow-xs"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </span>
          <Icon size={17} strokeWidth={1.8} className="text-text-muted shrink-0" />
        </div>

        {loading ? (
          <div className="mt-4 h-8 w-24 animate-pulse rounded-control bg-surface-subtle" />
        ) : (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {typeof value === "number" ? value.toLocaleString("en-IN") : value}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-subtle/80 pt-3 text-xs text-text-muted">
        <div className="truncate">{subtext}</div>
        {action}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const [tableDateFilter, setTableDateFilter] = useState<"all" | Timeframe>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const tableDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target as Node)) {
        setIsTableDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsTableDropdownOpen(false);
      }
    }
    if (isDropdownOpen || isTableDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isDropdownOpen, isTableDropdownOpen]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchDashboardData() {
      try {
        const [response, pendingResponse, candidatesResponse] = await Promise.all([
          fetch("/api/jobs", { cache: "no-store", signal: controller.signal }),
          fetch("/api/jobs?status=pending", { cache: "no-store", signal: controller.signal }).catch(() => null),
          fetch("/api/admin/candidates", { cache: "no-store", signal: controller.signal }).catch(() => null),
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

        if (candidatesResponse && candidatesResponse.ok) {
          const cData = await candidatesResponse.json().catch(() => ({}));
          if (Array.isArray(cData?.candidates)) {
            setCandidates(cData.candidates);
          }
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
            : "Something went wrong while loading dashboard data."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchDashboardData();
    return () => controller.abort();
  }, [retryKey]);

  const metrics = useMemo(() => {
    const periodJobs = jobs.filter((job) =>
      isDateInTimeframe(job.postedDate, timeframe)
    );
    const periodCandidates = candidates.filter((c) =>
      isDateInTimeframe(c.created_at, timeframe)
    );

    const totalViews = jobs.reduce(
      (sum, j) => sum + (typeof j.views === "number" ? j.views : 0),
      0
    );
    const periodViews = (timeframe === "all" ? jobs : periodJobs).reduce(
      (sum, j) => sum + (typeof j.views === "number" ? j.views : 0),
      0
    );

    const totalClicks = jobs.reduce(
      (sum, j) => sum + (typeof j.emailCopyCount === "number" ? j.emailCopyCount : 0),
      0
    );
    const periodClicks = (timeframe === "all" ? jobs : periodJobs).reduce(
      (sum, j) => sum + (typeof j.emailCopyCount === "number" ? j.emailCopyCount : 0),
      0
    );

    const totalCTR =
      totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
    const periodCTR =
      periodViews > 0 ? ((periodClicks / periodViews) * 100).toFixed(1) : "0.0";

    return {
      periodJobsCount: periodJobs.length,
      totalJobsCount: jobs.length,
      periodCandidatesCount: periodCandidates.length,
      totalCandidatesCount: candidates.length,
      periodViews,
      totalViews,
      periodClicks,
      totalClicks,
      totalCTR,
      periodCTR,
    };
  }, [jobs, candidates, timeframe]);

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

  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <div className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
        {/* Top Header */}
        <header>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-2xs font-bold uppercase tracking-wider text-brand">
              Admin Console
            </span>
            <span className="text-text-muted">•</span>
            <span className="text-xs text-text-muted">Overview</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Monitor job listings, candidate growth, impressions, and applications in real time.
          </p>
        </header>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-card border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div>
                <p className="text-sm font-semibold text-red-950">
                  Could not load dashboard data
                </p>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="self-start text-xs font-bold text-red-800 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pending Submissions Alert Banner */}
        {pendingCount > 0 && (
          <div className="flex flex-col items-start justify-between gap-3 rounded-card border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-amber-100 text-amber-700">
                <AlertCircle size={17} />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  {pendingCount === 1
                    ? "1 public job listing requires admin review"
                    : `${pendingCount} public job listings require admin review`}
                </p>
                <p className="text-xs text-amber-800/80">
                  Public postings submitted via the portal must be approved before appearing live.
                </p>
              </div>
            </div>
            <Link
              href="/admin/submissions"
              className="inline-flex h-8 items-center gap-1.5 rounded-control bg-amber-600 px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 transition"
            >
              <span>Review now</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        )}

        {/* Key Metrics Section */}
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-text-primary">
                Platform Performance
              </h2>
              <p className="text-xs text-text-muted">
                {timeframe === "all"
                  ? "Showing all-time cumulative platform performance"
                  : `Live metrics filtered for ${TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label.toLowerCase()}`}
              </p>
            </div>

            {/* Compact Timeframe Dropdown (Stripe / Vercel style) */}
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
                className={`inline-flex h-9 items-center gap-2 rounded-control border bg-surface-card px-3.5 text-xs font-semibold shadow-2xs transition ${
                  isDropdownOpen
                    ? "border-brand ring-2 ring-focus-ring text-text-primary"
                    : "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary"
                }`}
              >
                <CalendarDays size={14} className="text-brand shrink-0" />
                <span className="text-text-muted font-normal">Range:</span>
                <span className="font-semibold text-text-primary">
                  {TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-text-muted transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180 text-brand" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Select timeframe"
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-card border border-border-subtle bg-surface-card p-1.5 shadow-dropdown z-40 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2.5 py-1.5 text-3xs font-bold uppercase tracking-wider text-text-muted">
                    Filter by Period
                  </div>
                  <div className="space-y-0.5">
                    {TIMEFRAME_OPTIONS.map((opt) => {
                      const isSelected = timeframe === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setTimeframe(opt.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-control px-2.5 py-2 text-xs transition ${
                            isSelected
                              ? "bg-brand-soft font-semibold text-brand"
                              : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check size={14} className="text-brand shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Jobs */}
            <StatCard
              label="Total Jobs"
              value={timeframe === "all" ? metrics.totalJobsCount : metrics.periodJobsCount}
              subtext={
                timeframe === "all"
                  ? "All published listings"
                  : `All-time: ${metrics.totalJobsCount.toLocaleString("en-IN")}`
              }
              action={
                timeframe !== "all" && metrics.periodJobsCount > 0 && tableDateFilter !== timeframe ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTableDateFilter(timeframe);
                      document
                        .getElementById("job-listings-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-2xs font-semibold text-brand hover:underline"
                  >
                    Filter list ↓
                  </button>
                ) : undefined
              }
              icon={BriefcaseBusiness}
              loading={loading}
              href="/admin/jobs"
            />

            {/* 2. Total Candidates */}
            <StatCard
              label="Total Candidates"
              value={timeframe === "all" ? metrics.totalCandidatesCount : metrics.periodCandidatesCount}
              subtext={
                timeframe === "all"
                  ? "Registered candidate profiles"
                  : `All-time: ${metrics.totalCandidatesCount.toLocaleString("en-IN")}`
              }
              icon={Users}
              loading={loading}
              href="/admin/candidates"
            />

            {/* 3. Total Views */}
            <StatCard
              label="Total Views"
              value={timeframe === "all" ? metrics.totalViews : metrics.periodViews}
              subtext={
                timeframe === "all"
                  ? "Cumulative impressions"
                  : `All-time: ${metrics.totalViews.toLocaleString("en-IN")}`
              }
              icon={Eye}
              loading={loading}
            />

            {/* 4. Total Clicks */}
            <StatCard
              label="Total Clicks"
              value={timeframe === "all" ? metrics.totalClicks : metrics.periodClicks}
              subtext={
                <span>
                  CTR: <strong className="font-semibold text-text-primary">{timeframe === "all" ? metrics.totalCTR : metrics.periodCTR}%</strong>
                  {timeframe !== "all" && ` • All: ${metrics.totalClicks.toLocaleString("en-IN")}`}
                </span>
              }
              icon={MousePointerClick}
              loading={loading}
            />
          </div>
        </section>

        {/* Main Job Listings Card */}
        <section
          id="job-listings-section"
          className="rounded-card border border-border-subtle bg-surface-card shadow-2xs overflow-hidden"
        >
          {/* Card Top Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-border-subtle p-5 sm:flex-row sm:items-center bg-surface-card">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-soft text-brand font-semibold shrink-0">
                <BriefcaseBusiness size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    Job Listings
                  </h3>
                  <span className="rounded-control bg-surface-subtle border border-border-default px-2 py-0.5 text-2xs font-semibold text-text-secondary">
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
                  className="h-9 w-full rounded-control border border-border-default bg-surface-card pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted outline-none transition hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              <div className="relative inline-block text-left" ref={tableDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTableDropdownOpen((prev) => !prev)}
                  aria-expanded={isTableDropdownOpen}
                  aria-haspopup="listbox"
                  className={`inline-flex h-9 items-center gap-2 rounded-control border bg-surface-card px-3 text-xs font-semibold shadow-2xs transition cursor-pointer ${
                    isTableDropdownOpen
                      ? "border-brand ring-2 ring-focus-ring text-text-primary"
                      : "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  <CalendarDays size={13} className="text-brand shrink-0" />
                  <span className="font-semibold text-text-primary">
                    {tableDateFilter === "all"
                      ? "All dates"
                      : TIMEFRAME_OPTIONS.find((o) => o.value === tableDateFilter)?.label}
                  </span>
                  <span className="rounded-[4px] bg-surface-subtle px-1.5 py-0.5 text-3xs font-semibold text-text-muted border border-border-subtle">
                    {timeframeCounts[tableDateFilter]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-text-muted transition-transform duration-200 ${
                      isTableDropdownOpen ? "rotate-180 text-brand" : ""
                    }`}
                  />
                </button>

                {isTableDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Filter jobs table by date"
                    className="absolute right-0 top-full mt-1.5 w-52 rounded-card border border-border-subtle bg-surface-card p-1.5 shadow-dropdown z-40 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-2.5 py-1.5 text-3xs font-bold uppercase tracking-wider text-text-muted">
                      Filter by Date
                    </div>
                    <div className="space-y-0.5">
                      {[
                        { value: "all" as const, label: "All dates" },
                        { value: "today" as const, label: "Today" },
                        { value: "yesterday" as const, label: "Yesterday" },
                        { value: "7days" as const, label: "Last 7 days" },
                        { value: "30days" as const, label: "Last 30 days" },
                        { value: "this_month" as const, label: "This month" },
                      ].map((opt) => {
                        const isSelected = tableDateFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setTableDateFilter(opt.value);
                              setIsTableDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-control px-2.5 py-2 text-xs transition cursor-pointer ${
                              isSelected
                                ? "bg-brand-soft font-semibold text-brand"
                                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{opt.label}</span>
                              <span className="text-2xs text-text-muted">
                                ({timeframeCounts[opt.value]})
                              </span>
                            </span>
                            {isSelected && (
                              <Check size={14} className="text-brand shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/admin/jobs"
                className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-text-secondary shadow-2xs transition hover:bg-surface-subtle hover:text-text-primary"
              >
                <span>Full view</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* Table / Content */}
          <div>
            {loading ? (
              <div className="space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/3 rounded-control bg-surface-subtle" />
                      <div className="h-3 w-1/2 rounded-control bg-surface-muted" />
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
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    Reset date filter
                  </button>
                )}

                {!search && tableDateFilter === "all" && (
                  <Link
                    href="/admin/jobs/add"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-control bg-brand px-3.5 py-2 text-xs font-semibold text-text-inverse hover:bg-brand-hover shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Add your first job</span>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead className="border-b border-border-subtle bg-surface-subtle text-2xs font-semibold uppercase tracking-wider text-text-muted">
                      <tr>
                        <th className="py-3.5 pl-6 pr-4">Role & Company</th>
                        <th className="px-4 py-3.5">Location</th>
                        <th className="px-4 py-3.5">Date Posted</th>
                        <th className="px-4 py-3.5">Telemetry</th>
                        <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border-subtle/70">
                      {filteredJobs.slice(0, 10).map((job, idx) => (
                        <tr
                          key={job.id}
                          className="group transition-colors hover:bg-surface-subtle/70"
                        >
                          {/* Role & Company (No logo) */}
                          <td className="py-4 pl-6 pr-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/jobs/${job.id}`}
                                  className="max-w-[320px] lg:max-w-md truncate text-sm font-semibold text-text-primary hover:text-brand transition"
                                >
                                  {job.title}
                                </Link>
                                {idx === 0 && tableDateFilter === "all" && !search && (
                                  <span className="rounded-[4px] bg-emerald-50 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-text-muted truncate">
                                {job.company}
                              </p>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={13} className="shrink-0 text-text-muted" />
                              {job.location}
                            </span>
                          </td>

                          {/* Date Posted */}
                          <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={13} className="shrink-0 text-text-muted" />
                              {formatDate(job.postedDate)}
                            </span>
                          </td>

                          {/* Telemetry (Views & Clicks) */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-2xs">
                              <span
                                title="Page views"
                                className="inline-flex items-center gap-1 rounded-control bg-surface-subtle px-2 py-1 font-medium text-text-secondary border border-border-subtle"
                              >
                                <Eye size={12} className="text-violet-600" />
                                {(job.views || 0).toLocaleString()}
                              </span>
                              <span
                                title="Copy email / apply clicks"
                                className="inline-flex items-center gap-1 rounded-control bg-amber-50/70 text-amber-800 border border-amber-200/60 px-2 py-1 font-medium"
                              >
                                <MousePointerClick size={12} className="text-amber-600" />
                                {(job.emailCopyCount || 0).toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/job-posters?jobId=${encodeURIComponent(job.id)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View poster for ${job.title}`}
                                title="View poster image"
                                className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary shadow-2xs transition hover:border-brand/40 hover:text-brand"
                              >
                                <ImageDown size={13} className="text-brand" />
                                <span>Poster</span>
                              </a>

                              <Link
                                href={`/admin/jobs/${job.id}/edit`}
                                aria-label={`Edit ${job.title}`}
                                className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary shadow-2xs transition hover:border-brand/40 hover:text-brand"
                              >
                                <Pencil size={12} />
                                <span>Edit</span>
                              </Link>

                              <Link
                                href={`/admin/jobs/${job.id}`}
                                aria-label={`View ${job.title}`}
                                title="View details"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-control border border-border-default bg-surface-card text-text-muted shadow-2xs transition hover:border-brand/40 hover:text-brand"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List View (No logo) */}
                <div className="divide-y divide-border-subtle/70 md:hidden">
                  {filteredJobs.slice(0, 8).map((job) => (
                    <div key={job.id} className="p-4 space-y-3">
                      <div>
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="break-words text-sm font-semibold text-text-primary hover:text-brand transition"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5">
                          {job.company}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} />
                          {formatDate(job.postedDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/60">
                        <div className="flex items-center gap-2 text-2xs">
                          <span className="inline-flex items-center gap-1 text-text-muted">
                            <Eye size={12} /> {(job.views || 0).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <MousePointerClick size={12} /> {(job.emailCopyCount || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/job-posters?jobId=${encodeURIComponent(job.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-control border border-border-default px-2 py-1 text-xs font-medium text-text-secondary"
                          >
                            <ImageDown size={12} className="text-brand" />
                            Poster
                          </a>

                          <Link
                            href={`/admin/jobs/${job.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-control border border-border-default px-2 py-1 text-xs font-medium text-text-secondary"
                          >
                            <Pencil size={11} />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="flex flex-col gap-2 border-t border-border-subtle bg-surface-card px-6 py-4 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      Showing {Math.min(filteredJobs.length, 10)} of{" "}
                      {filteredJobs.length} matching jobs
                    </span>
                    {tableDateFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setTableDateFilter("all")}
                        className="font-semibold text-brand hover:underline"
                      >
                        (Clear date filter)
                      </button>
                    )}
                  </div>

                  <Link
                    href="/admin/jobs"
                    className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-hover"
                  >
                    <span>Manage all listings in full view</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-2 pb-6 text-center text-xs text-text-muted">
          Zenoway Admin Console • Internal Management Workbench
        </footer>
      </div>
    </div>
  );
}
