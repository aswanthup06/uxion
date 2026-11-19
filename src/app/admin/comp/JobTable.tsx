
"use client";

import { useMemo, useState } from "react";
import { Job } from "../../types/job";
import JobRow from "./JobRow";
import JobEmptyState from "./JobEmptyState";
import { Button } from "@/app/components/Button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

type Props = {
  jobs: Job[];
  onDelete: (id: string) => void;
  onViewPoster?: (job: Job) => void;
};

const PAGE_SIZE = 20;

export default function JobTable({ jobs, onDelete, onViewPoster }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        if (!query) return true;

        return [
          job.title,
          job.company,
          job.location,
          job.experience,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.postedDate || 0).getTime();
        const dateB = new Date(b.postedDate || 0).getTime();

        return (
          (Number.isNaN(dateB) ? 0 : dateB) -
          (Number.isNaN(dateA) ? 0 : dateA)
        );
      });
  }, [jobs, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / PAGE_SIZE)
  );

  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
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
  const visibleJobs = filteredJobs.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  if (jobs.length === 0) {
    return <JobEmptyState />;
  }

  return (
    <section className="overflow-hidden rounded-card border border-border-subtle bg-white shadow-2xs">
      {/* Search and result count */}
      <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs, companies, locations..."
            aria-label="Search jobs"
            className="h-9 w-full rounded-control border border-border-default bg-white pl-9 pr-9 text-xs text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-control p-1 text-text-muted hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <p className="text-xs text-text-muted">
          Showing <span className="font-semibold text-text-primary">{filteredJobs.length}</span> {filteredJobs.length === 1 ? "job" : "jobs"}
        </p>
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-semibold text-text-primary">
            No matching jobs
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Try another title, company, or location keyword.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-xs font-semibold text-brand hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-subtle/50 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  {["Job", "Company", "Location", "Views", "Copy Clicks", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-2xs font-semibold uppercase tracking-wider text-text-muted ${
                          heading === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {visibleJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDelete={onDelete}
                    onViewPoster={onViewPoster}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                leftIcon={<ChevronLeft size={15} />}
              >
                Previous
              </Button>

              <span className="min-w-16 text-center text-sm tabular-nums text-text-secondary">
                {page} / {totalPages}
              </span>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                rightIcon={<ChevronRight size={15} />}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
