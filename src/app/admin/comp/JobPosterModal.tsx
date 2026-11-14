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
  getPosterFilename,
  POSTER_FORMATS,
  POSTER_TEMPLATES,
  type PosterFormatId,
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
  const [template, setTemplate] = useState<PosterTemplateId>("bold");
  const [format, setFormat] = useState<PosterFormatId>("feed");
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
      bodyClassName="p-5 sm:p-6"
      title={
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand">
            <ImageDown size={15} />
          </span>
          <span className="text-base font-bold text-text-primary">
            Job Poster Preview
          </span>
        </div>
      }
      description={
        <span className="text-xs text-text-muted">
          Generate shareable social cards for <strong>{job.title}</strong> at {job.company}
        </span>
      }
    >
      <div className="space-y-5">
        {/* Controls Bar: Template & Format Selectors */}
        <div className="flex flex-col gap-3 rounded-card border border-border-default bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Template pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Template:
            </span>
            {POSTER_TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTemplate(item.id)}
                className={`rounded-control px-2.5 py-1 text-xs font-semibold transition ${
                  template === item.id
                    ? "bg-brand text-text-inverse shadow-subtle"
                    : "border border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Format pills */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-2 sm:border-t-0 sm:pt-0">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Format:
            </span>
            {(["feed", "square", "story"] as PosterFormatId[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-control px-2.5 py-1 text-xs font-semibold transition ${
                  format === f
                    ? "bg-brand text-text-inverse shadow-subtle"
                    : "border border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                }`}
              >
                {POSTER_FORMATS[f].label}
              </button>
            ))}
          </div>
        </div>

        {/* Scaled Preview Stage */}
        <div
          ref={previewStageRef}
          className="flex min-h-[380px] w-full items-center justify-center rounded-panel border border-border-default bg-surface-subtle/60 p-4 sm:p-5"
        >
          {previewDisplayWidth > 0 ? (
            <div
              style={{
                width: previewDisplayWidth,
                height: previewDisplayHeight,
              }}
              className="relative overflow-hidden rounded-[6px] border border-border-default bg-white shadow-card"
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
                  job={job}
                  template={template}
                  format={format}
                  logoSrc={logoDataUrl}
                  whiteLogoSrc={whiteLogoDataUrl}
                  megaphoneSrc={megaphoneDataUrl}
                  companyLogoSrc={companyLogoDataUrl}
                  fontFamily={resolvedFontFamily}
                  showHighlights={true}
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
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between border-t border-border-subtle">
          <a
            href={`/job-posters?jobId=${encodeURIComponent(job.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-brand transition"
          >
            <span>Open in Full Studio</span>
            <ExternalLink size={12} className="text-text-muted" />
          </a>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-control border border-border-default bg-surface-card px-4 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle"
            >
              Close
            </button>

            <button
              type="button"
              disabled={exporting}
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover disabled:opacity-50"
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
          fontFamily={resolvedFontFamily}
          showHighlights={true}
        />
      </div>
    </Modal>
  );
}
