"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
  Wallet,
  WifiOff,
  X,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import { parseExperience, timeAgo, isRecent, getJobCategory } from "@/app/components/jobs/jobs-utils";
import Modal from "@/app/components/Modal";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type WorkMode = "On-site" | "Hybrid" | "Remote";

const categories = [
  "Engineering",
  "Design",
  "Product",
  "Data",
  "Marketing",
  "Human Resources",
  "Customer Support",
  "Finance",
  "Sales",
];

const types: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
const modes: WorkMode[] = ["On-site", "Hybrid", "Remote"];
const experiences = [
  "Any experience",
  "Entry level",
  "0–2 years",
  "1–3 years",
  "2–4 years",
  "3–5 years",
  "5+ years",
];

const PAGE_SIZE = 12;

function getWorkMode(job: Job): WorkMode {
  const m = (job.workMode || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  if (m.includes("remote") || loc.includes("remote")) return "Remote";
  if (m.includes("hybrid") || loc.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function getJobType(job: Job): JobType {
  const t = (job.employmentType || "").toUpperCase();
  const title = (job.title || "").toLowerCase();
  if (t === "INTERN" || title.includes("intern")) return "Internship";
  if (t === "CONTRACTOR" || title.includes("contract")) return "Contract";
  if (t === "PART_TIME" || title.includes("part-time")) return "Part-time";
  return "Full-time";
}

function parseMonthlySalary(salaryStr?: string | null): number {
  if (!salaryStr || /not disclosed/i.test(salaryStr)) return 0;
  const lpaMatch = salaryStr.match(/(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?\s*lpa/i);
  if (lpaMatch) {
    const minLpa = parseFloat(lpaMatch[1]);
    return Math.round((minLpa * 100000) / 12);
  }
  const clean = salaryStr.replace(/,/g, "");
  const numMatch = clean.match(/(\d{4,})/);
  if (numMatch) {
    const val = parseInt(numMatch[1], 10);
    if (val > 100000) return Math.round(val / 12);
    return val;
  }
  return 0;
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors duration-normal ease-standard ${
        active
          ? "border-brand bg-brand text-text-inverse hover:bg-brand-hover shadow-subtle"
          : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

const navCls = (active: boolean) =>
  `flex w-full cursor-pointer items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium transition-colors duration-normal ${
    active
      ? "bg-brand-soft text-brand font-semibold"
      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
  }`;

const selectCls =
  "mt-2 h-10 w-full cursor-pointer rounded-control border border-border-default bg-surface-card px-3 text-sm text-text-primary outline-none transition-colors hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring";

function JobsViewContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<string>("All job types");
  const [mode, setMode] = useState<string>("All work modes");
  const [category, setCategory] = useState<string>(
    initialCategory
      ? categories.find((c) => c.toLowerCase().includes(initialCategory.toLowerCase())) || "All categories"
      : "All categories"
  );
  const [experience, setExperience] = useState<string>("Any experience");
  const [salaryFloor, setSalaryFloor] = useState<string>("0");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [emailCopied, setEmailCopied] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load saved job IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zenoway_saved_jobs");
      if (raw) {
        setSaved(JSON.parse(raw));
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  const toggleSaved = (id: string) => {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        localStorage.setItem("zenoway_saved_jobs", JSON.stringify(next));
      } catch {
        // Local storage unavailable
      }
      return next;
    });
  };

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error(String(res.status));
      const data: Job[] = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching jobs:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Derived category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) counts[c] = 0;
    for (const j of jobs) {
      const cat = getJobCategory(j);
      if (counts[cat] !== undefined) counts[cat]++;
    }
    return counts;
  }, [jobs]);

  // Filter & sort logic
  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const floor = Number(salaryFloor);

    const result = jobs.filter((job) => {
      const cat = getJobCategory(job);
      const jMode = getWorkMode(job);
      const jType = getJobType(job);
      const searchable = [
        job.title,
        job.company,
        cat,
        job.location,
        job.description,
        job.experience,
      ]
        .join(" ")
        .toLowerCase();

      // Search match
      if (q && !searchable.includes(q)) return false;

      // Location match
      if (loc && !job.location.toLowerCase().includes(loc)) return false;

      // Type match
      if (type !== "All job types" && jType !== type) return false;

      // Mode match
      if (mode !== "All work modes" && jMode !== mode) return false;

      // Category match
      if (category !== "All categories" && cat !== category) return false;

      // Saved only match
      if (savedOnly && !saved.includes(job.id)) return false;

      // Experience match
      if (experience !== "Any experience") {
        const r = parseExperience(job.experience);
        if (r) {
          if (experience === "Entry level" && r[0] > 1) return false;
          if (experience === "0–2 years" && !(r[0] <= 2 && r[1] >= 0)) return false;
          if (experience === "1–3 years" && !(r[0] <= 3 && r[1] >= 1)) return false;
          if (experience === "2–4 years" && !(r[0] <= 4 && r[1] >= 2)) return false;
          if (experience === "3–5 years" && !(r[0] <= 5 && r[1] >= 3)) return false;
          if (experience === "5+ years" && r[1] < 5 && r[0] < 5) return false;
        }
      }

      // Salary floor match
      if (floor > 0) {
        const monthly = parseMonthlySalary(job.salary);
        if (monthly > 0 && monthly < floor) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "salary-high") {
      result.sort((a, b) => parseMonthlySalary(b.salary) - parseMonthlySalary(a.salary));
    } else if (sortBy === "salary-low") {
      result.sort((a, b) => parseMonthlySalary(a.salary) - parseMonthlySalary(b.salary));
    } else if (sortBy === "company") {
      result.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      // most recent
      result.sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    }

    return result;
  }, [
    jobs,
    search,
    location,
    type,
    mode,
    category,
    experience,
    salaryFloor,
    sortBy,
    savedOnly,
    saved,
  ]);

  const activeFilters = [
    type !== "All job types",
    mode !== "All work modes",
    category !== "All categories",
    experience !== "Any experience",
    salaryFloor !== "0",
    Boolean(location.trim()),
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setType("All job types");
    setMode("All work modes");
    setCategory("All categories");
    setExperience("Any experience");
    setSalaryFloor("0");
    setSortBy("recent");
    setSavedOnly(false);
    setFiltersOpen(false);
  };

  const hasActiveCriteria = Boolean(
    search.trim() ||
      location.trim() ||
      activeFilters > 0 ||
      savedOnly ||
      sortBy !== "recent"
  );

  const visibleJobs = useMemo(
    () => filteredJobs.slice(0, visibleCount),
    [filteredJobs, visibleCount]
  );
  const hasMore = visibleCount < filteredJobs.length;

  // Reset paging when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    mainRef.current?.scrollTo({ top: 0 });
  }, [search, location, type, mode, category, experience, salaryFloor, sortBy, savedOnly]);

  // Infinite scroll sentinel
  useEffect(() => {
    const root = mainRef.current;
    const node = sentinelRef.current;
    if (!root || !node || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredJobs.length));
        }
      },
      { root, rootMargin: "0px 0px 400px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filteredJobs.length]);

  const copyEmailAddress = (email: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const [shareCopied, setShareCopied] = useState(false);

  const shareJob = (job: Job) => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: job.title,
          text: `${job.title} at ${job.company} on Zenoway`,
          url,
        })
        .catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const noSavedYet = savedOnly && saved.length === 0;

  return (
    <div className="min-h-full bg-surface-page text-text-primary lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          filtersOpen ? "flex" : "hidden"
        } flex-col gap-7 border-b border-border-default bg-surface-card p-5 lg:sticky lg:top-0 lg:flex lg:h-full lg:min-h-0 lg:self-stretch lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:p-6 lg:pb-8 [&>*]:shrink-0`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-text-primary">Filters</span>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
            className="rounded-control p-1.5 text-text-muted hover:bg-surface-subtle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Job views">
          <button
            type="button"
            onClick={() => {
              setSavedOnly(false);
              setFiltersOpen(false);
            }}
            className={navCls(!savedOnly)}
          >
            <BriefcaseBusiness className="h-4 w-4" /> All jobs{" "}
            <span className="ml-auto text-xs opacity-60">{jobs.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSavedOnly(true);
              setFiltersOpen(false);
            }}
            className={navCls(savedOnly)}
          >
            <Bookmark className="h-4 w-4" fill={savedOnly ? "currentColor" : "none"} /> Saved{" "}
            <span className="ml-auto text-xs opacity-60">{saved.length}</span>
          </button>
        </nav>

        <div className="space-y-6 border-t border-border-subtle pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Job type
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {types.map((t) => (
                <Chip
                  key={t}
                  active={type === t}
                  onClick={() => setType(type === t ? "All job types" : t)}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Work mode
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modes.map((m) => (
                <Chip
                  key={m}
                  active={mode === m}
                  onClick={() => setMode(mode === m ? "All work modes" : m)}
                >
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Department
            </p>
            <ul className="mt-2 space-y-0.5">
              {categories.map((c) => {
                const active = category === c;
                const count = categoryCounts[c] ?? 0;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => setCategory(active ? "All categories" : c)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-control px-2.5 py-1.5 text-sm transition-colors duration-normal ${
                        active
                          ? "bg-brand-soft font-semibold text-brand hover:bg-brand-soft-hover"
                          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                      }`}
                    >
                      {c}
                      <span
                        className={`text-xs ${
                          active ? "text-brand" : "text-text-muted"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Experience
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={`${selectCls} font-normal normal-case tracking-normal`}
            >
              {experiences.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Min. monthly salary
            <select
              value={salaryFloor}
              onChange={(e) => setSalaryFloor(e.target.value)}
              className={`${selectCls} font-normal normal-case tracking-normal`}
            >
              <option value="0">Any salary</option>
              <option value="15000">₹15,000+</option>
              <option value="25000">₹25,000+</option>
              <option value="40000">₹40,000+</option>
              <option value="60000">₹60,000+</option>
              <option value="100000">₹1,00,000+</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveCriteria}
          className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-muted disabled:text-text-muted"
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" />
          <span>Reset filters</span>
          {activeFilters > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-surface-muted px-1.5 text-[11px] font-semibold tabular-nums text-text-secondary">
              {activeFilters}
            </span>
          )}
        </button>
      </aside>

      {/* Main content */}
      <div
        ref={mainRef}
        className="min-w-0 bg-surface-base px-5 py-5 sm:px-8 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-10 lg:py-6"
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-baseline gap-2.5 text-2xl font-semibold tracking-[-0.04em] text-text-primary sm:text-[1.75rem]">
              Explore open roles
              {!loading && !error && (
                <span
                  className="rounded-full bg-brand-soft px-2.5 py-0.5 text-sm font-semibold tabular-nums tracking-normal text-brand-dark"
                  aria-live="polite"
                >
                  {filteredJobs.length}
                  <span className="sr-only"> matching roles</span>
                </span>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Roles that match your skills, your goals, and the way you want to work.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border px-3.5 text-sm font-medium transition-colors duration-200 lg:hidden ${
                filtersOpen
                  ? "border-brand bg-brand-soft text-brand-dark"
                  : "border-border-default text-text-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters{" "}
              {activeFilters > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-dark px-1 text-[11px] text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            <label className="inline-flex h-10 items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 text-sm text-text-muted">
              <ArrowDownUp className="h-4 w-4" />
              <select
                aria-label="Sort jobs"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer bg-transparent text-sm font-medium text-text-primary outline-none"
              >
                <option value="recent">Most recent</option>
                <option value="salary-high">Salary: high to low</option>
                <option value="salary-low">Salary: low to high</option>
                <option value="company">Company A–Z</option>
              </select>
            </label>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mt-5 grid grid-cols-1 rounded-control border border-border-default bg-surface-card transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-focus-ring sm:grid-cols-2">
          <label className="flex items-center gap-3 px-4 py-3.5">
            <Search className="h-[18px] w-[18px] shrink-0 text-brand" />
            <span className="sr-only">Search job title, skill or company</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skill or company"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <label className="flex items-center gap-3 border-t border-border-default px-4 py-3.5 sm:border-l sm:border-t-0">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-brand" />
            <span className="sr-only">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or remote"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            {location && (
              <button
                type="button"
                onClick={() => setLocation("")}
                aria-label="Clear location"
                className="cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Content State: Loading, Error, or Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex min-h-[190px] animate-pulse flex-col justify-between rounded-card border border-border-default bg-surface-card p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 rounded-control bg-surface-muted" />
                      <div className="h-3.5 w-16 rounded-control bg-surface-muted" />
                    </div>
                    <div className="mt-4 h-5 w-3/4 rounded-control bg-border-subtle" />
                    <div className="mt-2 h-4 w-1/3 rounded-control bg-surface-muted" />
                    <div className="mt-3 flex gap-1.5">
                      <div className="h-6 w-16 rounded-control bg-surface-muted" />
                      <div className="h-6 w-16 rounded-control bg-surface-muted" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-3">
                    <div className="h-4 w-28 rounded-control bg-surface-muted" />
                    <div className="h-4 w-4 rounded-control bg-surface-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-panel border border-dashed border-status-error/40 bg-surface-card px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-status-error-bg text-status-error">
                <WifiOff className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">
                Failed to load jobs
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Please check your connection or database setup and try again.
              </p>
              <button
                type="button"
                onClick={loadJobs}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-subtle transition-colors duration-200 hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-panel border border-dashed border-border-default bg-surface-card px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-surface-muted text-text-muted">
                {noSavedYet ? <Bookmark className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">
                {noSavedYet ? "No saved roles yet" : "No matching jobs found"}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {noSavedYet
                  ? "Tap the bookmark icon on any job card to save it here for later."
                  : "Try adjusting your search terms, removing filters, or widening the salary criteria."}
              </p>
              <button
                type="button"
                onClick={noSavedYet ? () => setSavedOnly(false) : clearFilters}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-surface-subtle hover:text-text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {noSavedYet ? "Browse all jobs" : "Reset search and filters"}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleJobs.map((job) => {
                  const isSaved = saved.includes(job.id);
                  const cat = getJobCategory(job);
                  const modeTag = getWorkMode(job);
                  const typeTag = getJobType(job);
                  const recent = isRecent(job.postedDate);

                  return (
                    <article
                      key={job.id}
                      onClick={() => setActiveJob(job)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setActiveJob(job);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${job.title} at ${job.company}`}
                      className="group flex min-h-[190px] cursor-pointer flex-col rounded-card border border-border-default bg-surface-card p-4 text-left shadow-subtle transition-[border-color,box-shadow] duration-300 ease-out hover:border-brand-accent/50 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 sm:p-5 motion-reduce:transition-none"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                          <BriefcaseBusiness className="h-3.5 w-3.5" />
                          {cat}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">
                            {timeAgo(job.postedDate)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaved(job.id);
                            }}
                            aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
                            aria-pressed={isSaved}
                            className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors duration-200 ${
                              isSaved
                                ? "bg-brand-soft text-brand-dark"
                                : "text-text-muted hover:bg-surface-subtle hover:text-brand"
                            }`}
                          >
                            <Bookmark
                              className="h-4 w-4"
                              fill={isSaved ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </div>

                      <h2 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.025em] text-text-primary">
                        <Link
                          href={`/jobs/${job.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="transition-colors hover:text-brand"
                        >
                          {job.title}
                        </Link>
                      </h2>

                      <p className="mt-1.5 text-sm font-medium text-text-secondary">
                        {job.company}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {[typeTag, modeTag, job.experience || "Fresher"].filter(Boolean).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-pill bg-surface-muted px-2.5 py-1.5 text-[11px] font-medium text-text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                        {recent && (
                          <span className="rounded-pill bg-brand-soft px-2.5 py-1.5 text-[11px] font-semibold text-brand-dark">
                            New
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tracking-tight text-text-primary">
                            {job.salary || "Not Disclosed"}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </p>
                        </div>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-text-muted transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                        />
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination / End indicator */}
              <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs text-text-muted">
                  Showing {visibleJobs.length} of {filteredJobs.length} roles
                </p>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredJobs.length))
                    }
                    className="cursor-pointer rounded-control border border-border-default bg-surface-card px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
                  >
                    Load more roles
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer info banner */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border-default pt-5 text-xs text-text-muted sm:flex-row">
          <span>Find your next career opportunity with Zenoway.</span>
          <span>Verified listings · Direct applications</span>
        </div>
      </div>

      {/* Quick Details & Apply Modal */}
      <Modal
        isOpen={Boolean(activeJob)}
        onClose={() => setActiveJob(null)}
        maxWidth="2xl"
        showCloseButton={false}
        className="p-0 border border-border-default shadow-modal overflow-hidden rounded-2xl"
        bodyClassName="overflow-hidden flex flex-col min-h-0 flex-1 bg-surface-card"
      >
        {activeJob && (
          <div className="flex flex-col min-h-0 flex-1 h-full">
            {/* Minimal Header */}
            <div className="relative shrink-0 border-b border-border-subtle bg-surface-card px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-brand">
                    {getJobCategory(activeJob)}
                  </span>
                  <span className="text-text-muted">
                    Posted {timeAgo(activeJob.postedDate)}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label="Close job details"
                  onClick={() => setActiveJob(null)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <h2
                id="job-modal-title"
                className="mt-2.5 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
              >
                {activeJob.title}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">{activeJob.company}</span>
                <span className="text-border-strong">·</span>
                <span>{activeJob.location}</span>
                {activeJob.companyLink && (
                  <>
                    <span className="text-border-strong">·</span>
                    <a
                      href={activeJob.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:underline"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-8 space-y-6">
              {/* Minimal Key Details Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border-default/70 bg-surface-subtle/50 p-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Salary</p>
                  <p className="mt-1 text-sm font-semibold text-brand truncate">
                    {activeJob.salary || "Not Disclosed"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Experience</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary truncate">
                    {activeJob.experience || "Fresher"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Location</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary truncate">
                    {activeJob.location}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Work Setup</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary truncate">
                    {getWorkMode(activeJob)} · {getJobType(activeJob)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  About the role
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary font-normal">
                  {activeJob.description}
                </div>
              </div>

              {/* Direct email contact if available */}
              {activeJob.mail && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-subtle/70 p-3.5 text-xs">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail className="h-4 w-4 text-brand shrink-0" />
                    <span>Direct application email: <strong className="font-semibold text-text-primary select-all">{activeJob.mail}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyEmailAddress(activeJob.mail)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-default bg-surface-card px-2.5 py-1.5 font-medium text-text-secondary shadow-subtle transition-all hover:bg-surface-subtle hover:text-text-primary active:scale-95"
                  >
                    {emailCopied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{emailCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pinned Sticky Footer Actions */}
            <div className="shrink-0 border-t border-border-default bg-surface-card px-6 py-4 sm:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSaved(activeJob.id)}
                    className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      saved.includes(activeJob.id)
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                    }`}
                  >
                    <Bookmark
                      className="h-4 w-4"
                      fill={saved.includes(activeJob.id) ? "currentColor" : "none"}
                    />
                    <span>{saved.includes(activeJob.id) ? "Saved" : "Save Job"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => shareJob(activeJob)}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-card px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-all"
                  >
                    {shareCopied ? <Check className="h-4 w-4 text-brand" /> : <Share2 className="h-4 w-4" />}
                    <span>{shareCopied ? "Link Copied" : "Share"}</span>
                  </button>

                  <Link
                    href={`/jobs/${activeJob.id}`}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-card px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-all"
                  >
                    <span>Full Page</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                  </Link>
                </div>

                {activeJob.mail?.trim() ? (
                  <a
                    href={`mailto:${activeJob.mail.trim()}?subject=${encodeURIComponent(
                      `Application for ${activeJob.title} - ${activeJob.company}`
                    )}&body=${encodeURIComponent(
                      `Hi Hiring Team,\n\nI am interested in applying for the ${activeJob.title} position at ${activeJob.company}.\n\nPlease find my resume attached.\n\nBest regards,`
                    )}`}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-subtle transition-all hover:bg-brand-hover active:scale-[0.99]"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Apply via Email</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-surface-muted px-6 py-2.5 text-sm font-semibold text-text-muted"
                  >
                    Application Unavailable
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-sm text-text-muted">Loading career opportunities...</p>
          </div>
        </div>
      }
    >
      <JobsViewContent />
    </Suspense>
  );
}