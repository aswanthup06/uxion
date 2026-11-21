"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  X,
  FileText,
  Lock,
  Unlock,
  MailCheck,
  ShieldCheck,
  Loader2,
  LogIn,
  AlertCircle,
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";
import toast from "react-hot-toast";
import Modal from "@/app/components/Modal";
import { Button } from "@/app/components/Button";
import { useAuth } from "@/context/AuthContext";

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  isInitialUnlocked?: boolean;
  onUnlocked?: (unmaskedEmail: string) => void;
};

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to document.execCommand
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

function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ApplyModal({
  open,
  onClose,
  email,
  jobId,
  jobTitle = "the role",
  company = "the hiring company",
  isInitialUnlocked = false,
  onUnlocked,
}: ApplyModalProps) {
  const { user } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isFreeMode = process.env.NEXT_PUBLIC_FREE_EMAIL_UNLOCK !== "false";

  const [unlockedState, setUnlockedState] = useState<boolean | null>(null);
  const [unlockedEmailState, setUnlockedEmailState] = useState<string | null>(null);
  const [prevJobId, setPrevJobId] = useState(jobId);

  if (jobId !== prevJobId) {
    setPrevJobId(jobId);
    setUnlockedState(null);
    setUnlockedEmailState(null);
  }

  const isUnlocked = unlockedState !== null ? unlockedState : isInitialUnlocked;
  const activeEmail = unlockedEmailState !== null ? unlockedEmailState : email;
  const [emailCopied, setEmailCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const subjectText = `Application for ${jobTitle} at ${company}`;

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [open]);

  const handleCopyEmail = async () => {
    if (!activeEmail?.trim()) return;

    const copied = await copyText(activeEmail.trim());
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

  const handleInitiateUnlock = async () => {
    if (!jobId) return;
    setPayError(null);
    setIsPaying(true);

    try {
      // 1. Request order creation (or direct free unlock if free launch mode is active)
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize unlock.");
      }

      // If already unlocked or unlocked via Free Launch Offer
      if ((orderData.alreadyUnlocked || orderData.isFree) && orderData.email) {
        setUnlockedEmailState(orderData.email);
        setUnlockedState(true);
        onUnlocked?.(orderData.email);
        toast.success(
          orderData.isFree
            ? "Recruitment email unlocked for free!"
            : "Email already unlocked!"
        );
        setIsPaying(false);
        return;
      }

      // 2. Ensure Razorpay client checkout script is loaded (only needed for paid mode)
      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load payment gateway. Please check your internet connection.");
      }

      // 3. Launch Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Zenoway",
        description: `Unlock Recruiter Email for ${company}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#087f50", // Zenoway brand green
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Verify payment on server
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobId,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            // 5. Success: reveal unmasked email
            setUnlockedEmailState(verifyData.email);
            setUnlockedState(true);
            onUnlocked?.(verifyData.email);
            toast.success("Recruitment email unlocked successfully!");
          } catch (verifyErr: unknown) {
            console.error("Verification error:", verifyErr);
            const msg = verifyErr instanceof Error ? verifyErr.message : "Failed to confirm payment.";
            setPayError(msg);
            toast.error(msg);
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      type RazorpayInstance = {
        open: () => void;
        on: (event: string, callback: (res: { error?: { description?: string } }) => void) => void;
      };
      const RazorpayConstructor = (
        window as unknown as {
          Razorpay: new (opts: unknown) => RazorpayInstance;
        }
      ).Razorpay;
      const razorpayInstance = new RazorpayConstructor(options);
      razorpayInstance.on("payment.failed", (response) => {
        setPayError(response.error?.description || "Payment was declined or cancelled.");
        setIsPaying(false);
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      console.error("Payment initiation error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred starting payment.";
      setPayError(msg);
      setIsPaying(false);
    }
  };

  const mailtoUrl = activeEmail?.trim()
    ? `mailto:${activeEmail.trim()}?subject=${encodeURIComponent(
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Apply for this role
            </p>
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-0.5 text-2xs font-semibold text-brand">
                <Unlock size={11} /> Unlocked
              </span>
            ) : isFreeMode ? (
              <span className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-0.5 text-2xs font-semibold text-brand">
                <Unlock size={11} /> Free Access
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-pill bg-amber-500/10 px-2 py-0.5 text-2xs font-medium text-amber-600 dark:text-amber-400">
                <Lock size={11} /> ₹5 to Unlock
              </span>
            )}
          </div>

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

      {payError && (
        <div className="mt-4 flex items-start gap-2.5 rounded-card border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{payError}</span>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Email Card */}
        <div className="rounded-card border border-border-default bg-surface-subtle p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-muted">
              Employer recruitment email
            </p>
            {!isUnlocked && (
              <span className="text-2xs font-medium text-text-muted flex items-center gap-1">
                <Lock size={12} className="text-amber-500" /> Hidden until unlocked
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Mail size={16} className="shrink-0 text-brand" />
              <span
                className={`min-w-0 flex-1 text-sm font-semibold ${
                  isUnlocked
                    ? "select-all break-all text-text-primary"
                    : "tracking-wider text-text-muted select-none filter blur-[1.5px]"
                }`}
              >
                {activeEmail || "******************"}
              </span>
            </div>

            {isUnlocked && (
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
            )}
          </div>
        </div>

        {/* LOCKED STATE PROMO & UNLOCK BUTTON */}
        {!isUnlocked && (
          <div className="rounded-panel border border-brand/20 bg-brand-soft/40 p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <MailCheck size={16} className="text-brand" />
                  Unlock Verified HR Email
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Get direct access to send your resume directly into {company}&apos;s recruitment inbox without job board delays.
                </p>
              </div>
              <div className="text-right shrink-0">
                {isFreeMode ? (
                  <>
                    <span className="text-lg font-bold text-brand">FREE</span>
                    <span className="block text-3xs font-medium text-brand uppercase tracking-wider">
                      Free Access
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-brand">₹5</span>
                    <span className="block text-3xs font-medium text-text-muted uppercase tracking-wider">
                      One-time
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-text-muted pt-1 border-t border-border-subtle/60">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-brand" /> Verified Email
              </span>
              <span>·</span>
              <span>{isFreeMode ? "Instant 1-click unlock" : "UPI / GPay / PhonePe / QR / Cards"}</span>
              <span>·</span>
              <span>Lifetime access on this opening</span>
            </div>

            {!user && !isFreeMode ? (
              <Link
                href={`/login?next=/jobs/${jobId || ""}`}
                onClick={onClose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover active:scale-[0.99]"
              >
                <LogIn size={15} />
                Sign in to Unlock for ₹5
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleInitiateUnlock}
                disabled={isPaying}
                className="w-full font-semibold"
                leftIcon={
                  isPaying ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Unlock size={16} />
                  )
                }
              >
                {isPaying
                  ? "Unlocking..."
                  : isFreeMode
                  ? "Unlock Employer Email (Free)"
                  : "Unlock with UPI / Pay ₹5"}
              </Button>
            )}
          </div>
        )}

        {/* UNLOCKED STATE ACTIONS */}
        {isUnlocked && (
          <div className="space-y-3">
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
              className="w-full font-semibold"
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
          <IoLogoWhatsapp size={16} className="text-brand" />
          Join Zenoway Community
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </Modal>
  );
}
