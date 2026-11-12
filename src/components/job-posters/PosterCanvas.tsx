"use client";

import React, { forwardRef } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Clock3,
  Globe,
  MapPin,
  Wallet,
} from "lucide-react";
import type { Job } from "@/app/types/job";
import {
  normalizePosterJobData,
  POSTER_FORMATS,
  truncateText,
  type NormalizedPosterJob,
  type PosterFormatId,
  type PosterTemplateId,
} from "@/lib/job-posters/poster-utils";
import { PosterQrCode } from "./PosterQrCode";

export interface PosterCanvasProps {
  job: Job;
  template: PosterTemplateId;
  format: PosterFormatId;
  logoSrc: string;
  whiteLogoSrc?: string;
  megaphoneSrc?: string;
  companyLogoSrc?: string | null;
  fontFamily?: string;
  showHighlights?: boolean;
}

interface TemplateRenderProps {
  data: NormalizedPosterJob;
  format: PosterFormatId;
  logoSrc: string;
  whiteLogoSrc: string;
  megaphoneSrc: string;
  companyLogoSrc: string | null;
  showHighlights: boolean;
}

const DEFAULT_FONT = 'var(--font-manrope), "Manrope", Arial, sans-serif';
const DEFAULT_WHITE_LOGO = "/posters/logo-white.png";
const DEFAULT_MEGAPHONE = "/posters/megaphone-cutout.png";

function getAdaptiveTitleSize(title: string, basePx: number): number {
  const len = title.length;
  if (len > 54) return Math.round(basePx * 0.68);
  if (len > 40) return Math.round(basePx * 0.78);
  if (len > 28) return Math.round(basePx * 0.88);
  return basePx;
}

/**
 * Pure geometric dot-matrix SVG layer without <pattern> url(#...) references
 * so html-to-image SVG foreignObject serialization renders identically everywhere.
 */
function DotMatrixTexture({
  width,
  height,
  cols = 14,
  rows = 18,
  color = "#087F50",
  opacity = 0.08,
  radius = 2,
}: {
  width: number;
  height: number;
  cols?: number;
  rows?: number;
  color?: string;
  opacity?: number;
  radius?: number;
}) {
  const dots: Array<{ cx: number; cy: number; key: string }> = [];
  const stepX = width / (cols + 1);
  const stepY = height / (rows + 1);

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      dots.push({
        cx: Math.round(c * stepX),
        cy: Math.round(r * stepY),
        key: `${r}-${c}`,
      });
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {dots.map((d) => (
        <circle
          key={d.key}
          cx={d.cx}
          cy={d.cy}
          r={radius}
          fill={color}
          fillOpacity={opacity}
        />
      ))}
    </svg>
  );
}

/**
 * Concentric signal ripples centered behind focal poster artwork.
 */
function ConcentricRipples({
  width,
  height,
  cx,
  cy,
  radii,
  stroke = "#FFFFFF",
  opacity = 0.1,
  strokeWidth = 1.5,
}: {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radii: number[];
  stroke?: string;
  opacity?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {radii.map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          stroke={stroke}
          strokeOpacity={opacity}
          strokeWidth={strokeWidth}
        />
      ))}
    </svg>
  );
}

/**
 * Four-point poster sparkle accent matching modern editorial hiring posters.
 */
function SparkleStar({
  size = 44,
  color = "#FFFFFF",
  style,
}: {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        pointerEvents: "none",
        ...style,
      }}
    >
      <path
        d="M24 2C25.9 14.8 33.2 22.1 46 24C33.2 25.9 25.9 33.2 24 46C22.1 33.2 14.8 25.9 2 24C14.8 22.1 22.1 14.8 24 2Z"
        fill={color}
      />
    </svg>
  );
}

function ZenowayLockup({
  logoSrc,
  size = "md",
  darkText = true,
}: {
  logoSrc: string;
  size?: "sm" | "md" | "lg";
  darkText?: boolean;
}) {
  const iconH = size === "lg" ? 40 : size === "sm" ? 30 : 36;
  const fontSize = size === "lg" ? 34 : size === "sm" ? 26 : 31;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="Zenoway"
        loading="eager"
        decoding="sync"
        style={{
          height: iconH,
          width: "auto",
          display: "block",
          objectFit: "contain",
        }}
      />
      <span
        style={{
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: darkText ? "#12231B" : "#FFFFFF",
        }}
      >
        zenoway
      </span>
    </div>
  );
}

/**
 * Renders an uploaded company mark cleanly when available (no generic monogram boxes).
 */
function CompanyLogoBadge({
  company,
  companyLogoSrc,
  size = 48,
  darkSurface = false,
}: {
  company: string;
  companyLogoSrc: string | null;
  size?: number;
  darkSurface?: boolean;
}) {
  if (!companyLogoSrc) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        border: darkSurface ? "1px solid rgba(255,255,255,0.22)" : "1px solid #D5E4DA",
        backgroundColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={companyLogoSrc}
        alt={company}
        loading="eager"
        decoding="sync"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}

/* ============================================================================
 * Template C: Bold Hiring — Billboard Emerald Studio Campaign
 * Full-bleed emerald radial depth, billboard-scale "We're / Hiring!" headline,
 * clear Regular Job Title contrast, 3D megaphone hand, sparkles & QR.
 * ============================================================================ */
