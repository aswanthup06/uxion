"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Check,
  Compass,
  ExternalLink,
  Globe,
  ImageDown,
  MapPin,
  Share2,
  Unlock,
  X,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import Modal from "@/app/components/Modal";
import { Button } from "@/app/components/Button";
import FormattedDescription from "@/app/components/jobs/FormattedDescription";
import {
  timeAgo,
  getJobCategory,
  isDisclosedSalary,
  formatLocationPreference,
} from "@/app/components/jobs/jobs-utils";
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
              <span className="text-border-strong select-none">·</span>
              <span className="text-text-muted">
                Posted {timeAgo(activeJob.postedDate)}
              </span>
              {isUnlocked && (
                <>
                  <span className="text-border-strong select-none">·</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-2xs font-semibold text-brand">
                    <Unlock className="h-3 w-3" strokeWidth={2} />
                    <span>Unlocked</span>
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              aria-label="Close job details"
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95"
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
            <span className="font-semibold text-text-primary">{activeJob.company}</span>
            {activeJob.companyLink && (
              <>
                <span className="text-border-strong select-none">·</span>
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
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-8 space-y-5">
          {/* Editorial Key Details Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary">
            {isDisclosedSalary(activeJob.salary) && (
              <>
                <span className="font-semibold text-text-primary">
                  {activeJob.salary!.trim()}
                </span>
                <span className="text-border-strong select-none">·</span>
              </>
            )}

            {activeJob.experience?.trim() && (
              <span>
                {activeJob.experience.trim()}
              </span>
            )}

            {activeJob.experience?.trim() && <span className="text-border-strong select-none">·</span>}

            <span className="capitalize">
              {getJobType(activeJob).toLowerCase().replace(/_/g, " ")}
            </span>

            <span className="text-border-strong select-none">·</span>

            <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
              {modalLocInfo.workMode === "Remote" ? (
                <Globe size={14} className="text-brand shrink-0" strokeWidth={1.8} />
              ) : modalLocInfo.workMode === "Hybrid" ? (
                <Building2 size={14} className="text-brand shrink-0" strokeWidth={1.8} />
              ) : (
                <MapPin size={14} className="text-brand shrink-0" strokeWidth={1.8} />
              )}
              <span>{modalLocInfo.officeLabel}</span>
            </span>
          </div>

          {/* Location Preference Callout */}
          {modalLocInfo.preferenceNote && (() => {
            const cleanNote = formatLocationPreference(modalLocInfo.preferenceNote);
            if (!cleanNote) return null;
            return (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Compass size={14} className="text-brand shrink-0" strokeWidth={2} />
                <span>{cleanNote}</span>
              </div>
            );
          })()}

          {/* Description */}
          <div className="pt-2 space-y-1">
            <h3 className="text-base-compact font-bold text-text-primary">
              About the role
            </h3>
            <FormattedDescription content={activeJob.description} />
          </div>
        </div>

        {/* Pinned Sticky Footer Actions */}
        <div className="shrink-0 border-t border-border-subtle bg-surface-card px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Secondary Actions on Mobile (Row 2: 50/50 equal width), Left side on Desktop */}
            <div className="order-last sm:order-first grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                href={`/job-posters?jobId=${encodeURIComponent(activeJob.id)}`}
                className="w-full sm:w-auto h-11 sm:h-9 text-xs font-semibold"
              >
                <ImageDown className="h-4 w-4" strokeWidth={1.75} />
                <span>Poster</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onShare(activeJob)}
                className="w-full sm:w-auto h-11 sm:h-9 text-xs font-semibold"
              >
                {shareCopied ? (
                  <Check className="h-4 w-4 text-brand" strokeWidth={1.75} />
                ) : (
                  <Share2 className="h-4 w-4" strokeWidth={1.75} />
                )}
                <span>{shareCopied ? "Copied" : "Share"}</span>
              </Button>
            </div>

            {/* Primary Action: Open Full Page & Apply */}
            <div className="order-first sm:order-last w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                href={`/jobs/${activeJob.id}`}
                className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-xs font-semibold shadow-subtle"
              >
                <span>Open Full Page & Apply</span>
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
