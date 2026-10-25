import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import type { Job } from "@/app/types/job";
import { isRecent, timeAgo } from "./jobs-utils";

export function JobGridCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex min-h-[10.5rem] flex-col justify-between rounded-panel border border-border-subtle bg-surface-card p-5 outline-none transition-all duration-normal hover:-translate-y-0.5 hover:border-brand-accent/50 hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-brand-accent/50"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{timeAgo(job.postedDate)}</span>
          {isRecent(job.postedDate) && (
            <span className="flex items-center gap-1.5 font-medium text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden />
              New
            </span>
          )}
        </div>
        <h2 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-brand">
          {job.title}
        </h2>
        <p className="mt-1 truncate text-sm text-text-secondary">{job.company}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1 text-xs font-medium text-text-secondary">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
          <span className="truncate">{job.location}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1 text-xs font-medium text-text-secondary">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
          {job.experience}
        </span>
      </div>
    </Link>
  );
}

export function JobGridSkeleton() {
  return (
    <div className="flex min-h-[10.5rem] animate-pulse flex-col justify-between rounded-panel border border-border-subtle bg-surface-card p-5">
      <div>
        <div className="h-3 w-16 rounded-control bg-surface-muted" />
        <div className="mt-4 h-5 w-3/4 rounded-control bg-border-subtle" />
        <div className="mt-2 h-4 w-1/3 rounded-control bg-surface-muted" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-24 rounded-pill bg-surface-muted" />
        <div className="h-6 w-20 rounded-pill bg-surface-muted" />
      </div>
    </div>
  );
}
