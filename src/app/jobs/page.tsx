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
  Mail,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  WifiOff,
  X,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import { parseExperience, timeAgo, isRecent } from "@/app/components/jobs/jobs-utils";

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

function getJobCategory(job: Job): string {
  const text = `${job.title} ${job.description || ""}`.toLowerCase();
  if (/design|ui|ux|product design|visual|motion|interaction|figma/i.test(text)) return "Design";
  if (/frontend|backend|engineer|developer|software|fullstack|devops|cloud|react|node|web/i.test(text)) return "Engineering";
  if (/product manager|product management|pm|scrum|owner/i.test(text)) return "Product";
  if (/data|analyst|analytics|science|sql|python|bi/i.test(text)) return "Data";
  if (/marketing|seo|growth|content|social media/i.test(text)) return "Marketing";
  if (/hr|recruit|human resources|talent|people/i.test(text)) return "Human Resources";
  if (/support|customer service|customer success|client/i.test(text)) return "Customer Support";
  if (/finance|accountant|accounts|audit|tax/i.test(text)) return "Finance";
  if (/sales|business development|sdr|account executive/i.test(text)) return "Sales";
  return "Engineering";
}

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
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
        active
          ? "border-emerald-900 bg-emerald-900 text-white hover:bg-emerald-800"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

