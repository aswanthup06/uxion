"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { AtsAnalysisResult } from "@/lib/resume/ats-checker";
import type { ResumeSectionKey } from "@/lib/resume/types";

interface AtsCheckerPanelProps {
  analysis: AtsAnalysisResult;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onJumpToSection: (section: "personal" | ResumeSectionKey) => void;
  aiConfigured: boolean;
  aiLoading: boolean;
  onTailorWithAi: () => void;
}

export default function AtsCheckerPanel({
  analysis,
  jobDescription,
  onJobDescriptionChange,
  onJumpToSection,
  aiConfigured,
  aiLoading,
  onTailorWithAi,
}: AtsCheckerPanelProps) {
  const sortedChecks = [...analysis.checks].sort((a, b) => {
    const order = { error: 0, warning: 1, pass: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-5">
      {/* Honest Summary Header */}
      <div className="rounded-panel border border-border-default bg-surface-card p-4 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Rule-Based ATS & Readability Check
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {analysis.wordCount} words analyzed across structure, dates, formatting, and
              keywords.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-pill border border-status-error-border bg-status-error-bg px-2.5 py-1 font-medium text-status-error">
              <AlertCircle size={12} />
              {analysis.counts.errors} critical
            </span>
            <span className="inline-flex items-center gap-1 rounded-pill border border-status-warning-border bg-status-warning-bg px-2.5 py-1 font-medium text-status-warning">
              <AlertTriangle size={12} />
              {analysis.counts.warnings} suggestions
            </span>
            <span className="inline-flex items-center gap-1 rounded-pill border border-status-success-border bg-status-success-bg px-2.5 py-1 font-medium text-brand">
              <CheckCircle2 size={12} />
              {analysis.counts.passes} passed
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-control border border-border-subtle bg-surface-subtle p-3 text-[11px] leading-relaxed text-text-secondary">
          <Info size={14} className="mt-0.5 shrink-0 text-brand" />
          <span>{analysis.disclaimer}</span>
        </div>
      </div>

      {/* Optional Job Description Matcher */}
      <div className="rounded-panel border border-border-default bg-surface-card p-4 shadow-subtle">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <label
              htmlFor="target-job-description"
              className="block text-xs font-semibold text-text-primary"
            >
              Target Job Description (Optional)
            </label>
            <p className="mt-0.5 text-xs text-text-muted">
              Paste a job description to compare domain keywords against your resume.
            </p>
          </div>

          {jobDescription.trim() && (
            <button
              type="button"
              onClick={() => onJobDescriptionChange("")}
              className="cursor-pointer text-xs font-medium text-text-muted hover:text-text-primary"
            >
              Clear JD
            </button>
          )}
        </div>

        <textarea
          id="target-job-description"
          rows={5}
          maxLength={8000}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job posting requirements, responsibilities, and skills here..."
          className="mt-2.5 w-full resize-y rounded-control border border-border-default bg-surface-base px-3 py-2 text-xs leading-relaxed text-text-primary outline-none placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring"
        />

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-text-muted">
            {jobDescription.length} / 8000 characters
          </span>

          {aiConfigured && (
            <button
              type="button"
              disabled={aiLoading || jobDescription.trim().length < 30}
              onClick={onTailorWithAi}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-border-strong bg-brand-soft px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              <span>Tailor suggestions with Gemini AI</span>
            </button>
          )}
        </div>

        {analysis.keywordAnalysis.hasJobDescription &&
          analysis.keywordAnalysis.extractedKeywords.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-border-subtle pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">
                  Keyword Overlap
                </span>
                <span className="font-medium text-text-secondary">
                  {analysis.keywordAnalysis.matchedKeywords.length} /{" "}
                  {analysis.keywordAnalysis.extractedKeywords.length} terms present (
                  {analysis.keywordAnalysis.matchPercentage}%)
                </span>
              </div>

              {analysis.keywordAnalysis.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-brand">
                    Present in your resume
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {analysis.keywordAnalysis.matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-pill border border-status-success-border bg-status-success-bg px-2 py-0.5 text-[11px] font-medium text-brand"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.keywordAnalysis.missingKeywords.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-status-warning">
                    Not found in your resume (add only if truthful)
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {analysis.keywordAnalysis.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-pill border border-status-warning-border bg-status-warning-bg px-2 py-0.5 text-[11px] font-medium text-status-warning"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Detailed Check List */}
      <div className="space-y-2.5">
        {sortedChecks.map((check) => {
          const isError = check.severity === "error";
          const isWarn = check.severity === "warning";
          const borderClass = isError
            ? "border-status-error-border bg-surface-card"
            : isWarn
              ? "border-status-warning-border bg-surface-card"
              : "border-status-success-border bg-surface-card";
          const badgeClass = isError
            ? "bg-status-error-bg text-status-error"
            : isWarn
              ? "bg-status-warning-bg text-status-warning"
              : "bg-status-success-bg text-brand";

          return (
            <div
              key={check.id}
              className={`rounded-card border p-3.5 shadow-subtle ${borderClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-control ${badgeClass}`}
                  >
                    {isError ? (
                      <AlertCircle size={13} />
                    ) : isWarn ? (
                      <AlertTriangle size={13} />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
                      {check.category}
                    </p>
                    <h3 className="mt-0.5 text-xs font-semibold text-text-primary">
                      {check.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {check.explanation}
                    </p>
                    {check.severity !== "pass" && (
                      <p className="mt-1.5 text-xs leading-relaxed text-text-primary">
                        <span className="font-semibold">How to fix: </span>
                        {check.howToFix}
                      </p>
                    )}
                  </div>
                </div>

                {check.section && check.severity !== "pass" && (
                  <button
                    type="button"
                    onClick={() => onJumpToSection(check.section!)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-1 text-[11px] font-medium text-brand transition-colors hover:border-brand hover:bg-brand-soft"
                  >
                    <span>Fix</span>
                    <ArrowRight size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

