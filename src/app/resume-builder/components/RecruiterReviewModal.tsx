"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Target,
} from "lucide-react";
import Modal from "@/app/components/Modal";
import type { AtsAnalysisResult, AtsCheckAction } from "@/lib/resume/ats-checker";
import type { ResumeSectionKey } from "@/lib/resume/types";

interface RecruiterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AtsAnalysisResult;
  onDownloadPdf: () => void;
  isExportingPdf: boolean;
  onJumpToSection: (section: "personal" | ResumeSectionKey) => void;
  onApplyCorrection?: (action: AtsCheckAction) => void;
}

export default function RecruiterReviewModal({
  isOpen,
  onClose,
  analysis,
  onDownloadPdf,
  isExportingPdf,
  onJumpToSection,
  onApplyCorrection,
}: RecruiterReviewModalProps) {
  const unresolvedErrors = analysis.checks.filter((c) => c.severity === "error");
  const unresolvedWarnings = analysis.checks.filter((c) => c.severity === "warning");
  const hasCriticalErrors = unresolvedErrors.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recruiter Quality & ATS Review"
      description="Pre-download evaluation of spelling, dates, achievement impact, and single-column PDF layout."
      maxWidth="2xl"
      bodyClassName="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto"
    >
      {/* Scorecard Overview: Spacious 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Pillar 1: Language */}
        <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-subtle p-3.5 sm:p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                  <BookOpen size={12} />
                </span>
                <span className="truncate text-xs font-bold text-text-primary">
                  Language &amp; Typos
                </span>
              </div>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-[10px] font-bold ${
                  analysis.scorecard.contentQuality.status === "Passed"
                    ? "border border-status-success-border bg-status-success-bg text-brand"
                    : "border border-status-error-border bg-status-error-bg text-status-error"
                }`}
              >
                {analysis.scorecard.contentQuality.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {analysis.scorecard.contentQuality.summary}
            </p>
          </div>
        </div>

        {/* Pillar 2: Experience */}
        <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-subtle p-3.5 sm:p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                  <Briefcase size={12} />
                </span>
                <span className="truncate text-xs font-bold text-text-primary">
                  Impact &amp; Verbs
                </span>
              </div>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-[10px] font-bold ${
                  analysis.scorecard.experienceImpact.status === "Passed"
                    ? "border border-status-success-border bg-status-success-bg text-brand"
                    : "border border-status-warning-border bg-status-warning-bg text-status-warning"
                }`}
              >
                {analysis.scorecard.experienceImpact.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {analysis.scorecard.experienceImpact.summary}
            </p>
          </div>
        </div>

        {/* Pillar 3: Job Match */}
        <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-subtle p-3.5 sm:p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                  <Target size={12} />
                </span>
                <span className="truncate text-xs font-bold text-text-primary">
                  Target JD Match
                </span>
              </div>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-[10px] font-bold ${
                  analysis.scorecard.jobMatch.status === "Passed"
                    ? "border border-status-success-border bg-status-success-bg text-brand"
                    : analysis.scorecard.jobMatch.status === "Needs review"
                      ? "border border-status-warning-border bg-status-warning-bg text-status-warning"
                      : "border border-border-default bg-surface-card text-text-muted"
                }`}
              >
                {analysis.scorecard.jobMatch.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {analysis.scorecard.jobMatch.summary}
            </p>
          </div>
        </div>

        {/* Pillar 4: PDF Readiness */}
        <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-subtle p-3.5 sm:p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                  <FileText size={12} />
                </span>
                <span className="truncate text-xs font-bold text-text-primary">
                  PDF &amp; Spacing
                </span>
              </div>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-[10px] font-bold ${
                  analysis.scorecard.pdfReadiness.status === "Passed"
                    ? "border border-status-success-border bg-status-success-bg text-brand"
                    : "border border-status-warning-border bg-status-warning-bg text-status-warning"
                }`}
              >
                {analysis.scorecard.pdfReadiness.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {analysis.scorecard.pdfReadiness.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Unresolved Issues Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-primary">
          Actionable Items ({unresolvedErrors.length + unresolvedWarnings.length})
        </h3>

        {unresolvedErrors.length === 0 && unresolvedWarnings.length === 0 ? (
          <div className="rounded-card border border-status-success-border bg-status-success-bg p-4 text-xs text-brand">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>All quality &amp; ATS checks passed!</span>
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed">
              Your resume contains complete contact information, clean date chronology, zero detected spelling/grammar typos, and a balanced single-column layout.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[38vh] overflow-y-auto pr-1">
            {/* Critical Errors First */}
            {unresolvedErrors.map((err) => (
              <div
                key={err.id}
                className="rounded-card border border-status-error-border bg-surface-card p-3.5 text-xs shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-status-error" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-status-error">
                        Critical
                      </span>
                      {err.location && (
                        <span className="text-[11px] text-text-muted">
                          · {err.location}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-bold text-text-primary">{err.title}</p>
                    <p className="mt-0.5 leading-relaxed text-text-secondary">
                      {err.explanation}
                    </p>
                    {err.whyItMatters && (
                      <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
                        <strong className="text-text-secondary">Recruiter impact: </strong>
                        {err.whyItMatters}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-border-subtle/60 pt-2">
                  {err.action && err.action.type === "replace-text" && onApplyCorrection && (
                    <button
                      type="button"
                      onClick={() => onApplyCorrection(err.action!)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-control bg-brand px-2.5 py-1 text-xs font-semibold text-text-inverse shadow-2xs hover:bg-brand-hover"
                    >
                      <Check size={11} />
                      <span>Accept fix</span>
                    </button>
                  )}
                  {err.section && (
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToSection(err.section!);
                        onClose();
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2.5 py-1 text-xs font-medium text-brand hover:border-brand"
                    >
                      <span>Fix in Section</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Suggestions Second */}
            {unresolvedWarnings.map((warn) => (
              <div
                key={warn.id}
                className="rounded-card border border-status-warning-border bg-surface-card p-3.5 text-xs shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-status-warning" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-status-warning">
                        Suggestion
                      </span>
                      {warn.location && (
                        <span className="text-[11px] text-text-muted">
                          · {warn.location}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-bold text-text-primary">{warn.title}</p>
                    <p className="mt-0.5 leading-relaxed text-text-secondary">
                      {warn.explanation}
                    </p>
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-border-subtle/60 pt-2">
                  {warn.action && warn.action.type === "replace-text" && onApplyCorrection && (
                    <button
                      type="button"
                      onClick={() => onApplyCorrection(warn.action!)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-control bg-brand px-2.5 py-1 text-xs font-semibold text-text-inverse shadow-2xs hover:bg-brand-hover"
                    >
                      <Check size={11} />
                      <span>Accept fix</span>
                    </button>
                  )}
                  {warn.section && (
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToSection(warn.section!);
                        onClose();
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2.5 py-1 text-xs font-medium text-brand hover:border-brand"
                    >
                      <span>Edit in Section</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-control border border-border-default bg-surface-card px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
        >
          Back to Editor
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isExportingPdf || hasCriticalErrors}
            onClick={() => {
              onDownloadPdf();
              onClose();
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2 text-xs font-bold text-text-inverse shadow-subtle hover:bg-brand-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingPdf ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>
                  {hasCriticalErrors
                    ? "Resolve critical errors to download"
                    : unresolvedWarnings.length > 0
                      ? "Download PDF Anyway"
                      : "Download ATS PDF"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