const navCls = (active: boolean) =>
  `flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
    active
      ? "bg-emerald-50 text-emerald-900"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const selectCls =
  "mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-emerald-700";

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

  const mainRef = useRef<HTMLElement>(null);
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

  const noSavedYet = savedOnly && saved.length === 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 lg:grid lg:h-[calc(100dvh-68px)] lg:min-h-0 lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          filtersOpen ? "flex" : "hidden"
        } flex-col gap-7 border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:flex lg:h-full lg:min-h-0 lg:self-stretch lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:p-6 lg:pb-8 [&>*]:shrink-0`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-slate-900">Filters</span>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
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

        <div className="space-y-6 border-t border-slate-100 pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
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
                      className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors duration-200 ${
                        active
                          ? "bg-emerald-50 font-semibold text-emerald-900 hover:bg-emerald-100/70"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {c}
                      <span
                        className={`text-xs ${
                          active ? "text-emerald-800" : "text-slate-400"
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

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
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

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
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
          className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" />
          <span>Reset filters</span>
          {activeFilters > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold tabular-nums text-slate-600">
              {activeFilters}
            </span>
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        ref={mainRef}
        className="min-w-0 px-5 py-5 sm:px-8 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-10 lg:py-6"
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-baseline gap-2.5 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.75rem]">
              Explore open roles
              {!loading && !error && (
                <span
                  className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums tracking-normal text-emerald-900"
                  aria-live="polite"
                >
                  {filteredJobs.length}
                  <span className="sr-only"> matching roles</span>
                </span>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Roles that match your skills, your goals, and the way you want to work.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-200 lg:hidden ${
                filtersOpen
                  ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters{" "}
              {activeFilters > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-900 px-1 text-[11px] text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-500">
              <ArrowDownUp className="h-4 w-4" />
              <select
                aria-label="Sort jobs"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
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
        <div className="mt-5 grid grid-cols-1 rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-emerald-700 sm:grid-cols-2">
          <label className="flex items-center gap-3 px-4 py-3.5">
            <Search className="h-[18px] w-[18px] shrink-0 text-emerald-800" />
            <span className="sr-only">Search job title, skill or company</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skill or company"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <label className="flex items-center gap-3 border-t border-slate-200 px-4 py-3.5 sm:border-l sm:border-t-0">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-emerald-800" />
            <span className="sr-only">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or remote"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {location && (
              <button
                type="button"
                onClick={() => setLocation("")}
                aria-label="Clear location"
                className="cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
                  className="flex min-h-[190px] animate-pulse flex-col justify-between rounded-lg border border-slate-200 bg-white p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 rounded bg-slate-100" />
                      <div className="h-3.5 w-16 rounded bg-slate-100" />
                    </div>
                    <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
                    <div className="mt-3 flex gap-1.5">
                      <div className="h-6 w-16 rounded bg-slate-100" />
                      <div className="h-6 w-16 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="h-4 w-28 rounded bg-slate-100" />
                    <div className="h-4 w-4 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-red-200 bg-white px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-500">
                <WifiOff className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Failed to load jobs
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Please check your connection or database setup and try again.
              </p>
              <button
                type="button"
                onClick={loadJobs}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                {noSavedYet ? <Bookmark className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {noSavedYet ? "No saved roles yet" : "No matching jobs found"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {noSavedYet
                  ? "Tap the bookmark icon on any job card to save it here for later."
                  : "Try adjusting your search terms, removing filters, or widening the salary criteria."}
              </p>
              <button
                type="button"
                onClick={noSavedYet ? () => setSavedOnly(false) : clearFilters}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
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
                      className="group flex min-h-[190px] cursor-pointer flex-col rounded-lg border border-slate-200 bg-white p-4 text-left transition-[border-color,box-shadow] duration-500 ease-out hover:border-emerald-700/70 hover:shadow-[0_8px_24px_-12px_rgba(6,78,59,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:p-5 motion-reduce:transition-none"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                          <BriefcaseBusiness className="h-3.5 w-3.5" />
                          {cat}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
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
                                ? "bg-emerald-100 text-emerald-900"
                                : "text-slate-400 hover:bg-slate-100 hover:text-emerald-800"
                            }`}
                          >
                            <Bookmark
                              className="h-4 w-4"
                              fill={isSaved ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </div>

                      <h2 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.025em] text-slate-950">
                        <Link
                          href={`/jobs/${job.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="transition-colors hover:text-emerald-900"
                        >
                          {job.title}
                        </Link>
                      </h2>

                      <p className="mt-1.5 text-sm font-medium text-slate-500">
                        {job.company}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {[typeTag, modeTag, job.experience || "Fresher"].filter(Boolean).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-[#f3f6f4] px-2.5 py-1.5 text-[11px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {recent && (
                          <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800">
                            New
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tracking-tight text-slate-900">
                            {job.salary || "Not Disclosed"}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </p>
                        </div>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-slate-400 transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-900 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                        />
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination / End indicator */}
              <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs text-slate-400">
                  Showing {visibleJobs.length} of {filteredJobs.length} roles
                </p>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredJobs.length))
                    }
                    className="cursor-pointer rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    Load more roles
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer info banner */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
          <span>Find your next career opportunity with Zenoway.</span>
          <span>Verified listings · Direct applications</span>
        </div>
      </main>

      {/* Quick Details & Apply Modal */}
      {activeJob && (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveJob(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-[#064e3b] px-6 pb-6 pt-7 text-white sm:px-8">
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-20 h-48 w-48 rounded-full border border-white/10"
              />
              <button
                type="button"
                aria-label="Close job details"
                onClick={() => setActiveJob(null)}
                className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-white/15 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                {getJobCategory(activeJob)}
              </p>
              <h2
                id="job-modal-title"
                className="mt-3 pr-8 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {activeJob.title}
              </h2>
              <p className="mt-2 text-sm text-emerald-50/80">{activeJob.company}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-50/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {activeJob.location}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {getWorkMode(activeJob)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {getJobType(activeJob)}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-medium text-emerald-800">Compensation</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {activeJob.salary || "Not Disclosed"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  {activeJob.experience || "Fresher"} · Posted {timeAgo(activeJob.postedDate)}
                </p>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900">About the role</h3>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {activeJob.description}
                </div>
              </div>

              {/* Company Link if available */}
              {activeJob.companyLink && (
                <div className="mt-4">
                  <a
                    href={activeJob.companyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 transition hover:text-emerald-950"
                  >
                    <span>Visit company website</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Application Options & Actions */}
              <div className="mt-7 space-y-3 border-t border-slate-100 pt-5">
                {/* Email Apply if configured */}
                {activeJob.mail && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-4 w-4 text-emerald-800" />
                      <span className="font-medium break-all">{activeJob.mail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyEmailAddress(activeJob.mail)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {emailCopied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                        {emailCopied ? "Copied" : "Copy"}
                      </button>
                      <a
                        href={`mailto:${activeJob.mail}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-900 px-2.5 py-1.5 font-medium text-white hover:bg-emerald-800"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSaved(activeJob.id)}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Bookmark
                        className="h-4 w-4"
                        fill={saved.includes(activeJob.id) ? "currentColor" : "none"}
                      />
                      {saved.includes(activeJob.id) ? "Saved job" : "Save job"}
                    </button>
                    <Link
                      href={`/jobs/${activeJob.id}`}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span>Full page</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>

                  {activeJob.mail?.trim() ? (
                    <a
                      href={`mailto:${activeJob.mail.trim()}?subject=${encodeURIComponent(
                        `Application for ${activeJob.title} - ${activeJob.company}`
                      )}&body=${encodeURIComponent(
                        `Hi Hiring Team,\n\nI am interested in applying for the ${activeJob.title} position at ${activeJob.company}.\n\nPlease find my resume attached.\n\nBest regards,`
                      )}`}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-950"
                    >
                      Apply via email <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-400"
                    >
                      Application unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-900 border-t-transparent" />
            <p className="text-sm text-slate-500">Loading career opportunities...</p>
          </div>
        </div>
      }
    >
      <JobsViewContent />
    </Suspense>
  );
}