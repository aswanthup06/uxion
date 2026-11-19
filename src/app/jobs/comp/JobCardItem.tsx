"use client";

import Link from "next/link";
import { MailCheck, MapPin } from "lucide-react";
import type { Job } from "@/app/types/job";
import { timeAgo } from "@/app/components/jobs/jobs-utils";
import { parseCardLocation, getJobType } from "./jobs-client-utils";

interface JobCardItemProps {
  job: Job;
  isUnlocked?: boolean;
  onSelect: (job: Job) => void;
}

export function JobCardItem({
  job,
  isUnlocked = false,
  onSelect,
}: JobCardItemProps) {
  const typeTag = getJobType(job);
  const locInfo = parseCardLocation(job);

  return (
    <article
      onClick={() => onSelect(job)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(job);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${job.title} at ${job.company}`}
      className="group relative flex cursor-pointer flex-col justify-between rounded-card border border-border-default bg-surface-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <div>
        {/* Top: Job Title + Unlocked Badge */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.015em] text-text-primary transition-colors group-hover:text-brand">
            <Link
              href={`/jobs/${job.id}`}
              prefetch={true}
              onClick={(e) => e.stopPropagation()}
            >
              {job.title}
            </Link>
          </h2>

          {isUnlocked && (
            <span
              className="shrink-0 text-brand mt-0.5"
              title="Employer recruitment email unlocked"
              aria-label="Email Unlocked"
            >
              <MailCheck className="h-4 w-4" strokeWidth={1.75} />
            </span>
          )}
        </div>

        {/* Company · Posted Date */}
        <p className="mt-1 flex flex-wrap items-center text-sm font-medium text-text-secondary">
          <span className="text-text-primary">{job.company}</span>
          <span className="mx-1.5 text-border-strong select-none">·</span>
          <span className="text-xs text-text-muted font-normal">{timeAgo(job.postedDate)}</span>
        </p>

        {/* Clean Editorial Metadata: Work Mode · Experience · Job Type */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-text-secondary">
          <span className="font-semibold text-brand">
            {locInfo.workMode}
          </span>

          {job.experience?.trim() && (
            <>
              <span className="text-border-strong select-none">·</span>
              <span>{job.experience.trim()}</span>
            </>
          )}

          <span className="text-border-strong select-none">·</span>
          <span className="text-text-muted">{typeTag}</span>
        </div>
      </div>

      {/* Bottom Row: Salary on left, Location on right */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-1 text-xs">
        <span className="font-semibold text-text-primary text-[13.5px] tracking-tight">
          {job.salary || "Not Disclosed"}
        </span>

        <span
          className="flex items-center gap-1 text-text-muted truncate max-w-[55%]"
          title={locInfo.officeLabel}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={1.75} />
          <span className="truncate font-medium text-text-secondary">
            {locInfo.officeLabel.replace(/^(Remote|Hybrid)\s*[·-]\s*/i, "")}
          </span>
        </span>
      </div>
    </article>
  );
}
