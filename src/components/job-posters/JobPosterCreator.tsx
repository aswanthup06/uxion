"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBlob, getFontEmbedCSS } from "html-to-image";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ImageDown,
  Layers,
  Loader2,
  RectangleVertical,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Square,
} from "lucide-react";

import type { Job } from "@/app/types/job";
import {
  getCompanyLogoUrl,
  getPosterFilename,
  POSTER_FORMATS,
  POSTER_TEMPLATES,
  type PosterFormatId,
  type PosterQualityScale,
  type PosterTemplateId,
} from "@/lib/job-posters/poster-utils";
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

  const [template, setTemplate] = useState<PosterTemplateId>("bold");
  const [format, setFormat] = useState<PosterFormatId>("feed");
  const [exportScale, setExportScale] = useState<PosterQualityScale>(2);
  const [showHighlights, setShowHighlights] = useState<boolean>(true);

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
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const previewStageRef = useRef<HTMLDivElement>(null);
  const exportNodeRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(0);

  const formatSpec = POSTER_FORMATS[format];
  const activeTemplateMeta = useMemo(
    () =>
      POSTER_TEMPLATES.find((item) => item.id === template) ||
      POSTER_TEMPLATES[0],
    [template]
  );

  // Measure available preview stage width cleanly on mount & resize
  useEffect(() => {
    const el = previewStageRef.current;
    if (!el) return;

    const measure = () => {
      const nextWidth = el.clientWidth;
      if (nextWidth > 0) {
        setStageWidth(nextWidth);
      }
    };

    const rafId = window.requestAnimationFrame(measure);
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", measure);
      };
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [selectedJob?.id]);

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
    setExportSuccess(false);
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
    setExportSuccess(false);

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

      setExportSuccess(true);
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

  // Compute responsive preview scale keeping Feed (4:5), Square (1:1), and Story (9:16) cleanly framed
  const maxStageHeight =
    format === "story" ? 680 : format === "square" ? 600 : 640;
  const previewScale =
    stageWidth > 0
      ? Math.min(stageWidth / formatSpec.width, maxStageHeight / formatSpec.height)
      : 0;

  const previewDisplayWidth = Math.round(formatSpec.width * previewScale);
  const previewDisplayHeight = Math.round(formatSpec.height * previewScale);

  return (
    <div className="min-h-full overflow-x-hidden bg-surface-base text-text-primary">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">
        {/* Minimal Page Header */}
        <header className="border-b border-border-subtle pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                <span>Zenoway Poster Studio</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-text-primary sm:text-3xl">
                Create Job Poster
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Generate clean, share-ready job posters from live Zenoway
                listings for LinkedIn, Instagram Stories, and WhatsApp.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              {selectedJob ? (
                <Link
                  href={`/jobs/${selectedJob.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <ArrowLeft size={14} strokeWidth={1.8} />
                  <span>Back to job</span>
                </Link>
              ) : (
                <Link
                  href="/jobs"
                  className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3.5 text-xs font-semibold text-text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <ArrowLeft size={14} strokeWidth={1.8} />
                  <span>Browse jobs</span>
                </Link>
              )}
            </div>
          </div>

          {missingJobNotice && (
            <div
              role="status"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-control border border-status-warning-border bg-status-warning-bg px-4 py-3 text-xs text-text-primary"
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  size={15}
                  className="shrink-0 text-status-warning"
                />
                <span>
                  The requested job (<strong className="font-semibold">{missingJobNotice}</strong>) could not be found. Select an active role below to create a poster.
                </span>
              </div>
              {jobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectJob(jobs[0])}
                  className="cursor-pointer font-semibold text-brand hover:underline"
                >
                  Load latest job
                </button>
              )}
            </div>
          )}
        </header>

        {/* Main Studio Grid */}
        {loadError && jobs.length === 0 ? (
          <div className="mt-8 rounded-panel border border-dashed border-status-error-border bg-surface-card px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-status-error-bg text-status-error">
              <AlertCircle size={20} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-text-primary">
              Unable to load job listings
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">
              Check your connection and try loading the active Zenoway job
              listings again.
            </p>
            <button
              type="button"
              onClick={handleRetryLoadJobs}
              disabled={retryingJobs}
              className="mt-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {retryingJobs ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RotateCcw size={14} />
              )}
              <span>{retryingJobs ? "Retrying..." : "Try again"}</span>
            </button>
          </div>
        ) : jobs.length === 0 && !selectedJob ? (
          <div className="mt-8 rounded-panel border border-dashed border-border-default bg-surface-card px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-surface-muted text-text-muted">
              <BriefcaseBusiness size={20} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-text-primary">
              No active jobs available
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">
              Publish a job opening first, then return here to generate and
              download its shareable poster.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/jobs"
                className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle"
              >
                Explore jobs
              </Link>
              <Link
                href="/post-job"
                className="inline-flex h-9 items-center gap-1.5 rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover"
              >
                Post a job
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[410px_minmax(0,1fr)] lg:items-start xl:grid-cols-[440px_minmax(0,1fr)]">
            {/* Left Column: Studio Controls */}
            <aside className="space-y-6 rounded-panel border border-border-default bg-surface-card p-5 shadow-subtle sm:p-6">
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

              {/* 2. Poster Template Selector with Visual Previews */}
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
                  <span className="text-[11px] font-medium text-brand">
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
                        className={`flex cursor-pointer items-center gap-3 rounded-card border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-brand bg-brand-soft/60"
                            : "border-border-default bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                        }`}
                      >
                        <TemplateThumbnail
                          template={item.id}
                          active={isActive}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`truncate text-xs font-semibold ${
                                isActive ? "text-brand" : "text-text-primary"
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
                        className={`flex cursor-pointer flex-col justify-between rounded-card border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-brand bg-brand-soft/60"
                            : "border-border-default bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                        }`}
                      >
                        <div className="flex w-full items-center gap-1.5">
                          <Icon
                            size={13}
                            strokeWidth={1.9}
                            className={isActive ? "shrink-0 text-brand" : "shrink-0 text-text-muted"}
                          />
                          <span
                            className={`whitespace-nowrap text-xs font-semibold ${
                              isActive ? "text-brand" : "text-text-primary"
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

              {/* 4. Poster Content & Export Quality */}
              <section className="space-y-3.5 border-t border-border-subtle pt-5">
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
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      showHighlights
                        ? "border-brand bg-brand"
                        : "border-border-default bg-surface-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-subtle transition-transform ${
                        showHighlights ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                    Export Quality
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="Export resolution"
                    className="inline-flex rounded-control border border-border-default bg-surface-subtle p-0.5"
                  >
                    {([
                      { scale: 1 as PosterQualityScale, label: "1× · 1080px" },
                      { scale: 2 as PosterQualityScale, label: "2× · 2160px" },
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
                          className={`cursor-pointer rounded-[3px] px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            active
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
                  onClick={handleDownloadPng}
                  disabled={!selectedJob || exporting}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Exporting PNG...</span>
                    </>
                  ) : (
                    <>
                      <ImageDown size={16} strokeWidth={2} />
                      <span>Download PNG</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCycleTemplate}
                  disabled={!selectedJob || exporting}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={14} strokeWidth={1.85} />
                  <span>Choose another template</span>
                </button>

                {exportError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-control border border-status-error-border bg-status-error-bg px-3 py-2.5 text-xs text-status-error"
                  >
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{exportError}</span>
                  </div>
                )}

                {exportSuccess && !exportError && selectedJob && (
                  <p
                    role="status"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand"
                  >
                    <Check size={14} strokeWidth={2.3} />
                    <span>
                      Downloaded {getPosterFilename(selectedJob, format, template)}
                    </span>
                  </p>
                )}
              </section>
            </aside>

            {/* Right Column: Live Poster Preview Stage */}
            <section
              aria-labelledby="preview-stage-heading"
              className="min-w-0 rounded-panel border border-border-default bg-surface-subtle p-4 sm:p-6 lg:p-7"
            >
              {/* Preview Top Metadata Bar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    id="preview-stage-heading"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary"
                  >
                    <Layers size={14} className="text-brand" />
                    Live Preview
                  </span>
                  <span className="text-border-strong">·</span>
                  <span className="text-xs font-medium text-text-secondary">
                    {activeTemplateMeta.name}
                  </span>
                  <span className="rounded-control border border-border-default bg-surface-card px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                    {formatSpec.width * exportScale} × {formatSpec.height * exportScale} ({formatSpec.ratio})
                  </span>
                </div>

                {selectedJob && (
                  <Link
                    href={`/jobs/${selectedJob.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:underline"
                  >
                    <span>Open job page</span>
                    <ArrowUpRight size={13} />
                  </Link>
                )}
              </div>

              {/* Scaled Preview Container */}
              <div
                ref={previewStageRef}
                className="flex w-full items-center justify-center py-2"
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
                    className="relative overflow-hidden rounded-[4px] border border-border-default bg-white shadow-card"
                  >
                    <div
                      style={{
                        width: formatSpec.width,
                        height: formatSpec.height,
                        transform: `scale(${previewScale})`,
                        transformOrigin: "top left",
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
                        fontFamily={resolvedFontFamily}
                        showHighlights={showHighlights}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
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
            fontFamily={resolvedFontFamily}
            showHighlights={showHighlights}
          />
        </div>
      )}
    </div>
  );
}
