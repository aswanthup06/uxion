"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Schibsted_Grotesk } from "next/font/google";
import type { Job } from "@/app/types/job";
import { JobGridCard, JobGridSkeleton } from "@/app/components/jobs/JobGridCard";
import { FilterPanel } from "@/app/components/jobs/FilterPanel";
import { ActiveFilters, SortSelect } from "@/app/components/jobs/JobsToolbar";
import { MobileFilterSheet } from "@/app/components/jobs/MobileFilterSheet";
import { EmptyState, ErrorState } from "@/app/components/jobs/JobStates";
import {
  EMPTY_FILTERS,
  EXP_MAX,
  applyFilters,
  countActive,
  parseExperience,
  type Filters,
  type Sort,
} from "@/app/components/jobs/jobs-utils";

const font = Schibsted_Grotesk({ subsets: ["latin"], display: "swap" });

const PAGE_SIZE = 12; // divisible by 1, 2 and 3 columns so the grid never ends on a ragged row
const GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3";

export default function JobsPage() {
  const mainRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<Sort>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);

  /* ---- fetch ---- */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error(String(res.status));
      setJobs(await res.json());
    } catch (e) {
      console.error("Error fetching jobs:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = useCallback((p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p })), []);
  const clearAll = useCallback(() => setFilters(EMPTY_FILTERS), []);

  /* ---- derived data ---- */
  const titles = useMemo(() => [...new Set(jobs.map((j) => j.title))].sort(), [jobs]);

  // Location counts reflect every other active filter, so numbers match what you'll see.
  const locationOptions = useMemo(() => {
    const counts = new Map<string, number>();
    applyFilters(jobs, filters, "locations").forEach((j) => counts.set(j.location, (counts.get(j.location) ?? 0) + 1));
    filters.locations.forEach((l) => counts.has(l) || counts.set(l, 0));
    return [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [jobs, filters]);

  // Jobs per year of experience, ignoring the experience filter itself.
  const histogram = useMemo(() => {
    const bins: number[] = new Array(EXP_MAX + 1).fill(0);
    applyFilters(jobs, filters, "experience").forEach((j) => {
      const r = parseExperience(j.experience);
      if (!r) return;
      for (let y = r[0]; y <= Math.min(r[1], EXP_MAX); y++) bins[y]++;
    });
    return bins;
  }, [jobs, filters]);

  const filtered = useMemo(() => {
    const dir = sort === "newest" ? -1 : 1;
    return [...applyFilters(jobs, filters)].sort(
      (a, b) => dir * (new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()),
    );
  }, [jobs, filters, sort]);

  const activeCount = countActive(filters);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  /* ---- reset paging when the result set changes ---- */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    mainRef.current?.scrollTo({ top: 0 });
  }, [filters, sort]);

  /* ---- infinite scroll inside the results column ---- */
  useEffect(() => {
    const root = mainRef.current;
    const node = sentinelRef.current;
    if (!root || !node || !hasMore) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
      },
      { root, rootMargin: "0px 0px 400px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, visibleCount, filtered.length]);

  const panel = (onClose?: () => void) => (
    <FilterPanel
      filters={filters}
      onChange={patch}
      titles={titles}
      locations={locationOptions}
      histogram={histogram}
      activeCount={activeCount}
      onClear={clearAll}
      onClose={onClose}
    />
  );

  return (
    <div className={`${font.className} flex h-full w-full bg-[#F7F8F6] text-[#111815]`}>
      {/* Desktop sidebar */}
      <aside
        aria-label="Job filters"
        className="hidden w-72 shrink-0 overflow-y-auto border-r border-[#E8ECE8] bg-white lg:block"
      >
        {panel()}
      </aside>

      {/* Results */}
      <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-[#F7F8F6]/85 px-4 py-5 backdrop-blur-md md:px-8">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
              {!loading && !error && (
                <p className="mt-0.5 text-sm text-[#66726B]" aria-live="polite">
                  <span className="font-semibold tabular-nums text-[#111815]">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "role" : "roles"}
                  {activeCount > 0 ? " match your filters" : " open now"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#DDE3DE] bg-white px-4 py-2 text-sm font-medium hover:border-[#C5CEC7] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filters
                {activeCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#0FA968] px-1.5 text-[11px] font-semibold text-white">
                    {activeCount}
                  </span>
                )}
              </button>
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-2 md:px-8">
          {activeCount > 0 && !loading && !error && (
            <div className="mb-5">
              <ActiveFilters filters={filters} onChange={patch} onClear={clearAll} />
            </div>
          )}

          {loading ? (
            <div className={GRID}>
              {Array.from({ length: 6 }).map((_, i) => (
                <JobGridSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState onRetry={load} />
          ) : filtered.length === 0 ? (
            <EmptyState onClear={clearAll} canClear={activeCount > 0} />
          ) : (
            <>
              <div className={GRID}>
                {visible.map((job) => (
                  <JobGridCard key={job.id} job={job} />
                ))}
              </div>

              <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs text-[#7A867F]">
                  Showing {visible.length} of {filtered.length}
                </p>
                {hasMore ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))}
                    className="rounded-full border border-[#DDE3DE] bg-white px-6 py-2.5 text-sm font-medium hover:border-[#C5CEC7]"
                  >
                    Load more
                  </button>
                ) : (
                  <p className="text-sm text-[#7A867F]">You’ve reached the end of the list.</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <MobileFilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} resultCount={filtered.length}>
        {panel(() => setSheetOpen(false))}
      </MobileFilterSheet>
    </div>
  );
}