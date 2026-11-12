"use client";

import Link from "next/link";
import {
  AlertTriangle,
  FilePlus2,
  FileText,
  Loader2,
  LogIn,
  Trash2,
} from "lucide-react";
import Modal from "@/app/components/Modal";
import type { SavedResumeRecord } from "@/lib/resume/types";

interface SavedResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  migrationRequired: boolean;
  resumes: SavedResumeRecord[];
  activeResumeId: string | null;
  deletingId: string | null;
  onSelectResume: (resume: SavedResumeRecord) => void;
  onDeleteResume: (id: string) => void;
  onCreateNew: () => void;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function SavedResumesModal({
  isOpen,
  onClose,
  isAuthenticated,
  isLoading,
  error,
  migrationRequired,
  resumes,
  activeResumeId,
  deletingId,
  onSelectResume,
  onDeleteResume,
  onCreateNew,
}: SavedResumesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Resumes"
      description={
        isAuthenticated
          ? "Open, manage, or delete resumes saved to your Zenoway account."
          : "Sign in to save multiple resumes across sessions and devices."
      }
      maxWidth="lg"
      bodyClassName="p-5 sm:p-6"
    >
      {!isAuthenticated ? (
        <div className="space-y-4">
          <div className="rounded-card border border-border-default bg-surface-subtle p-4 text-xs leading-relaxed text-text-secondary">
            Your current work is stored locally in this browser only. Sign in with your
            Zenoway account to save, retrieve, and manage resumes securely on the server.
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              Continue as guest
            </button>
            <Link
              href="/login?redirect=/resume-builder"
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
            >
              <LogIn size={14} />
              Sign in with Google
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              {resumes.length} saved {resumes.length === 1 ? "resume" : "resumes"}
            </p>
            <button
              type="button"
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-border-strong bg-brand-soft px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft-hover"
            >
              <FilePlus2 size={13} />
              New blank resume
            </button>
          </div>

          {migrationRequired && (
            <div className="flex items-start gap-2.5 rounded-card border border-status-warning-border bg-status-warning-bg p-3.5 text-xs text-text-primary">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-status-warning" />
              <div>
                <p className="font-semibold">Cloud table migration pending</p>
                <p className="mt-1 text-text-secondary">
                  The <code className="font-mono text-[11px]">public.resumes</code> table
                  is not present in Supabase yet. Apply{" "}
                  <code className="font-mono text-[11px]">
                    supabase/migrations/20261110000001_create_resumes_table.sql
                  </code>{" "}
                  to enable account sync. Your current draft remains saved locally in this
                  browser.
                </p>
              </div>
            </div>
          )}

          {error && !migrationRequired && (
            <div className="rounded-card border border-status-error-border bg-status-error-bg p-3 text-xs text-status-error">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-xs text-text-muted">
              <Loader2 size={18} className="mr-2 animate-spin text-brand" />
              Loading saved resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-card border border-dashed border-border-default bg-surface-subtle p-8 text-center">
              <FileText size={20} className="mx-auto text-text-muted" />
              <p className="mt-2 text-xs font-semibold text-text-primary">
                No saved resumes yet
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Use the Save button in the builder toolbar to store your first resume in
                your account.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {resumes.map((item) => {
                const isActive = item.id === activeResumeId;
                const isDeleting = item.id === deletingId;
                return (
                  <li
                    key={item.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-card border p-3.5 transition-colors ${
                      isActive
                        ? "border-brand bg-brand-soft/35"
                        : "border-border-default bg-surface-card hover:border-border-strong"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {item.title}
                        </p>
                        {isActive && (
                          <span className="rounded-pill bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
                            Open
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        Updated {formatUpdatedAt(item.updatedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectResume(item);
                          onClose();
                        }}
                        className="inline-flex h-8 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:text-brand"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDeleteResume(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-control border border-status-error-border bg-surface-card px-2.5 text-xs font-medium text-status-error transition-colors hover:bg-status-error-bg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}

