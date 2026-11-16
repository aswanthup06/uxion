
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  X,
  FileText,
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";
import Modal from "@/app/components/Modal";
import { Button } from "@/app/components/Button";

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
};

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Use the fallback below.
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);

  return copied;
}

export default function ApplyModal({
  open,
  onClose,
  email,
  jobId,
  jobTitle = "the role",
  company = "the hiring company",
}: ApplyModalProps) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);

  const subjectText = `Application for ${jobTitle} at ${company}`;

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  const handleCopyEmail = async () => {
    if (!email?.trim()) return;

    const copied = await copyText(email.trim());
    setEmailCopied(copied);

    if (copied) {
      if (jobId) {
        fetch("/api/jobs/copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: jobId }),
        }).catch(() => {});
      }
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleCopySubject = async () => {
    const copied = await copyText(subjectText);
    setSubjectCopied(copied);

    if (copied) {
      setTimeout(() => setSubjectCopied(false), 2000);
    }
  };

  const mailtoUrl = email?.trim()
    ? `mailto:${email.trim()}?subject=${encodeURIComponent(
        subjectText
      )}&body=${encodeURIComponent(
        `Hi Hiring Team,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}.\n\nPlease find my resume attached.\n\nBest regards,`
      )}`
    : "";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
      bodyClassName="p-5 sm:p-6"
      labelledBy="apply-modal-title"
    >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                  Apply for this role
                </p>

                <h2
                  id="apply-modal-title"
                  className="mt-1.5 text-xl font-semibold tracking-tight text-text-primary"
                >
                  Employer contact details
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Send your resume and introduction directly to the hiring team.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {email?.trim() ? (
                <div className="space-y-3">
                  {/* Employer email address */}
                  <div className="rounded-card border border-border-default bg-surface-subtle p-3.5">
                    <p className="text-xs font-medium text-text-muted">
                      Employer recruitment email
                    </p>

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Mail size={16} className="shrink-0 text-brand" />
                        <span className="min-w-0 flex-1 select-all break-all text-sm font-semibold text-text-primary">
                          {email.trim()}
                        </span>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyEmail}
                        aria-label="Copy contact email"
                        className="text-brand hover:bg-brand-soft"
                        leftIcon={emailCopied ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
                      >
                        {emailCopied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {/* Suggested subject line */}
                  <div className="rounded-card border border-border-default bg-surface-subtle p-3.5">
                    <p className="text-xs font-medium text-text-muted">
                      Suggested subject line
                    </p>

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-secondary">
                        {subjectText}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopySubject}
                        aria-label="Copy subject line"
                        className="text-brand hover:bg-brand-soft"
                        leftIcon={subjectCopied ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
                      >
                        {subjectCopied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {/* Primary button: Copy Email */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCopyEmail}
                    className="mt-1 w-full font-semibold"
                    leftIcon={emailCopied ? <Check size={16} /> : <Copy size={16} />}
                  >
                    {emailCopied ? "Email copied to clipboard!" : "Copy email address"}
                  </Button>

                  {/* Optional secondary mailto */}
                  <div className="text-center pt-1">
                    <a
                      href={mailtoUrl}
                      className="inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-brand underline decoration-border-default underline-offset-2 hover:decoration-brand"
                    >
                      <span>Or open in default mail app</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="rounded-panel bg-surface-subtle p-4 text-sm leading-6 text-text-secondary">
                  Application email is not available for this role.
                </p>
              )}
            </div>

            {/* Email guide recommendation */}
            <div className="mt-5 border-t border-border-subtle pt-4">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-brand" />
                  Need email tips?
                </span>
                <Link
                  href="/email"
                  onClick={onClose}
                  className="font-medium text-brand hover:underline inline-flex items-center gap-1"
                >
                  Read Email Guide <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            {/* Community link */}
            <div className="mt-4 border-t border-border-subtle pt-4">
              <Link
                href="/join"
                onClick={onClose}
                className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:bg-brand-soft"
              >
                <IoLogoWhatsapp
                  size={16}
                  className="text-brand"
                />
                Join Zenoway Community
                <ArrowUpRight size={14} />
              </Link>
            </div>
    </Modal>
  );
}
