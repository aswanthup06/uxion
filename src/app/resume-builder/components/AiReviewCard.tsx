"use client";

import { useState } from "react";
import { AlertCircle, Check, Sparkles, X } from "lucide-react";

export type AiPendingSuggestion =
  | {
      type: "improve-summary";
      suggestedSummary: string;
      rationale: string;
    }
  | {
      type: "rewrite-bullets";
      experienceId: string;
      roleLabel: string;
      bullets: string[];
      note: string;
      contextPrompts?: string[];
    }
  | {
      type: "suggest-skills";
      suggestedSkills: string[];
      rationale: string;
    }
  | {
      type: "tailor-to-jd";
      summarySuggestion: string;
      experienceSuggestions: Array<{
        experienceId: string;
        roleLabel: string;
        suggestedBullets: string[];
      }>;
      alignmentNotes: string[];
      missingRequirementsToVerify: string[];
    };

interface AiReviewCardProps {
  suggestion: AiPendingSuggestion;
  onApplySummary: (summary: string) => void;
  onApplyExperienceBullets: (experienceId: string, bullets: string[]) => void;
  onApplySkills: (skills: string[]) => void;
  onDismiss: () => void;
}

export default function AiReviewCard({
  suggestion,
  onApplySummary,
  onApplyExperienceBullets,
  onApplySkills,
  onDismiss,
}: AiReviewCardProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() =>
    suggestion.type === "suggest-skills" ? suggestion.suggestedSkills : []
  );
  const [appliedExpIds, setAppliedExpIds] = useState<string[]>([]);
  const [summaryApplied, setSummaryApplied] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div
      role="region"
      aria-label="AI suggestion review"
      className="rounded-panel border border-border-strong bg-brand-soft/45 p-4 shadow-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-control bg-brand text-text-inverse">
            <Sparkles size={14} />
          </span>
          <div>
            <p className="text-xs font-semibold text-text-primary">
              {suggestion.type === "improve-summary" && "Suggested Professional Summary"}
              {suggestion.type === "rewrite-bullets" &&
                `Suggested Bullets · ${suggestion.roleLabel}`}
              {suggestion.type === "suggest-skills" &&
                "Skills Detected in Your Experience"}
              {suggestion.type === "tailor-to-jd" &&
                "Job Description Tailoring Suggestions"}
            </p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Review carefully before applying. Only accept wording that accurately
              reflects your real experience.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss AI suggestion"
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-control text-text-muted transition-colors hover:bg-surface-card hover:text-text-primary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Improve Summary */}
      {suggestion.type === "improve-summary" && (
        <div className="mt-3 space-y-3">
          <div className="rounded-control border border-border-default bg-surface-card p-3 text-xs leading-relaxed text-text-primary">
            {suggestion.suggestedSummary}
          </div>
          {suggestion.rationale && (
            <p className="text-[11px] text-text-secondary">{suggestion.rationale}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onApplySummary(suggestion.suggestedSummary);
                onDismiss();
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-3 text-xs font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
            >
              <Check size={13} />
              Apply summary
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-8 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-3 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Rewrite Bullets */}
      {suggestion.type === "rewrite-bullets" && (
        <div className="mt-3 space-y-3">
          <ul className="space-y-1.5 rounded-control border border-border-default bg-surface-card p-3 text-xs text-text-primary">
            {suggestion.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-brand">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {suggestion.note && (
            <p className="text-[11px] text-text-secondary">{suggestion.note}</p>
          )}
          {suggestion.contextPrompts && suggestion.contextPrompts.length > 0 && (
            <div className="rounded-control border border-border-subtle bg-surface-subtle/70 p-2.5 text-xs text-text-secondary">
              <p className="font-semibold text-text-primary text-[11px] mb-1">
                Optional context / metrics to consider adding:
              </p>
              <ul className="space-y-1 text-[11px]">
                {suggestion.contextPrompts.map((cp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-brand">💡</span>
                    <span>{cp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onApplyExperienceBullets(suggestion.experienceId, suggestion.bullets);
                onDismiss();
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-3 text-xs font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
            >
              <Check size={13} />
              Replace bullets with suggestion
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-8 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-3 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              Keep current bullets
            </button>
          </div>
        </div>
      )}

      {/* Suggest Skills */}
      {suggestion.type === "suggest-skills" && (
        <div className="mt-3 space-y-3">
          {suggestion.suggestedSkills.length === 0 ? (
            <p className="rounded-control border border-border-default bg-surface-card p-3 text-xs text-text-secondary">
              Your skills list already covers the key technologies and competencies
              found in your experience and projects.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {suggestion.suggestedSkills.map((skill) => {
                  const checked = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      aria-pressed={checked}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium transition-colors ${
                        checked
                          ? "border-brand bg-brand text-text-inverse"
                          : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong"
                      }`}
                    >
                      {checked && <Check size={11} />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
              {suggestion.rationale && (
                <p className="text-[11px] text-text-secondary">{suggestion.rationale}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={selectedSkills.length === 0}
                  onClick={() => {
                    onApplySkills(selectedSkills);
                    onDismiss();
                  }}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-3 text-xs font-semibold text-text-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={13} />
                  Add {selectedSkills.length} selected skill
                  {selectedSkills.length === 1 ? "" : "s"}
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex h-8 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-3 text-xs font-medium text-text-secondary hover:text-text-primary"
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tailor to JD */}
      {suggestion.type === "tailor-to-jd" && (
        <div className="mt-3 space-y-3">
          {suggestion.summarySuggestion && (
            <div className="rounded-control border border-border-default bg-surface-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  Tailored Summary Proposal
                </p>
                <button
                  type="button"
                  disabled={summaryApplied}
                  onClick={() => {
                    onApplySummary(suggestion.summarySuggestion);
                    setSummaryApplied(true);
                  }}
                  className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-control bg-brand px-2.5 text-[11px] font-semibold text-text-inverse transition-colors hover:bg-brand-hover disabled:bg-brand-soft disabled:text-brand"
                >
                  <Check size={12} />
                  {summaryApplied ? "Applied" : "Apply"}
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                {suggestion.summarySuggestion}
              </p>
            </div>
          )}

          {suggestion.experienceSuggestions.map((expItem) => {
            const isApplied = appliedExpIds.includes(expItem.experienceId);
            return (
              <div
                key={expItem.experienceId}
                className="rounded-control border border-border-default bg-surface-card p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-text-primary">
                    {expItem.roleLabel}
                  </p>
                  <button
                    type="button"
                    disabled={isApplied}
                    onClick={() => {
                      onApplyExperienceBullets(
                        expItem.experienceId,
                        expItem.suggestedBullets
                      );
                      setAppliedExpIds((prev) => [...prev, expItem.experienceId]);
                    }}
                    className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-control bg-brand px-2.5 text-[11px] font-semibold text-text-inverse transition-colors hover:bg-brand-hover disabled:bg-brand-soft disabled:text-brand"
                  >
                    <Check size={12} />
                    {isApplied ? "Applied" : "Apply bullets"}
                  </button>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                  {expItem.suggestedBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-brand">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {suggestion.alignmentNotes.length > 0 && (
            <div className="rounded-control border border-border-subtle bg-surface-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Alignment Notes
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-text-secondary">
                {suggestion.alignmentNotes.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestion.missingRequirementsToVerify.length > 0 && (
            <div className="rounded-control border border-status-warning-border bg-status-warning-bg p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-status-warning">
                <AlertCircle size={13} />
                Job requirements not currently evidenced in your resume
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                Only add these if you actually have hands-on experience with them:
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-text-primary">
                {suggestion.missingRequirementsToVerify.map((req, idx) => (
                  <li key={idx}>• {req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

