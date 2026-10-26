"use client";

import Link from "next/link";
import { Job } from "@/app/types/job";
import { ArrowUpRight, MapPin } from "lucide-react";

interface JobListProps {
  jobs: Job[];
}

function formatDate(dateString: string) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-text-muted">
        No jobs available.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-subtle">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {job.title}
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              {job.company}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />
                {job.location || "Location not specified"}
              </span>

              <span>{job.experience || "Experience not specified"}</span>

              <span>Posted {formatDate(job.postedDate)}</span>
            </div>
          </div>

          <Link
            href={`/admin/jobs/${job.id}`}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            Edit job
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ))}
    </div>
  );
}