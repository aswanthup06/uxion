"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  type ResumeCertificationItem,
  type ResumeData,
  type ResumeEducationItem,
  type ResumeExperienceItem,
  type ResumeOptionalSection,
  type ResumeProjectItem,
  type ResumeSectionKey,
  type ResumeSkillGroup,
  createBlankCertification,
  createBlankEducation,
  createBlankExperience,
  createBlankOptionalSection,
  createBlankProject,
  createBlankSkillGroup,
  createId,
} from "@/lib/resume/types";
import { formatResumeDate } from "@/lib/resume/validation";

const inputBase =
  "mt-1 w-full rounded-control border bg-surface-base px-3 py-2 text-xs text-text-primary outline-none transition-colors placeholder:text-text-muted focus:ring-4 focus:ring-focus-ring";

function inputClass(hasError?: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-status-error focus:border-status-error"
      : "border-border-default hover:border-border-strong focus:border-brand"
  }`;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const copy = [...items];
  const [moved] = copy.splice(index, 1);
  copy.splice(target, 0, moved);
  return copy;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-xs font-medium text-text-secondary">
        {label}
        {required && <span className="ml-0.5 text-status-error">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={inputClass(Boolean(error))}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-[11px] text-status-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[11px] text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function EntryControls({
  index,
  total,
  label,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  index: number;
  total: number;
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={onMoveUp}
        aria-label={`Move ${label} up`}
        title="Move up"
        className="grid h-7 w-7 cursor-pointer place-items-center rounded-control border border-border-default bg-surface-card text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp size={12} />
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={onMoveDown}
        aria-label={`Move ${label} down`}
        title="Move down"
        className="grid h-7 w-7 cursor-pointer place-items-center rounded-control border border-border-default bg-surface-card text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowDown size={12} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        title="Remove entry"
        className="grid h-7 w-7 cursor-pointer place-items-center rounded-control border border-border-default bg-surface-card text-text-muted transition-colors hover:border-status-error-border hover:bg-status-error-bg hover:text-status-error"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function SectionWrapper({
  id,
  title,
  description,
  badge,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
  children,
}: {
  id: string;
  title: string;
  description: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex?: number;
  sectionTotal?: number;
  onMoveSection?: (dir: -1 | 1) => void;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-4 rounded-panel border border-border-default bg-surface-card shadow-subtle"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
        >
          <ChevronDown
            size={15}
            className={`shrink-0 text-text-muted transition-transform duration-150 ${
              isOpen ? "" : "-rotate-90"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
              {badge && (
                <span className="rounded-pill bg-surface-subtle px-2 py-0.5 text-[10.5px] font-medium text-text-secondary">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-text-muted">{description}</p>
          </div>
        </button>

        {onMoveSection &&
          sectionIndex !== undefined &&
          sectionTotal !== undefined && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                disabled={sectionIndex === 0}
                onClick={() => onMoveSection(-1)}
                aria-label={`Move ${title} section up`}
                title="Move section up"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-control border border-border-subtle bg-surface-subtle text-text-muted transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                disabled={sectionIndex === sectionTotal - 1}
                onClick={() => onMoveSection(1)}
                aria-label={`Move ${title} section down`}
                title="Move section down"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-control border border-border-subtle bg-surface-subtle text-text-muted transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowDown size={12} />
              </button>
            </div>
          )}
      </div>

      {isOpen && (
        <div className="border-t border-border-subtle px-4 py-4 sm:px-5">{children}</div>
      )}
    </section>
  );
}

interface EditorProps {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
  errorsByKey: Record<string, string>;
  openSections: Record<string, boolean>;
  onToggleSection: (key: string) => void;
  aiConfigured: boolean;
  aiLoadingKey: string | null;
  onAiImproveSummary: () => void;
  onAiRewriteBullets: (experienceId: string) => void;
  onAiSuggestSkills: () => void;
}

