"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Share2,
  Wallet,
} from "lucide-react";

import ApplyModal from "./ApplyModal";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  description: string;
  applicantCountry?: string;
  validThrough?: string;
  employmentType?: string;
};

type JobDetailsClientProps = {
  job: Job;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function normalizeUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );

    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to document.execCommand for older browsers.
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  textarea.setAttribute("readonly", "");

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

function ActionButton({
  children,
  href,
  onClick,
  primary = false,
  external = false,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
  external?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const classes = [
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-control px-4 py-2",
    "text-xs font-semibold transition-colors duration-normal ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    primary
      ? "bg-brand text-text-inverse shadow-subtle hover:bg-brand-hover"
      : "border border-border-default bg-surface-card text-text-primary hover:bg-surface-subtle",
    disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "",
    className,
  ].join(" ");

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

function DetailItem({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 py-1 text-sm text-text-secondary">
      <Icon
        size={17}
        strokeWidth={1.7}
        className="shrink-0 text-brand"
        aria-hidden="true"
      />
      <span className="break-words">{value}</span>
    </div>
  );
}

export default function JobDetailsClient({ job }: JobDetailsClientProps) {
  const reduceMotion = useReducedMotion();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const description = job.description?.trim() || "";

  const companyUrl = useMemo(
    () => normalizeUrl(job.companyLink),
    [job.companyLink],
  );

  const postedDate = useMemo(
    () => formatDate(job.postedDate),
    [job.postedDate],
  );

  const isFullyRemote = /^(fully\s+)?remote$/i.test(
    (job.location || "").trim(),
  );

  const showToast = (message: string) => {
    setToast(message);

    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const shareJob = async () => {
    const url = window.location.href;

    const shareText = [
      job.title,
      `Company: ${job.company}`,
      `Location: ${job.location || "Not specified"}`,
      `Experience: ${job.experience || "Not specified"}`,
      "",
      description.slice(0, 180),
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: shareText,
          url,
        });
      } catch {
        // The user may cancel sharing.
      }
      return;
    }

    const copied = await copyText(`${shareText}\n\n${url}`);

    showToast(
      copied
        ? "Job details copied to clipboard"
        : "Couldn't copy the job details",
    );
  };

  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: EASE, delay },
        };

  const schema = useMemo(() => {
    if (
      !job.title?.trim() ||
      !job.company?.trim() ||
      !description ||
      !job.postedDate ||
      !job.mail?.trim()
    ) {
      return null;
    }

    const parsedPostedDate = new Date(job.postedDate);
    if (Number.isNaN(parsedPostedDate.getTime())) return null;

    const optionalExpiry = job.validThrough ? new Date(job.validThrough) : null;

    if (optionalExpiry && Number.isNaN(optionalExpiry.getTime())) return null;
    if (optionalExpiry && optionalExpiry.getTime() < Date.now()) return null;

    const locationParts = (job.location || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const allowedEmploymentTypes = new Set([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACTOR",
      "TEMPORARY",
      "INTERN",
      "VOLUNTEER",
      "PER_DIEM",
      "OTHER",
    ]);

    const employmentType = job.employmentType?.trim().toUpperCase();

    const baseSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description,
      datePosted: parsedPostedDate.toISOString().split("T")[0],
      ...(optionalExpiry
        ? { validThrough: optionalExpiry.toISOString().split("T")[0] }
        : {}),
      ...(employmentType && allowedEmploymentTypes.has(employmentType)
        ? { employmentType }
        : {}),
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
        ...(companyUrl ? { sameAs: companyUrl } : {}),
      },
    };

    if (isFullyRemote) {
      if (!job.applicantCountry?.trim()) return null;

      return {
        ...baseSchema,
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: {
          "@type": "Country",
          name: job.applicantCountry.trim(),
        },
      };
    }

    if (!locationParts.length) return null;

    return {
      ...baseSchema,
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: locationParts[0],
          ...(locationParts[1] ? { addressRegion: locationParts[1] } : {}),
          addressCountry: "IN",
        },
      },
    };
  }, [
    job.title,
    job.company,
    job.postedDate,
    job.location,
    job.validThrough,
    job.employmentType,
    job.applicantCountry,
    job.mail,
    description,
    companyUrl,
    isFullyRemote,
  ]);

  return (
    <main className="min-h-screen bg-surface-base text-text-primary">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-panel border border-border-default bg-surface-card px-4 py-3 text-sm font-medium text-text-primary shadow-modal"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-[var(--container-max)] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:pt-14">
        <motion.nav
          {...rise()}
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-[13px]"
        >
          <Link
            href="/jobs"
            className="cursor-pointer font-medium text-text-muted transition-colors hover:text-brand"
          >
            All jobs
          </Link>

          <span aria-hidden="true" className="text-border-strong">
            /
          </span>

          <span className="font-medium text-brand">{job.company}</span>

          <span aria-hidden="true" className="text-border-strong">
            /
          </span>

          <span className="text-text-muted">Job opportunity</span>
        </motion.nav>

        <motion.header
          {...rise(0.04)}
          className="border-b border-border-subtle pb-6"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-text-primary sm:text-4xl lg:text-[42px]">
                {job.title}
              </h1>

              <p className=" text-base font-medium text-text-secondary">
                {job.company}
              </p>

              <section aria-label="Job information" className="mb-6 mt-6">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <DetailItem
                    icon={BriefcaseBusiness}
                    value={job.experience?.trim() || "Not specified"}
                  />
                  <DetailItem
                    icon={Wallet}
                    value={job.salary?.trim() || "Not disclosed"}
                  />
                  <DetailItem
                    icon={MapPin}
                    value={job.location?.trim() || "Not specified"}
                  />
                  <DetailItem
                    icon={CalendarDays}
                    value={postedDate || "Not specified"}
                  />
                  <DetailItem
                    icon={Clock3}
                    value={isFullyRemote ? "Remote" : "See location details"}
                  />
                </div>
              </section>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ActionButton onClick={shareJob}>
                <Share2 size={16} />
                Share
              </ActionButton>

              {job.mail?.trim() ? (
                <ActionButton
                  primary
                  onClick={() => setApplyOpen(true)}
                >
                  Apply now
                  <ArrowUpRight size={16} />
                </ActionButton>
              ) : (
                <ActionButton primary disabled>
                  Applications closed
                </ActionButton>
              )}
            </div>
          </div>
        </motion.header>

        <div className="">
          <motion.section {...rise(0.08)} className="min-w-0 max-w-4xl">
            <section aria-labelledby="about-role-heading">
              <h2
                id="about-role-heading"
                className="text-xl font-semibold tracking-tight text-text-primary"
              >
                About this role
              </h2>

              <div className="mt-4">
                {description ? (
                  <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-text-secondary">
                    {description}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-text-muted">
                    A detailed description for this position has not been
                    provided yet.
                  </p>
                )}
              </div>
              {companyUrl && (
                <div className="mt-5">
                  <ActionButton href={companyUrl} external>
                    <Globe size={16} />
                    Company website
                    <ArrowUpRight size={15} />
                  </ActionButton>
                </div>
              )}
            </section>
          </motion.section>
        </div>

        <footer className="mt-14 border-t border-border-subtle pt-6">
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-text-muted">
            <Link
              href="/about"
              className="cursor-pointer transition-colors hover:text-brand"
            >
              About
            </Link>

            <Link
              href="/privacy-policy"
              className="cursor-pointer transition-colors hover:text-brand"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="cursor-pointer transition-colors hover:text-brand"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="cursor-pointer transition-colors hover:text-brand"
            >
              Contact
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-text-muted">
            © {new Date().getFullYear()} Zenoway
          </p>
        </footer>
      </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        email={job.mail}
        jobTitle={job.title}
        company={job.company}
      />
    </main>
  );
}
