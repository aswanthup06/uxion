
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
  applyUrl: string | null;
  email: string;
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
  applyUrl,
  email,
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

    const copied = await copyText(email);

    setEmailCopied(copied);
    setCopyMessage(
      copied ? "Email address copied" : "Couldn't copy email address",
    );

    if (copied) {
      setTimeout(() => setEmailCopied(false), 1800);
    }
  };

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
            className="relative z-10 my-auto w-full max-w-md rounded-2xl border border-[#E3EAE4] bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#176B4D]">
                  Application
                </p>

                <h2
                  id="apply-modal-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-[#19352A]"
                >
                  How would you like to apply?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#68776D]">
                  Choose an application method below.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#68776D] transition-colors hover:bg-[#F6F9F6] hover:text-[#19352A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#176B4D] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#12583F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-2"
                >
                  Continue to application
                  <ArrowUpRight size={16} />
                </a>
              )}

              {email?.trim() && (
                <div className="rounded-xl border border-[#E3EAE4] p-4">
                  <p className="text-sm font-medium text-[#19352A]">
                    Apply by email
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#68776D]">
                    Contact the hiring team using this email address.
                  </p>

                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F6F9F6] p-3">
                    <Mail
                      size={16}
                      className="shrink-0 text-[#176B4D]"
                    />

                    <span className="min-w-0 flex-1 break-all text-sm text-[#19352A]">
                      {email}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy contact email"
                      className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#176B4D] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D]"
                    >
                      {emailCopied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  {copyMessage && (
                    <p role="status" className="mt-2 text-xs text-[#176B4D]">
                      {copyMessage}
                    </p>
                  )}

                  <a
                    href={`mailto:${email}`}
                    className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDE6DE] px-4 py-2.5 text-sm font-medium text-[#19352A] transition-colors hover:bg-[#F6F9F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D]"
                  >
                    <Mail size={16} />
                    Open email app
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              )}

              {!applyUrl && !email?.trim() && (
                <p className="rounded-xl bg-[#F6F9F6] p-4 text-sm leading-6 text-[#68776D]">
                  Application instructions are not available for this role
                  yet. Please check back later.
                </p>
              )}
            </div>

            {/* Community link */}
            <div className="mt-6 border-t border-[#E8EDE8] pt-5">
              <h3 className="text-sm font-semibold text-[#19352A]">
                Stay connected
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#68776D]">
                Join the Zenoway community for more career opportunities.
              </p>

              <Link
                href="/join"
                onClick={onClose}
                className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDE6DE] px-4 py-2.5 text-sm font-medium text-[#19352A] transition-colors hover:bg-[#F6F9F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D]"
              >
                <IoLogoWhatsapp
                  size={17}
                  className="text-[#176B4D]"
                />
                Join the community
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-[#89958C]">
              Check the application instructions before submitting.
            </p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