export function PersonalSectionEditor({
  data,
  onChange,
  errorsByKey,
  isOpen,
  onToggle,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  errorsByKey: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { personal } = data;
  const setField = (
    field: "firstName" | "lastName" | "headline" | "email" | "phone" | "city",
    value: string
  ) => {
    onChange((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const addLink = (presetLabel = "") => {
    onChange((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        links: [
          ...prev.personal.links,
          { id: createId("lnk"), label: presetLabel, url: "" },
        ],
      },
    }));
  };

  const updateLink = (id: string, patch: { label?: string; url?: string }) => {
    onChange((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        links: prev.personal.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    }));
  };

  return (
    <SectionWrapper
      id="section-personal"
      title="Personal Details"
      description="Plain-text contact details parsed at the top of your resume."
      badge={
        personal.firstName.trim() && personal.lastName.trim() && personal.email.trim()
          ? "Ready"
          : "Required"
      }
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          id="personal-first-name"
          label="First name"
          value={personal.firstName}
          onChange={(v) => setField("firstName", v)}
          placeholder="First name"
          required
          error={errorsByKey["personal.firstName"]}
        />
        <Field
          id="personal-last-name"
          label="Last name"
          value={personal.lastName}
          onChange={(v) => setField("lastName", v)}
          placeholder="Last name"
          required
          error={errorsByKey["personal.lastName"]}
        />
        <div className="sm:col-span-2">
          <Field
            id="personal-headline"
            label="Target role / headline (optional)"
            value={personal.headline}
            onChange={(v) => setField("headline", v)}
            placeholder="e.g. Frontend Engineer · React & TypeScript"
          />
        </div>
        <Field
          id="personal-email"
          label="Email address"
          type="email"
          value={personal.email}
          onChange={(v) => setField("email", v)}
          placeholder="you@example.com"
          required
          error={errorsByKey["personal.email"]}
        />
        <Field
          id="personal-phone"
          label="Phone number"
          type="tel"
          value={personal.phone}
          onChange={(v) => setField("phone", v)}
          placeholder="+91 98765 43210"
          error={errorsByKey["personal.phone"]}
        />
        <div className="sm:col-span-2">
          <Field
            id="personal-city"
            label="City / location"
            value={personal.city}
            onChange={(v) => setField("city", v)}
            placeholder="e.g. Bengaluru, India"
          />
        </div>
      </div>

      {/* Professional Links */}
      <div className="mt-4 border-t border-border-subtle pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-text-primary">
            Professional Links
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["LinkedIn", "GitHub", "Portfolio"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addLink(preset)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
              >
                <Plus size={11} />
                {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => addLink("")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-card px-2 py-1 text-[11px] font-medium text-brand transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <Plus size={11} />
              Custom link
            </button>
          </div>
        </div>

        {personal.links.length > 0 && (
          <div className="mt-3 space-y-2.5">
            {personal.links.map((link, idx) => (
              <div
                key={link.id}
                className="rounded-card border border-border-default bg-surface-subtle/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-text-muted">
                    Link {idx + 1}
                  </span>
                  <EntryControls
                    index={idx}
                    total={personal.links.length}
                    label={link.label || `link ${idx + 1}`}
                    onMoveUp={() =>
                      onChange((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          links: moveItem(prev.personal.links, idx, -1),
                        },
                      }))
                    }
                    onMoveDown={() =>
                      onChange((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          links: moveItem(prev.personal.links, idx, 1),
                        },
                      }))
                    }
                    onRemove={() =>
                      onChange((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          links: prev.personal.links.filter((l) => l.id !== link.id),
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2.5 sm:grid-cols-[150px_1fr]">
                  <Field
                    id={`link-label-${link.id}`}
                    label="Label"
                    value={link.label}
                    onChange={(v) => updateLink(link.id, { label: v })}
                    placeholder="LinkedIn"
                    error={errorsByKey[`personal.links.${link.id}.label`]}
                  />
                  <Field
                    id={`link-url-${link.id}`}
                    label="URL"
                    type="url"
                    value={link.url}
                    onChange={(v) => updateLink(link.id, { url: v })}
                    placeholder="https://linkedin.com/in/username"
                    error={errorsByKey[`personal.links.${link.id}.url`]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

export function SummarySectionEditor({
  data,
  onChange,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
  aiConfigured,
  aiLoading,
  onAiImproveSummary,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
  aiConfigured: boolean;
  aiLoading: boolean;
  onAiImproveSummary: () => void;
}) {
  const words = data.summary.trim() ? data.summary.trim().split(/\s+/).length : 0;

  return (
    <SectionWrapper
      id="section-summary"
      title="Professional Summary"
      description="A concise 2–4 sentence overview of your background and focus."
      badge={data.summary.trim() ? `${words} words` : "Optional"}
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="resume-summary" className="text-xs font-medium text-text-secondary">
          Summary text
        </label>

        {aiConfigured && (
          <button
            type="button"
            disabled={aiLoading}
            onClick={onAiImproveSummary}
            className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-control border border-border-strong bg-brand-soft px-2.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand-soft-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            <span>Improve summary with AI</span>
          </button>
        )}
      </div>

      <textarea
        id="resume-summary"
        rows={4}
        maxLength={2500}
        value={data.summary}
        onChange={(e) =>
          onChange((prev) => ({
            ...prev,
            summary: e.target.value,
          }))
        }
        placeholder="Summarize your role, core skills, and the types of problems you solve..."
        className={`${inputClass(false)} resize-y leading-relaxed`}
      />
      <p className="mt-1 text-[11px] text-text-muted">
        Aim for 40–85 words. Leave blank if you prefer not to include a summary.
      </p>
    </SectionWrapper>
  );
}

export function ExperienceSectionEditor({
  data,
  onChange,
  errorsByKey,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
  aiConfigured,
  aiLoadingKey,
  onAiRewriteBullets,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  errorsByKey: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
  aiConfigured: boolean;
  aiLoadingKey: string | null;
  onAiRewriteBullets: (experienceId: string) => void;
}) {
  const updateExp = (id: string, patch: Partial<ResumeExperienceItem>) => {
    onChange((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  return (
    <SectionWrapper
      id="section-experience"
      title="Work Experience"
      description="Add roles in reverse-chronological order with achievement bullets."
      badge={
        data.experience.length > 0
          ? `${data.experience.length} ${data.experience.length === 1 ? "role" : "roles"}`
          : "Optional for freshers"
      }
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="space-y-4">
        {data.experience.length === 0 ? (
          <p className="rounded-card border border-dashed border-border-default bg-surface-subtle p-4 text-xs text-text-muted">
            No work experience added yet. If you have internships, freelance, or full-time
            roles, add them below—or leave this section empty if you prefer to highlight
            Education and Projects.
          </p>
        ) : (
          data.experience.map((exp, idx) => {
            const label =
              exp.jobTitle.trim() || exp.company.trim() || `Experience ${idx + 1}`;
            const isAiLoading = aiLoadingKey === `rewrite:${exp.id}`;

            return (
              <div
                key={exp.id}
                className="rounded-card border border-border-default bg-surface-subtle/40 p-3.5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-text-primary">
                    {idx + 1}. {label}
                  </p>
                  <EntryControls
                    index={idx}
                    total={data.experience.length}
                    label={label}
                    onMoveUp={() =>
                      onChange((prev) => ({
                        ...prev,
                        experience: moveItem(prev.experience, idx, -1),
                      }))
                    }
                    onMoveDown={() =>
                      onChange((prev) => ({
                        ...prev,
                        experience: moveItem(prev.experience, idx, 1),
                      }))
                    }
                    onRemove={() =>
                      onChange((prev) => ({
                        ...prev,
                        experience: prev.experience.filter((e) => e.id !== exp.id),
                      }))
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`exp-title-${exp.id}`}
                    label="Job title"
                    value={exp.jobTitle}
                    onChange={(v) => updateExp(exp.id, { jobTitle: v })}
                    placeholder="e.g. Frontend Developer"
                    required
                    error={errorsByKey[`experience.${exp.id}.jobTitle`]}
                  />
                  <Field
                    id={`exp-company-${exp.id}`}
                    label="Company"
                    value={exp.company}
                    onChange={(v) => updateExp(exp.id, { company: v })}
                    placeholder="e.g. Acme Technologies"
                    required
                    error={errorsByKey[`experience.${exp.id}.company`]}
                  />
                  <Field
                    id={`exp-location-${exp.id}`}
                    label="Location"
                    value={exp.location}
                    onChange={(v) => updateExp(exp.id, { location: v })}
                    placeholder="e.g. Bengaluru or Remote"
                  />
                  <div className="flex items-end pb-1">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-text-secondary">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) =>
                          updateExp(exp.id, {
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? "" : exp.endDate,
                          })
                        }
                        className="h-4 w-4 cursor-pointer accent-brand"
                      />
                      I currently work here
                    </label>
                  </div>
                  <Field
                    id={`exp-start-${exp.id}`}
                    label="Start date"
                    value={exp.startDate}
                    onChange={(v) => updateExp(exp.id, { startDate: v })}
                    placeholder="YYYY-MM (e.g. 2023-04)"
                    hint={
                      exp.startDate && !errorsByKey[`experience.${exp.id}.startDate`]
                        ? `Displays as: ${formatResumeDate(exp.startDate)}`
                        : "Use YYYY-MM or YYYY"
                    }
                    required
                    error={errorsByKey[`experience.${exp.id}.startDate`]}
                  />
                  {!exp.isCurrent && (
                    <Field
                      id={`exp-end-${exp.id}`}
                      label="End date"
                      value={exp.endDate}
                      onChange={(v) => updateExp(exp.id, { endDate: v })}
                      placeholder="YYYY-MM (e.g. 2025-10)"
                      hint={
                        exp.endDate && !errorsByKey[`experience.${exp.id}.endDate`]
                          ? `Displays as: ${formatResumeDate(exp.endDate)}`
                          : "Use YYYY-MM or YYYY"
                      }
                      required
                      error={errorsByKey[`experience.${exp.id}.endDate`]}
                    />
                  )}
                </div>

                {/* Bullets */}
                <div className="mt-3.5 border-t border-border-subtle pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-text-secondary">
                      Achievement bullet points
                    </span>
                    {aiConfigured && (
                      <button
                        type="button"
                        disabled={isAiLoading || !exp.bullets.some((b) => b.trim())}
                        onClick={() => onAiRewriteBullets(exp.id)}
                        className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-control border border-border-strong bg-brand-soft px-2.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand-soft-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isAiLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        <span>Rewrite bullets with AI</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-2 space-y-2">
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5">
                        <span className="mt-2.5 text-xs text-text-muted">•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const next = [...exp.bullets];
                            next[bIdx] = e.target.value;
                            updateExp(exp.id, { bullets: next });
                          }}
                          aria-label={`Bullet ${bIdx + 1} for ${label}`}
                          placeholder="Start with an action verb (e.g., Built..., Improved..., Designed...) and describe the outcome."
                          className="min-h-[38px] flex-1 resize-y rounded-control border border-border-default bg-surface-base px-2.5 py-1.5 text-xs leading-relaxed text-text-primary outline-none placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring"
                        />
                        <div className="flex flex-col gap-1 pt-0.5">
                          <button
                            type="button"
                            disabled={bIdx === 0}
                            onClick={() =>
                              updateExp(exp.id, {
                                bullets: moveItem(exp.bullets, bIdx, -1),
                              })
                            }
                            aria-label={`Move bullet ${bIdx + 1} up`}
                            className="grid h-6 w-6 cursor-pointer place-items-center rounded-control border border-border-default bg-surface-card text-text-muted hover:text-text-primary disabled:opacity-40"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={bIdx === exp.bullets.length - 1}
                            onClick={() =>
                              updateExp(exp.id, {
                                bullets: moveItem(exp.bullets, bIdx, 1),
                              })
                            }
                            aria-label={`Move bullet ${bIdx + 1} down`}
                            className="grid h-6 w-6 cursor-pointer place-items-center rounded-control border border-border-default bg-surface-card text-text-muted hover:text-text-primary disabled:opacity-40"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = exp.bullets.filter((_, i) => i !== bIdx);
                            updateExp(exp.id, {
                              bullets: next.length > 0 ? next : [""],
                            });
                          }}
                          aria-label={`Remove bullet ${bIdx + 1}`}
                          className="mt-0.5 grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-control text-text-muted hover:bg-status-error-bg hover:text-status-error"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateExp(exp.id, { bullets: [...exp.bullets, ""] })
                    }
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
                  >
                    <Plus size={13} />
                    Add bullet point
                  </button>
                </div>
              </div>
            );
          })
        )}

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              experience: [...prev.experience, createBlankExperience()],
            }))
          }
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <Plus size={14} />
          Add work experience
        </button>
      </div>
    </SectionWrapper>
  );
}

export function EducationSectionEditor({
  data,
  onChange,
  errorsByKey,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  errorsByKey: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
}) {
  const updateEdu = (id: string, patch: Partial<ResumeEducationItem>) => {
    onChange((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  return (
    <SectionWrapper
      id="section-education"
      title="Education"
      description="Degrees, diplomas, or relevant academic credentials."
      badge={
        data.education.length > 0
          ? `${data.education.length} ${data.education.length === 1 ? "entry" : "entries"}`
          : "Optional"
      }
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="space-y-4">
        {data.education.map((edu, idx) => {
          const label = edu.degree.trim() || edu.institution.trim() || `Education ${idx + 1}`;
          return (
            <div
              key={edu.id}
              className="rounded-card border border-border-default bg-surface-subtle/40 p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-text-primary">
                  {idx + 1}. {label}
                </p>
                <EntryControls
                  index={idx}
                  total={data.education.length}
                  label={label}
                  onMoveUp={() =>
                    onChange((prev) => ({
                      ...prev,
                      education: moveItem(prev.education, idx, -1),
                    }))
                  }
                  onMoveDown={() =>
                    onChange((prev) => ({
                      ...prev,
                      education: moveItem(prev.education, idx, 1),
                    }))
                  }
                  onRemove={() =>
                    onChange((prev) => ({
                      ...prev,
                      education: prev.education.filter((e) => e.id !== edu.id),
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id={`edu-degree-${edu.id}`}
                  label="Degree / qualification"
                  value={edu.degree}
                  onChange={(v) => updateEdu(edu.id, { degree: v })}
                  placeholder="e.g. B.Tech"
                  required
                  error={errorsByKey[`education.${edu.id}.degree`]}
                />
                <Field
                  id={`edu-field-${edu.id}`}
                  label="Field of study (optional)"
                  value={edu.fieldOfStudy}
                  onChange={(v) => updateEdu(edu.id, { fieldOfStudy: v })}
                  placeholder="e.g. Computer Science"
                />
                <Field
                  id={`edu-inst-${edu.id}`}
                  label="Institution"
                  value={edu.institution}
                  onChange={(v) => updateEdu(edu.id, { institution: v })}
                  placeholder="College or university name"
                  required
                  error={errorsByKey[`education.${edu.id}.institution`]}
                />
                <Field
                  id={`edu-loc-${edu.id}`}
                  label="Location (optional)"
                  value={edu.location}
                  onChange={(v) => updateEdu(edu.id, { location: v })}
                  placeholder="City, State"
                />
                <Field
                  id={`edu-start-${edu.id}`}
                  label="Start year or month"
                  value={edu.startDate}
                  onChange={(v) => updateEdu(edu.id, { startDate: v })}
                  placeholder="YYYY or YYYY-MM"
                  error={errorsByKey[`education.${edu.id}.startDate`]}
                />
                {!edu.isCurrent && (
                  <Field
                    id={`edu-end-${edu.id}`}
                    label="End / graduation year"
                    value={edu.endDate}
                    onChange={(v) => updateEdu(edu.id, { endDate: v })}
                    placeholder="YYYY or YYYY-MM"
                    error={errorsByKey[`education.${edu.id}.endDate`]}
                  />
                )}
                <Field
                  id={`edu-grade-${edu.id}`}
                  label="Grade / CGPA (optional)"
                  value={edu.grade}
                  onChange={(v) => updateEdu(edu.id, { grade: v })}
                  placeholder="e.g. 8.6 / 10"
                />
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-text-secondary">
                    <input
                      type="checkbox"
                      checked={edu.isCurrent}
                      onChange={(e) =>
                        updateEdu(edu.id, {
                          isCurrent: e.target.checked,
                          endDate: e.target.checked ? "" : edu.endDate,
                        })
                      }
                      className="h-4 w-4 cursor-pointer accent-brand"
                    />
                    Currently enrolled
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id={`edu-highlights-${edu.id}`}
                    label="Relevant coursework or notes (optional)"
                    value={edu.highlights}
                    onChange={(v) => updateEdu(edu.id, { highlights: v })}
                    placeholder="e.g. Data Structures, Human-Computer Interaction, Dean's List"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              education: [...prev.education, createBlankEducation()],
            }))
          }
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <Plus size={14} />
          Add education
        </button>
      </div>
    </SectionWrapper>
  );
}

export function SkillsSectionEditor({
  data,
  onChange,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
  aiConfigured,
  aiLoading,
  onAiSuggestSkills,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
  aiConfigured: boolean;
  aiLoading: boolean;
  onAiSuggestSkills: () => void;
}) {
  const [draftByGroup, setDraftByGroup] = useState<Record<string, string>>({});

  const totalSkills = data.skills.reduce((sum, g) => sum + g.items.length, 0);

  const updateGroup = (id: string, patch: Partial<ResumeSkillGroup>) => {
    onChange((prev) => ({
      ...prev,
      skills: prev.skills.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  };

  const addSkillsFromText = (groupId: string, rawText: string) => {
    const incoming = rawText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;

    onChange((prev) => ({
      ...prev,
      skills: prev.skills.map((g) => {
        if (g.id !== groupId) return g;
        const existingLower = new Set(g.items.map((x) => x.toLowerCase()));
        const unique = incoming.filter((item) => !existingLower.has(item.toLowerCase()));
        return { ...g, items: [...g.items, ...unique] };
      }),
    }));
    setDraftByGroup((prev) => ({ ...prev, [groupId]: "" }));
  };

  return (
    <SectionWrapper
      id="section-skills"
      title="Technical & Professional Skills"
      description="Plain-text skill categories with zero rating bars or charts."
      badge={totalSkills > 0 ? `${totalSkills} skills` : "Recommended"}
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="space-y-4">
        {aiConfigured && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border-subtle bg-surface-subtle px-3 py-2">
            <span className="text-[11px] text-text-secondary">
              Extract missing skills directly from your existing experience and projects.
            </span>
            <button
              type="button"
              disabled={aiLoading}
              onClick={onAiSuggestSkills}
              className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-control border border-border-strong bg-brand-soft px-2.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand-soft-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              <span>Suggest skills from experience</span>
            </button>
          </div>
        )}

        {data.skills.map((group, idx) => {
          const draft = draftByGroup[group.id] || "";
          return (
            <div
              key={group.id}
              className="rounded-card border border-border-default bg-surface-subtle/40 p-3.5"
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  {group.category.trim() || `Skill Group ${idx + 1}`}
                </p>
                <EntryControls
                  index={idx}
                  total={data.skills.length}
                  label={group.category || `skill group ${idx + 1}`}
                  onMoveUp={() =>
                    onChange((prev) => ({
                      ...prev,
                      skills: moveItem(prev.skills, idx, -1),
                    }))
                  }
                  onMoveDown={() =>
                    onChange((prev) => ({
                      ...prev,
                      skills: moveItem(prev.skills, idx, 1),
                    }))
                  }
                  onRemove={() =>
                    onChange((prev) => ({
                      ...prev,
                      skills: prev.skills.filter((g) => g.id !== group.id),
                    }))
                  }
                />
              </div>

              <Field
                id={`skill-cat-${group.id}`}
                label="Category label (optional)"
                value={group.category}
                onChange={(v) => updateGroup(group.id, { category: v })}
                placeholder="e.g. Languages & Frameworks, Design Tools, Cloud"
              />

              <div className="mt-3">
                <label
                  htmlFor={`skill-add-${group.id}`}
                  className="block text-xs font-medium text-text-secondary"
                >
                  Add skills (press Enter or comma)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id={`skill-add-${group.id}`}
                    type="text"
                    value={draft}
                    onChange={(e) =>
                      setDraftByGroup((prev) => ({
                        ...prev,
                        [group.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addSkillsFromText(group.id, draft);
                      }
                    }}
                    placeholder="Type skill(s) e.g. React, TypeScript, Figma"
                    className="h-9 min-w-0 flex-1 rounded-control border border-border-default bg-surface-base px-3 text-xs text-text-primary outline-none placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring"
                  />
                  <button
                    type="button"
                    onClick={() => addSkillsFromText(group.id, draft)}
                    className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-brand hover:border-brand hover:bg-brand-soft"
                  >
                    Add
                  </button>
                </div>

                {group.items.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 py-1 text-xs font-medium text-text-primary"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateGroup(group.id, {
                              items: group.items.filter((s) => s !== skill),
                            })
                          }
                          aria-label={`Remove ${skill}`}
                          className="cursor-pointer text-text-muted hover:text-status-error"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              skills: [...prev.skills, createBlankSkillGroup("")],
            }))
          }
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <Plus size={14} />
          Add skill group
        </button>
      </div>
    </SectionWrapper>
  );
}

export function ProjectsSectionEditor({
  data,
  onChange,
  errorsByKey,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  errorsByKey: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
}) {
  const updateProj = (id: string, patch: Partial<ResumeProjectItem>) => {
    onChange((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  return (
    <SectionWrapper
      id="section-projects"
      title="Projects"
      description="Selected engineering, design, or open-source projects with links."
      badge={
        data.projects.length > 0
          ? `${data.projects.length} ${data.projects.length === 1 ? "project" : "projects"}`
          : "Optional"
      }
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="space-y-4">
        {data.projects.map((proj, idx) => {
          const label = proj.name.trim() || `Project ${idx + 1}`;
          return (
            <div
              key={proj.id}
              className="rounded-card border border-border-default bg-surface-subtle/40 p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-text-primary">
                  {idx + 1}. {label}
                </p>
                <EntryControls
                  index={idx}
                  total={data.projects.length}
                  label={label}
                  onMoveUp={() =>
                    onChange((prev) => ({
                      ...prev,
                      projects: moveItem(prev.projects, idx, -1),
                    }))
                  }
                  onMoveDown={() =>
                    onChange((prev) => ({
                      ...prev,
                      projects: moveItem(prev.projects, idx, 1),
                    }))
                  }
                  onRemove={() =>
                    onChange((prev) => ({
                      ...prev,
                      projects: prev.projects.filter((p) => p.id !== proj.id),
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id={`proj-name-${proj.id}`}
                  label="Project name"
                  value={proj.name}
                  onChange={(v) => updateProj(proj.id, { name: v })}
                  placeholder="e.g. Design Token Compiler"
                  required
                  error={errorsByKey[`projects.${proj.id}.name`]}
                />
                <Field
                  id={`proj-role-${proj.id}`}
                  label="Role / stack tag (optional)"
                  value={proj.role}
                  onChange={(v) => updateProj(proj.id, { role: v })}
                  placeholder="e.g. Creator · TypeScript"
                />
                <div className="sm:col-span-2">
                  <Field
                    id={`proj-link-${proj.id}`}
                    label="Project URL (optional)"
                    type="url"
                    value={proj.link}
                    onChange={(v) => updateProj(proj.id, { link: v })}
                    placeholder="https://github.com/..."
                    error={errorsByKey[`projects.${proj.id}.link`]}
                  />
                </div>
                <Field
                  id={`proj-start-${proj.id}`}
                  label="Start date (optional)"
                  value={proj.startDate}
                  onChange={(v) => updateProj(proj.id, { startDate: v })}
                  placeholder="YYYY-MM or YYYY"
                  error={errorsByKey[`projects.${proj.id}.startDate`]}
                />
                <Field
                  id={`proj-end-${proj.id}`}
                  label="End date (optional)"
                  value={proj.endDate}
                  onChange={(v) => updateProj(proj.id, { endDate: v })}
                  placeholder="YYYY-MM or YYYY"
                  error={errorsByKey[`projects.${proj.id}.endDate`]}
                />
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`proj-desc-${proj.id}`}
                    className="block text-xs font-medium text-text-secondary"
                  >
                    Project description
                  </label>
                  <textarea
                    id={`proj-desc-${proj.id}`}
                    rows={3}
                    maxLength={1000}
                    value={proj.description}
                    onChange={(e) =>
                      updateProj(proj.id, { description: e.target.value })
                    }
                    placeholder="Describe what you built, technologies used, and measurable or user outcomes."
                    className={`${inputClass(false)} resize-y`}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              projects: [...prev.projects, createBlankProject()],
            }))
          }
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <Plus size={14} />
          Add project
        </button>
      </div>
    </SectionWrapper>
  );
}

export function CertificationsSectionEditor({
  data,
  onChange,
  errorsByKey,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  errorsByKey: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
}) {
  const updateCert = (id: string, patch: Partial<ResumeCertificationItem>) => {
    onChange((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  };

  return (
    <SectionWrapper
      id="section-certifications"
      title="Certifications"
      description="Industry credentials, licenses, or verified courses."
      badge={
        data.certifications.length > 0
          ? `${data.certifications.length}`
          : "Optional"
      }
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="space-y-4">
        {data.certifications.map((cert, idx) => {
          const label = cert.name.trim() || `Certification ${idx + 1}`;
          return (
            <div
              key={cert.id}
              className="rounded-card border border-border-default bg-surface-subtle/40 p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-text-primary">
                  {idx + 1}. {label}
                </p>
                <EntryControls
                  index={idx}
                  total={data.certifications.length}
                  label={label}
                  onMoveUp={() =>
                    onChange((prev) => ({
                      ...prev,
                      certifications: moveItem(prev.certifications, idx, -1),
                    }))
                  }
                  onMoveDown={() =>
                    onChange((prev) => ({
                      ...prev,
                      certifications: moveItem(prev.certifications, idx, 1),
                    }))
                  }
                  onRemove={() =>
                    onChange((prev) => ({
                      ...prev,
                      certifications: prev.certifications.filter((c) => c.id !== cert.id),
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id={`cert-name-${cert.id}`}
                  label="Certification name"
                  value={cert.name}
                  onChange={(v) => updateCert(cert.id, { name: v })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  required
                  error={errorsByKey[`certifications.${cert.id}.name`]}
                />
                <Field
                  id={`cert-issuer-${cert.id}`}
                  label="Issuing organization"
                  value={cert.issuer}
                  onChange={(v) => updateCert(cert.id, { issuer: v })}
                  placeholder="e.g. Amazon Web Services"
                />
                <Field
                  id={`cert-date-${cert.id}`}
                  label="Issue date (optional)"
                  value={cert.issueDate}
                  onChange={(v) => updateCert(cert.id, { issueDate: v })}
                  placeholder="YYYY-MM or YYYY"
                  error={errorsByKey[`certifications.${cert.id}.issueDate`]}
                />
                <Field
                  id={`cert-url-${cert.id}`}
                  label="Credential URL (optional)"
                  type="url"
                  value={cert.credentialUrl}
                  onChange={(v) => updateCert(cert.id, { credentialUrl: v })}
                  placeholder="https://..."
                  error={errorsByKey[`certifications.${cert.id}.credentialUrl`]}
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              certifications: [...prev.certifications, createBlankCertification()],
            }))
          }
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <Plus size={14} />
          Add certification
        </button>
      </div>
    </SectionWrapper>
  );
}

export function OptionalSectionsEditor({
  data,
  onChange,
  errorsByKey,
  isOpen,
  onToggle,
  sectionIndex,
  sectionTotal,
  onMoveSection,
}: {
  data: ResumeData;
  onChange: EditorProps["onChange"];
  errorsByKey: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  sectionIndex: number;
  sectionTotal: number;
  onMoveSection: (dir: -1 | 1) => void;
}) {
  const updateOpt = (id: string, patch: Partial<ResumeOptionalSection>) => {
    onChange((prev) => ({
      ...prev,
      optionalSections: prev.optionalSections.map((o) =>
        o.id === id ? { ...o, ...patch } : o
      ),
    }));
  };

  const addSection = (title = "") => {
    onChange((prev) => ({
      ...prev,
      optionalSections: [...prev.optionalSections, createBlankOptionalSection(title)],
    }));
  };

  return (
    <SectionWrapper
      id="section-optional"
      title="Additional Sections"
      description="Optional sections such as Languages, Awards, Publications, or Volunteering."
      badge={
        data.optionalSections.length > 0
          ? `${data.optionalSections.length}`
          : "Optional"
      }
      isOpen={isOpen}
      onToggle={onToggle}
      sectionIndex={sectionIndex}
      sectionTotal={sectionTotal}
      onMoveSection={onMoveSection}
    >
      <div className="space-y-4">
        {data.optionalSections.map((sec, idx) => {
          const label = sec.title.trim() || `Section ${idx + 1}`;
          return (
            <div
              key={sec.id}
              className="rounded-card border border-border-default bg-surface-subtle/40 p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-text-primary">
                  {idx + 1}. {label}
                </p>
                <EntryControls
                  index={idx}
                  total={data.optionalSections.length}
                  label={label}
                  onMoveUp={() =>
                    onChange((prev) => ({
                      ...prev,
                      optionalSections: moveItem(prev.optionalSections, idx, -1),
                    }))
                  }
                  onMoveDown={() =>
                    onChange((prev) => ({
                      ...prev,
                      optionalSections: moveItem(prev.optionalSections, idx, 1),
                    }))
                  }
                  onRemove={() =>
                    onChange((prev) => ({
                      ...prev,
                      optionalSections: prev.optionalSections.filter((o) => o.id !== sec.id),
                    }))
                  }
                />
              </div>

              <Field
                id={`opt-title-${sec.id}`}
                label="Section heading"
                value={sec.title}
                onChange={(v) => updateOpt(sec.id, { title: v })}
                placeholder="e.g. Languages, Awards & Honors, Publications"
                required
                error={errorsByKey[`optional.${sec.id}.title`]}
              />

              <div className="mt-3 space-y-2">
                <span className="block text-xs font-medium text-text-secondary">
                  Items
                </span>
                {sec.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const next = [...sec.items];
                        next[iIdx] = e.target.value;
                        updateOpt(sec.id, { items: next });
                      }}
                      aria-label={`Item ${iIdx + 1} in ${label}`}
                      placeholder="e.g. English — Fluent; Hindi — Native"
                      className="h-9 min-w-0 flex-1 rounded-control border border-border-default bg-surface-base px-3 text-xs text-text-primary outline-none placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = sec.items.filter((_, k) => k !== iIdx);
                        updateOpt(sec.id, { items: next.length > 0 ? next : [""] });
                      }}
                      aria-label={`Remove item ${iIdx + 1}`}
                      className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-control text-text-muted hover:bg-status-error-bg hover:text-status-error"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateOpt(sec.id, { items: [...sec.items, ""] })}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
                >
                  <Plus size={13} />
                  Add item
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap items-center gap-2">
          {["Languages", "Awards & Honors", "Publications", "Volunteering"].map(
            (preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addSection(preset)}
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
              >
                <Plus size={12} />
                {preset}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => addSection("")}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
          >
            <Plus size={13} />
            Custom section
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}

export function OrderedSectionEditor({
  sectionKey,
  sectionIndex,
  onMoveSection,
  ...props
}: EditorProps & {
  sectionKey: ResumeSectionKey;
  sectionIndex: number;
  onMoveSection: (index: number, dir: -1 | 1) => void;
}) {
  const total = props.data.sectionOrder.length;
  const isOpen = props.openSections[sectionKey] ?? true;
  const onToggle = () => props.onToggleSection(sectionKey);
  const onMove = (dir: -1 | 1) => onMoveSection(sectionIndex, dir);

  switch (sectionKey) {
    case "summary":
      return (
        <SummarySectionEditor
          data={props.data}
          onChange={props.onChange}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
          aiConfigured={props.aiConfigured}
          aiLoading={props.aiLoadingKey === "improve-summary"}
          onAiImproveSummary={props.onAiImproveSummary}
        />
      );
    case "experience":
      return (
        <ExperienceSectionEditor
          data={props.data}
          onChange={props.onChange}
          errorsByKey={props.errorsByKey}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
          aiConfigured={props.aiConfigured}
          aiLoadingKey={props.aiLoadingKey}
          onAiRewriteBullets={props.onAiRewriteBullets}
        />
      );
    case "education":
      return (
        <EducationSectionEditor
          data={props.data}
          onChange={props.onChange}
          errorsByKey={props.errorsByKey}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
        />
      );
    case "skills":
      return (
        <SkillsSectionEditor
          data={props.data}
          onChange={props.onChange}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
          aiConfigured={props.aiConfigured}
          aiLoading={props.aiLoadingKey === "suggest-skills"}
          onAiSuggestSkills={props.onAiSuggestSkills}
        />
      );
    case "projects":
      return (
        <ProjectsSectionEditor
          data={props.data}
          onChange={props.onChange}
          errorsByKey={props.errorsByKey}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
        />
      );
    case "certifications":
      return (
        <CertificationsSectionEditor
          data={props.data}
          onChange={props.onChange}
          errorsByKey={props.errorsByKey}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
        />
      );
    case "optional":
      return (
        <OptionalSectionsEditor
          data={props.data}
          onChange={props.onChange}
          errorsByKey={props.errorsByKey}
          isOpen={isOpen}
          onToggle={onToggle}
          sectionIndex={sectionIndex}
          sectionTotal={total}
          onMoveSection={onMove}
        />
      );
  }
}

