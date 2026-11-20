"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Globe,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Unlock,
  WifiOff,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import { useAuth } from "@/context/AuthContext";
import { getJobCategory, parseExperience } from "@/app/components/jobs/jobs-utils";
import {
  CANONICAL_CITIES,
  INDIAN_STATES,
  jobMatchesLocation,
} from "@/lib/supabase/locations-data";
import {
  categories,
  getJobType,
  getWorkMode,
  PAGE_SIZE,
  parseMonthlySalary,
  POPULAR_LOCATIONS,
} from "./comp/jobs-client-utils";
import { JobDetailModal } from "./comp/JobDetailModal";
import { JobCardItem } from "./comp/JobCardItem";
import { JobFilterSidebar } from "./comp/JobFilterSidebar";
import { JobLocationBar } from "./comp/JobLocationBar";


function JobsViewContent({
  initialJobs,
  initialCategory,
}: {
  initialJobs?: Job[];
  initialCategory?: string;
}) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams ? searchParams.get("category") : null;
  const effectiveInitialCategory = initialCategory || urlCategory || undefined;

  const [jobs, setJobs] = useState<Job[]>(initialJobs && initialJobs.length > 0 ? initialJobs : []);
  const [loading, setLoading] = useState(initialJobs && initialJobs.length > 0 ? false : true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<string>("All job types");
  const [mode, setMode] = useState<string>("All work modes");
  const [category, setCategory] = useState<string>(
    effectiveInitialCategory
      ? categories.find((c) => c.toLowerCase().includes(effectiveInitialCategory.toLowerCase())) || "All categories"
      : "All categories"
  );
  const [experience, setExperience] = useState<string>("Any experience");
  const [salaryFloor, setSalaryFloor] = useState<string>("0");

  const { user } = useAuth();
  const [unlockedJobIds, setUnlockedJobIds] = useState<string[]>([]);
  const [unlockedOnly, setUnlockedOnly] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnlockedJobIds([]);
      return;
    }
    fetch("/api/jobs/unlocked")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.unlockedJobIds)) {
          setUnlockedJobIds(data.unlockedJobIds);
        }
      })
      .catch(() => {});
  }, [user]);

  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const mainRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sync category if URL search param changes during render
  const [prevUrlCategory, setPrevUrlCategory] = useState(urlCategory);
  if (urlCategory !== prevUrlCategory) {
    setPrevUrlCategory(urlCategory);
    if (urlCategory) {
      const match = categories.find((c) => c.toLowerCase().includes(urlCategory.toLowerCase()));
      if (match) {
        setCategory(match);
      }
    }
  }

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
  }, []);

  useEffect(() => {
    if (initialJobs && initialJobs.length > 0) return;
    let ignore = false;
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error(String(res.status));
        const data: Job[] = await res.json();
        if (!ignore) setJobs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching jobs:", e);
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchJobs();
    return () => {
      ignore = true;
    };
  }, [initialJobs]);

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

  // Derived work mode counts
  const modeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Remote: 0,
      Hybrid: 0,
      "On-site": 0,
    };
    for (const j of jobs) {
      const m = getWorkMode(j);
      if (counts[m] !== undefined) counts[m]++;
    }
    return counts;
  }, [jobs]);

  // Locations with live job counts
  const availableLocations = useMemo(() => {
    const locMap = new Map<string, { name: string; state?: string }>();

    locMap.set("pan-india", { name: "Pan-India" });

    for (const loc of POPULAR_LOCATIONS) {
      locMap.set(loc.toLowerCase(), { name: loc });
    }

    for (const city of CANONICAL_CITIES) {
      if (!locMap.has(city.name.toLowerCase())) {
        locMap.set(city.name.toLowerCase(), {
          name: city.name,
          state: city.state,
        });
      }
    }

    for (const state of INDIAN_STATES) {
      if (!locMap.has(state.name.toLowerCase())) {
        locMap.set(state.name.toLowerCase(), {
          name: state.name,
        });
      }
    }

    for (const job of jobs) {
      if (
        job.primaryCity &&
        job.primaryCity.toLowerCase() !== "remote" &&
        !locMap.has(job.primaryCity.toLowerCase())
      ) {
        locMap.set(job.primaryCity.toLowerCase(), {
          name: job.primaryCity,
        });
      }
      if (Array.isArray(job.physicalLocations)) {
        for (const pl of job.physicalLocations) {
          if (
            pl.city &&
            pl.city.toLowerCase() !== "remote" &&
            !locMap.has(pl.city.toLowerCase())
          ) {
            locMap.set(pl.city.toLowerCase(), {
              name: pl.city,
            });
          }
        }
      }
    }

    return Array.from(locMap.values()).map((item) => {
      let count = 0;
      for (const j of jobs) {
        if (jobMatchesLocation(j, item.name)) {
          count++;
        }
      }
      return {
        ...item,
        count,
      };
    });
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

      if (q && !searchable.includes(q) && !jobMatchesLocation(job, q)) return false;
      if (loc && !jobMatchesLocation(job, loc)) return false;
      if (type !== "All job types" && jType !== type) return false;
      if (mode !== "All work modes" && jMode !== mode) return false;
      if (category !== "All categories" && cat !== category) return false;
      if (unlockedOnly && !unlockedJobIds.includes(job.id)) return false;

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

      if (floor > 0) {
        const monthly = parseMonthlySalary(job.salary);
        if (monthly > 0 && monthly < floor) return false;
      }

      return true;
    });

    result.sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

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
    unlockedOnly,
    unlockedJobIds,
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
    setUnlockedOnly(false);
    setFiltersOpen(false);
  };

  const hasActiveCriteria = Boolean(
    search.trim() ||
    location.trim() ||
    activeFilters > 0 ||
    unlockedOnly
  );

  const visibleJobs = useMemo(
    () => filteredJobs.slice(0, visibleCount),
    [filteredJobs, visibleCount]
  );
  const hasMore = visibleCount < filteredJobs.length;

  // Reset paging when filters change
  const filterKey = `${search}|${location}|${type}|${mode}|${category}|${experience}|${salaryFloor}|${unlockedOnly}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    if (mainRef.current && window.innerWidth >= 1024) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filterKey]);

  // Infinite scroll sentinel
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const root = isDesktop ? mainRef.current : null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredJobs.length));
        }
      },
      { root, rootMargin: isDesktop ? "0px 0px 400px 0px" : "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filteredJobs.length]);

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

  const noUnlockedYet = unlockedOnly && unlockedJobIds.length === 0;

  return (
    <div className="min-h-full bg-surface-page text-text-primary lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Extracted Modular Sidebar */}
      <JobFilterSidebar
        filtersOpen={filtersOpen}
        onCloseFilters={() => setFiltersOpen(false)}
        unlockedOnly={unlockedOnly}
        setUnlockedOnly={setUnlockedOnly}
        totalJobsCount={jobs.length}
        unlockedCount={unlockedJobIds.length}
        type={type}
        setType={setType}
        category={category}
        setCategory={setCategory}
        categoryCounts={categoryCounts}
        experience={experience}
        setExperience={setExperience}
        salaryFloor={salaryFloor}
        setSalaryFloor={setSalaryFloor}
        hasActiveCriteria={hasActiveCriteria}
        activeFilters={activeFilters}
        clearFilters={clearFilters}
      />

      {/* Main content */}
      <div
        ref={mainRef}
        className="min-w-0 bg-surface-base px-5 py-5 sm:px-8 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-10 lg:py-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-text-primary sm:text-[1.75rem]">
              Explore open roles
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Roles that match your skills, your goals, and the way you want to work.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border px-3 text-xs font-medium transition-colors duration-200 lg:hidden ${
              filtersOpen
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-border-default text-text-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Filters</span>
            {activeFilters > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-pill bg-brand-dark px-1 text-3xs text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </header>

        {/* Work Mode Switcher & Sort Toolbar */}
        <div className="mt-5 flex min-w-0 max-w-full flex-wrap items-center justify-between gap-3">
          <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain no-scrollbar sm:w-auto">
            <div className="inline-flex min-w-max items-center gap-1 rounded-control border border-border-default bg-surface-card p-1 shadow-xs">
              {[
                { id: "All work modes", label: "All", count: jobs.length },
                { id: "Remote", label: "Remote", icon: Globe, count: modeCounts["Remote"] },
                { id: "Hybrid", label: "Hybrid", icon: Building2, count: modeCounts["Hybrid"] },
                { id: "On-site", label: "On-site", icon: MapPin, count: modeCounts["On-site"] },
              ].map(({ id, label, icon: Icon, count }) => {
                const isActive = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={`inline-flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-control px-3 py-1.5 text-xs transition-all duration-150 ${
                      isActive
                        ? "bg-brand text-text-inverse font-semibold shadow-subtle"
                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary font-medium"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-text-inverse" : "text-text-muted"
                        }`}
                        strokeWidth={1.8}
                      />
                    )}
                    <span>{label}</span>
                    <span
                      className={`text-xs tabular-nums ${
                        isActive ? "text-text-inverse/80" : "text-text-muted"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Extracted Search Bar & Location Autocomplete */}
        <JobLocationBar
          search={search}
          setSearch={setSearch}
          location={location}
          setLocation={setLocation}
          availableLocations={availableLocations}
        />

        {/* Content State: Loading, Error, or Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse flex-col justify-between rounded-card border border-border-default bg-surface-card p-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-5 w-3/5 rounded-control bg-surface-muted" />
                      <div className="h-4 w-4 shrink-0 rounded-control bg-surface-subtle" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-3.5 w-24 rounded-control bg-surface-subtle" />
                      <div className="h-1 w-1 rounded-full bg-border-strong" />
                      <div className="h-3.5 w-16 rounded-control bg-surface-subtle" />
                      <div className="h-1 w-1 rounded-full bg-border-strong" />
                      <div className="h-3.5 w-12 rounded-control bg-surface-subtle" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-3.5 w-14 rounded-control bg-surface-subtle" />
                      <div className="h-1 w-1 rounded-full bg-border-strong" />
                      <div className="h-3.5 w-20 rounded-control bg-surface-subtle" />
                      <div className="h-1 w-1 rounded-full bg-border-strong" />
                      <div className="h-3.5 w-16 rounded-control bg-surface-subtle" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 pt-1">
                    <div className="h-4 w-28 rounded-control bg-surface-muted" />
                    <div className="h-3.5 w-24 rounded-control bg-surface-subtle" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-panel border border-dashed border-status-error/40 bg-surface-card px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-status-error-bg text-status-error">
                <WifiOff className="h-5 w-5" strokeWidth={1.75} />
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
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} /> Try again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-panel border border-dashed border-border-default bg-surface-card px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-surface-muted text-text-muted">
                {noUnlockedYet ? <Unlock className="h-5 w-5" strokeWidth={1.75} /> : <Search className="h-5 w-5" strokeWidth={1.75} />}
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">
                {noUnlockedYet ? "No unlocked roles yet" : "No matching jobs found"}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {noUnlockedYet
                  ? "Roles whose recruitment emails you've unlocked for ₹5 will appear here."
                  : "Try adjusting your search terms, removing filters, or widening the salary criteria."}
              </p>
              <button
                type="button"
                onClick={noUnlockedYet ? () => setUnlockedOnly(false) : clearFilters}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-surface-subtle hover:text-text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                {noUnlockedYet ? "Browse all jobs" : "Reset search and filters"}
              </button>
            </div>
          ) : (
            <>
              {/* Extracted Modular Job Card Item */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleJobs.map((job) => (
                  <JobCardItem
                    key={job.id}
                    job={job}
                    isUnlocked={unlockedJobIds.includes(job.id)}
                    onSelect={(selected) => setActiveJob(selected)}
                  />
                ))}
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

      {/* Extracted Modular Quick Details Modal */}
      <JobDetailModal
        activeJob={activeJob}
        onClose={() => setActiveJob(null)}
        isUnlocked={Boolean(activeJob && unlockedJobIds.includes(activeJob.id))}
        onShare={shareJob}
        shareCopied={shareCopied}
      />
    </div>
  );
}

export default function JobsClient({
  initialJobs,
  initialCategory,
}: {
  initialJobs?: Job[];
  initialCategory?: string;
}) {
  return (
    <Suspense fallback={null}>
      <JobsViewContent
        initialJobs={initialJobs}
        initialCategory={initialCategory}
      />
    </Suspense>
  );
}
