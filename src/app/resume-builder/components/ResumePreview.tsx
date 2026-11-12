"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, ZoomIn, ZoomOut } from "lucide-react";
import type { ResumeData } from "@/lib/resume/types";
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  MARGIN_TOP_PT,
  MARGIN_X_PT,
  layoutResumeDocument,
} from "@/lib/resume/document-layout";

const PT_TO_PX = 96 / 72;
const PAGE_WIDTH_PX = A4_WIDTH_PT * PT_TO_PX; // ~793.7px
const PAGE_HEIGHT_PX = A4_HEIGHT_PT * PT_TO_PX; // ~1122.5px
const PAD_X_PX = MARGIN_X_PT * PT_TO_PX; // 64px
const PAD_TOP_PX = MARGIN_TOP_PT * PT_TO_PX; // 58.67px

type ZoomMode = "fit" | "75" | "100";

interface ResumePreviewProps {
  data: ResumeData;
  documentTitle?: string;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(560);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(240, el.clientWidth - 24);
      setContainerWidth(next);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => layoutResumeDocument(data), [data]);

  const scale = useMemo(() => {
    const fitScale = Math.min(1, containerWidth / PAGE_WIDTH_PX);
    if (zoomMode === "fit") return fitScale;
    if (zoomMode === "75") return Math.min(0.75, fitScale * 1.15);
    return 1;
  }, [containerWidth, zoomMode]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-subtle">
      {/* Preview Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default bg-surface-card px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <FileText size={14} className="text-brand" />
          <span className="font-semibold text-text-primary">A4 ATS Preview</span>
          <span className="text-border-strong">·</span>
          <span>
            {layout.pages.length} {layout.pages.length === 1 ? "page" : "pages"}
          </span>
          <span className="hidden text-text-muted sm:inline">· Arial, single column</span>
        </div>

        <div
          className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle p-0.5 text-[11px]"
          role="group"
          aria-label="Preview zoom"
        >
          <button
            type="button"
            onClick={() => setZoomMode("fit")}
            className={`cursor-pointer rounded-control px-2 py-1 font-medium transition-colors ${
              zoomMode === "fit"
                ? "bg-surface-card text-brand shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoomMode("75")}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-control px-2 py-1 font-medium transition-colors ${
              zoomMode === "75"
                ? "bg-surface-card text-brand shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ZoomOut size={11} />
            75%
          </button>
          <button
            type="button"
            onClick={() => setZoomMode("100")}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-control px-2 py-1 font-medium transition-colors ${
              zoomMode === "100"
                ? "bg-surface-card text-brand shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ZoomIn size={11} />
            100%
          </button>
        </div>
      </div>

      {/* Pages Scroll Area */}
      <div
        ref={containerRef}
        className={`min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5 ${
          zoomMode === "100" ? "overflow-x-auto" : "overflow-x-hidden"
        }`}
      >
        <div className="mx-auto flex flex-col items-center gap-5">
          {layout.pages.map((page) => (
            <div key={page.pageNumber} className="flex flex-col items-center">
              <div
                style={{
                  width: `${PAGE_WIDTH_PX * scale}px`,
                  height: `${PAGE_HEIGHT_PX * scale}px`,
                }}
                className="relative overflow-hidden rounded-control border border-border-default bg-white shadow-card"
              >
                <article
                  aria-label={`Resume preview page ${page.pageNumber}`}
                  style={{
                    width: `${PAGE_WIDTH_PX}px`,
                    height: `${PAGE_HEIGHT_PX}px`,
                    paddingLeft: `${PAD_X_PX}px`,
                    paddingRight: `${PAD_X_PX}px`,
                    paddingTop: `${PAD_TOP_PX}px`,
                    paddingBottom: `${PAD_TOP_PX}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    color: "#141717",
                  }}
                  className="bg-white select-text"
                >
                  {!layout.hasAnyContent && page.pageNumber === 1 ? (
                    <div className="flex h-full flex-col items-center justify-center border border-dashed border-[#d4d8d6] p-12 text-center">
                      <p className="text-[16px] font-bold text-[#141717]">
                        Your ATS-Friendly Resume Preview
                      </p>
                      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[#59615e]">
                        Start filling in your details on the left. Your single-column A4 resume
                        updates here in real time—with no layout tables, icons, or graphics that
                        interfere with ATS text extraction.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {page.blocks.map((block, idx) => {
                        if (block.type === "header") {
                          return (
                            <header
                              key={`h-${idx}`}
                              style={{ height: `${block.heightPt * PT_TO_PX}px` }}
                              className="overflow-hidden"
                            >
                              {block.fullName && (
                                <h1
                                  style={{
                                    fontSize: `${18 * PT_TO_PX}px`,
                                    lineHeight: `${22 * PT_TO_PX}px`,
                                    margin: 0,
                                  }}
                                  className="font-bold text-[#141717]"
                                >
                                  {block.fullName}
                                </h1>
                              )}

                              {block.headline && (
                                <p
                                  style={{
                                    fontSize: `${10.5 * PT_TO_PX}px`,
                                    lineHeight: `${15 * PT_TO_PX}px`,
                                    margin: 0,
                                  }}
                                  className="text-[#3d4542]"
                                >
                                  {block.headline}
                                </p>
                              )}

                              {block.contactLines.length > 0 && (
                                <div
                                  style={{
                                    marginBottom: `${3 * PT_TO_PX}px`,
                                  }}
                                >
                                  {block.contactLines.map((segLine, lineIdx) => (
                                    <p
                                      key={lineIdx}
                                      style={{
                                        fontSize: `${9.5 * PT_TO_PX}px`,
                                        lineHeight: `${13 * PT_TO_PX}px`,
                                        margin: 0,
                                      }}
                                      className="text-[#3d4542]"
                                    >
                                      {segLine.map((seg, sIdx) => (
                                        <span key={sIdx}>
                                          {seg.href ? (
                                            <a
                                              href={seg.href}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[#3d4542] underline-offset-2 hover:underline"
                                            >
                                              {seg.text}
                                            </a>
                                          ) : (
                                            <span>{seg.text}</span>
                                          )}
                                          {sIdx < segLine.length - 1 && (
                                            <span className="text-[#59615e]">{"  |  "}</span>
                                          )}
                                        </span>
                                      ))}
                                    </p>
                                  ))}
                                </div>
                              )}

                              <div
                                style={{
                                  marginTop: `${2 * PT_TO_PX}px`,
                                  borderBottom: "1px solid #c7ccc9",
                                }}
                              />
                            </header>
                          );
                        }

                        if (block.type === "section-heading") {
                          return (
                            <div
                              key={`sh-${idx}`}
                              style={{
                                height: `${block.heightPt * PT_TO_PX}px`,
                                paddingTop: `${4 * PT_TO_PX}px`,
                              }}
                            >
                              <h2
                                style={{
                                  fontSize: `${10.5 * PT_TO_PX}px`,
                                  lineHeight: `${12 * PT_TO_PX}px`,
                                  margin: 0,
                                  letterSpacing: "0.04em",
                                }}
                                className="font-bold uppercase text-[#141717]"
                              >
                                {block.title}
                              </h2>
                              <div
                                style={{
                                  borderBottom: "0.75px solid #c7ccc9",
                                }}
                              />
                            </div>
                          );
                        }

                        if (block.type === "split-row") {
                          const rightSize = Math.max(9, block.fontSizePt - 0.5);
                          return (
                            <div
                              key={`sr-${idx}`}
                              style={{
                                height: `${block.heightPt * PT_TO_PX}px`,
                                paddingBottom: `${block.spaceAfterPt * PT_TO_PX}px`,
                              }}
                              className="relative"
                            >
                              {block.leftLines.map((line, lIdx) => (
                                <div
                                  key={lIdx}
                                  style={{
                                    height: `${block.lineHeightPt * PT_TO_PX}px`,
                                    lineHeight: `${block.lineHeightPt * PT_TO_PX}px`,
                                  }}
                                  className="flex items-baseline justify-between gap-3"
                                >
                                  <span
                                    style={{ fontSize: `${block.fontSizePt * PT_TO_PX}px` }}
                                    className={
                                      block.boldLeft
                                        ? "font-bold text-[#141717]"
                                        : "text-[#141717]"
                                    }
                                  >
                                    {line}
                                  </span>
                                  {lIdx === 0 && block.rightText && (
                                    <span
                                      style={{ fontSize: `${rightSize * PT_TO_PX}px` }}
                                      className="shrink-0 text-[#3d4542]"
                                    >
                                      {block.rightText}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (block.type === "paragraph") {
                          const colorClass =
                            block.color === "muted"
                              ? "text-[#59615e]"
                              : block.color === "secondary"
                                ? "text-[#3d4542]"
                                : "text-[#141717]";
                          return (
                            <div
                              key={`p-${idx}`}
                              style={{
                                height: `${block.heightPt * PT_TO_PX}px`,
                                paddingBottom: `${block.spaceAfterPt * PT_TO_PX}px`,
                              }}
                            >
                              {block.lines.map((line, lIdx) => (
                                <p
                                  key={lIdx}
                                  style={{
                                    fontSize: `${block.fontSizePt * PT_TO_PX}px`,
                                    lineHeight: `${block.lineHeightPt * PT_TO_PX}px`,
                                    margin: 0,
                                  }}
                                  className={`${colorClass} ${block.bold ? "font-bold" : ""}`}
                                >
                                  {block.href ? (
                                    <a
                                      href={block.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline-offset-2 hover:underline"
                                    >
                                      {line}
                                    </a>
                                  ) : (
                                    line
                                  )}
                                </p>
                              ))}
                            </div>
                          );
                        }

                        if (block.type === "bullet") {
                          return (
                            <div
                              key={`b-${idx}`}
                              style={{
                                height: `${block.heightPt * PT_TO_PX}px`,
                                paddingBottom: `${block.spaceAfterPt * PT_TO_PX}px`,
                              }}
                            >
                              {block.lines.map((line, lIdx) => (
                                <div
                                  key={lIdx}
                                  style={{
                                    fontSize: `${block.fontSizePt * PT_TO_PX}px`,
                                    lineHeight: `${block.lineHeightPt * PT_TO_PX}px`,
                                    paddingLeft: `${14 * PT_TO_PX}px`,
                                  }}
                                  className="relative text-[#141717]"
                                >
                                  {lIdx === 0 && (
                                    <span
                                      aria-hidden="true"
                                      style={{ left: `${3 * PT_TO_PX}px` }}
                                      className="absolute top-0"
                                    >
                                      •
                                    </span>
                                  )}
                                  <span>{line}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (block.type === "skill-line") {
                          return (
                            <div
                              key={`sk-${idx}`}
                              style={{
                                height: `${block.heightPt * PT_TO_PX}px`,
                                paddingBottom: `${block.spaceAfterPt * PT_TO_PX}px`,
                              }}
                            >
                              {block.lines.map((line, lIdx) => (
                                <p
                                  key={lIdx}
                                  style={{
                                    fontSize: `${block.fontSizePt * PT_TO_PX}px`,
                                    lineHeight: `${block.lineHeightPt * PT_TO_PX}px`,
                                    margin: 0,
                                  }}
                                  className="text-[#141717]"
                                >
                                  {line.categoryPrefix && (
                                    <strong className="font-bold">
                                      {line.categoryPrefix}
                                    </strong>
                                  )}
                                  <span>{line.text}</span>
                                </p>
                              ))}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`gap-${idx}`}
                            style={{ height: `${block.heightPt * PT_TO_PX}px` }}
                          />
                        );
                      })}
                    </div>
                  )}
                </article>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-text-muted">
                Page {page.pageNumber} of {layout.pages.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

