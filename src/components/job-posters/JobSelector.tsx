"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { Job } from "@/app/types/job";
import { formatOptionalLocation } from "@/lib/job-posters/poster-utils";

interface JobSelectorProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelect: (job: Job) => void;
  disabled?: boolean;
}

export function JobSelector({
  jobs,
  selectedJob,
  onSelect,
  disabled = false,
}: JobSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) => {
      const locationText = formatOptionalLocation(job) || "";
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.id.toLowerCase().includes(q) ||
        locationText.toLowerCase().includes(q)
      );
    });
  }, [jobs, query]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleSelect = (job: Job) => {
    onSelect(job);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveIndex(0);
        setOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        filteredJobs.length === 0 ? 0 : (prev + 1) % filteredJobs.length
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        filteredJobs.length === 0
          ? 0
          : (prev - 1 + filteredJobs.length) % filteredJobs.length
      );
      return;
    }

    if (e.key === "Enter" && filteredJobs[activeIndex]) {
      e.preventDefault();
      handleSelect(filteredJobs[activeIndex]);
    }
  };

  const selectedLocation = selectedJob
    ? formatOptionalLocation(selectedJob)
    : null;

  return (
    <div ref={wrapperRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        id="poster-job-selector"
        disabled={disabled || jobs.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setActiveIndex(0);
          setOpen((prev) => !prev);
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-control border border-border-default bg-surface-card px-3.5 py-2.5 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="min-w-0 flex-1">
          {selectedJob ? (
            <>
              <div className="truncate text-sm font-semibold text-text-primary">
                {selectedJob.title}
              </div>
              <div className="mt-0.5 truncate text-xs text-text-secondary">
                {selectedJob.company}
                {selectedLocation ? ` · ${selectedLocation}` : ""}
              </div>
            </>
          ) : (
            <div className="py-1 text-sm text-text-muted">
              {jobs.length === 0
                ? "No active jobs available"
                : "Select a job listing..."}
            </div>
          )}
        </div>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={`shrink-0 text-text-muted transition-transform duration-150 ${
            open ? "rotate-180 text-brand" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-dropdown">
          {/* Search Bar */}
          <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
            <Search size={14} className="shrink-0 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search title, company, or ID..."
              aria-label="Search jobs"
              className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveIndex(0);
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="rounded-control p-0.5 text-text-muted hover:bg-surface-subtle hover:text-text-primary"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <ul
            role="listbox"
            aria-label="Available job listings"
            className="max-h-64 overflow-y-auto divide-y divide-border-subtle/70 py-1"
          >
            {filteredJobs.length === 0 ? (
              <li className="px-3.5 py-6 text-center text-xs text-text-muted">
                No jobs match &ldquo;{query.trim()}&rdquo;
              </li>
            ) : (
              filteredJobs.map((job, idx) => {
                const isSelected = selectedJob?.id === job.id;
                const isHighlighted = idx === activeIndex;
                const loc = formatOptionalLocation(job);

                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(job)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-brand-soft/80"
                          : isHighlighted
                            ? "bg-surface-subtle"
                            : "hover:bg-surface-subtle"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate text-xs font-semibold ${
                              isSelected ? "text-brand" : "text-text-primary"
                            }`}
                          >
                            {job.title}
                          </span>
                          <span className="shrink-0 text-[10px] font-medium text-text-muted">
                            {job.id}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-text-secondary">
                          {job.company}
                          {loc ? ` · ${loc}` : ""}
                        </div>
                      </div>

                      {isSelected && (
                        <Check
                          size={14}
                          strokeWidth={2.2}
                          className="shrink-0 text-brand"
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

