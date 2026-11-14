"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import type { ResumeData, ResumeSectionKey } from "@/lib/resume/types";
import type {
  AtsAnalysisResult,
  AtsCheckAction,
  AtsCheckItem,
} from "@/lib/resume/ats-checker";
import { applyAllAtsFixes } from "@/lib/resume/ats-checker";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
  proposedSummary?: string;
  proposedBullets?: {
    experienceId: string;
    roleLabel: string;
    bullets: string[];
  };
  metricPrompts?: string[];
  applied?: boolean;
}

interface AiSidekickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  onUpdateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  atsAnalysis: AtsAnalysisResult;
  onJumpToSection: (section: "personal" | ResumeSectionKey) => void;
  onApplyCorrection: (action: AtsCheckAction) => void;
  targetJobDescription: string;
  onJobDescriptionChange: (text: string) => void;
  aiConfigured: boolean;
  onOpenUploadModal?: () => void;
  onDownloadPdf?: () => void;
  isExportingPdf?: boolean;
}

type SidekickTab = "fixes" | "copilot" | "jobmatch";

export default function AiSidekickDrawer({
  isOpen,
  onClose,
  data,
  onUpdateResumeData,
  atsAnalysis,
  onJumpToSection,
  onApplyCorrection,
  targetJobDescription,
  onJobDescriptionChange,
  aiConfigured,
  onOpenUploadModal,
  onDownloadPdf,
  isExportingPdf = false,
}: AiSidekickDrawerProps) {
  const [tab, setTab] = useState<SidekickTab>("fixes");
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial-greeting",
      sender: "ai",
      text: "👋 Hi! I'm your AI Resume Co-Pilot. I can sharpen bullet points, tailor your experience to target jobs, and suggest measurable metrics—without making up fake facts.",
      timestamp: Date.now(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (tab === "copilot") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, tab]);

  // Identify all 1-click auto-fixable issues (typos, casing, redundant bullet marks)
  const autoFixableChecks = atsAnalysis.checks.filter(
    (c) =>
      c.canAutoFix &&
      c.action?.type === "replace-text" &&
      typeof c.action.replacementText === "string"
  );

  const nonFixableChecks = atsAnalysis.checks.filter(
    (c) => !c.canAutoFix || c.action?.type !== "replace-text"
  );

  // 1-Click Fix All (0 tokens, 100% free, 0ms)
  const handleFixAll = () => {
    const { updatedData, appliedCount } = applyAllAtsFixes(
      data,
      autoFixableChecks
    );
    if (appliedCount > 0) {
      onUpdateResumeData(() => updatedData);
    }
  };

  // Send instruction to AI Co-pilot
  const handleSendPrompt = async (promptText: string) => {
    const query = promptText.trim();
    if (!query || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/resume/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "copilot-chat",
          data,
          message: query,
          jobDescription: targetJobDescription,
        }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Could not get AI co-pilot response.");
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: json.reply || "I've reviewed your request and generated recommendations below:",
        timestamp: Date.now(),
        proposedSummary: json.proposedSummary,
        proposedBullets: json.proposedBullets,
        metricPrompts: json.metricPrompts,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : "Failed to communicate with AI co-pilot.";
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `⚠️ ${errorText}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplySummary = (messageId: string, summary: string) => {
    onUpdateResumeData((prev) => ({ ...prev, summary }));
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, applied: true } : msg))
    );
  };

  const handleApplyBullets = (
    messageId: string,
    experienceId: string,
    bullets: string[]
  ) => {
    onUpdateResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === experienceId ? { ...exp, bullets } : exp
      ),
    }));
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, applied: true } : msg))
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(chatInput);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="AI Recruiter Sidekick"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border-default bg-surface-card shadow-2xl transition-all duration-200 sm:w-[440px]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface-card px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-control bg-brand-soft text-brand">
            <Sparkles size={16} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-text-primary">
              AI Recruiter Sidekick
            </h2>
            <p className="text-[11px] text-text-muted">
              1-click instant fixes &amp; conversational co-pilot
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidekick drawer"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      {/* ATS Readiness Score & Direct Download Strip */}
      <div className="shrink-0 bg-surface-subtle border-b border-border-subtle px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-text-primary">ATS Readiness:</span>
          <span className="text-xs font-bold text-brand">{atsAnalysis.overallScore}%</span>
          <span className="text-[11px] text-text-muted truncate">({atsAnalysis.readinessLabel})</span>
        </div>
        {onDownloadPdf && (
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={onDownloadPdf}
            className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-2.5 text-[11px] font-semibold text-text-inverse hover:bg-brand-hover shadow-2xs transition-colors shrink-0 disabled:opacity-60"
          >
            {isExportingPdf ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Download size={11} />
            )}
            <span>{isExportingPdf ? "Exporting..." : "Download PDF"}</span>
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex shrink-0 border-b border-border-subtle bg-surface-subtle px-2 pt-1.5">
        <button
          type="button"
          onClick={() => setTab("fixes")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 py-2 text-xs font-semibold transition-colors ${
            tab === "fixes"
              ? "border-brand bg-surface-card text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Zap size={13} />
          <span>Quick Fixes</span>
          {autoFixableChecks.length > 0 && (
            <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
              {autoFixableChecks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("copilot")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 py-2 text-xs font-semibold transition-colors ${
            tab === "copilot"
              ? "border-brand bg-surface-card text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <MessageSquare size={13} />
          <span>Co-Pilot Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("jobmatch")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 py-2 text-xs font-semibold transition-colors ${
            tab === "jobmatch"
              ? "border-brand bg-surface-card text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Target size={13} />
          <span>JD Match</span>
          {atsAnalysis.keywordAnalysis.hasJobDescription && (
            <span className="rounded-pill bg-surface-card px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
              {atsAnalysis.keywordAnalysis.matchPercentage}%
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Instant Quick Fixes (0 tokens, 100% free) */}
      {tab === "fixes" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
          {/* Hero 1-Click Fix Banner */}
          {autoFixableChecks.length > 0 ? (
            <div className="rounded-card border border-brand/40 bg-brand-soft/50 p-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-control bg-brand text-text-inverse">
                    <Zap size={13} />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">
                      {autoFixableChecks.length} 1-Click Fix{autoFixableChecks.length > 1 ? "es" : ""} Ready
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                      Instant correction for typos, brand casing (e.g. JavaScript, Next.js), and duplicate bullet symbols.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-brand/20 pt-2.5">
                <span className="text-[10px] font-medium text-brand">
                  Free · 0 tokens · Instant
                </span>
                <button
                  type="button"
                  onClick={handleFixAll}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-3 py-1.5 text-xs font-semibold text-text-inverse shadow-subtle hover:bg-brand-hover transition-colors"
                >
                  <Check size={13} />
                  <span>Fix All {autoFixableChecks.length} Issue{autoFixableChecks.length > 1 ? "s" : ""}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-card border border-status-success-border bg-status-success-bg p-3.5 text-center">
              <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-status-success-bg text-brand">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="mt-2 text-xs font-bold text-text-primary">
                Spelling &amp; Formatting Clean!
              </h3>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                No typos, brand casing inconsistencies, or broken punctuation detected.
              </p>
            </div>
          )}

          {/* List of Fixable Issues */}
          {autoFixableChecks.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Detected Typos &amp; Casing ({autoFixableChecks.length})
              </p>
              {autoFixableChecks.map((check) => (
                <div
                  key={check.id}
                  className="rounded-control border border-border-default bg-surface-base p-2.5 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-semibold text-text-primary">
                      {check.title}
                    </span>
                    <span className="shrink-0 rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                      {check.location}
                    </span>
                  </div>

                  {check.suggestedCorrection && (
                    <div className="flex items-center gap-1.5 rounded bg-surface-subtle px-2 py-1 text-xs">
                      <span className="text-text-muted line-through truncate max-w-[120px]">
                        {check.action?.currentText || "Original"}
                      </span>
                      <ArrowRight size={11} className="shrink-0 text-text-muted" />
                      <span className="font-semibold text-brand truncate">
                        {check.suggestedCorrection}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => check.section && onJumpToSection(check.section)}
                      className="cursor-pointer text-[11px] text-text-muted hover:text-text-primary"
                    >
                      Locate
                    </button>
                    {check.action && (
                      <button
                        type="button"
                        onClick={() => onApplyCorrection(check.action!)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded bg-brand px-2 py-0.5 text-[11px] font-semibold text-text-inverse hover:bg-brand-hover"
                      >
                        <Check size={11} />
                        <span>Apply</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Recruiter Guidelines */}
          {nonFixableChecks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Recruiter Recommendations ({nonFixableChecks.length})
              </p>
              {nonFixableChecks.slice(0, 5).map((check) => (
                <div
                  key={check.id}
                  className="rounded-control border border-border-default bg-surface-subtle/50 p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text-primary">
                      {check.title}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        check.severity === "error"
                          ? "bg-status-error-bg text-status-error"
                          : "bg-status-warning-bg text-status-warning"
                      }`}
                    >
                      {check.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {check.howToFix || check.explanation}
                  </p>
                  {check.section && (
                    <button
                      type="button"
                      onClick={() => onJumpToSection(check.section!)}
                      className="cursor-pointer font-medium text-[11px] text-brand underline hover:no-underline"
                    >
                      Jump to {check.section}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Co-Pilot Chat & Targeted Fixes */}
      {tab === "copilot" && (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Quick Prompt Chips */}
          <div className="shrink-0 border-b border-border-subtle bg-surface-subtle px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Suggested prompts
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[
                "✨ Make summary punchier",
                "💼 Polish latest job bullets",
                "📊 Suggest metrics to highlight",
                "🎯 Tailor to target role",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleSendPrompt(chip.replace(/^[^\w]+/, "").trim())}
                  className="cursor-pointer rounded-pill border border-border-default bg-surface-card px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-card px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-brand text-text-inverse font-medium"
                      : "border border-border-default bg-surface-subtle text-text-primary"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Proposed Summary Diff Card */}
                {msg.proposedSummary && (
                  <div className="mt-2 w-full rounded-control border border-border-strong bg-surface-base p-3 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-primary">
                        Suggested Professional Summary:
                      </span>
                      {msg.applied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand">
                          <Check size={12} /> Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplySummary(msg.id, msg.proposedSummary!)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded bg-brand px-2.5 py-1 text-[11px] font-semibold text-text-inverse hover:bg-brand-hover shadow-subtle"
                        >
                          <Check size={12} /> Apply to Resume
                        </button>
                      )}
                    </div>
                    <p className="text-xs italic text-text-secondary leading-relaxed bg-surface-subtle p-2 rounded">
                      &ldquo;{msg.proposedSummary}&rdquo;
                    </p>
                  </div>
                )}

                {/* Proposed Bullets Diff Card */}
                {msg.proposedBullets && (
                  <div className="mt-2 w-full rounded-control border border-border-strong bg-surface-base p-3 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-primary">
                        Suggested Bullets ({msg.proposedBullets.roleLabel}):
                      </span>
                      {msg.applied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand">
                          <Check size={12} /> Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleApplyBullets(
                              msg.id,
                              msg.proposedBullets!.experienceId,
                              msg.proposedBullets!.bullets
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded bg-brand px-2.5 py-1 text-[11px] font-semibold text-text-inverse hover:bg-brand-hover shadow-subtle"
                        >
                          <Check size={12} /> Apply to Resume
                        </button>
                      )}
                    </div>
                    <ul className="space-y-1.5 text-xs text-text-primary bg-surface-subtle p-2 rounded">
                      {msg.proposedBullets.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-brand font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metric Prompts if requested */}
                {msg.metricPrompts && msg.metricPrompts.length > 0 && (
                  <div className="mt-2 w-full rounded-control border border-border-subtle bg-brand-soft/30 p-2.5 text-xs space-y-1">
                    <p className="font-semibold text-brand text-[11px]">
                      💡 Optional metrics you could include:
                    </p>
                    <ul className="space-y-1 text-[11px] text-text-secondary">
                      {msg.metricPrompts.map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Loader2 size={14} className="animate-spin text-brand" />
                <span>Thinking &amp; reviewing facts...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="shrink-0 border-t border-border-subtle bg-surface-card p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask co-pilot to polish bullets, add metrics..."
                disabled={isAiLoading}
                className="min-w-0 flex-1 rounded-control border border-border-default bg-surface-base px-3 py-2 text-xs text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
              <button
                type="button"
                disabled={!chatInput.trim() || isAiLoading}
                onClick={() => handleSendPrompt(chatInput)}
                aria-label="Send prompt"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-control bg-brand text-text-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAiLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-text-muted text-center">
              Micro-targeted context (~150 tokens) · Factual accuracy preserved
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Target Job Description Match */}
      {tab === "jobmatch" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="sidekick-jd-input"
              className="text-xs font-semibold text-text-primary"
            >
              Paste Target Job Description
            </label>
            <textarea
              id="sidekick-jd-input"
              rows={5}
              value={targetJobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste requirements, responsibilities, or keywords from the job posting..."
              className="w-full rounded-control border border-border-default bg-surface-base p-2.5 text-xs text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          {targetJobDescription.trim() ? (
            <div className="space-y-3">
              {/* Match Score Card */}
              <div className="flex items-center justify-between rounded-card border border-border-default bg-surface-subtle p-3">
                <div>
                  <span className="text-[11px] font-semibold text-text-secondary">
                    Estimated Term Coverage
                  </span>
                  <p className="text-xl font-extrabold text-brand">
                    {atsAnalysis.keywordAnalysis.matchPercentage}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTab("copilot");
                    handleSendPrompt(
                      "Review my resume against this job description and suggest factual bullet point enhancements."
                    );
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-3 py-1.5 text-xs font-semibold text-text-inverse hover:bg-brand-hover shadow-subtle"
                >
                  <Wand2 size={12} />
                  <span>Tailor with AI</span>
                </button>
              </div>

              {/* Matched Keywords */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-text-primary">
                  Matched Skills &amp; Keywords ({atsAnalysis.keywordAnalysis.matchedKeywords.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.keywordAnalysis.matchedKeywords.slice(0, 15).map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-status-success-bg px-2 py-0.5 text-[11px] font-medium text-brand border border-status-success-border"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              {atsAnalysis.keywordAnalysis.missingKeywords.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-text-primary">
                    Missing Keywords to Consider ({atsAnalysis.keywordAnalysis.missingKeywords.length})
                  </p>
                  <p className="text-[10px] text-text-muted">
                    Only include if you have genuine experience with these technologies:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {atsAnalysis.keywordAnalysis.missingKeywords.slice(0, 12).map((kw) => (
                      <span
                        key={kw}
                        className="rounded bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-default"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic text-center py-4">
              Paste a job posting above to see matched keywords, missing terms, and tailored suggestions.
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
