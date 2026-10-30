"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Compass,
  ExternalLink,
  Globe,
  MapPin,
  Share2,
  Wallet,
} from "lucide-react";

import ApplyModal from "./ApplyModal";
import FormattedDescription from "@/app/components/jobs/FormattedDescription";
import { getJobCategory } from "@/app/components/jobs/jobs-utils";
import type { Job } from "@/app/types/job";
import {
  normalizeWorkMode,
  formatLocationLabel,
  COUNTRY_BY_CODE,
} from "@/lib/supabase/locations-data";

export type { Job };

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
    "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-control px-4 py-2",
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

  const workMode = normalizeWorkMode(job.workMode, job.location);
  const isRemote = workMode === "Remote";
  const isHybrid = workMode === "Hybrid";
  const locationLabel = formatLocationLabel(job);

  const locDetails = useMemo(() => {
    const raw = (job.location || "").trim();
    let officeText = raw;
    let preferenceNote = job.workModeNotes?.trim() || null;

    // Check parenthetical if not already in workModeNotes
    const parenMatch = raw.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      officeText = parenMatch[1].trim();
      if (!preferenceNote) {
        preferenceNote = parenMatch[2].trim();
      }
    }

    // For Remote jobs: Country-wide (All-India) or Worldwide jobs do not have regional state preferences
    if (
      workMode === "Remote" &&
      (job.remoteEligibilityType === "COUNTRIES" ||
        job.remoteEligibilityType === "WORLDWIDE" ||
        officeText.toLowerCase().includes("remote · india") ||
        officeText.toLowerCase().includes("remote · worldwide") ||
        officeText.toLowerCase() === "remote")
    ) {
      preferenceNote = null;
    }

    let officeCities: string[] = [];
    if (job.physicalLocations && job.physicalLocations.length > 0) {
      officeCities = job.physicalLocations
        .map((pl) => pl.city)
        .filter((c): c is string => Boolean(c));
    } else if (job.primaryCity) {
      officeCities = [job.primaryCity];
    } else if (workMode !== "Remote" && officeText) {
      officeCities = officeText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    let cleanLocationText = "";
    if (workMode === "Remote") {
      const elType = job.remoteEligibilityType?.toUpperCase();
      const geo = officeText.replace(/^remote\s*[·-]?\s*/i, "").trim();

      if (elType === "WORLDWIDE" || geo.toLowerCase().includes("worldwide")) {
        cleanLocationText = "Remote · Worldwide";
      } else if (
        elType === "COUNTRIES" ||
        geo.toLowerCase().includes("pan-india") ||
        geo.toLowerCase() === "india"
      ) {
        cleanLocationText = "Remote · Pan-India";
      } else if (elType === "REGIONS" && job.remoteEligibilityRegions && job.remoteEligibilityRegions.length > 0) {
        cleanLocationText = `Remote · ${job.remoteEligibilityRegions.map((r) => r.region).join(", ")}`;
      } else if (elType === "CITIES" && job.remoteEligibilityCities && job.remoteEligibilityCities.length > 0) {
        cleanLocationText = `Remote · ${job.remoteEligibilityCities.map((c) => c.city).join(", ")}`;
      } else if (geo && !geo.toLowerCase().includes("remote")) {
        cleanLocationText = `Remote · ${geo.replace(/india/i, "Pan-India")}`;
      } else {
        cleanLocationText = "Remote · Pan-India";
      }
    } else if (workMode === "Hybrid") {
      const geo = officeText.replace(/^hybrid\s*[·-]?\s*/i, "").trim();
      cleanLocationText = geo ? `Hybrid · ${geo}` : "Hybrid";
    } else {
      cleanLocationText = officeText || "On-site";
    }

    // Deduplicate candidate preference note (e.g. remove redundant "candidates preferred" or "(no relocation)")
    let formattedPreference: { label: string; text: string } | null = null;
    if (preferenceNote) {
      let trimmed = preferenceNote
        .trim()
        .replace(/\s*[-–—]?\s*\(no relocation\)/gi, "")
        .replace(/\s*\(no relocation\)/gi, "")
        .replace(/\s*no relocation/gi, "")
        .trim();

      const cleaned = trimmed
        .replace(/\s*candidates\s+preferred\.?$/i, "")
        .replace(/\s*candidates\s+only\.?$/i, "")
        .replace(/\s*preferred\.?$/i, "")
        .trim();

      const displayText = trimmed.toLowerCase().startsWith("local candidates")
        ? trimmed
        : cleaned && cleaned.toLowerCase() !== trimmed.toLowerCase()
        ? cleaned
        : trimmed;

      if (displayText) {
        formattedPreference = {
          label: "Location preference",
          text: displayText,
        };
      }
    }

    return {
      officeCities,
      preferenceNote,
      formattedPreference,
      cleanLocationText,
      displayLocation: officeText || locationLabel,
    };
  }, [
    job.location,
    job.workModeNotes,
    job.physicalLocations,
    job.remoteEligibilityType,
    job.primaryState,
    job.primaryCountry,
    workMode,
    locationLabel,
  ]);

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
      `Location: ${locationLabel}`,
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

    if (isRemote) {
      const eligibilityType = job.remoteEligibilityType?.toUpperCase();
      const countries =
        job.remoteEligibilityCountries && job.remoteEligibilityCountries.length > 0
          ? job.remoteEligibilityCountries
          : job.applicantCountry
            ? [job.applicantCountry]
            : ["IN"];

      if (eligibilityType === "WORLDWIDE") {
        return {
          ...baseSchema,
          jobLocationType: "TELECOMMUTE",
        };
      }

      if (eligibilityType === "REGIONS") {
        const regions = job.remoteEligibilityRegions;
        if (Array.isArray(regions) && regions.length > 1) {
          return {
            ...baseSchema,
            jobLocationType: "TELECOMMUTE",
            applicantLocationRequirements: regions.map((r) => ({
              "@type": "AdministrativeArea",
              name: r.region,
            })),
          };
        }
        const stateName =
          job.primaryState ||
          job.remoteEligibilityRegions?.[0]?.region;
        return {
          ...baseSchema,
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "AdministrativeArea",
            name: stateName || "India",
          },
        };
      }

      const applicantRequirements =
        countries.length === 1
          ? {
            "@type": "Country",
            name: COUNTRY_BY_CODE.get(countries[0]) || countries[0],
          }
          : countries.map((c) => ({
            "@type": "Country",
            name: COUNTRY_BY_CODE.get(c) || c,
          }));

      return {
        ...baseSchema,
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: applicantRequirements,
      };
    }

    // Physical work location (On-site or Hybrid)
    const city = job.primaryCity || locationParts[0];
    const state =
      job.primaryState ||
      (locationParts.length > 1 ? locationParts[1] : undefined);
    const country = job.primaryCountryCode || "IN";

    if (!city && !locationParts.length && !job.physicalLocations?.length) {
      return null;
    }

    const primaryPlace: Record<string, unknown> = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.locality ? { streetAddress: job.locality } : {}),
        ...(city ? { addressLocality: city } : {}),
        ...(state ? { addressRegion: state } : {}),
        ...(job.postalCode ? { postalCode: job.postalCode } : {}),
        addressCountry: country,
      },
    };

    let jobLocationValue: unknown = primaryPlace;
    if (job.physicalLocations && job.physicalLocations.length > 1) {
      jobLocationValue = job.physicalLocations.map((pl) => ({
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          ...(pl.locality ? { streetAddress: pl.locality } : {}),
          ...(pl.city ? { addressLocality: pl.city } : {}),
          ...(pl.state ? { addressRegion: pl.state } : {}),
          ...(pl.postalCode ? { postalCode: pl.postalCode } : {}),
          addressCountry: pl.countryCode || "IN",
        },
      }));
    }

    return {
      ...baseSchema,
      jobLocation: jobLocationValue,
    };
  }, [
    job.title,
    job.company,
    job.postedDate,
    job.location,
    job.validThrough,
    job.employmentType,
    job.applicantCountry,
    job.remoteEligibilityType,
    job.remoteEligibilityCountries,
    job.primaryCity,
    job.primaryState,
    job.primaryCountryCode,
    job.locality,
    job.postalCode,
    job.physicalLocations,
    job.mail,
    description,
    companyUrl,
    isRemote,
  ]);

  const category = useMemo(() => getJobCategory(job), [job]);

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

      <div className="mx-auto w-full max-w-4xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <motion.nav
          {...rise()}
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-[13px]"
        >
          <Link
            href="/jobs"
            className="cursor-pointer font-medium text-text-muted transition-colors hover:text-brand"
          >
            Jobs
          </Link>

          <span aria-hidden="true" className="text-border-strong">
            /
          </span>

          <Link
            href={`/jobs?category=${encodeURIComponent(category.toLowerCase())}`}
            className="cursor-pointer font-medium text-text-muted transition-colors hover:text-brand"
          >
            {category}
          </Link>

          <span aria-hidden="true" className="text-border-strong">
            /
          </span>

          <span
            aria-current="page"
            className="max-w-[260px] truncate font-medium text-text-primary sm:max-w-md"
            title={job.title}
          >
            {job.title}
          </span>
        </motion.nav>

        <motion.header
          {...rise(0.04)}
          className="border-b border-border-subtle pb-7"
        >
          {/* Title & Primary Action Row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-text-primary sm:text-4xl">
                {job.title}
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">{job.company}</span>
                {companyUrl && (
                  <>
                    <span className="text-border-strong">·</span>
                    <a
                      href={companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:underline"
                    >
                      <span>Website</span>
                      <ExternalLink size={12} strokeWidth={2} />
                    </a>
                  </>
                )}
                {postedDate && (
                  <>
                    <span className="text-border-strong">·</span>
                    <span className="text-xs text-text-muted">{postedDate}</span>
                  </>
                )}
              </div>
            </div>

            {/* Single Action Cluster: Share + Apply Now */}
            <div className="flex shrink-0 items-center gap-2.5">
              <ActionButton onClick={shareJob}>
                <Share2 size={15} strokeWidth={1.75} />
                Share
              </ActionButton>

              {job.mail?.trim() ? (
                <ActionButton primary onClick={() => setApplyOpen(true)}>
                  Apply now
                  <ArrowUpRight size={16} strokeWidth={2} />
                </ActionButton>
              ) : (
                <ActionButton primary disabled>
                  Applications closed
                </ActionButton>
              )}
            </div>
          </div>

          {/* Approach A: Clean Editorial Metadata Row */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary">
            {/* Salary */}
            {job.salary?.trim() && (
              <span className="font-semibold text-text-primary">
                {job.salary.trim()}
              </span>
            )}

            {job.salary?.trim() && <span className="text-border-strong select-none">·</span>}

            {/* Experience */}
            {job.experience?.trim() && (
              <span>
                {job.experience.trim()}
              </span>
            )}

            {job.experience?.trim() && <span className="text-border-strong select-none">·</span>}

            {/* Employment Type */}
            {job.employmentType && (
              <span className="capitalize">
                {job.employmentType.toLowerCase().replace(/_/g, " ")}
              </span>
            )}

            {job.employmentType && <span className="text-border-strong select-none">·</span>}

            {/* Unified Work Mode & Location */}
            <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
              {isRemote ? (
                <Globe size={14} className="text-brand shrink-0" strokeWidth={1.8} />
              ) : isHybrid ? (
                <Building2 size={14} className="text-brand shrink-0" strokeWidth={1.8} />
              ) : (
                <MapPin size={14} className="text-brand shrink-0" strokeWidth={1.8} />
              )}
              <span>{locDetails.cleanLocationText}</span>
            </span>
          </div>

          {/* Candidate Residency Requirement / Preference Note */}
          {locDetails.formattedPreference && (
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-control border border-border-default bg-surface-subtle px-3 py-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
                <Compass size={13} className="shrink-0 text-brand" strokeWidth={2} />
                {locDetails.formattedPreference.label}:
              </span>
              <span className="font-medium text-text-secondary">
                {locDetails.formattedPreference.text}
              </span>
            </div>
          )}

          {/* Company Office / HQ Locations */}
          {((isRemote && (job.primaryCity || locDetails.officeCities.length > 0)) || locDetails.officeCities.length > 1) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">
                {isRemote ? (locDetails.officeCities.length > 1 ? "Company Offices:" : "Company HQ:") : "Offices:"}
              </span>
              {locDetails.officeCities.length > 0 ? (
                locDetails.officeCities.map((city, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-0.5 font-medium text-text-secondary"
                  >
                    <Building2 size={11} className="shrink-0 text-brand" />
                    {city}
                    {job.primaryState && locDetails.officeCities.length === 1 ? `, ${job.primaryState}` : ""}
                    {idx < locDetails.officeCities.length - 1 && <span className="text-border-strong ml-1">·</span>}
                  </span>
                ))
              ) : job.primaryCity ? (
                <span className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle px-2 py-0.5 font-medium text-text-secondary">
                  <Building2 size={11} className="shrink-0 text-brand" />
                  {job.primaryCity}
                  {job.primaryState ? `, ${job.primaryState}` : ""}
                </span>
              ) : null}
            </div>
          )}
        </motion.header>

        {/* Main Content Area */}
        <div className="mt-8">
          <motion.section {...rise(0.08)} className="max-w-3xl">
            <h2
              id="about-role-heading"
              className="text-base font-semibold tracking-tight text-text-primary"
            >
              About this role
            </h2>

            <div className="mt-4">
              <FormattedDescription content={description} />
            </div>

            {companyUrl && (
              <div className="mt-8 border-t border-border-subtle pt-6">
                <ActionButton href={companyUrl} external>
                  <Globe size={15} strokeWidth={1.75} />
                  Company website
                  <ArrowUpRight size={14} strokeWidth={1.75} />
                </ActionButton>
              </div>
            )}
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
