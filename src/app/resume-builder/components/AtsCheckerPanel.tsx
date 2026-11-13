"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  AtsAnalysisResult,
  AtsCheckAction,
  AtsCheckCategory,
} from "@/lib/resume/ats-checker";
import type { ResumeSectionKey } from "@/lib/resume/types";

interface AtsCheckerPanelProps {
  analysis: AtsAnalysisResult;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onJumpToSection: (section: "personal" | ResumeSectionKey) => void;
  onApplyCorrection?: (action: AtsCheckAction) => void;
  dismissedCheckIds?: Set<string>;
  onDismissCheck?: (checkId: string) => void;
  onUndismissCheck?: (checkId: string) => void;
  aiConfigured: boolean;
  aiLoading: boolean;
  onTailorWithAi: () => void;
}

type FilterCategory = "all" | AtsCheckCategory;

export default function AtsCheckerPanel({
  analysis,
  jobDescription,
  onJobDescriptionChange,
  onJumpToSection,
  onApplyCorrection,
  dismissedCheckIds = new Set(),
  onDismissCheck,
  onUndismissCheck,
  aiConfigured,
  aiLoading,
  onTailorWithAi,
}: AtsCheckerPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [showDismissed, setShowDismissed] = useState(false);

  const activeChecks = analysis.checks.filter(
    (c) => showDismissed || !dismissedCheckIds.has(c.id)
  );

  const filteredChecks = activeChecks
    .filter((c) => selectedCategory === "all" || c.category === selectedCategory)
    .sort((a, b) => {
      const order = { error: 0, warning: 1, pass: 2 };
      return order[a.severity] - order[b.severity];
    });

  const categories: FilterCategory[] = [
    "all",
    "Spelling & Grammar",
    "Experience & Impact",
    "Dates & Chronology",
    "Job Keywords",
    "Layout & Page Budget",
    "Contact Details",
    "Standard Sections",
  ];

  return (
    <div className="space-y-5">
      {/* 1. Recruiter Executive Scorecard */}
      <div className="rounded-panel border border-border-default bg-surface-card p-4 shadow-subtle sm:p-5">
        <div className="flex flex-col gap-3 border-b border-border-subtle pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary">
              Recruiter Review &amp; Quality Audit
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              ATS compatibility, clarity, date chronology, and achievement strength.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-pill border border-status-error-border bg-status-error-bg px-2.5 py-1 text-[11px] font-semibold text-status-error">
              <AlertCircle size={12} />
              {analysis.counts.errors} critical
            </span>
            <span className="inline-flex items-center gap-1 rounded-pill border border-status-warning-border bg-status-warning-bg px-2.5 py-1 text-[11px] font-semibold text-status-warning">
              <AlertTriangle size={12} />
              {analysis.counts.warnings} suggestions
            </span>
            <span className="inline-flex items-center gap-1 rounded-pill border border-status-success-border bg-status-success-bg px-2.5 py-1 text-[11px] font-semibold text-brand">
              <CheckCircle2 size={12} />
              {analysis.counts.passes} passed
            </span>
          </div>
        </div>

        {/* 4 Scorecard Pillars: Spacious 2-Column Responsive Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Pillar 1: Content Quality */}
          <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-base p-3.5 sm:p-4 transition-colors hover:border-border-strong">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                    <BookOpen size={13} />
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
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                {analysis.scorecard.contentQuality.summary}
              </p>
            </div>
          </div>

          {/* Pillar 2: Experience & Impact */}
          <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-base p-3.5 sm:p-4 transition-colors hover:border-border-strong">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                    <Briefcase size={13} />
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
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                {analysis.scorecard.experienceImpact.summary}
              </p>
            </div>
          </div>

          {/* Pillar 3: Job Description Match */}
          <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-base p-3.5 sm:p-4 transition-colors hover:border-border-strong">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                    <Target size={13} />
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
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                {analysis.scorecard.jobMatch.summary}
              </p>
            </div>
          </div>

          {/* Pillar 4: PDF Readiness */}
          <div className="flex flex-col justify-between rounded-card border border-border-default/80 bg-surface-base p-3.5 sm:p-4 transition-colors hover:border-border-strong">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-card text-brand">
                    <FileText size={13} />
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
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                {analysis.scorecard.pdfReadiness.summary}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex items-start gap-2.5 rounded-control border border-border-subtle bg-surface-subtle/70 p-3 text-[11px] leading-relaxed text-text-muted">
          <Info size={14} className="mt-0.5 shrink-0 text-brand" />
          <span>{analysis.disclaimer}</span>
        </div>
      </div>

      {/* 2. Target Job Description Matching */}
      <div className="rounded-panel border border-border-default bg-surface-card p-4 shadow-subtle sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <label
              htmlFor="target-job-description"
              className="block text-xs font-bold text-text-primary"
            >
              Target Job Description Matching
            </label>
            <p className="mt-0.5 text-xs text-text-muted">
              Paste a target job posting to compare required keywords, find missing terms, and view tailoring suggestions.
            </p>
          </div>

          {jobDescription.trim() && (
            <button
              type="button"
              onClick={() => onJobDescriptionChange("")}
              className="cursor-pointer text-xs font-semibold text-text-muted hover:text-text-primary"
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
          placeholder="Paste requirements, responsibilities, and qualifications from the target job posting..."
          className="mt-3 w-full resize-y rounded-control border border-border-default bg-surface-base px-3 py-2 text-xs leading-relaxed text-text-primary outline-none placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring"
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
              <span>Tailor bullets &amp; summary with Gemini AI</span>
            </button>
          )}
        </div>

        {/* Detailed Keyword Match Breakdown */}
        {analysis.keywordAnalysis.hasJobDescription && (
          <div className="mt-4 space-y-3.5 border-t border-border-subtle pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-text-primary">
                  Keyword Overlap: {analysis.keywordAnalysis.matchPercentage}%
                </span>
                <span className="ml-2 text-text-muted">
                  ({analysis.keywordAnalysis.matchedKeywords.length} of{" "}
                  {analysis.keywordAnalysis.extractedKeywords.length} detected terms)
                </span>
              </div>
              <span className="text-[11px] text-text-muted italic">
                {analysis.keywordAnalysis.matchScoreExplanation}
              </span>
            </div>

            {/* Matched Keywords */}
            {analysis.keywordAnalysis.matchedKeywords.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-brand">
                  ✓ Demonstrated in your resume ({analysis.keywordAnalysis.matchedKeywords.length})
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analysis.keywordAnalysis.matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-pill border border-status-success-border bg-status-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-brand"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transferable Skills */}
            {analysis.keywordAnalysis.transferableKeywords.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-text-primary">
                  ⇄ Transferable &amp; Related competencies (
                  {analysis.keywordAnalysis.transferableKeywords.length})
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analysis.keywordAnalysis.transferableKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-pill border border-border-strong bg-surface-subtle px-2.5 py-0.5 text-[11px] font-medium text-text-secondary"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Critical Keywords */}
            {analysis.keywordAnalysis.missingKeywords.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-status-warning">
                  ⚠ Not found in your resume (add only if genuinely practiced)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analysis.keywordAnalysis.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-pill border border-status-warning-border bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Needing Evidence */}
            {analysis.keywordAnalysis.skillsNeedingEvidence.length > 0 && (
              <div className="rounded-control border border-border-subtle bg-surface-subtle p-3">
                <p className="text-[11px] font-semibold text-text-primary">
                  Listed in skills but missing applied context in experience:
                </p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Recruiters prefer skills backed by a project or role bullet.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {analysis.keywordAnalysis.skillsNeedingEvidence.map((s) => (
                    <span
                      key={s}
                      className="rounded-pill border border-border-default bg-surface-card px-2 py-0.5 text-[10.5px] text-text-secondary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Recommendations */}
            {analysis.keywordAnalysis.sectionImprovementIdeas.length > 0 && (
              <div className="rounded-control border border-border-subtle bg-surface-card p-3">
                <p className="text-[11px] font-bold text-text-primary">
                  Recruiter Optimization Recommendations:
                </p>
                <ul className="mt-1.5 space-y-1 text-xs text-text-secondary">
                  {analysis.keywordAnalysis.sectionImprovementIdeas.map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-brand font-bold">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Filterable Actionable Findings List */}
      <div className="space-y-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 cursor-pointer rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-brand text-text-inverse shadow-2xs"
                    : "border border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                }`}
              >
                {cat === "all" ? `All (${activeChecks.length})` : cat}
              </button>
            ))}
          </div>

          {dismissedCheckIds.size > 0 && (
            <button
              type="button"
              onClick={() => setShowDismissed(!showDismissed)}
              className="shrink-0 cursor-pointer text-xs font-medium text-text-muted hover:text-text-primary"
            >
              {showDismissed
                ? `Hide dismissed (${dismissedCheckIds.size})`
                : `Show dismissed (${dismissedCheckIds.size})`}
            </button>
          )}
        </div>

        {filteredChecks.length === 0 ? (
          <div className="rounded-panel border border-border-default bg-surface-card p-6 text-center text-xs text-text-muted">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-brand" />
            <p className="font-semibold text-text-primary">No issues found in this category.</p>
            <p className="mt-1">Your resume content adheres to recruiter standards here.</p>
          </div>
        ) : (
          filteredChecks.map((check) => {
            const isDismissed = dismissedCheckIds.has(check.id);
            const isError = check.severity === "error";
            const isWarn = check.severity === "warning";

            const borderClass = isDismissed
              ? "border-border-subtle bg-surface-subtle/50 opacity-60"
              : isError
                ? "border-status-error-border bg-surface-card"
                : isWarn
                  ? "border-status-warning-border bg-surface-card"
                  : "border-status-success-border bg-surface-card";

            const badgeClass = isError
              ? "bg-status-error-bg text-status-error"
              : isWarn
                ? "bg-status-warning-bg text-status-warning"
                : "bg-status-success-bg text-brand";

            const hasActions = Boolean(
              (check.action && check.action.type === "replace-text" && onApplyCorrection && !isDismissed) ||
                (check.section && check.severity !== "pass") ||
                (onDismissCheck && onUndismissCheck && check.severity !== "pass")
            );

            return (
              <div
                key={check.id}
                className={`rounded-card border p-4 shadow-subtle transition-all ${borderClass}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-control ${badgeClass}`}
                  >
                    {isError ? (
                      <AlertCircle size={14} />
                    ) : isWarn ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                        {check.category}
                      </span>
                      {check.location && (
                        <>
                          <span className="text-xs text-border-strong">·</span>
                          <span className="text-[11px] font-medium text-brand">
                            {check.location}
                          </span>
                        </>
                      )}
                      {isDismissed && (
                        <span className="rounded-pill bg-surface-muted px-1.5 py-0.2 text-[10px] text-text-muted">
                          Dismissed
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 text-xs font-bold text-text-primary">
                      {check.title}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {check.explanation}
                    </p>

                    {check.whyItMatters && check.severity !== "pass" && (
                      <p className="mt-2 text-[11.5px] leading-relaxed text-text-muted">
                        <strong className="font-semibold text-text-secondary">
                          Why it matters to a recruiter:{" "}
                        </strong>
                        {check.whyItMatters}
                      </p>
                    )}

                    {check.suggestedCorrection && check.severity !== "pass" && (
                      <div className="mt-2.5 rounded-control border border-border-subtle bg-surface-subtle p-2.5 text-xs">
                        <span className="text-[10.5px] font-semibold uppercase text-text-muted">
                          Suggested correction:
                        </span>
                        <p className="mt-0.5 font-medium text-text-primary">
                          {check.suggestedCorrection}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions row: Placed at bottom for generous breathing room */}
                {hasActions && (
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle/70 pt-2.5">
                    {onDismissCheck && onUndismissCheck && check.severity !== "pass" && (
                      <button
                        type="button"
                        onClick={() =>
                          isDismissed
                            ? onUndismissCheck(check.id)
                            : onDismissCheck(check.id)
                        }
                        className="cursor-pointer px-2 py-1 text-[11px] text-text-muted hover:text-text-primary"
                      >
                        {isDismissed ? "Undo dismiss" : "Dismiss"}
                      </button>
                    )}

                    {check.section && check.severity !== "pass" && (
                      <button
                        type="button"
                        onClick={() => onJumpToSection(check.section!)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-brand hover:text-brand"
                      >
                        <span>Edit in Section</span>
                        <ArrowRight size={11} />
                      </button>
                    )}

                    {check.action && check.action.type === "replace-text" && onApplyCorrection && !isDismissed && (
                      <button
                        type="button"
                        onClick={() => onApplyCorrection(check.action!)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-control bg-brand px-3 py-1 text-xs font-semibold text-text-inverse shadow-2xs hover:bg-brand-hover"
                      >
                        <Check size={12} />
                        <span>Accept correction</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
