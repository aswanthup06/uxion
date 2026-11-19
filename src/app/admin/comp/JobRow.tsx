"use client";

import Link from "next/link";
import { Job } from "../../types/job";
import {
  CalendarDays,
  ExternalLink,
  Eye,
  ImageDown,
  MapPin,
  MousePointerClick,
  Pencil,
  Trash2,
} from "lucide-react";

type Props = {
  job: Job;
  onDelete: (id: string) => void;
  onViewPoster?: (job: Job) => void;
  isLatest?: boolean;
};

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const input = value.trim();

  // Support DD/MM/YYYY and DD-MM-YYYY.
  const dmy = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  // Parse date-only ISO values locally to avoid timezone shifts.
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string) {
  const date = parseDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function JobRow({ job, onDelete, onViewPoster, isLatest }: Props) {
  return (
    <tr className="group transition-colors hover:bg-surface-subtle/70">
      {/* Role & Company */}
      <td className="py-4 pl-6 pr-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jobs/${job.id}`}
              className="max-w-[320px] lg:max-w-md truncate text-sm font-semibold text-text-primary hover:text-brand transition"
            >
              {job.title}
            </Link>
            {isLatest && (
              <span className="rounded-[4px] bg-emerald-50 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
                Latest
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-muted truncate">
            {job.company}
          </p>
        </div>
      </td>

      {/* Location */}
      <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={13} className="shrink-0 text-text-muted" />
          {job.location || "—"}
        </span>
      </td>

      {/* Date Posted */}
      <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={13} className="shrink-0 text-text-muted" />
          {formatDate(job.postedDate)}
        </span>
      </td>

      {/* Telemetry (Views & Clicks) */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-2xs">
          <span
            title="Page views"
            className="inline-flex items-center gap-1 rounded-control bg-surface-subtle px-2 py-1 font-medium text-text-secondary border border-border-subtle"
          >
            <Eye size={12} className="text-violet-600" />
            {(job.views || 0).toLocaleString()}
          </span>
          <span
            title="Copy email / apply clicks"
            className="inline-flex items-center gap-1 rounded-control bg-amber-50/70 text-amber-800 border border-amber-200/60 px-2 py-1 font-medium"
          >
            <MousePointerClick size={12} className="text-amber-600" />
            {(job.emailCopyCount || 0).toLocaleString()}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          {onViewPoster ? (
            <button
              type="button"
              onClick={() => onViewPoster(job)}
              aria-label={`View poster for ${job.title}`}
              title="Job poster preview"
              className="inline-flex items-center gap-1 rounded-control border border-border-default bg-white px-2.5 py-1 text-xs font-medium text-text-secondary shadow-2xs transition hover:border-brand/40 hover:text-brand cursor-pointer"
            >
              <ImageDown size={13} className="text-brand" />
              <span>Poster</span>
            </button>
          ) : (
            <a
              href={`/job-posters?jobId=${encodeURIComponent(job.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View poster for ${job.title}`}
              title="View job poster"
              className="inline-flex items-center gap-1 rounded-control border border-border-default bg-white px-2.5 py-1 text-xs font-medium text-text-secondary shadow-2xs transition hover:border-brand/40 hover:text-brand"
            >
              <ImageDown size={13} className="text-brand" />
              <span>Poster</span>
            </a>
          )}

          <Link
            href={`/admin/jobs/${job.id}/edit`}
            aria-label={`Edit ${job.title}`}
            className="inline-flex items-center gap-1 rounded-control border border-border-default bg-white px-2.5 py-1 text-xs font-medium text-text-secondary shadow-2xs transition hover:border-brand/40 hover:text-brand"
          >
            <Pencil size={12} />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => onDelete(job.id)}
            aria-label={`Delete ${job.title}`}
            title="Delete job"
            className="inline-flex h-7 w-7 items-center justify-center rounded-control border border-border-default bg-white text-text-muted shadow-2xs transition hover:border-status-error/40 hover:text-status-error hover:bg-status-error-bg cursor-pointer"
          >
            <Trash2 size={13} />
          </button>

          <Link
            href={`/admin/jobs/${job.id}`}
            aria-label={`View ${job.title}`}
            title="View details"
            className="inline-flex h-7 w-7 items-center justify-center rounded-control border border-border-default bg-white text-text-muted shadow-2xs transition hover:border-brand/40 hover:text-brand"
          >
            <ExternalLink size={13} />
          </Link>
        </div>
      </td>
    </tr>
  );
}
