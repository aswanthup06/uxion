
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Layers3,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
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

function isWithinLastSevenDays(value?: string) {
  const date = parseDate(value);
  if (!date) return false;

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const posted = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference = today.getTime() - posted.getTime();

  return difference >= 0 && difference < 7 * 24 * 60 * 60 * 1000;
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
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof BriefcaseBusiness;
  loading: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-border-subtle py-5 sm:border-b-0 sm:border-r sm:border-border-subtle sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-text-muted">
          {label}
        </p>
        <Icon size={17} strokeWidth={1.7} className="text-brand" />
      </div>

      {loading ? (
        <div className="mt-3 h-9 w-16 animate-pulse rounded-control bg-surface-subtle" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-text-primary">
          {value.toLocaleString("en-IN")}
        </p>
      )}

      <p className="mt-2 text-xs text-text-muted">{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const loadJobs = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/jobs", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("Unable to load jobs. Please try again.");
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The jobs API returned an unexpected response.");
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

  const recentCount = useMemo(
    () => jobs.filter((job) => isWithinLastSevenDays(job.postedDate)).length,
    [jobs]
  );

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
    const query = search.trim().toLowerCase();
    if (!query) return jobs;

    return jobs.filter((job) =>
      [job.title, job.company, job.location].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [jobs, search]);

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
              label="Posted in the last 7 days"
              value={recentCount}
              description="Recent posting activity"
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
        <section className="mt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.025em] text-text-primary">
                Job listings
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Search and update your published jobs.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-[270px]">
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
                  {search ? "No matching jobs" : "No jobs posted yet"}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
                  {search
                    ? "Try another title, company name, or location."
                    : "Your job listings will appear here when you add your first job."}
                </p>

                {!search && (
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
                  <span>
                    Showing {Math.min(filteredJobs.length, 8)} of{" "}
                    {filteredJobs.length} matching jobs
                  </span>
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
