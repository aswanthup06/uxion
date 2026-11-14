"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBlob, getFontEmbedCSS } from "html-to-image";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ImageDown,
  Layers,
  Loader2,
  RectangleVertical,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Smartphone,
  Square,
} from "lucide-react";

import type { Job } from "@/app/types/job";
import {
  getCompanyLogoUrl,
  getJobPublicUrl,
  getPosterFilename,
  POSTER_FONTS,
  POSTER_FORMATS,
  POSTER_PORTRAITS,
  POSTER_TEMPLATES,
  type PosterFontId,
  type PosterFormatId,
  type PosterPortraitId,
  type PosterQualityScale,
  type PosterTemplateId,
} from "@/lib/job-posters/poster-utils";
import {
  type QrCornerStyle,
  type QrDotStyle,
} from "@/lib/job-posters/qr-generator";
import { PosterCanvas } from "./PosterCanvas";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { JobSelector } from "./JobSelector";

interface JobPosterCreatorProps {
  initialJobs: Job[];
  initialSelectedJob: Job | null;
  missingRequestedJobId?: string | null;
  initialLoadError?: boolean;
}

const FALLBACK_FONT_FAMILY = 'var(--font-manrope), "Manrope", Arial, sans-serif';

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to data URL"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });
}

async function waitForImagesInContainer(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) {
        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            // Ignore decode errors on already-loaded images
          }
        }
        return;
      }

      await new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    })
  );
}

