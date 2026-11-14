"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toBlob, getFontEmbedCSS } from "html-to-image";
import toast from "react-hot-toast";
import {
  Download,
  ExternalLink,
  ImageDown,
  Loader2,
  Sparkles,
} from "lucide-react";

import Modal from "@/app/components/Modal";
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
  type PosterTemplateId,
} from "@/lib/job-posters/poster-utils";
import { PosterCanvas } from "@/components/job-posters/PosterCanvas";

interface JobPosterModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function JobPosterModal({
  job,
  isOpen,
  onClose,
}: JobPosterModalProps) {
  const [template, setTemplate] = useState<PosterTemplateId>("portrait");
  const [portraitId, setPortraitId] = useState<PosterPortraitId>("man-1");
  const [format, setFormat] = useState<PosterFormatId>("feed");
  const [fontId, setFontId] = useState<PosterFontId>("manrope");
  const [exporting, setExporting] = useState(false);

  const [logoDataUrl, setLogoDataUrl] = useState<string>("/logo.png");
  const [whiteLogoDataUrl, setWhiteLogoDataUrl] = useState<string>(
    "/posters/logo-white.png"
  );
  const [megaphoneDataUrl, setMegaphoneDataUrl] = useState<string>(
    "/posters/megaphone-cutout.png"
  );
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState<string | null>(
    null
  );
  const [resolvedFontFamily, setResolvedFontFamily] = useState<string | undefined>(
    undefined
  );

  const activeFont =
    POSTER_FONTS.find((f) => f.id === fontId) || POSTER_FONTS[0];
  const activePortrait =
    POSTER_PORTRAITS.find((p) => p.id === portraitId) || POSTER_PORTRAITS[0];

  const exportNodeRef = useRef<HTMLDivElement>(null);
  const previewStageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  // Preload asset images as Data URLs to prevent canvas CORS errors
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    if (bodyFont && bodyFont.trim()) {
      window.requestAnimationFrame(() => {
        if (!cancelled) setResolvedFontFamily(bodyFont);
      });
    }

    const preloadAsset = (path: string, onReady: (dataUrl: string) => void) => {
      fetch(path)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${path}`);
          return res.blob();
        })
        .then(blobToDataUrl)
        .then((dataUrl) => {
          if (!cancelled) onReady(dataUrl);
        })
        .catch(() => {
          // Fallback to static path
        });
    };

    preloadAsset("/logo.png", setLogoDataUrl);
    preloadAsset("/posters/logo-white.png", setWhiteLogoDataUrl);
    preloadAsset("/posters/megaphone-cutout.png", setMegaphoneDataUrl);

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Preload company logo if available
  useEffect(() => {
    if (!isOpen || !job) return;

    let cancelled = false;
    const rawLogoUrl = getCompanyLogoUrl(job);

    if (!rawLogoUrl) {
      window.requestAnimationFrame(() => {
        if (!cancelled) setCompanyLogoDataUrl(null);
      });
      return;
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
  }, [isOpen, job]);

  // Responsive stage observer
  useEffect(() => {
    if (!isOpen || !previewStageRef.current) return;

    const node = previewStageRef.current;
    const updateSize = () => {
      const computed = window.getComputedStyle(node);
      const paddingX =
        (parseFloat(computed.paddingLeft) || 0) +
        (parseFloat(computed.paddingRight) || 0);
      setStageWidth(Math.max(0, node.clientWidth - paddingX));
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setStageWidth(entry.contentRect.width);
        }
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [isOpen]);

  const formatSpec = POSTER_FORMATS[format];

  // Maximum preview container height inside the modal
  const maxStageHeight = 430;
  const previewScale =
    stageWidth > 0
      ? Math.min(
        stageWidth / formatSpec.width,
        maxStageHeight / formatSpec.height
      )
      : 0.32;

  const previewDisplayWidth = Math.round(formatSpec.width * previewScale);
  const previewDisplayHeight = Math.round(formatSpec.height * previewScale);

  const handleDownloadPng = async () => {
    if (!job || exporting) return;
    const node = exportNodeRef.current;
    if (!node) {
      toast.error("Poster is preparing. Please try again.");
      return;
    }

    setExporting(true);

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
        fontEmbedCSS = await getFontEmbedCSS(node);
      } catch {
        fontEmbedCSS = undefined;
      }

      const commonOptions = {
        width: formatSpec.width,
        height: formatSpec.height,
        canvasWidth: formatSpec.width,
        canvasHeight: formatSpec.height,
        pixelRatio: 2, // High resolution export
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
        blob = await toBlob(node, {
          ...commonOptions,
          skipFonts: true,
        });
      }

      if (!blob || blob.size < 1000) {
        throw new Error("Generated image was empty.");
      }

      const filename = getPosterFilename(job, format, template);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

      toast.success("Job poster downloaded successfully!");
    } catch (error) {
      console.error("Failed to export poster PNG:", error);
      toast.error("Could not generate poster PNG. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      className="rounded-modal border border-border-default shadow-modal overflow-hidden"
      headerClassName="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-border-subtle bg-surface-card"
      bodyClassName="px-5 pb-5 pt-3.5 sm:px-6 sm:pb-6 bg-surface-card"
      title={
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:pr-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand">
              <Sparkles size={14} />
            </span>
            <span className="text-base font-bold text-text-primary">
              Job Poster
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-semibold text-text-primary truncate max-w-[220px]">
              {job.title}
            </span>
            <span>·</span>
            <span className="truncate max-w-[150px]">{job.company}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Sleek Segmented Controls: Small rounded corners (rounded-control) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Template segmented pill group */}
          <div className="flex flex-wrap items-center gap-1 rounded-control bg-surface-subtle p-1 border border-border-subtle">
            <span className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Template
            </span>
            {POSTER_TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTemplate(item.id)}
                className={`rounded-control px-2.5 py-1 text-xs font-semibold transition-all ${template === item.id
                  ? "bg-brand text-text-inverse shadow-subtle"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-card/80"
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Font segmented pill group */}
          <div className="flex flex-wrap items-center gap-1 rounded-control bg-surface-subtle p-1 border border-border-subtle">
            <span className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Font
            </span>
            {POSTER_FONTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFontId(item.id)}
                style={{ fontFamily: item.fontFamily }}
                className={`rounded-control px-2 py-1 text-xs font-semibold transition-all ${fontId === item.id
                  ? "bg-brand text-text-inverse shadow-subtle"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-card/80"
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Format segmented pill group */}
          <div className="flex flex-wrap items-center gap-1 rounded-control bg-surface-subtle p-1 border border-border-subtle">
            <span className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Format
            </span>
            {(["feed", "square", "story"] as PosterFormatId[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-control px-2.5 py-1 text-xs font-semibold transition-all ${format === f
                  ? "bg-brand text-text-inverse shadow-subtle"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-card/80"
                  }`}
              >
                {POSTER_FORMATS[f].label}
              </button>
            ))}
          </div>

          {/* Portrait segmented pill group (for Editorial Portrait) */}
          {template === "portrait" && (
            <div className="flex flex-wrap items-center gap-1 rounded-control bg-surface-subtle p-1 border border-border-subtle">
              <span className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Model
              </span>
              {POSTER_PORTRAITS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPortraitId(p.id)}
                  className={`flex items-center gap-1.5 rounded-control px-2.5 py-1 text-xs font-semibold transition-all ${portraitId === p.id
                    ? "bg-brand text-text-inverse shadow-subtle"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-card/80"
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.name}
                    className="h-4 w-4 rounded-full object-cover ring-1 ring-border-subtle"
                  />
                  <span>{p.name}</span>
                  <span
                    className={`rounded px-1 py-0.5 text-[9px] font-medium uppercase ${portraitId === p.id
                      ? "bg-white/20 text-text-inverse"
                      : "bg-surface-muted text-text-muted"
                      }`}
                  >
                    {p.gender === "male" ? "Man" : "Woman"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Studio Preview Stage: Stage has small rounded corners (rounded-card), POSTER HAS SHARP CORNERS (rounded-none) */}
        <div
          ref={previewStageRef}
          className="flex min-h-[390px] w-full items-center justify-center rounded-card border border-border-subtle/80 bg-gradient-to-b from-surface-subtle/80 to-surface-muted/30 p-4 sm:p-5"
        >
          {previewDisplayWidth > 0 ? (
            <div
              style={{
                width: previewDisplayWidth,
                height: previewDisplayHeight,
              }}
              className="relative overflow-hidden rounded-none shadow-[0_20px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/10 bg-white"
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
                  job={job}
                  template={template}
                  format={format}
                  logoSrc={logoDataUrl}
                  whiteLogoSrc={whiteLogoDataUrl}
                  megaphoneSrc={megaphoneDataUrl}
                  companyLogoSrc={companyLogoDataUrl}
                  fontFamily={activeFont.fontFamily}
                  showHighlights={true}
                  portraitSrc={activePortrait.src}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-text-muted">
              <Loader2 size={18} className="animate-spin text-brand" />
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <span className="rounded-control bg-surface-subtle border border-border-subtle px-2 py-0.5 text-[11px] font-medium text-text-muted">
              {formatSpec.width} × {formatSpec.height} px · {formatSpec.ratio}
            </span>
            <a
              href={`/job-posters?jobId=${encodeURIComponent(job.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-brand transition-colors"
            >
              <span>Full Studio</span>
              <ExternalLink size={12} className="text-text-muted" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-control border border-border-default bg-surface-card px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              Close
            </button>

            <button
              type="button"
              disabled={exporting}
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Poster PNG</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Unscaled 1080px Export Surface (for html-to-image capture) */}
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
          job={job}
          template={template}
          format={format}
          logoSrc={logoDataUrl}
          whiteLogoSrc={whiteLogoDataUrl}
          megaphoneSrc={megaphoneDataUrl}
          companyLogoSrc={companyLogoDataUrl}
          fontFamily={activeFont.fontFamily}
          showHighlights={true}
          portraitSrc={activePortrait.src}
        />
      </div>
    </Modal>
  );
}