function BoldHiringPoster({
  data,
  format,
  whiteLogoSrc,
  megaphoneSrc,
  companyLogoSrc,
  showHighlights,
}: TemplateRenderProps) {
  const isStory = format === "story";
  const isSquare = format === "square";
  const spec = POSTER_FORMATS[format];

  const heroWordSize = isStory ? 182 : isSquare ? 120 : 156;
  const titleSize = getAdaptiveTitleSize(
    data.title,
    isStory ? 78 : isSquare ? 54 : 68
  );

  const displayBullets =
    showHighlights && data.bullets.length > 0
      ? data.bullets.slice(0, isStory ? 3 : isSquare ? 2 : 3)
      : [];

  const prioritySpecs = [
    data.location
      ? {
          key: "loc",
          value: data.location,
          icon:
            data.workMode === "Remote"
              ? Globe
              : data.workMode === "Hybrid"
                ? Building2
                : MapPin,
          highlight: false,
        }
      : null,
    data.salary
      ? {
          key: "sal",
          value: data.salary,
          icon: Wallet,
          highlight: true,
        }
      : null,
    data.employmentType
      ? {
          key: "type",
          value: data.employmentType,
          icon: Clock3,
          highlight: false,
        }
      : null,
    data.experience
      ? {
          key: "exp",
          value: data.experience,
          icon: BriefcaseBusiness,
          highlight: false,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    value: string;
    icon: typeof MapPin;
    highlight: boolean;
  }>;

  const megaphonePos = isStory
    ? { top: 840, width: 515 }
    : isSquare
      ? { top: 300, width: 410 }
      : { top: 485, width: 480 };

  const rippleCenter = isStory
    ? { cx: 835, cy: 1015 }
    : isSquare
      ? { cx: 865, cy: 440 }
      : { cx: 845, cy: 655 };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#077D4E",
        backgroundImage:
          "radial-gradient(circle at 76% 48%, rgba(24, 200, 126, 0.44) 0%, rgba(14, 154, 96, 0.16) 40%, rgba(4, 74, 46, 0.72) 100%), linear-gradient(155deg, #09965E 0%, #077A4C 54%, #044D30 100%)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isStory ? "78px 72px 64px" : isSquare ? "42px 58px 36px" : "58px 72px 46px",
        boxSizing: "border-box",
      }}
    >
      {/* Concentric Signal Ripples behind Megaphone */}
      <ConcentricRipples
        width={spec.width}
        height={spec.height}
        cx={rippleCenter.cx}
        cy={rippleCenter.cy}
        radii={isStory ? [190, 290, 390, 490] : [145, 225, 310, 395]}
        stroke="#FFFFFF"
        opacity={0.1}
        strokeWidth={1.6}
      />

      {/* Graphic Sparkles */}
      <SparkleStar
        size={isSquare ? 36 : 48}
        color="#FFFFFF"
        style={{
          left: isStory ? 635 : isSquare ? 610 : 620,
          top: isStory ? 535 : isSquare ? 145 : 265,
        }}
      />
      <SparkleStar
        size={isSquare ? 42 : 54}
        color="#B8FF3B"
        style={{
          right: isSquare ? 88 : 112,
          top: isStory ? 745 : isSquare ? 235 : 410,
        }}
      />
      <SparkleStar
        size={isSquare ? 36 : 46}
        color="#FFFFFF"
        style={{
          left: isStory ? 595 : isSquare ? 595 : 590,
          top: isStory ? 1275 : isSquare ? 630 : 845,
        }}
      />
      {isStory && (
        <SparkleStar
          size={40}
          color="#B8FF3B"
          style={{
            right: 110,
            bottom: 245,
          }}
        />
      )}

      {/* Focal 3D Megaphone Hand Asset anchored flush right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={megaphoneSrc}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="sync"
        style={{
          position: "absolute",
          right: 0,
          top: megaphonePos.top,
          width: megaphonePos.width,
          height: "auto",
          display: "block",
          zIndex: 2,
          pointerEvents: "none",
          filter: "drop-shadow(0 28px 34px rgba(2, 28, 17, 0.42))",
        }}
      />

      {/* Top Brand Header */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <ZenowayLockup
          logoSrc={whiteLogoSrc}
          size={isSquare ? "sm" : "md"}
          darkText={false}
        />
        <span
          style={{
            fontSize: isStory ? 21 : isSquare ? 17 : 19,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.88)",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
        >
          www.zenoway.online
        </span>
      </div>

      {/* Main Campaign Typographic Stage */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: isStory ? 32 : isSquare ? 10 : 20,
          paddingBottom: isStory ? 32 : isSquare ? 12 : 20,
        }}
      >
        {/* Massive Billboard Two-Line Display Headline */}
        <div
          style={{
            fontSize: heroWordSize,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.045em",
            color: "#B8FF3B",
          }}
        >
          <div>We’re</div>
          <div>Hiring!</div>
        </div>

        {/* Crisp Regular-Weight Editorial Job Title Contrast */}
        <h1
          style={{
            margin: 0,
            marginTop: isStory ? 34 : isSquare ? 18 : 24,
            fontSize: titleSize,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "#FFFFFF",
            maxWidth: isStory ? 520 : isSquare ? 500 : 510,
          }}
        >
          {truncateText(data.title, 68)}
        </h1>

        {/* Clean Company Attribution */}
        <div
          style={{
            marginTop: isStory ? 22 : isSquare ? 10 : 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <CompanyLogoBadge
            company={data.company}
            companyLogoSrc={companyLogoSrc}
            size={isSquare ? 36 : 42}
            darkSurface={true}
          />
          <span
            style={{
              fontSize: isStory ? 29 : isSquare ? 22 : 25,
              fontWeight: 600,
              color: "#CCF7DE",
              letterSpacing: "-0.01em",
            }}
          >
            {truncateText(data.company, 40)}
          </span>
        </div>

        {/* Priority Unboxed Role Details (Location, Salary, Engagement, Experience) */}
        {prioritySpecs.length > 0 && (
          <div
            style={{
              marginTop: isStory ? 30 : isSquare ? 16 : 22,
              maxWidth: isStory ? 520 : isSquare ? 510 : 515,
              display: "flex",
              flexWrap: "wrap",
              columnGap: isStory ? 28 : isSquare ? 20 : 26,
              rowGap: isStory ? 14 : isSquare ? 9 : 12,
            }}
          >
            {prioritySpecs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    color: item.highlight ? "#B8FF3B" : "#FFFFFF",
                    fontSize: isStory ? 24 : isSquare ? 19 : 22,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon
                    size={isSquare ? 18 : 20}
                    strokeWidth={2.3}
                    style={{
                      color: "#B8FF3B",
                      flexShrink: 0,
                    }}
                  />
                  <span>{truncateText(item.value, 36)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Scannable Bullets safely clear of Megaphone */}
        {displayBullets.length > 0 && (
          <div
            style={{
              marginTop: isStory ? 38 : isSquare ? 16 : 26,
              maxWidth: isStory ? 500 : isSquare ? 495 : 500,
            }}
          >
            <div
              style={{
                fontSize: isStory ? 25 : isSquare ? 18 : 21,
                fontWeight: 700,
                color: "#B8FF3B",
                marginBottom: isStory ? 14 : 8,
                letterSpacing: "-0.01em",
              }}
            >
              Key highlights:
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isStory ? 12 : isSquare ? 6 : 8,
              }}
            >
              {displayBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 11,
                    fontSize: isStory ? 24 : isSquare ? 18 : 21,
                    fontWeight: 400,
                    lineHeight: 1.34,
                    color: "#F3FCF7",
                  }}
                >
                  <span
                    style={{
                      color: "#B8FF3B",
                      fontWeight: 800,
                      lineHeight: 1.32,
                      flexShrink: 0,
                    }}
                  >
                    •
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unified Bottom QR & Application Footer Strip */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          borderTop: "1px solid rgba(255, 255, 255, 0.24)",
          paddingTop: isStory ? 30 : isSquare ? 18 : 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isSquare ? 16 : 22,
            minWidth: 0,
          }}
        >
          <PosterQrCode
            value={data.jobUrl}
            size={isStory ? 128 : isSquare ? 96 : 114}
            borderColor="none"
            padding={isSquare ? 6 : 8}
            borderRadius={6}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isStory ? 16 : 14,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#CCF7DE",
                marginBottom: 4,
                whiteSpace: "nowrap",
              }}
            >
              Interested?
            </div>
            <div
              style={{
                fontSize: isStory ? 28 : isSquare ? 21 : 25,
                fontWeight: 800,
                letterSpacing: "0.01em",
                color: "#B8FF3B",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}
            >
              APPLY NOW!
            </div>
            <div
              style={{
                fontSize: isStory ? 21 : isSquare ? 16 : 19,
                fontWeight: 500,
                color: "#FFFFFF",
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              Scan QR code to apply online
            </div>
          </div>
        </div>

        <div
          style={{
            paddingLeft: isSquare ? 20 : 28,
            borderLeft: "1px solid rgba(255, 255, 255, 0.22)",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: isStory ? 16 : 14,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.85)",
              whiteSpace: "nowrap",
            }}
          >
            Join Our Growing Team
          </div>
          <div
            style={{
              fontSize: isStory ? 22 : isSquare ? 17 : 19,
              fontWeight: 700,
              color: "#FFFFFF",
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {data.companyWebsiteDisplay || truncateText(data.company, 24)}
          </div>
          <div
            style={{
              fontSize: isStory ? 18 : isSquare ? 15 : 16,
              fontWeight: 500,
              color: "#CCF7DE",
              marginTop: 3,
              whiteSpace: "nowrap",
            }}
          >
            {data.workMode} Opportunity
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Template A: Minimal — Crisp Swiss Gallery Editorial Poster
 * Billboard stacked emerald "We're / Hiring!", Regular Job Title contrast,
 * balanced adaptive column row (zero orphan 2+1 slot), & clean QR footer.
 * ============================================================================ */
function MinimalPoster({
  data,
  format,
  logoSrc,
  companyLogoSrc,
  showHighlights,
}: TemplateRenderProps) {
  const isStory = format === "story";
  const isSquare = format === "square";
  const spec = POSTER_FORMATS[format];

  const heroWordSize = isStory ? 172 : isSquare ? 114 : 148;
  const titleSize = getAdaptiveTitleSize(
    data.title,
    isStory ? 76 : isSquare ? 54 : 66
  );

  const specItems = [
    data.location ? { label: "Location", value: data.location, accent: false } : null,
    data.salary ? { label: "Compensation", value: data.salary, accent: true } : null,
    data.employmentType ? { label: "Engagement", value: data.employmentType, accent: false } : null,
    data.experience ? { label: "Experience", value: data.experience, accent: false } : null,
  ].filter((item): item is { label: string; value: string; accent: boolean } => item !== null);

  const displayBullets =
    showHighlights && data.bullets.length > 0
      ? data.bullets.slice(0, isStory ? 3 : isSquare ? 2 : 3)
      : [];

  // Prevent orphan 2+1 cell when 3 metrics exist by placing 3 side-by-side cleanly
  const specCols = specItems.length === 4 ? 2 : Math.max(1, specItems.length);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#FAFDFB",
        backgroundImage:
          "radial-gradient(circle at 92% 14%, rgba(15, 169, 104, 0.13) 0%, rgba(15, 169, 104, 0) 44%), radial-gradient(circle at 6% 88%, rgba(8, 127, 80, 0.08) 0%, rgba(8, 127, 80, 0) 40%), linear-gradient(160deg, #FFFFFF 0%, #F7FBF8 58%, #ECF6F0 100%)",
        color: "#12231B",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isStory ? "82px 78px" : isSquare ? "46px 68px" : "64px 78px",
        boxSizing: "border-box",
      }}
    >
      {/* Subtle Studio Texture & Concentric Arcs */}
      <DotMatrixTexture
        width={spec.width}
        height={spec.height}
        cols={14}
        rows={isStory ? 22 : isSquare ? 14 : 16}
        color="#087F50"
        opacity={0.045}
        radius={1.6}
      />
      <ConcentricRipples
        width={spec.width}
        height={spec.height}
        cx={spec.width - 55}
        cy={isStory ? 320 : 215}
        radii={[140, 240, 340, 440]}
        stroke="#087F50"
        opacity={0.095}
        strokeWidth={1.5}
      />

      {/* Sculptural Sparkles on Right Canvas */}
      <SparkleStar
        size={isSquare ? 42 : 54}
        color="#087F50"
        style={{
          right: isSquare ? 88 : 110,
          top: isStory ? 265 : isSquare ? 150 : 200,
        }}
      />
      <SparkleStar
        size={isSquare ? 26 : 32}
        color="#0FA968"
        style={{
          right: isSquare ? 168 : 206,
          top: isStory ? 205 : isSquare ? 115 : 150,
        }}
      />
      <SparkleStar
        size={isSquare ? 22 : 28}
        color="#34D399"
        style={{
          right: isSquare ? 74 : 96,
          top: isStory ? 375 : isSquare ? 235 : 305,
        }}
      />

      {/* Top Editorial Bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: isStory ? 34 : isSquare ? 18 : 24,
          borderBottom: "1px solid rgba(8, 127, 80, 0.16)",
        }}
      >
        <ZenowayLockup logoSrc={logoSrc} size={isSquare ? "sm" : "md"} />
        <span
          style={{
            fontSize: isStory ? 20 : isSquare ? 16 : 18,
            fontWeight: 500,
            color: "#536258",
            whiteSpace: "nowrap",
          }}
        >
          www.zenoway.online
        </span>
      </div>

      {/* Main Typographic Composition */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: isStory ? 36 : isSquare ? 16 : 26,
          paddingBottom: isStory ? 36 : isSquare ? 16 : 26,
        }}
      >
        {/* Billboard Stacked "We're / Hiring!" */}
        <div
          style={{
            fontSize: heroWordSize,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.045em",
          }}
        >
          <div style={{ color: "#12231B" }}>We’re</div>
          <div style={{ color: "#087F50" }}>Hiring!</div>
        </div>

        {/* Contrast Regular-Weight Job Title */}
        <h1
          style={{
            margin: 0,
            marginTop: isStory ? 32 : isSquare ? 18 : 24,
            fontSize: titleSize,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "#12231B",
            maxWidth: 880,
          }}
        >
          {truncateText(data.title, 74)}
        </h1>

        {/* Clean Company Lockup */}
        <div
          style={{
            marginTop: isStory ? 22 : isSquare ? 12 : 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <CompanyLogoBadge
            company={data.company}
            companyLogoSrc={companyLogoSrc}
            size={isSquare ? 40 : 46}
          />
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontSize: isStory ? 29 : isSquare ? 22 : 25,
                fontWeight: 700,
                color: "#087F50",
                letterSpacing: "-0.015em",
              }}
            >
              {truncateText(data.company, 44)}
            </span>
            {data.companyWebsiteDisplay && (
              <span
                style={{
                  fontSize: isStory ? 22 : isSquare ? 17 : 19,
                  fontWeight: 500,
                  color: "#738279",
                  marginLeft: 14,
                }}
              >
                · {data.companyWebsiteDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Priority Swiss Editorial Specs Strip (Location, Compensation, Type, Exp) */}
        {specItems.length > 0 && (
          <div
            style={{
              marginTop: isStory ? 38 : isSquare ? 18 : 26,
              paddingTop: isStory ? 26 : isSquare ? 14 : 20,
              paddingBottom: isStory ? 26 : isSquare ? 14 : 20,
              borderTop: "1px solid rgba(8, 127, 80, 0.16)",
              borderBottom:
                displayBullets.length > 0
                  ? "1px solid rgba(8, 127, 80, 0.16)"
                  : "none",
              display: "grid",
              gridTemplateColumns: `repeat(${specCols}, minmax(0, 1fr))`,
              gap: isStory ? "28px 32px" : isSquare ? "14px 24px" : "20px 28px",
            }}
          >
            {specItems.map((item, idx) => {
              const showLeftRule = idx % specCols !== 0;
              return (
                <div
                  key={item.label}
                  style={{
                    minWidth: 0,
                    paddingLeft: showLeftRule ? (isSquare ? 18 : 24) : 0,
                    borderLeft: showLeftRule ? "1px solid rgba(8, 127, 80, 0.18)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: isSquare ? 13 : 14,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#738279",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: isStory ? 26 : isSquare ? 20 : 23,
                      fontWeight: 700,
                      color: item.accent ? "#087F50" : "#12231B",
                      lineHeight: 1.28,
                    }}
                  >
                    {truncateText(item.value, 40)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Concise Scannable Bullet Highlights */}
        {displayBullets.length > 0 && (
          <div
            style={{
              marginTop: isStory ? 38 : isSquare ? 18 : 26,
              paddingLeft: 20,
              borderLeft: "4px solid #087F50",
            }}
          >
            <div
              style={{
                fontSize: isStory ? 19 : isSquare ? 14 : 16,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#087F50",
                marginBottom: isStory ? 12 : 8,
              }}
            >
              Key Highlights
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 10 : 7 }}>
              {displayBullets.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 11,
                    fontSize: isStory ? 25 : isSquare ? 18 : 21,
                    fontWeight: 500,
                    lineHeight: 1.36,
                    color: "#2C3E35",
                  }}
                >
                  <span style={{ color: "#0FA968", fontWeight: 800, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer QR Code & Editorial Prompt */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: isStory ? 30 : isSquare ? 16 : 22,
          borderTop: "1px solid rgba(8, 127, 80, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isSquare ? 16 : 22, minWidth: 0 }}>
          <PosterQrCode
            value={data.jobUrl}
            size={isStory ? 128 : isSquare ? 98 : 114}
            borderColor="#CFE3D6"
            padding={isSquare ? 6 : 8}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isSquare ? 14 : 16,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#087F50",
                marginBottom: 5,
                whiteSpace: "nowrap",
              }}
            >
              Apply Online
            </div>
            <div
              style={{
                fontSize: isStory ? 25 : isSquare ? 19 : 22,
                fontWeight: 600,
                color: "#12231B",
                lineHeight: 1.3,
              }}
            >
              Scan QR code to view role &amp; apply
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: isSquare ? 15 : 17,
              fontWeight: 700,
              color: "#087F50",
              whiteSpace: "nowrap",
            }}
          >
            Join Our Team
          </div>
          <div
            style={{
              fontSize: isSquare ? 14 : 15,
              fontWeight: 500,
              color: "#536258",
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {data.workMode} Role
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Template B: Corporate — Executive LinkedIn Poster (Architectural Canopy)
 * Bold stacked "We're / Hiring!" headline, full-row balanced hairline metrics
 * (no 2+1 gaps!), real company mark only, & clean LinkedIn footer.
 * ============================================================================ */
function CorporatePoster({
  data,
  format,
  whiteLogoSrc,
  companyLogoSrc,
  showHighlights,
}: TemplateRenderProps) {
  const isStory = format === "story";
  const isSquare = format === "square";
  const spec = POSTER_FORMATS[format];

  const heroWordSize = isStory ? 138 : isSquare ? 88 : 116;
  const titleSize = getAdaptiveTitleSize(
    data.title,
    isStory ? 72 : isSquare ? 50 : 62
  );

  const metricColumns = [
    data.location ? { label: "Location", value: data.location, highlight: false } : null,
    data.employmentType ? { label: "Type", value: data.employmentType, highlight: false } : null,
    data.experience ? { label: "Experience", value: data.experience, highlight: false } : null,
    data.salary ? { label: "Compensation", value: data.salary, highlight: true } : null,
  ].filter(
    (col): col is { label: string; value: string; highlight: boolean } => col !== null
  );

  const displayBullets = showHighlights
    ? data.bullets.slice(0, isStory ? 4 : isSquare ? 2 : 3)
    : [];

  const metricCols = metricColumns.length === 4 ? 2 : Math.max(1, metricColumns.length);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#F8FBF9",
        backgroundImage:
          "radial-gradient(circle at 92% 72%, rgba(15, 169, 104, 0.09) 0%, transparent 44%), linear-gradient(180deg, #FFFFFF 0%, #F4FAF6 100%)",
        color: "#12231B",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Subtle Architectural Texture */}
      <DotMatrixTexture
        width={spec.width}
        height={spec.height}
        cols={16}
        rows={isStory ? 24 : isSquare ? 15 : 18}
        color="#087F50"
        opacity={0.045}
        radius={1.5}
      />
      <ConcentricRipples
        width={spec.width}
        height={spec.height}
        cx={spec.width - 65}
        cy={isStory ? 390 : 280}
        radii={[130, 220, 310]}
        stroke="#087F50"
        opacity={0.07}
        strokeWidth={1.4}
      />

      {/* Executive Deep Forest Canopy Header */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          backgroundColor: "#0C2D20",
          backgroundImage:
            "radial-gradient(circle at 86% 30%, rgba(15, 169, 104, 0.28) 0%, transparent 48%), linear-gradient(135deg, #092419 0%, #0E3526 60%, #134A34 100%)",
          color: "#FFFFFF",
          padding: isStory ? "52px 72px" : isSquare ? "32px 64px" : "42px 72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isSquare ? 16 : 20, minWidth: 0 }}>
          <CompanyLogoBadge
            company={data.company}
            companyLogoSrc={companyLogoSrc}
            size={isStory ? 64 : isSquare ? 48 : 56}
            darkSurface={true}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isSquare ? 12 : 13,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#34F09A",
                marginBottom: 4,
              }}
            >
              Hiring Partner
            </div>
            <div
              style={{
                fontSize: isStory ? 31 : isSquare ? 24 : 28,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.18,
              }}
            >
              {truncateText(data.company, 38)}
            </div>
            {data.companyWebsiteDisplay && (
              <div
                style={{
                  fontSize: isStory ? 18 : isSquare ? 15 : 16,
                  fontWeight: 500,
                  color: "#9DD6B9",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                }}
              >
                {data.companyWebsiteDisplay}
              </div>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <ZenowayLockup logoSrc={whiteLogoSrc} size="sm" darkText={false} />
          {data.postedDateLabel && (
            <div
              style={{
                fontSize: isSquare ? 14 : 15,
                fontWeight: 500,
                color: "#A7D7BD",
                marginTop: 6,
                whiteSpace: "nowrap",
              }}
            >
              Posted {data.postedDateLabel}
            </div>
          )}
        </div>
      </div>

      {/* Emerald Structural Seam */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: 6,
          backgroundImage: "linear-gradient(90deg, #087F50 0%, #22D089 65%, #087F50 100%)",
          backgroundColor: "#087F50",
          flexShrink: 0,
        }}
      />

      {/* Open Editorial LinkedIn Body */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          padding: isStory ? "56px 72px" : isSquare ? "28px 64px" : "42px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: isStory ? 40 : isSquare ? 18 : 28,
        }}
      >
        <SparkleStar
          size={isSquare ? 38 : 48}
          color="#087F50"
          style={{ right: 72, top: isStory ? 60 : isSquare ? 28 : 42 }}
        />

        <div>
          {data.category && (
            <div
              style={{
                fontSize: isSquare ? 14 : 15,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#536258",
                marginBottom: isStory ? 14 : 10,
                whiteSpace: "nowrap",
              }}
            >
              {truncateText(data.category, 38)}
            </div>
          )}

          {/* Billboard Two-Line "We're / Hiring!" */}
          <div
            style={{
              fontSize: heroWordSize,
              fontWeight: 800,
              lineHeight: 0.91,
              letterSpacing: "-0.04em",
              color: "#087F50",
            }}
          >
            <div style={{ color: "#12231B" }}>We’re</div>
            <div>Hiring!</div>
          </div>

          <h1
            style={{
              margin: 0,
              marginTop: isStory ? 30 : isSquare ? 16 : 22,
              fontSize: titleSize,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.07,
              color: "#12231B",
            }}
          >
            {truncateText(data.title, 74)}
          </h1>
        </div>

        {/* Full-Row Balanced Hairline Metric Bar */}
        {metricColumns.length > 0 && (
          <div
            style={{
              borderTop: "1.5px solid #B7D1BE",
              borderBottom: "1.5px solid #B7D1BE",
              paddingTop: isStory ? 26 : isSquare ? 14 : 20,
              paddingBottom: isStory ? 26 : isSquare ? 14 : 20,
              display: "grid",
              gridTemplateColumns: `repeat(${metricCols}, minmax(0, 1fr))`,
              gap: isStory ? "24px 28px" : isSquare ? "14px 22px" : "18px 26px",
            }}
          >
            {metricColumns.map((col, idx) => {
              const showLeftRule = idx % metricCols !== 0;
              return (
                <div
                  key={col.label}
                  style={{
                    minWidth: 0,
                    paddingLeft: showLeftRule ? (isSquare ? 16 : 22) : 0,
                    borderLeft: showLeftRule ? "1px solid #C8DDD0" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: isSquare ? 13 : 14,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#738279",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                  </div>
                  <div
                    style={{
                      fontSize: isStory ? 24 : isSquare ? 19 : 21,
                      fontWeight: 700,
                      color: col.highlight ? "#087F50" : "#12231B",
                      lineHeight: 1.28,
                    }}
                  >
                    {truncateText(col.value, 36)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Concise Scannable Role Highlights */}
        {displayBullets.length > 0 && (
          <div>
            <div
              style={{
                fontSize: isSquare ? 14 : 16,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#087F50",
                marginBottom: isStory ? 14 : 10,
                whiteSpace: "nowrap",
              }}
            >
              What You’ll Focus On
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 14 : 8 }}>
              {displayBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: isStory ? 25 : isSquare ? 18 : 21,
                    fontWeight: 500,
                    lineHeight: 1.38,
                    color: "#22362C",
                  }}
                >
                  <span
                    style={{
                      marginTop: isStory ? 10 : 8,
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: "#0FA968",
                      flexShrink: 0,
                    }}
                  />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Executive Architectural Footer Band */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#E8F4ED",
          borderTop: "1.5px solid #B7D1BE",
          padding: isStory ? "32px 72px" : isSquare ? "18px 64px" : "26px 72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isSquare ? 16 : 22, minWidth: 0 }}>
          <PosterQrCode
            value={data.jobUrl}
            size={isStory ? 128 : isSquare ? 98 : 114}
            borderColor="#B7D1BE"
            padding={isSquare ? 6 : 8}
            borderRadius={4}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isSquare ? 14 : 16,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#087F50",
                marginBottom: 5,
                whiteSpace: "nowrap",
              }}
            >
              Apply on Zenoway
            </div>
            <div
              style={{
                fontSize: isStory ? 24 : isSquare ? 19 : 21,
                fontWeight: 600,
                color: "#12231B",
                lineHeight: 1.3,
              }}
            >
              Scan QR code for full role details
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: isSquare ? 15 : 17,
              fontWeight: 700,
              color: "#0C2D20",
              whiteSpace: "nowrap",
            }}
          >
            {truncateText(data.company, 28)}
          </div>
          <div
            style={{
              fontSize: isSquare ? 14 : 15,
              fontWeight: 500,
              color: "#536258",
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            www.zenoway.online
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Template D: Compact — Night-Forest & Neon-Mint Mobile Flyer
 * Billboard two-line lime "We're / Hiring!", flex tonal spec pills (zero odd
 * dashboard boxes!), clean highlights, & high-contrast white QR strip.
 * ============================================================================ */
function CompactPoster({
  data,
  format,
  whiteLogoSrc,
  companyLogoSrc,
  showHighlights,
}: TemplateRenderProps) {
  const isStory = format === "story";
  const isSquare = format === "square";
  const spec = POSTER_FORMATS[format];

  const heroWordSize = isStory ? 138 : isSquare ? 88 : 116;
  const titleSize = getAdaptiveTitleSize(
    data.title,
    isStory ? 66 : isSquare ? 48 : 58
  );

  const infoPills = [
    data.location
      ? {
          label: "Location",
          value: data.location,
          icon: data.workMode === "Remote" ? Globe : data.workMode === "Hybrid" ? Building2 : MapPin,
          highlight: false,
        }
      : null,
    data.salary
      ? { label: "Salary", value: data.salary, icon: Wallet, highlight: true }
      : null,
    data.experience
      ? { label: "Experience", value: data.experience, icon: BriefcaseBusiness, highlight: false }
      : null,
    data.employmentType
      ? { label: "Job Type", value: data.employmentType, icon: Clock3, highlight: false }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    icon: typeof MapPin;
    highlight: boolean;
  }>;

  const displayBullets =
    showHighlights && data.bullets.length > 0
      ? data.bullets.slice(0, isStory ? 4 : isSquare ? 2 : 3)
      : [];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#0B241A",
        backgroundImage:
          "radial-gradient(circle at 88% 18%, rgba(34, 208, 137, 0.22) 0%, transparent 46%), linear-gradient(165deg, #0E2F22 0%, #091E16 100%)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <DotMatrixTexture
        width={spec.width}
        height={spec.height}
        cols={16}
        rows={isStory ? 24 : isSquare ? 15 : 18}
        color="#22D089"
        opacity={0.075}
        radius={1.5}
      />
      <ConcentricRipples
        width={spec.width}
        height={spec.height}
        cx={spec.width - 70}
        cy={isStory ? 300 : 195}
        radii={[120, 210, 300]}
        stroke="#22D089"
        opacity={0.12}
        strokeWidth={1.5}
      />

      {/* Top Bright Emerald Flyer Bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#087F50",
          backgroundImage: "linear-gradient(90deg, #087F50 0%, #0FA968 100%)",
          padding: isStory ? "32px 56px" : isSquare ? "20px 48px" : "26px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <ZenowayLockup logoSrc={whiteLogoSrc} size="sm" darkText={false} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span
            style={{
              backgroundColor: "#34F09A",
              color: "#053220",
              padding: isSquare ? "6px 14px" : "8px 18px",
              borderRadius: 4,
              fontSize: isSquare ? 14 : 16,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Hiring Now
          </span>
          <span
            style={{
              fontSize: isSquare ? 15 : 17,
              fontWeight: 600,
              color: "#EDF7F1",
              whiteSpace: "nowrap",
            }}
          >
            {data.workMode}
          </span>
        </div>
      </div>

      {/* Main High-Contrast Flyer Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          padding: isStory ? "48px 56px" : isSquare ? "24px 48px" : "34px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: isStory ? 34 : isSquare ? 16 : 24,
        }}
      >
        <SparkleStar
          size={isSquare ? 38 : 48}
          color="#34F09A"
          style={{ right: 56, top: isStory ? 54 : isSquare ? 26 : 36 }}
        />

        <div>
          <div
            style={{
              fontSize: heroWordSize,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.91,
              color: "#34F09A",
            }}
          >
            <div>We’re</div>
            <div>Hiring!</div>
          </div>

          <h1
            style={{
              margin: 0,
              marginTop: isStory ? 28 : isSquare ? 16 : 20,
              fontSize: titleSize,
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.07,
              color: "#FFFFFF",
            }}
          >
            {truncateText(data.title, 70)}
          </h1>

          <div
            style={{
              marginTop: isSquare ? 10 : 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <CompanyLogoBadge
              company={data.company}
              companyLogoSrc={companyLogoSrc}
              size={isSquare ? 40 : 44}
              darkSurface={true}
            />
            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: isStory ? 28 : isSquare ? 22 : 24,
                  fontWeight: 700,
                  color: "#B6F7D8",
                  lineHeight: 1.2,
                }}
              >
                {truncateText(data.company, 42)}
              </span>
              {data.postedDateLabel && (
                <span
                  style={{
                    fontSize: isSquare ? 14 : 16,
                    fontWeight: 500,
                    color: "#9EC8B3",
                    marginLeft: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  · {data.postedDateLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Unboxed High-Contrast Flyer Specs */}
        {infoPills.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(52, 240, 154, 0.22)",
              paddingTop: isStory ? 22 : isSquare ? 12 : 16,
              display: "flex",
              flexWrap: "wrap",
              columnGap: isStory ? 30 : isSquare ? 22 : 28,
              rowGap: isStory ? 14 : isSquare ? 9 : 12,
            }}
          >
            {infoPills.map((cell) => {
              const Icon = cell.icon;
              return (
                <div
                  key={cell.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    color: cell.highlight ? "#34F09A" : "#FFFFFF",
                    fontSize: isStory ? 25 : isSquare ? 20 : 22,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon
                    size={isSquare ? 18 : 20}
                    strokeWidth={2.3}
                    style={{
                      color: "#34F09A",
                      flexShrink: 0,
                    }}
                  />
                  <span>{truncateText(cell.value, 36)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Highlights without form-style checkboxes */}
        {displayBullets.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.14)",
              paddingTop: isStory ? 24 : isSquare ? 14 : 18,
            }}
          >
            <div
              style={{
                fontSize: isSquare ? 14 : 15,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#34F09A",
                marginBottom: isSquare ? 8 : 10,
                whiteSpace: "nowrap",
              }}
            >
              Role Highlights
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 12 : 8 }}>
              {displayBullets.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: isStory ? 24 : isSquare ? 18 : 21,
                    fontWeight: 500,
                    lineHeight: 1.36,
                    color: "#EDF7F1",
                  }}
                >
                  <span
                    style={{
                      color: "#34F09A",
                      fontWeight: 800,
                      lineHeight: 1.3,
                      flexShrink: 0,
                    }}
                  >
                    •
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pure White High-Contrast Action & QR Footer Band */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#FFFFFF",
          color: "#0B241A",
          padding: isStory ? "28px 56px" : isSquare ? "18px 48px" : "22px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isSquare ? 16 : 22, minWidth: 0 }}>
          <PosterQrCode
            value={data.jobUrl}
            size={isStory ? 128 : isSquare ? 98 : 112}
            borderColor="#CFE3D6"
            padding={isSquare ? 6 : 7}
            borderRadius={6}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isSquare ? 14 : 16,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#087F50",
                marginBottom: 5,
                whiteSpace: "nowrap",
              }}
            >
              Scan QR to Apply
            </div>
            <div
              style={{
                fontSize: isStory ? 24 : isSquare ? 19 : 21,
                fontWeight: 700,
                color: "#0B241A",
                lineHeight: 1.3,
              }}
            >
              Open this role directly on Zenoway
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: isSquare ? 14 : 16,
              fontWeight: 800,
              color: "#087F50",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            {data.workMode}
          </div>
          <div
            style={{
              fontSize: isSquare ? 14 : 15,
              fontWeight: 600,
              color: "#536258",
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            www.zenoway.online
          </div>
        </div>
      </div>
    </div>
  );
}

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas(
    {
      job,
      template,
      format,
      logoSrc,
      whiteLogoSrc = DEFAULT_WHITE_LOGO,
      megaphoneSrc = DEFAULT_MEGAPHONE,
      companyLogoSrc = null,
      fontFamily,
      showHighlights = true,
    },
    ref
  ) {
    const spec = POSTER_FORMATS[format];
    const data = normalizePosterJobData(job, format);

    return (
      <div
        ref={ref}
        style={{
          width: spec.width,
          height: spec.height,
          flexShrink: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          fontFamily: fontFamily || DEFAULT_FONT,
          backgroundColor: "#F6FBF8",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {template === "minimal" && (
          <MinimalPoster
            data={data}
            format={format}
            logoSrc={logoSrc}
            whiteLogoSrc={whiteLogoSrc}
            megaphoneSrc={megaphoneSrc}
            companyLogoSrc={companyLogoSrc}
            showHighlights={showHighlights}
          />
        )}
        {template === "corporate" && (
          <CorporatePoster
            data={data}
            format={format}
            logoSrc={logoSrc}
            whiteLogoSrc={whiteLogoSrc}
            megaphoneSrc={megaphoneSrc}
            companyLogoSrc={companyLogoSrc}
            showHighlights={showHighlights}
          />
        )}
        {template === "bold" && (
          <BoldHiringPoster
            data={data}
            format={format}
            logoSrc={logoSrc}
            whiteLogoSrc={whiteLogoSrc}
            megaphoneSrc={megaphoneSrc}
            companyLogoSrc={companyLogoSrc}
            showHighlights={showHighlights}
          />
        )}
        {template === "compact" && (
          <CompactPoster
            data={data}
            format={format}
            logoSrc={logoSrc}
            whiteLogoSrc={whiteLogoSrc}
            megaphoneSrc={megaphoneSrc}
            companyLogoSrc={companyLogoSrc}
            showHighlights={showHighlights}
          />
        )}
      </div>
    );
  }
);
