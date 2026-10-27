import Link from "next/link";
import { MapPin } from "lucide-react";
import { Job } from "../types/job";
import { formatLocationLabel, normalizeWorkMode } from "@/lib/supabase/locations-data";

interface JobCardProps {
  job: Job;
}

function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  const shortLabels: { [key: string]: string } = {
    year: "y",
    month: "mo",
    week: "w",
    day: "d",
    hour: "h",
    minute: "m",
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count}${shortLabels[unit]} ago`;
    }
  }

  return "Just now";
}

export default function JobCard({ job }: JobCardProps) {
  const workMode = normalizeWorkMode(job.workMode, job.location);
  const locationText = formatLocationLabel(job);
  const cleanLocation = locationText.replace(/^(Remote|Hybrid)\s*[·-]\s*/i, "");

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group relative flex cursor-pointer flex-col justify-between rounded-card border border-border-default bg-surface-card p-5 text-left transition-all duration-200 hover:border-brand-accent/50 hover:shadow-card-hover"
    >
      <div>
        {/* Title */}
        <h2 className="line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.015em] text-text-primary transition-colors group-hover:text-brand">
          {job.title}
        </h2>

        {/* Company · Time */}
        <p className="mt-1 flex flex-wrap items-center text-sm font-medium text-text-secondary">
          <span className="text-text-primary">{job.company}</span>
          {timeAgo(job.postedDate) && (
            <>
              <span className="mx-1.5 text-border-strong select-none">·</span>
              <span className="text-xs text-text-muted font-normal">{timeAgo(job.postedDate)}</span>
            </>
          )}
        </p>

        {/* Specs: Work Mode · Experience */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-text-secondary">
          <span className="font-semibold text-brand">{workMode}</span>
          {job.experience?.trim() && (
            <>
              <span className="text-border-strong select-none">·</span>
              <span>{job.experience.trim()}</span>
            </>
          )}
          <span className="text-border-strong select-none">·</span>
          <span className="text-text-muted">Full-time</span>
        </div>
      </div>

      {/* Bottom Row: Salary on left, Location on right */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-1 text-xs">
        <span className="font-semibold text-text-primary text-[13.5px] tracking-tight">
          {job.salary || "Not Disclosed"}
        </span>

        <span className="flex items-center gap-1 text-text-muted truncate max-w-[55%]" title={cleanLocation}>
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={1.75} />
          <span className="truncate font-medium text-text-secondary">{cleanLocation}</span>
        </span>
      </div>
    </Link>
  );
}
