"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Check,
  Compass,
  ExternalLink,
  Lock,
  Share2,
  Unlock,
  X,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import Modal from "@/app/components/Modal";
import FormattedDescription from "@/app/components/jobs/FormattedDescription";
import { timeAgo, getJobCategory } from "@/app/components/jobs/jobs-utils";
import { parseCardLocation, getJobType } from "./jobs-client-utils";

interface JobDetailModalProps {
  activeJob: Job | null;
  onClose: () => void;
  isUnlocked?: boolean;
  onShare: (job: Job) => void;
  shareCopied: boolean;
}

export function JobDetailModal({
  activeJob,
  onClose,
  isUnlocked = false,
  onShare,
  shareCopied,
}: JobDetailModalProps) {
  if (!activeJob) return null;

  const modalLocInfo = parseCardLocation(activeJob);

  return (
    <Modal
      isOpen={Boolean(activeJob)}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
      className="p-0 border border-border-default shadow-modal overflow-hidden rounded-2xl"
      bodyClassName="overflow-hidden flex flex-col min-h-0 flex-1 bg-surface-card"
    >
      <div className="flex flex-col min-h-0 flex-1 h-full">
        {/* Minimal Header */}
        <div className="relative shrink-0 border-b border-border-subtle bg-surface-card px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-brand">
                {getJobCategory(activeJob)}
              </span>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">
                Posted {timeAgo(activeJob.postedDate)}
              </span>
            </div>

            <button
              type="button"
              aria-label="Close job details"
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <h2
            id="job-modal-title"
            className="mt-2.5 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
          >
            {activeJob.title}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{activeJob.company}</span>
            <span className="text-border-strong">·</span>
            <span>{modalLocInfo.officeLabel}</span>
            {activeJob.companyLink && (
              <>
                <span className="text-border-strong">·</span>
                <a
                  href={activeJob.companyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:underline"
                >
                  <span>Website</span>
                  <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-8 space-y-6">
          {/* Minimal Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-card border border-border-default/70 bg-surface-subtle/50 p-4">
            <div>
              <p className="text-2xs font-medium uppercase tracking-wider text-text-muted">Salary</p>
              <p className="mt-1 text-sm font-semibold text-brand truncate">
                {activeJob.salary || "Not Disclosed"}
              </p>
            </div>
            <div>
              <p className="text-2xs font-medium uppercase tracking-wider text-text-muted">Experience</p>
              <p className="mt-1 text-sm font-semibold text-text-primary truncate">
                {activeJob.experience || "Fresher"}
              </p>
            </div>
            <div>
              <p className="text-2xs font-medium uppercase tracking-wider text-text-muted">Location</p>
              <p className="mt-1 text-sm font-semibold text-text-primary truncate" title={modalLocInfo.officeLabel}>
                {modalLocInfo.officeLabel}
              </p>
            </div>
            <div>
              <p className="text-2xs font-medium uppercase tracking-wider text-text-muted">Work Setup</p>
              <p className="mt-1 text-sm font-semibold text-text-primary truncate">
                {modalLocInfo.workMode} · {getJobType(activeJob)}
              </p>
            </div>
          </div>

          {/* Location Preference Callout */}
          {modalLocInfo.preferenceNote && (() => {
            const trimmed = modalLocInfo.preferenceNote
              .trim()
              .replace(/\s*[-–—]?\s*\(no relocation\)/gi, "")
              .replace(/\s*\(no relocation\)/gi, "")
              .replace(/\s*no relocation/gi, "")
              .trim();
            const cleaned = trimmed
              .replace(/\s*candidates\s+preferred\.?$/i, "")
              .replace(/\s*candidates\s+only\.?$/i, "")
              .replace(/\s*preferred\.?$/i, "")
              .trim();
            const cleanNote = trimmed.toLowerCase().startsWith("local candidates")
              ? trimmed
              : (cleaned && cleaned.toLowerCase() !== trimmed.toLowerCase() ? cleaned : trimmed);
            if (!cleanNote) return null;
            return (
              <div className="rounded-control border border-border-default bg-surface-subtle p-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Compass size={15} className="text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-text-primary">Location preference</span>
                    <span className="text-text-secondary font-medium mt-0.5 block">{cleanNote}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Company Office / HQ or Multiple Branches */}
          {modalLocInfo.workMode === "Remote" && (activeJob.primaryCity || modalLocInfo.officeCities.length > 0) ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-medium text-text-muted">
                {modalLocInfo.officeCities.length > 1 ? "Company Offices:" : "Company HQ:"}
              </span>
              {modalLocInfo.officeCities.length > 0 ? (
                modalLocInfo.officeCities.map((city, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-0.5 text-xs text-text-primary"
                  >
                    <Building2 size={11} className="text-brand shrink-0" />
                    {city}
                    {activeJob.primaryState && modalLocInfo.officeCities.length === 1 ? `, ${activeJob.primaryState}` : ""}
                  </span>
                ))
              ) : activeJob.primaryCity ? (
                <span className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-0.5 text-xs text-text-primary">
                  <Building2 size={11} className="text-brand shrink-0" />
                  {activeJob.primaryCity}{activeJob.primaryState ? `, ${activeJob.primaryState}` : ""}
                </span>
              ) : null}
            </div>
          ) : modalLocInfo.officeCities.length > 1 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-medium text-text-muted">Office Branches:</span>
              {modalLocInfo.officeCities.map((city, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-0.5 text-xs text-text-primary">
                  <Building2 size={11} className="text-brand shrink-0" />
                  {city}
                </span>
              ))}
            </div>
          ) : null}

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-base-compact font-bold text-text-primary">
              About the role
            </h3>
            <FormattedDescription content={activeJob.description} />
          </div>
        </div>

        {/* Pinned Sticky Footer Actions */}
        <div className="shrink-0 border-t border-border-subtle bg-surface-card px-6 py-4 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-control border border-brand/20 bg-brand-soft px-3.5 text-xs font-semibold text-brand shadow-2xs">
                  <Unlock className="h-4 w-4" strokeWidth={2} />
                  <span>Unlocked</span>
                </span>
              ) : process.env.NEXT_PUBLIC_FREE_EMAIL_UNLOCK !== "false" ? (
                <Link
                  href={`/jobs/${activeJob.id}`}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-brand/20 bg-brand-soft px-3.5 text-xs font-semibold text-brand shadow-2xs transition-colors hover:bg-brand-soft-hover"
                >
                  <Unlock className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
                  <span>Free Unlock</span>
                </Link>
              ) : (
                <Link
                  href={`/jobs/${activeJob.id}`}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-primary shadow-2xs transition-colors hover:border-border-strong hover:bg-surface-subtle"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
                  <span>₹5 to Unlock</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => onShare(activeJob)}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-primary shadow-2xs transition-colors hover:border-border-strong hover:bg-surface-subtle"
              >
                {shareCopied ? (
                  <Check className="h-4 w-4 text-brand" strokeWidth={1.75} />
                ) : (
                  <Share2 className="h-4 w-4" strokeWidth={1.75} />
                )}
                <span>{shareCopied ? "Link Copied" : "Share"}</span>
              </button>
            </div>

            <Link
              href={`/jobs/${activeJob.id}`}
              prefetch={true}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover active:scale-[0.99]"
            >
              <span>View More</span>
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
