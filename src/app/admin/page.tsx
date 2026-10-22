
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Plus,
  ArrowUpRight,
  Search,
  MapPin,
  CalendarDays,
  Pencil,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Building2,
  Layers3,
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

  // Handle dd/mm/yyyy explicitly.
  const dmy = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const date = new Date(year, month - 1, day);

    // Reject invalid dates such as 31/02/2026.
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  // Handle ISO dates, including YYYY-MM-DD.
  const date = new Date(value);
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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const posted = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference = today.getTime() - posted.getTime();
  return difference >= 0 && difference < 7 * 24 * 60 * 60 * 1000;
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

      const validJobs = data.filter(
        (job): job is Job =>
          job !== null &&
          typeof job === "object" &&
          typeof job.id === "string" &&
          typeof job.title === "string" &&
          typeof job.company === "string" &&
          typeof job.location === "string" &&
          typeof job.postedDate === "string"
      );

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
      if (!signal.aborted) {
        setLoading(false);
      }
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
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="font-medium text-slate-700">Overview</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage job listings and keep track of your hiring platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/admin/jobs/add"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Add new job
            </Link>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div>
                <p className="font-semibold text-red-900">
                  Could not load dashboard data
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Statistics */}
        <section aria-label="Job statistics">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Platform overview
            </h2>
            <span className="text-xs text-slate-500">
              Based on available job listings
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Total jobs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total job listings
                  </p>

                  {loading ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
                  ) : (
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      {jobs.length}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <BriefcaseBusiness size={21} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <Layers3 size={15} />
                All available listings
              </div>
            </div>

            {/* Recent jobs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Posted in the last 7 days
                  </p>

                  {loading ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
                  ) : (
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      {recentCount}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <CalendarDays size={21} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <ArrowUpRight size={15} />
                Recent posting activity
              </div>
            </div>

            {/* Companies */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6 xl:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Companies represented
                  </p>

                  {loading ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
                  ) : (
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      {companiesCount}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                  <Building2 size={21} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <Building2 size={15} />
                Unique company names in listings
              </div>
            </div>
          </div>
        </section>

        {/* Latest posting highlight */}
        {!loading && !error && latestJob && (
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/10 p-3 text-white">
                  <BriefcaseBusiness size={23} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300">
                    Most recently posted job
                  </p>
                  <h2 className="mt-2 break-words text-xl font-semibold tracking-tight sm:text-2xl">
                    {latestJob.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={15} />
                      {latestJob.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} />
                      {latestJob.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} />
                      {formatDate(latestJob.postedDate)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/jobs/${latestJob.id}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Edit latest job
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* Jobs table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Recent job listings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review listings and update their details.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-72">
                <span className="sr-only">
                  Search jobs by title, company, or location
                </span>
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search jobs..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </label>

              <Link
                href="/admin/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                All jobs
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-16 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                Job listings are unavailable until the request succeeds.
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                {search ? <Search size={22} /> : <BriefcaseBusiness size={22} />}
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {search ? "No matching jobs" : "No jobs posted yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try another title, company name, or location."
                  : "Your job listings will appear here once you add your first job."}
              </p>

              {!search && (
                <Link
                  href="/admin/jobs/add"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Add your first job
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Job details</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Date posted</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.slice(0, 8).map((job) => (
                      <tr
                        key={job.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                              {getInitials(job.company)}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-sm truncate text-sm font-semibold text-slate-900">
                                {job.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {job.company}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <MapPin
                              size={14}
                              className="shrink-0 text-slate-400"
                            />
                            {job.location}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(job.postedDate)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/jobs/${job.id}`}
                            aria-label={`Edit ${job.title}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
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

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredJobs.slice(0, 8).map((job) => (
                  <div key={job.id} className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                        {getInitials(job.company)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-semibold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {job.company}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {formatDate(job.postedDate)}
                          </span>
                        </div>

                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit job
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(filteredJobs.length, 8)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {filteredJobs.length}
                  </span>{" "}
                  matching jobs
                </p>

                <Link
                  href="/admin/jobs"
                  className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-blue-700"
                >
                  Manage all listings
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="pb-2 text-center text-xs text-slate-400">
          Zenoway Admin · Job management overview
        </footer>
      </div>
    </div>
  );
}
