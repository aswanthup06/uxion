
"use client";

import { useEffect, useMemo, useState } from "react";
import { Job } from "../../types/job";
import JobRow from "./JobRow";
import JobEmptyState from "./JobEmptyState";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

type Props = {
  jobs: Job[];
  onDelete: (id: string) => void;
};

const PAGE_SIZE = 20;

export default function JobTable({ jobs, onDelete }: Props) {
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

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleJobs = filteredJobs.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  if (jobs.length === 0) {
    return <JobEmptyState />;
  }

  return (
    <section className="overflow-hidden rounded-panel border border-gray-200 bg-white">
      {/* Search and result count */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs, companies, locations..."
            aria-label="Search jobs"
            className="h-10 w-full rounded-control border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-control p-1 text-gray-400 hover:text-gray-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">
            {filteredJobs.length}
          </span>{" "}
          {filteredJobs.length === 1 ? "job" : "jobs"}
        </p>
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">
            No matching jobs
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Try another title, company, or location.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-sm font-medium text-[#087F50] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {["Job", "Company", "Location", "Views", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 ${
                          heading === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {visibleJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-800">
                {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredJobs.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-800">
                {filteredJobs.length}
              </span>{" "}
              jobs
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-control border border-gray-200 px-3 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="min-w-16 text-center text-sm tabular-nums text-gray-600">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-control border border-gray-200 px-3 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
