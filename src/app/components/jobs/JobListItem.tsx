import Link from "next/link";
import { Briefcase, Clock, MapPin } from "lucide-react";
import type { Job } from "@/app/types/job";
import { isRecent, timeAgo } from "./jobs-utils";

const COLS = "md:grid md:grid-cols-[minmax(0,1fr)_10rem_7rem_6.5rem] md:items-center md:gap-5";

function hue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

/** Wraps rows in one bordered table with a column header (desktop). */
export function JobTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-subtle">
      <div className={`hidden border-b border-border-default bg-surface-subtle px-5 py-2.5 text-xs font-medium text-text-secondary ${COLS}`}>
        <span>Role</span>
        <span>Location</span>
        <span>Experience</span>
        <span className="text-right">Posted</span>
      </div>
      <ul className="divide-y divide-border-subtle">{children}</ul>
    </div>
  );
}

export function JobListItem({ job }: { job: Job }) {
  const h = hue(job.company ?? "");
  return (
    <li>
      <Link
        href={`/jobs/${job.id}`}
        className={`group relative block px-5 py-4 outline-none transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent/50 ${COLS}`}
      >
        <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />

        <div className="flex min-w-0 items-center gap-3.5">
          <div
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-control text-sm font-semibold"
            style={{ background: `hsl(${h} 42% 92%)`, color: `hsl(${h} 50% 28%)` }}
          >
            {job.company?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[15px] font-semibold text-text-primary">{job.title}</h2>
              {isRecent(job.postedDate) && (
                <span className="shrink-0 rounded-pill bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                  New
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-text-secondary">{job.company}</p>
          </div>
        </div>

        {/* desktop columns */}
        <span className="hidden truncate text-sm text-text-primary md:block">{job.location}</span>
        <span className="hidden truncate text-sm tabular-nums text-text-primary md:block">{job.experience}</span>
        <span className="hidden text-right text-sm text-text-muted md:block">{timeAgo(job.postedDate)}</span>

        {/* mobile meta */}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 pl-[54px] text-[13px] text-text-secondary md:hidden">
          <li className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden /> {job.location}
          </li>
          <li className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-text-muted" aria-hidden /> {job.experience}
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-text-muted" aria-hidden /> {timeAgo(job.postedDate)}
          </li>
        </ul>
      </Link>
    </li>
  );
}

export function JobListSkeleton() {
  return (
    <li className="flex animate-pulse items-center gap-3.5 px-5 py-4">
      <div className="h-10 w-10 shrink-0 rounded-control bg-surface-muted" />
      <div className="flex-1">
        <div className="h-4 w-2/5 rounded-control bg-border-subtle" />
        <div className="mt-2 h-3.5 w-1/4 rounded-control bg-surface-muted" />
      </div>
      <div className="hidden h-3.5 w-24 rounded-control bg-surface-muted md:block" />
    </li>
  );
}
