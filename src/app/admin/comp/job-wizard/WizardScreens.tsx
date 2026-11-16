"use client";

import React from "react";
import Link from "next/link";
import { LoaderCircle, AlertCircle, CheckCircle2, ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Job } from "@/app/types/job";
import type { JobFormState } from "./types";

export function WizardLoadingScreen({ message = "Loading job details..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <LoaderCircle size={24} className="animate-spin text-brand" />
      <p className="text-xs font-medium text-text-muted">{message}</p>
    </div>
  );
}

export function WizardErrorScreen({
  error,
  backHref = "/admin/jobs",
  backLabel = "Back to job listings",
}: {
  error: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-control bg-status-error/10 text-status-error">
        <AlertCircle size={20} />
      </div>
      <h2 className="mt-3 text-base font-semibold text-text-primary">Unable to load job</h2>
      <p className="mt-1 text-xs text-text-muted">{error}</p>
      <Link
        href={backHref}
        className="mt-5 inline-flex items-center gap-1.5 rounded-control bg-brand px-3.5 py-2 text-xs font-medium text-text-inverse"
      >
        <ArrowLeft size={13} />
        {backLabel}
      </Link>
    </div>
  );
}

export interface WizardSuccessScreenProps {
  submittedJobData?: Partial<Job> | null;
  form: JobFormState;
  previewLocation: string;
  onPostAnother: () => void;
}

export function WizardSuccessScreen({
  submittedJobData,
  form,
  previewLocation,
  onPostAnother,
}: WizardSuccessScreenProps) {
  return (
    <main className="min-h-full bg-surface-base text-text-primary">
      <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <div className="mx-auto flex items-center justify-center text-brand">
          <CheckCircle2 size={40} strokeWidth={2} />
        </div>

        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Submitted · Pending Review
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Job Submitted for Review!
        </h1>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          Thank you for posting on Zenoway. To maintain high listing quality and ensure compensation
          transparency, all public submissions undergo a quick editorial review. Your listing will go live
          once approved by our moderation team.
        </p>

        {/* Submitted Job Overview Card */}
        <div className="mt-8 rounded-card border border-border-default bg-surface-card p-5 text-left shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {submittedJobData?.title || form.title}
              </h3>
              <p className="text-xs font-medium text-text-secondary">
                {submittedJobData?.company || form.company}
              </p>
            </div>
            <span className="rounded-control bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
              {submittedJobData?.workMode || form.workMode}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-default/40 pt-3 text-xs sm:grid-cols-3">
            <div>
              <span className="text-3xs font-semibold uppercase text-text-muted">Location</span>
              <p className="mt-0.5 truncate font-medium text-text-primary">{previewLocation}</p>
            </div>
            <div>
              <span className="text-3xs font-semibold uppercase text-text-muted">Salary</span>
              <p className="mt-0.5 font-semibold text-brand">{form.salary || "Not Disclosed"}</p>
            </div>
            <div>
              <span className="text-3xs font-semibold uppercase text-text-muted">Contact Email</span>
              <p className="mt-0.5 truncate font-medium text-text-primary">{form.mail || "—"}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-1.5 rounded-control bg-brand px-4 py-2.5 text-xs font-medium text-text-inverse shadow-subtle transition hover:bg-brand-hover"
          >
            <span>Browse Job Listings</span>
            <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            onClick={onPostAnother}
            className="inline-flex items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-xs font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary"
          >
            <span>Post Another Job</span>
          </button>
        </div>
      </div>
    </main>
  );
}