export function JobPosterCreator({
  initialJobs,
  initialSelectedJob,
  missingRequestedJobId = null,
  initialLoadError = false,
}: JobPosterCreatorProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(initialSelectedJob);
  const [missingJobNotice, setMissingJobNotice] = useState<string | null>(
    missingRequestedJobId
  );
  const [loadError, setLoadError] = useState<boolean>(initialLoadError);
  const [retryingJobs, setRetryingJobs] = useState<boolean>(false);

  const [template, setTemplate] = useState<PosterTemplateId>("portrait");
  const [portraitId, setPortraitId] = useState<PosterPortraitId>("man-1");
  const [format, setFormat] = useState<PosterFormatId>("feed");
  const [fontId, setFontId] = useState<PosterFontId>("manrope");
  const [exportScale, setExportScale] = useState<PosterQualityScale>(2);
  const [showHighlights, setShowHighlights] = useState<boolean>(true);
  const qrDotStyle: QrDotStyle = "rounded";
  const qrCornerStyle: QrCornerStyle = "extra-rounded";
  const qrWithLogo = false;

  const [logoDataUrl, setLogoDataUrl] = useState<string>("/logo.png");
  const [whiteLogoDataUrl, setWhiteLogoDataUrl] = useState<string>(
    "/posters/logo-white.png"
  );
  const [megaphoneDataUrl, setMegaphoneDataUrl] = useState<string>(
    "/posters/megaphone-cutout.png"
  );
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState<string | null>(null);
  const [resolvedFontFamily, setResolvedFontFamily] =
    useState<string>(FALLBACK_FONT_FAMILY);

  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Responsive mobile tab state: defaults to "preview" so mobile users instantly see the poster
  const [mobileTab, setMobileTab] = useState<"preview" | "controls">("preview");

  const previewStageRef = useRef<HTMLDivElement>(null);
  const exportNodeRef = useRef<HTMLDivElement>(null);

  // Initialize stage dimensions intelligently to avoid any 0-scale flash on mount
  const [stageWidth, setStageWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024
        ? window.innerWidth
        : Math.max(380, window.innerWidth - 440);
    }
    return 600;
  });
  const [stageHeight, setStageHeight] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.max(380, window.innerHeight - 150);
    }
    return 750;
  });

  const formatSpec = POSTER_FORMATS[format];
  const activeTemplateMeta = useMemo(
    () =>
      POSTER_TEMPLATES.find((item) => item.id === template) ||
      POSTER_TEMPLATES[0],
    [template]
  );
  const activeFontMeta = useMemo(
    () => POSTER_FONTS.find((f) => f.id === fontId) || POSTER_FONTS[0],
    [fontId]
  );
  const activePortrait = useMemo(
    () =>
      POSTER_PORTRAITS.find((p) => p.id === portraitId) || POSTER_PORTRAITS[0],
    [portraitId]
  );

  // Measure available preview stage width and height cleanly on mount, tab switch & resize
  useEffect(() => {
    const el = previewStageRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = el.clientWidth || rect.width;
      const h = el.clientHeight || rect.height;
      if (w > 0) setStageWidth(w);
      if (h > 0) setStageHeight(h);
    };

    measure();
    const rafId = window.requestAnimationFrame(measure);
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", measure);
      };
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || el.clientWidth;
        const h = entry.contentRect.height || el.clientHeight;
        if (w > 0) setStageWidth(w);
        if (h > 0) setStageHeight(h);
      }
    });
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [selectedJob?.id, mobileTab, format]);

  // Preload /logo.png as a data URI and capture resolved Manrope font family
  useEffect(() => {
    let cancelled = false;

    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    if (bodyFont && bodyFont.trim()) {
      window.requestAnimationFrame(() => {
        if (!cancelled) {
          setResolvedFontFamily(bodyFont);
        }
      });
    }

    const preloadAsset = (
      path: string,
      onReady: (dataUrl: string) => void
    ) => {
      fetch(path)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${path}`);
          return res.blob();
        })
        .then(blobToDataUrl)
        .then((dataUrl) => {
          if (!cancelled) {
            onReady(dataUrl);
          }
        })
        .catch(() => {
          // Keep default path fallback
        });
    };

    preloadAsset("/logo.png", setLogoDataUrl);
    preloadAsset("/posters/logo-white.png", setWhiteLogoDataUrl);
    preloadAsset("/posters/megaphone-cutout.png", setMegaphoneDataUrl);

    return () => {
      cancelled = true;
    };
  }, []);

  // Safely preload optional company logo when available (CORS-safe fallback to monogram)
  useEffect(() => {
    let cancelled = false;
    const rawLogoUrl = selectedJob ? getCompanyLogoUrl(selectedJob) : null;

    if (!rawLogoUrl) {
      window.requestAnimationFrame(() => {
        if (!cancelled) setCompanyLogoDataUrl(null);
      });
      return () => {
        cancelled = true;
      };
    }

    fetch(rawLogoUrl, { mode: "cors" })
      .then((res) => {
        if (!res.ok) throw new Error("Logo unavailable");
        return res.blob();
      })
      .then(blobToDataUrl)
      .then((dataUrl) => {
        if (!cancelled) setCompanyLogoDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setCompanyLogoDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedJob]);

  // Clear temporary export notices when configuration changes
  const resetExportFeedback = useCallback(() => {
    setExportError(null);
  }, []);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setMissingJobNotice(null);
    resetExportFeedback();

    if (typeof window !== "undefined") {
      const nextUrl = `/job-posters?jobId=${encodeURIComponent(job.id)}`;
      window.history.replaceState(null, "", nextUrl);
    }
  };

  const handleSelectTemplate = (nextTemplate: PosterTemplateId) => {
    setTemplate(nextTemplate);
    resetExportFeedback();
  };

  const handleCycleTemplate = () => {
    const currentIndex = POSTER_TEMPLATES.findIndex((t) => t.id === template);
    const nextIndex = (currentIndex + 1) % POSTER_TEMPLATES.length;
    handleSelectTemplate(POSTER_TEMPLATES[nextIndex].id);
  };

  const handleSelectFormat = (nextFormat: PosterFormatId) => {
    setFormat(nextFormat);
    resetExportFeedback();
  };

  const handleRetryLoadJobs = async () => {
    if (retryingJobs) return;
    setRetryingJobs(true);
    setLoadError(false);

    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const fetched: Job[] = await res.json();
      const list = Array.isArray(fetched) ? fetched : [];
      setJobs(list);
      if (!selectedJob && list.length > 0 && !missingJobNotice) {
        setSelectedJob(list[0]);
      }
    } catch {
      setLoadError(true);
    } finally {
      setRetryingJobs(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!selectedJob || exporting) return;
    const node = exportNodeRef.current;
    if (!node) {
      setExportError("Poster preview is not ready yet. Please try again.");
      return;
    }

    setExporting(true);
    setExportError(null);

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      await waitForImagesInContainer(node);

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

      let fontEmbedCSS: string | undefined;
      try {
        // Omit preferredFontFormat due to a stateful global-regex bug in html-to-image's filterPreferredFontFormat
        fontEmbedCSS = await getFontEmbedCSS(node);
      } catch {
        fontEmbedCSS = undefined;
      }

      const commonOptions = {
        width: formatSpec.width,
        height: formatSpec.height,
        canvasWidth: formatSpec.width,
        canvasHeight: formatSpec.height,
        pixelRatio: exportScale,
        backgroundColor: "#ffffff",
        skipAutoScale: true,
        cacheBust: false,
      };

      let blob: Blob | null = null;
      try {
        blob = await toBlob(node, {
          ...commonOptions,
          ...(fontEmbedCSS !== undefined
            ? { fontEmbedCSS }
            : { skipFonts: true }),
        });
      } catch {
        // Fallback once without font embedding in case a browser blocks CSS rule inspection
        blob = await toBlob(node, {
          ...commonOptions,
          skipFonts: true,
        });
      }

      if (!blob || blob.size < 1000) {
        throw new Error("Generated poster image was empty.");
      }

      const filename = getPosterFilename(selectedJob, format, template);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

      toast.success("Job poster downloaded", { id: "job-poster-download" });
    } catch (error) {
      console.error("Failed to export job poster PNG:", error);
      const message =
        "Could not generate the PNG poster in this browser. Please try again.";
      setExportError(message);
      toast.error(message, { id: "job-poster-download" });
    } finally {
      setExporting(false);
    }
  };

  // Compute responsive preview scale to fit the viewport stage cleanly
  const paddingX = stageWidth > 0 && stageWidth < 640 ? 20 : 40;
  const paddingY = stageWidth > 0 && stageWidth < 640 ? 20 : 40;
  const fitWidth = Math.max(0, stageWidth - paddingX);
  const fitHeight = Math.max(0, stageHeight - paddingY);

  const safeFallbackScale =
    stageWidth > 0
      ? Math.min((stageWidth - 24) / formatSpec.width, 0.45)
      : typeof window !== "undefined"
        ? Math.min((window.innerWidth - 32) / formatSpec.width, 0.35)
        : 0.3;

  const previewScale =
    fitWidth > 0 && fitHeight > 0
      ? Math.min(fitWidth / formatSpec.width, fitHeight / formatSpec.height, 0.95)
      : safeFallbackScale;

  const previewDisplayWidth = Math.round(formatSpec.width * previewScale);
  const previewDisplayHeight = Math.round(formatSpec.height * previewScale);

  return (
    <div className="h-full w-full overflow-hidden bg-surface-base text-text-primary flex flex-col">
      {/* Mobile Top Navigation Bar (lg:hidden) */}
      <div className="lg:hidden shrink-0 border-b border-border-subtle bg-surface-card px-3 py-2.5 shadow-subtle z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Segmented Tab Control */}
          <div className="flex items-center gap-1 rounded-control bg-surface-subtle p-1 border border-border-subtle flex-1 max-w-[260px]">
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[3px] text-xs font-semibold transition-all ${
                mobileTab === "preview"
                  ? "bg-brand text-text-inverse shadow-subtle"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers size={13} strokeWidth={2.2} />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("controls")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[3px] text-xs font-semibold transition-all ${
                mobileTab === "controls"
                  ? "bg-brand text-text-inverse shadow-subtle"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <SlidersHorizontal size={13} strokeWidth={2.2} />
              <span>Customize</span>
            </button>
          </div>

          {/* Quick Action Button in Mobile Header */}
          <div className="flex items-center gap-1.5">
            {mobileTab === "preview" ? (
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!selectedJob || exporting}
                className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand px-3 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ImageDown size={13} strokeWidth={2} />
                )}
                <span>Download PNG</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className="inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 text-xs font-semibold text-brand transition-colors hover:bg-surface-subtle"
              >
                <span>View Poster</span>
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Body: Side-by-side on desktop, Tab-switched on mobile */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col lg:flex-row">
        {/* Left Column: Integrated Header & Customization Controls */}
        <aside
          className={`${
            mobileTab === "controls" ? "flex" : "hidden"
          } lg:flex flex-col w-full lg:w-[410px] xl:w-[440px] shrink-0 border-r-0 lg:border-r border-border-subtle bg-surface-base h-full overflow-y-auto p-4 sm:p-6 space-y-6`}
        >
        {/* Minimal Studio Header (Integrated into Left Section) */}
        <div className="border-b border-border-subtle pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              <span>Poster Studio</span>
            </div>
            {selectedJob ? (
              <Link
                href={`/jobs/${selectedJob.id}`}
                className="inline-flex h-7 items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <ArrowLeft size={12} strokeWidth={2} />
                <span>Back to job</span>
              </Link>
            ) : (
              <Link
                href="/jobs"
                className="inline-flex h-7 items-center gap-1 rounded-control border border-border-default bg-surface-card px-2.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <ArrowLeft size={12} strokeWidth={2} />
                <span>Browse jobs</span>
              </Link>
            )}
          </div>

          <h1 className="mt-2 text-xl font-bold tracking-tight text-text-primary">
            Create Job Poster
          </h1>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            Generate clean, share-ready social cards from live Zenoway listings.
          </p>

          {missingJobNotice && (
            <div
              role="status"
              className="mt-3 flex items-start gap-2 rounded-control border border-status-warning-border bg-status-warning-bg p-2.5 text-xs text-text-primary"
            >
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0 text-status-warning"
              />
              <div className="flex-1">
                <span>The requested job was not found. Select an active role below.</span>
                {jobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSelectJob(jobs[0])}
                    className="mt-1 block font-semibold text-brand hover:underline"
                  >
                    Load latest job
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {loadError && jobs.length === 0 ? (
          <div className="rounded-card border border-dashed border-status-error-border bg-surface-card p-6 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-pill bg-status-error-bg text-status-error">
              <AlertCircle size={18} />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-text-primary">
              Unable to load job listings
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={handleRetryLoadJobs}
              disabled={retryingJobs}
              className="mt-4 inline-flex h-8 cursor-pointer items-center gap-2 rounded-control bg-brand px-3 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {retryingJobs ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RotateCcw size={13} />
              )}
              <span>{retryingJobs ? "Retrying..." : "Try again"}</span>
            </button>
          </div>
        ) : jobs.length === 0 && !selectedJob ? (
          <div className="rounded-card border border-dashed border-border-default bg-surface-card p-6 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-pill bg-surface-muted text-text-muted">
              <BriefcaseBusiness size={18} />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-text-primary">
              No active jobs available
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Publish a job opening first to generate its shareable poster.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/jobs"
                className="inline-flex h-8 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle"
              >
                Browse jobs
              </Link>
              <Link
                href="/post-job"
                className="inline-flex h-8 items-center gap-1.5 rounded-control bg-brand px-3 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover"
              >
                Post job
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Job Selection */}
            <section aria-labelledby="job-select-heading">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label
                  id="job-select-heading"
                  htmlFor="poster-job-selector"
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted"
                >
                  1. Select Job
                </label>
                <span className="text-[11px] text-text-muted">
                  {jobs.length} active {jobs.length === 1 ? "role" : "roles"}
                </span>
              </div>

              <JobSelector
                jobs={jobs}
                selectedJob={selectedJob}
                onSelect={handleSelectJob}
              />
            </section>

            {/* 2. Poster Template Selector */}
            <section
              aria-labelledby="template-select-heading"
              className="border-t border-border-subtle pt-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2
                  id="template-select-heading"
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted"
                >
                  2. Poster Template
                </h2>
                <span className="text-[11px] font-semibold text-brand">
                  {activeTemplateMeta.name}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Poster template"
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              >
                {POSTER_TEMPLATES.map((item) => {
                  const isActive = item.id === template;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => handleSelectTemplate(item.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-control border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${isActive
                        ? "border-brand bg-brand-soft/70 shadow-subtle"
                        : "border-border-default/80 bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                        }`}
                    >
                      <TemplateThumbnail
                        template={item.id}
                        active={isActive}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`truncate text-xs font-semibold ${isActive ? "text-brand" : "text-text-primary"
                              }`}
                          >
                            {item.name}
                          </span>
                          {isActive && (
                            <Check
                              size={13}
                              strokeWidth={2.5}
                              className="shrink-0 text-brand"
                            />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                          {item.tagline}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-text-muted">
                          {item.bestFor}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2b. Choose Indian Model (Editorial Portrait Template) */}
            {template === "portrait" && (
              <section
                aria-labelledby="portrait-select-heading"
                className="border-t border-border-subtle pt-5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2
                    id="portrait-select-heading"
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted"
                  >
                    2b. Indian Model
                  </h2>
                  <span className="text-[11px] font-medium text-brand">
                    {activePortrait.name} ({activePortrait.gender === "male" ? "Man" : "Woman"})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {POSTER_PORTRAITS.map((p) => {
                    const isActive = p.id === portraitId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPortraitId(p.id);
                          resetExportFeedback();
                        }}
                        className={`group relative flex flex-col items-center rounded-control border p-2 text-center transition-all ${isActive
                          ? "border-brand bg-brand-soft/70 shadow-subtle ring-1 ring-brand/30"
                          : "border-border-default/80 bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                          }`}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-control bg-surface-subtle">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.src}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute left-1 bottom-1 rounded bg-black/65 px-1 py-0.5 text-[9px] font-semibold text-white backdrop-blur-[2px]">
                            {p.gender === "male" ? "Man" : "Woman"}
                          </div>
                          {isActive && (
                            <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-text-inverse shadow-sm">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <span
                          className={`mt-1.5 block truncate text-[11px] font-semibold ${isActive ? "text-brand" : "text-text-primary"
                            }`}
                        >
                          {p.name}
                        </span>
                        <span className="block truncate text-[10px] text-text-muted">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Output Format Selector */}
            <section
              aria-labelledby="format-select-heading"
              className="border-t border-border-subtle pt-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2
                  id="format-select-heading"
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted"
                >
                  3. Output Format
                </h2>
                <span className="text-[11px] text-text-muted">
                  {formatSpec.width} × {formatSpec.height} px
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Poster format"
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {(["feed", "square", "story"] as PosterFormatId[]).map((id) => {
                  const spec = POSTER_FORMATS[id];
                  const isActive = format === id;
                  const Icon =
                    id === "feed"
                      ? RectangleVertical
                      : id === "square"
                        ? Square
                        : Smartphone;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => handleSelectFormat(id)}
                      className={`flex cursor-pointer flex-col justify-between rounded-control border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${isActive
                        ? "border-brand bg-brand-soft/70 shadow-subtle"
                        : "border-border-default/80 bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                        }`}
                    >
                      <div className="flex w-full items-center gap-1.5">
                        <Icon
                          size={13}
                          strokeWidth={1.9}
                          className={isActive ? "shrink-0 text-brand" : "shrink-0 text-text-muted"}
                        />
                        <span
                          className={`whitespace-nowrap text-xs font-semibold ${isActive ? "text-brand" : "text-text-primary"
                            }`}
                        >
                          {spec.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex w-full items-center justify-between gap-1">
                        <span className="text-[10.5px] font-medium text-text-secondary">
                          {spec.width}×{spec.height}
                        </span>
                        <span className="rounded-control bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                          {spec.ratio}
                        </span>
                      </div>
                      <span className="mt-1 text-[10px] text-text-muted">
                        {spec.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. Typography & Font Style Selector */}
            <section
              aria-labelledby="font-select-heading"
              className="border-t border-border-subtle pt-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2
                  id="font-select-heading"
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted"
                >
                  4. Font Style
                </h2>
                <span className="text-[11px] font-semibold text-brand">
                  {activeFontMeta.name}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Poster font style"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {POSTER_FONTS.map((font) => {
                  const isActive = font.id === fontId;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setFontId(font.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-control border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${isActive
                        ? "border-brand bg-brand-soft/70 shadow-subtle"
                        : "border-border-default/80 bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                        }`}
                    >
                      <div className="min-w-0">
                        <span
                          style={{ fontFamily: font.fontFamily }}
                          className={`block truncate text-xs font-bold ${isActive ? "text-brand" : "text-text-primary"
                            }`}
                        >
                          {font.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-text-muted">
                          {font.category}
                        </span>
                      </div>
                      <span
                        style={{ fontFamily: font.fontFamily }}
                        className={`text-sm font-bold shrink-0 ml-2 ${isActive ? "text-brand" : "text-text-muted"
                          }`}
                      >
                        Aa
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. Content & Customization Options */}
            <section className="space-y-4 border-t border-border-subtle pt-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span
                    id="highlights-toggle-label"
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted"
                  >
                    Role Highlights
                  </span>
                  <p className="mt-0.5 text-[11px] text-text-secondary">
                    Bullet points from job details
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showHighlights}
                  aria-labelledby="highlights-toggle-label"
                  onClick={() => {
                    setShowHighlights((prev) => !prev);
                    resetExportFeedback();
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${showHighlights
                    ? "border-brand bg-brand"
                    : "border-border-default bg-surface-muted"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-subtle transition-transform ${showHighlights ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Export Resolution
                </span>
                <div
                  role="radiogroup"
                  aria-label="Export resolution"
                  className="inline-flex rounded-control border border-border-default bg-surface-subtle p-0.5"
                >
                  {([
                    { scale: 1 as PosterQualityScale, label: "1× · Standard" },
                    { scale: 2 as PosterQualityScale, label: "2× · High-Res" },
                  ]).map((opt) => {
                    const active = exportScale === opt.scale;
                    return (
                      <button
                        key={opt.scale}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setExportScale(opt.scale);
                          resetExportFeedback();
                        }}
                        className={`cursor-pointer rounded-[3px] px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${active
                          ? "bg-surface-card text-brand shadow-subtle"
                          : "text-text-secondary hover:text-text-primary"
                          }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCycleTemplate}
                disabled={!selectedJob || exporting}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={14} strokeWidth={1.85} />
                <span>Shuffle template</span>
              </button>
            </section>

            {/* Mobile-only CTA to jump to preview after configuring */}
            <div className="lg:hidden pt-2 pb-6">
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-4 text-xs font-bold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover"
              >
                <Layers size={14} />
                <span>View Live Poster Preview ({formatSpec.label})</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Right Section: Full Viewport Live Preview Stage with Download Button Above */}
      <section
        aria-labelledby="preview-stage-heading"
        className={`${
          mobileTab === "preview" ? "flex" : "hidden"
        } lg:flex flex-1 h-full min-w-0 flex-col bg-surface-subtle overflow-y-auto lg:overflow-hidden`}
      >
        {/* Action Bar Above Preview */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-card px-4 py-3 sm:px-6 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="preview-stage-heading"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary"
            >
              <Layers size={14} className="text-brand" />
              Poster Preview
            </span>
            <span className="text-border-strong">·</span>
            <span className="rounded-control bg-surface-subtle border border-border-subtle px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
              {activeTemplateMeta.name}
            </span>
            <span className="rounded-control bg-surface-subtle border border-border-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {formatSpec.label} ({formatSpec.ratio})
            </span>
            <span className="hidden sm:inline-block text-[11px] text-text-muted">
              {formatSpec.width * exportScale} × {formatSpec.height * exportScale} px
            </span>
            {selectedJob && (
              <Link
                href={`/jobs/${selectedJob.id}`}
                target="_blank"
                className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-brand transition-colors ml-1"
              >
                <span>View job</span>
                <ArrowUpRight size={11} />
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!selectedJob || exporting}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Exporting PNG...</span>
                </>
              ) : (
                <>
                  <ImageDown size={14} strokeWidth={2} />
                  <span>Download Poster PNG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Quick Control Strip: Format switcher, Shuffle button, and Model strip */}
        <div className="lg:hidden flex flex-col border-b border-border-subtle bg-surface-card shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border-subtle/60">
            {/* Format pills */}
            <div
              role="radiogroup"
              aria-label="Format on mobile"
              className="inline-flex rounded-control border border-border-default bg-surface-subtle p-0.5"
            >
              {(["feed", "story", "square"] as PosterFormatId[]).map((f) => {
                const active = format === f;
                return (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setFormat(f);
                      resetExportFeedback();
                    }}
                    className={`cursor-pointer rounded-[3px] px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      active
                        ? "bg-brand text-text-inverse shadow-subtle"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {POSTER_FORMATS[f].label}
                  </button>
                );
              })}
            </div>

            {/* Shuffle button */}
            <button
              type="button"
              onClick={handleCycleTemplate}
              disabled={!selectedJob || exporting}
              className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-2.5 py-1 text-[11px] font-semibold text-text-primary hover:bg-surface-subtle disabled:opacity-50"
            >
              <RefreshCw size={12} strokeWidth={2} />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Quick Model Selector when Editorial Portrait template is active */}
          {template === "portrait" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto bg-surface-subtle/50 no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted shrink-0 mr-1">
                Model:
              </span>
              {POSTER_PORTRAITS.map((p) => {
                const isActive = p.id === portraitId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPortraitId(p.id);
                      resetExportFeedback();
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-brand text-text-inverse shadow-subtle"
                        : "border border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.name}
                      className="h-3.5 w-3.5 rounded-full object-cover"
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback Notifications */}
        {exportError && (
          <div
            role="alert"
            className="mx-4 mt-3 shrink-0 flex items-start gap-2 rounded-control border border-status-error-border bg-status-error-bg px-3.5 py-2 text-xs text-status-error"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* Full Viewport Canvas Stage: Centered, Sharp Corner Poster */}
        <div
          ref={previewStageRef}
          className="flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center p-3 sm:p-6 lg:p-8"
        >
          {!selectedJob ? (
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-card border border-dashed border-border-default bg-surface-card px-6 py-16 text-center">
              <div className="grid h-11 w-11 place-items-center rounded-pill bg-brand-soft text-brand">
                <ImageDown size={19} />
              </div>
              <h3 className="mt-3.5 text-sm font-semibold text-text-primary">
                Select a job to preview its poster
              </h3>
              <p className="mt-1 text-xs text-text-secondary">
                Choose any active role from the selector to render all
                four poster templates.
              </p>
              <button
                type="button"
                onClick={() => setMobileTab("controls")}
                className="mt-4 lg:hidden inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-1.5 text-xs font-semibold text-text-inverse shadow-subtle"
              >
                <span>Select a job</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ) : previewScale <= 0 ? (
            <div
              className={`w-full max-w-[440px] animate-pulse rounded-control border border-border-default bg-surface-card ${
                format === "story"
                  ? "aspect-[9/16] max-h-[680px]"
                  : format === "square"
                    ? "aspect-square max-h-[600px]"
                    : "aspect-[4/5] max-h-[640px]"
              }`}
            />
          ) : (
            <div
              style={{
                width: previewDisplayWidth,
                height: previewDisplayHeight,
              }}
              className="relative overflow-hidden rounded-none shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/10 bg-white"
            >
              <div
                style={{
                  width: formatSpec.width,
                  height: formatSpec.height,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  borderRadius: 0,
                }}
              >
                <PosterCanvas
                  job={selectedJob}
                  template={template}
                  format={format}
                  logoSrc={logoDataUrl}
                  whiteLogoSrc={whiteLogoDataUrl}
                  megaphoneSrc={megaphoneDataUrl}
                  companyLogoSrc={companyLogoDataUrl}
                  fontFamily={activeFontMeta.fontFamily}
                  showHighlights={showHighlights}
                  portraitSrc={activePortrait.src}
                  qrWithLogo={qrWithLogo}
                  qrDotStyle={qrDotStyle}
                  qrCornerStyle={qrCornerStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Bar: Customize Button */}
        <div className="lg:hidden border-t border-border-subtle bg-surface-card px-4 py-2.5 shrink-0 flex items-center justify-between gap-3">
          <span className="text-[11px] text-text-muted truncate">
            {activeTemplateMeta.name} · {activeFontMeta.name}
          </span>
          <button
            type="button"
            onClick={() => setMobileTab("controls")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline shrink-0"
          >
            <span>Edit fonts & options</span>
            <ArrowRight size={12} strokeWidth={2} />
          </button>
        </div>
      </section>
    </div>

      {/* Dedicated Unscaled 1080px Export Surface (never visible, never scaled) */}
      {selectedJob && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <PosterCanvas
            ref={exportNodeRef}
            job={selectedJob}
            template={template}
            format={format}
            logoSrc={logoDataUrl}
            whiteLogoSrc={whiteLogoDataUrl}
            megaphoneSrc={megaphoneDataUrl}
            companyLogoSrc={companyLogoDataUrl}
            fontFamily={activeFontMeta.fontFamily}
            showHighlights={showHighlights}
            portraitSrc={activePortrait.src}
            qrWithLogo={qrWithLogo}
            qrDotStyle={qrDotStyle}
            qrCornerStyle={qrCornerStyle}
          />
        </div>
      )}
    </div>
  );
}
