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
      <div className="py-12 text-center text-sm text-gray-500">
        No jobs available.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {job.title}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {job.company}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
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
            className="inline-flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-[#087F50] transition-colors hover:text-[#065F3D]"
          >
            Edit job
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ))}
    </div>
  );
}