import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Job } from "../types/job";
import { formatLocationLabel, normalizeWorkMode } from "@/lib/supabase/locations-data";

interface JobCardProps {
  job: Job;
}

// ✅ Helper: format "time ago"
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
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

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="relative overflow-hidden rounded-card border border-border-subtle hover:border-brand-accent/50 hover:shadow-card-hover transition-all duration-normal ease-standard bg-surface-card flex flex-col justify-between"
    >
      <div className="flex justify-between pt-4 px-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{job.title}</h2>

          <h3 className="text-xs font-medium text-brand md:text-sm">
            {job.company}
          </h3>
        </div>

        <div className="flex flex-col items-end text-xs text-text-muted">
          <span className="font-normal">{timeAgo(job.postedDate)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 pt-2 text-xs text-text-secondary">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
        <span className="truncate">{locationText}</span>
      </div>

      <div className="grid grid-cols-3 text-xs border-t border-border-subtle text-text-secondary">
        <div className="flex justify-center items-center gap-2 pl-4 py-4 border-r border-border-subtle min-w-0">
          <span className="truncate">{job.experience}</span>
        </div>

        <div className="flex justify-center items-center gap-2 py-4 min-w-0 border-r border-border-subtle">
          <span className="truncate">Full-Time</span>
        </div>

        <div className="flex justify-center items-center gap-2 py-4 min-w-0">
          <span className="truncate">{workMode}</span>
        </div>
      </div>
    </Link>
  );
}
