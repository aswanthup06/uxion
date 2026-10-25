
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
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
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
  jobTitle = "the role",
  company = "the hiring company",
}: ApplyModalProps) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

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

  useEffect(() => {
    if (!copyMessage) return;

    const timer = setTimeout(() => setCopyMessage(""), 2200);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const handleCopyEmail = async () => {
    if (!email?.trim()) return;

    const copied = await copyText(email.trim());

    setEmailCopied(copied);
    setCopyMessage(
      copied ? "Email address copied" : "Couldn't copy email address",
    );

    if (copied) {
      setTimeout(() => setEmailCopied(false), 1800);
    }
  };

  const mailtoUrl = email?.trim()
    ? `mailto:${email.trim()}?subject=${encodeURIComponent(
        `Application for ${jobTitle} at ${company}`
      )}&body=${encodeURIComponent(
        `Hi Hiring Team,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}.\n\nPlease find my resume attached.\n\nBest regards,`
      )}`
    : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close application details"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-[#10251B]/45 backdrop-blur-[2px]"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
            initial={
              reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 my-auto w-full max-w-md rounded-modal border border-border-default bg-surface-card p-5 shadow-modal sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand">
                  Application
                </p>

                <h2
                  id="apply-modal-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-text-primary"
                >
                  Apply by email
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Send your resume and introduction directly to the employer.
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

            <div className="mt-6 space-y-3">
              {email?.trim() ? (
                <div className="rounded-panel border border-border-default p-4">
                  <p className="text-sm font-medium text-text-primary">
                    Employer recruitment email
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Contact the hiring team using this address.
                  </p>

                  <div className="mt-3 flex items-center gap-2 rounded-control bg-surface-subtle p-3">
                    <Mail
                      size={16}
                      className="shrink-0 text-brand"
                    />

                    <span className="min-w-0 flex-1 break-all text-sm font-medium text-text-primary">
                      {email.trim()}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy contact email"
                      className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-control text-brand transition-colors hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      {emailCopied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  {copyMessage && (
                    <p role="status" className="mt-2 text-xs text-brand">
                      {copyMessage}
                    </p>
                  )}

                  <a
                    href={mailtoUrl}
                    className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Mail size={16} />
                    Open email client
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              ) : (
                <p className="rounded-panel bg-surface-subtle p-4 text-sm leading-6 text-text-secondary">
                  Application email is not available for this role.
                </p>
              )}
            </div>

            {/* Community link */}
            <div className="mt-6 border-t border-border-subtle pt-5">
              <h3 className="text-sm font-semibold text-text-primary">
                Stay connected
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Join the Zenoway community for more career opportunities.
              </p>

              <Link
                href="/join"
                onClick={onClose}
                className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <IoLogoWhatsapp
                  size={17}
                  className="text-brand"
                />
                Join the community
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-text-muted">
              Check the application instructions before submitting.
            </p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
