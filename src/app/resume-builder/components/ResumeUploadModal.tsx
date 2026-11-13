"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Check,
  FileCheck2,
  FileCode,
  FileText,
  FileUp,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";
import Modal from "@/app/components/Modal";
import type { ResumeData } from "@/lib/resume/types";

interface ParsedResumePayload {
  data: ResumeData;
  detectedTitle: string;
  stats?: {
    hasSummary: boolean;
    experienceCount: number;
    educationCount: number;
    skillsCount: number;
    projectsCount: number;
    certificationsCount: number;
  };
}

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResume: (
    parsedData: ResumeData,
    detectedTitle?: string,
    mode?: "replace" | "merge"
  ) => void;
  hasExistingData: boolean;
}

type UploadTab = "file" | "paste";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".json"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatResumeUploadError(err: unknown): string {
  if (!err) return "Failed to process resume document.";
  const raw = err instanceof Error ? err.message : String(err);

  try {
    const parsed = JSON.parse(raw);
    if (parsed.error?.message) {
      if (
        parsed.error.code === 503 ||
        parsed.error.status === "UNAVAILABLE" ||
        parsed.error.message.toLowerCase().includes("high demand")
      ) {
        return "The AI service is temporarily experiencing high traffic from Google. Please wait a few seconds and try again, or paste your resume text.";
      }
      return parsed.error.message;
    }
    if (parsed.message) return parsed.message;
  } catch {
    // not JSON
  }

  if (raw.includes("503") || raw.toLowerCase().includes("high demand") || raw.includes("UNAVAILABLE")) {
    return "The AI service is temporarily experiencing high traffic from Google. Please wait a few seconds and try again, or paste your resume text.";
  }

  return raw;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return <FileText className="text-red-500" size={20} />;
  if (lower.endsWith(".docx")) return <FileText className="text-blue-500" size={20} />;
  if (lower.endsWith(".json")) return <FileCode className="text-amber-500" size={20} />;
  return <FileText className="text-brand" size={20} />;
}

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onApplyResume,
  hasExistingData,
}: ResumeUploadModalProps) {
  const [tab, setTab] = useState<UploadTab>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPayload, setParsedPayload] = useState<ParsedResumePayload | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setPastedText("");
    setIsProcessing(false);
    setProcessingStep("");
    setErrorMessage(null);
    setParsedPayload(null);
    setImportMode("replace");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetState();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size is too large (${formatFileSize(file.size)}). Maximum supported file size is 10 MB.`;
    }

    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      return "Unsupported file type. Please upload a PDF (.pdf), Word (.docx), plain text (.txt, .md), or JSON file.";
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setParsedPayload(null);
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleStartParsing = async () => {
    setErrorMessage(null);

    if (tab === "file" && !selectedFile) {
      setErrorMessage("Please select a resume file first.");
      return;
    }
    if (tab === "paste" && !pastedText.trim()) {
      setErrorMessage("Please paste your resume text before proceeding.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Reading resume document...");

    try {
      const formData = new FormData();
      if (tab === "file" && selectedFile) {
        formData.append("file", selectedFile);
        setProcessingStep(`Analyzing ${selectedFile.name}...`);
      } else {
        formData.append("text", pastedText.trim());
        setProcessingStep("Analyzing resume text...");
      }

      // Step transition message for smooth visual feedback
      const timer = setTimeout(() => {
        setProcessingStep("Extracting experience, education & skills into ATS structure...");
      }, 1800);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer);

      const json = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: ResumeData;
        detectedTitle?: string;
        stats?: ParsedResumePayload["stats"];
      };

      if (!response.ok || !json.success || !json.data) {
        throw new Error(
          json.error || "Could not parse this resume document. Please check the file or try pasting the text."
        );
      }

      setParsedPayload({
        data: json.data,
        detectedTitle: json.detectedTitle || "Imported Resume",
        stats: json.stats,
      });
    } catch (err) {
      const message = formatResumeUploadError(err);
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleConfirmApply = () => {
    if (!parsedPayload) return;
    onApplyResume(parsedPayload.data, parsedPayload.detectedTitle, importMode);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Existing Resume"
      description="Upload your current resume in PDF, Word, or text format. Our AI will automatically extract your contact information, work history, education, and skills into ATS format."
      maxWidth="lg"
      bodyClassName="p-5 sm:p-6"
    >
      <div className="space-y-5">
        {/* Step 1: Input / Upload Screen */}
        {!parsedPayload ? (
          <>
            {/* Format Tabs */}
            <div className="flex border-b border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setTab("file");
                  setErrorMessage(null);
                }}
                disabled={isProcessing}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === "file"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <FileUp size={14} />
                <span>Upload Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("paste");
                  setErrorMessage(null);
                }}
                disabled={isProcessing}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === "paste"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <FileText size={14} />
                <span>Paste Resume Text</span>
              </button>
            </div>

            {/* Tab: Upload File */}
            {tab === "file" && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,application/json"
                  onChange={handleInputChange}
                  className="hidden"
                  id="resume-file-upload-input"
                  disabled={isProcessing}
                />

                {!selectedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-8 text-center transition-colors ${
                      isDragging
                        ? "border-brand bg-brand-soft/50"
                        : "border-border-default bg-surface-subtle/50 hover:border-brand hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                      <Upload size={22} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-text-primary">
                      Drag & drop your resume here, or{" "}
                      <span className="text-brand underline">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Supports PDF (.pdf), Word (.docx), Plain Text (.txt, .md), and JSON up to 10 MB
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-text-secondary">
                      <span className="rounded bg-surface-card px-2 py-0.5 border border-border-default">
                        PDF
                      </span>
                      <span className="rounded bg-surface-card px-2 py-0.5 border border-border-default">
                        DOCX
                      </span>
                      <span className="rounded bg-surface-card px-2 py-0.5 border border-border-default">
                        TXT / MD
                      </span>
                      <span className="rounded bg-surface-card px-2 py-0.5 border border-border-default">
                        JSON
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-card border border-border-default bg-surface-card p-3.5 shadow-2xs">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-surface-subtle">
                        {getFileIcon(selectedFile.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      disabled={isProcessing}
                      aria-label="Remove file"
                      className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-text-muted hover:bg-surface-subtle hover:text-text-primary"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Paste Text */}
            {tab === "paste" && (
              <div className="space-y-2">
                <label
                  htmlFor="resume-paste-textarea"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-muted"
                >
                  Paste your resume text
                </label>
                <textarea
                  id="resume-paste-textarea"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume contents here (contact info, work experience, education, skills, projects)..."
                  rows={9}
                  disabled={isProcessing}
                  className="w-full rounded-control border border-border-default bg-surface-base p-3 text-xs leading-relaxed text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                <p className="text-[11px] text-text-muted">
                  Tip: Copy directly from Google Docs, Word, or LinkedIn summary/experience sections.
                </p>
              </div>
            )}

            {/* Import Mode Options (only shown if current draft has data) */}
            {hasExistingData && (
              <div className="rounded-card border border-border-default bg-surface-subtle p-3.5 space-y-2">
                <p className="text-xs font-semibold text-text-primary">
                  Import Destination
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-control border p-2.5 text-xs transition-colors ${
                      importMode === "replace"
                        ? "border-brand bg-brand-soft/60 font-semibold text-brand"
                        : "border-border-default bg-surface-card text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="import-mode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="accent-brand"
                    />
                    <span>Replace current draft</span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-control border p-2.5 text-xs transition-colors ${
                      importMode === "merge"
                        ? "border-brand bg-brand-soft/60 font-semibold text-brand"
                        : "border-border-default bg-surface-card text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="import-mode"
                      value="merge"
                      checked={importMode === "merge"}
                      onChange={() => setImportMode("merge")}
                      className="accent-brand"
                    />
                    <span>Merge / Append sections</span>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-control border border-status-error-border bg-status-error-bg p-3 text-xs text-status-error"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartParsing}
                  disabled={isProcessing}
                  className="shrink-0 inline-flex items-center gap-1 font-semibold underline hover:no-underline cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Try again</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="inline-flex h-9 cursor-pointer items-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartParsing}
                disabled={
                  isProcessing ||
                  (tab === "file" && !selectedFile) ||
                  (tab === "paste" && !pastedText.trim())
                }
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{processingStep || "Extracting resume..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Extract &amp; Auto-Fill</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Extraction Preview & Confirmation */
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-control border border-status-success-border bg-status-success-bg p-3 text-xs text-brand">
              <FileCheck2 size={18} className="shrink-0" />
              <span className="font-semibold">
                Resume successfully parsed! Review extracted details below before importing.
              </span>
            </div>

            {/* Summary Card */}
            <div className="rounded-card border border-border-default bg-surface-card p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">
                      {parsedPayload.data.personal.firstName}{" "}
                      {parsedPayload.data.personal.lastName}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {parsedPayload.data.personal.headline || "Candidate Profile"}
                      {parsedPayload.data.personal.city
                        ? ` · ${parsedPayload.data.personal.city}`
                        : ""}
                    </p>
                  </div>
                </div>

                <span className="rounded-control bg-surface-subtle px-2 py-1 text-[11px] font-medium text-text-muted">
                  {parsedPayload.detectedTitle}
                </span>
              </div>

              {/* Contact Snapshot */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                {parsedPayload.data.personal.email && (
                  <span>✉ {parsedPayload.data.personal.email}</span>
                )}
                {parsedPayload.data.personal.phone && (
                  <span>📞 {parsedPayload.data.personal.phone}</span>
                )}
                {parsedPayload.data.personal.links.length > 0 && (
                  <span>
                    🔗 {parsedPayload.data.personal.links.length} web{" "}
                    {parsedPayload.data.personal.links.length === 1 ? "link" : "links"}
                  </span>
                )}
              </div>

              {/* Extracted Sections Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
                <div className="rounded-control border border-border-subtle bg-surface-subtle p-2.5">
                  <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium uppercase">
                    <Briefcase size={12} className="text-brand" />
                    <span>Experience</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {parsedPayload.data.experience.length}{" "}
                    <span className="text-xs font-normal text-text-muted">
                      {parsedPayload.data.experience.length === 1 ? "role" : "roles"}
                    </span>
                  </p>
                </div>

                <div className="rounded-control border border-border-subtle bg-surface-subtle p-2.5">
                  <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium uppercase">
                    <GraduationCap size={12} className="text-brand" />
                    <span>Education</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {parsedPayload.data.education.length}{" "}
                    <span className="text-xs font-normal text-text-muted">
                      {parsedPayload.data.education.length === 1 ? "degree" : "degrees"}
                    </span>
                  </p>
                </div>

                <div className="rounded-control border border-border-subtle bg-surface-subtle p-2.5">
                  <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium uppercase">
                    <Wrench size={12} className="text-brand" />
                    <span>Skills</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {parsedPayload.data.skills.reduce((acc, g) => acc + g.items.length, 0)}{" "}
                    <span className="text-xs font-normal text-text-muted">skills</span>
                  </p>
                </div>

                <div className="rounded-control border border-border-subtle bg-surface-subtle p-2.5">
                  <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium uppercase">
                    <Sparkles size={12} className="text-brand" />
                    <span>Projects/Certs</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {parsedPayload.data.projects.length +
                      parsedPayload.data.certifications.length}{" "}
                    <span className="text-xs font-normal text-text-muted">items</span>
                  </p>
                </div>
              </div>

              {/* Summary Snippet if present */}
              {parsedPayload.data.summary && (
                <div className="border-t border-border-subtle pt-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Summary Preview
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                    {parsedPayload.data.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Destination Mode Reminder */}
            {hasExistingData && (
              <p className="text-xs text-text-secondary">
                Mode:{" "}
                <strong className="font-semibold text-text-primary">
                  {importMode === "replace"
                    ? "Replace current draft"
                    : "Merge with current draft"}
                </strong>
                . You can edit, add, or refine any section once imported.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setParsedPayload(null)}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
              >
                <RefreshCw size={13} />
                <span>Upload Another</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmApply}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Check size={14} />
                <span>Apply to Resume Builder</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

