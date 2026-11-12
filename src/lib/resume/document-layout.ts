import type { ResumeData, ResumeSectionKey } from "./types";
import {
  formatDateRange,
  formatResumeDate,
  hasCertificationContent,
  hasEducationContent,
  hasExperienceContent,
  hasOptionalSectionContent,
  hasProjectContent,
  normalizeResumeUrl,
} from "./validation";

export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
export const MARGIN_X_PT = 48;
export const MARGIN_TOP_PT = 44;
export const MARGIN_BOTTOM_PT = 44;
export const CONTENT_WIDTH_PT = A4_WIDTH_PT - MARGIN_X_PT * 2; // 499.28pt

// Standard Helvetica/Arial glyph width table (units per 1000 em) for ASCII 32..126
// Ensures consistent wrapping between HTML Arial preview and PDF Helvetica output.
const HELVETICA_WIDTHS: Record<number, number> = {
  32: 278, 33: 278, 34: 355, 35: 556, 36: 556, 37: 889, 38: 667, 39: 191,
  40: 333, 41: 333, 42: 389, 43: 584, 44: 278, 45: 333, 46: 278, 47: 278,
  48: 556, 49: 556, 50: 556, 51: 556, 52: 556, 53: 556, 54: 556, 55: 556,
  56: 556, 57: 556, 58: 278, 59: 278, 60: 584, 61: 584, 62: 584, 63: 556,
  64: 1015, 65: 667, 66: 667, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778,
  72: 722, 73: 278, 74: 500, 75: 667, 76: 556, 77: 833, 78: 722, 79: 778,
  80: 667, 81: 778, 82: 722, 83: 667, 84: 611, 85: 722, 86: 667, 87: 944,
  88: 667, 89: 667, 90: 611, 91: 278, 92: 278, 93: 278, 94: 469, 95: 556,
  96: 333, 97: 556, 98: 556, 99: 500, 100: 556, 101: 556, 102: 278, 103: 556,
  104: 556, 105: 222, 106: 222, 107: 500, 108: 222, 109: 833, 110: 556,
  111: 556, 112: 556, 113: 556, 114: 333, 115: 500, 116: 278, 117: 556,
  118: 500, 119: 722, 120: 500, 121: 500, 122: 500, 123: 334, 124: 260,
  125: 334, 126: 584,
};

const HELVETICA_BOLD_WIDTHS: Record<number, number> = {
  32: 278, 33: 333, 34: 474, 35: 556, 36: 556, 37: 889, 38: 722, 39: 238,
  40: 333, 41: 333, 42: 389, 43: 584, 44: 278, 45: 333, 46: 278, 47: 278,
  48: 556, 49: 556, 50: 556, 51: 556, 52: 556, 53: 556, 54: 556, 55: 556,
  56: 556, 57: 556, 58: 333, 59: 333, 60: 584, 61: 584, 62: 584, 63: 611,
  64: 975, 65: 722, 66: 722, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778,
  72: 722, 73: 278, 74: 556, 75: 722, 76: 611, 77: 833, 78: 722, 79: 778,
  80: 667, 81: 778, 82: 722, 83: 667, 84: 611, 85: 722, 86: 667, 87: 944,
  88: 667, 89: 667, 90: 611, 91: 333, 92: 278, 93: 333, 94: 584, 95: 556,
  96: 333, 97: 556, 98: 611, 99: 556, 100: 611, 101: 556, 102: 333, 103: 611,
  104: 611, 105: 278, 106: 278, 107: 556, 108: 278, 109: 889, 110: 611,
  111: 611, 112: 611, 113: 611, 114: 389, 115: 556, 116: 333, 117: 611,
  118: 556, 119: 778, 120: 556, 121: 556, 122: 500, 123: 389, 124: 280,
  125: 389, 126: 584,
};

const WIN_ANSI_EXTRAS = new Set<number>([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

export function sanitizeForPdfWinAnsi(input: string): string {
  const replaced = input
    .replace(/\u20B9/g, "INR ")
    .replace(/[\u2192\u21D2]/g, "->")
    .replace(/[\u2190]/g, "<-")
    .replace(/\u2265/g, ">=")
    .replace(/\u2264/g, "<=")
    .replace(/[\u2713\u2714]/g, "-")
    .replace(/[\u25AA\u25AB\u25CF\u2023\u25E6]/g, "•")
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\t/g, " ");

  let result = "";
  for (const ch of replaced) {
    const code = ch.codePointAt(0) ?? 0;
    if (
      code === 0x0a ||
      (code >= 0x20 && code <= 0x7e) ||
      (code >= 0xa0 && code <= 0xff) ||
      WIN_ANSI_EXTRAS.has(code)
    ) {
      result += ch;
    }
  }
  return result;
}

export function estimateTextWidthPt(
  text: string,
  fontSizePt: number,
  bold = false
): number {
  const table = bold ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 0x2013) total += 556; // en-dash
    else if (code === 0x2014) total += 1000; // em-dash
    else if (code === 0x2022) total += 350; // bullet
    else if (code === 0x20b9) total += 1700; // rupee symbol -> "INR " in WinAnsi PDF
    else total += table[code] ?? 556;
  }
  return (total / 1000) * fontSizePt;
}

export function wrapTextToLines(
  text: string,
  maxWidthPt: number,
  fontSizePt: number,
  bold = false
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  const pushLongWord = (word: string) => {
    let chunk = "";
    for (const ch of word) {
      if (estimateTextWidthPt(chunk + ch, fontSizePt, bold) > maxWidthPt && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    if (chunk) current = chunk;
  };

  for (const word of words) {
    if (!current) {
      if (estimateTextWidthPt(word, fontSizePt, bold) <= maxWidthPt) {
        current = word;
      } else {
        pushLongWord(word);
      }
    } else {
      const candidate = `${current} ${word}`;
      if (estimateTextWidthPt(candidate, fontSizePt, bold) <= maxWidthPt) {
        current = candidate;
      } else {
        lines.push(current);
        current = "";
        if (estimateTextWidthPt(word, fontSizePt, bold) <= maxWidthPt) {
          current = word;
        } else {
          pushLongWord(word);
        }
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

export interface ContactSegment {
  text: string;
  href?: string;
}

export type DocumentBlock =
  | {
      type: "header";
      fullName: string;
      headline: string;
      contactLines: ContactSegment[][];
      heightPt: number;
    }
  | {
      type: "section-heading";
      title: string;
      heightPt: number;
      keepWithNext: true;
    }
  | {
      type: "paragraph";
      lines: string[];
      fontSizePt: number;
      lineHeightPt: number;
      bold?: boolean;
      color?: "primary" | "secondary" | "muted";
      spaceAfterPt: number;
      heightPt: number;
      href?: string;
    }
  | {
      type: "split-row";
      leftLines: string[];
      rightText: string;
      fontSizePt: number;
      lineHeightPt: number;
      boldLeft: boolean;
      spaceAfterPt: number;
      heightPt: number;
      keepWithNext?: boolean;
    }
  | {
      type: "bullet";
      lines: string[];
      fontSizePt: number;
      lineHeightPt: number;
      spaceAfterPt: number;
      heightPt: number;
    }
  | {
      type: "skill-line";
      category: string;
      itemsText: string;
      lines: Array<{ categoryPrefix?: string; text: string }>;
      fontSizePt: number;
      lineHeightPt: number;
      spaceAfterPt: number;
      heightPt: number;
    }
  | {
      type: "entry-gap";
      heightPt: number;
    };

export interface DocumentPage {
  pageNumber: number;
  blocks: DocumentBlock[];
}

export interface DocumentLayout {
  pages: DocumentPage[];
  hasAnyContent: boolean;
}

function buildContactSegments(data: ResumeData): ContactSegment[] {
  const segs: ContactSegment[] = [];
  const email = data.personal.email.trim();
  const phone = data.personal.phone.trim();
  const city = data.personal.city.trim();

  if (email) segs.push({ text: email, href: `mailto:${email}` });
  if (phone) segs.push({ text: phone });
  if (city) segs.push({ text: city });

  for (const link of data.personal.links) {
    const label = link.label.trim();
    const url = link.url.trim();
    if (!url && !label) continue;
    const normalized = url ? normalizeResumeUrl(url) : null;
    const displayUrl = url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const text = label && displayUrl ? `${label}: ${displayUrl}` : displayUrl || label;
    if (text) {
      segs.push({ text, href: normalized || undefined });
    }
  }

  return segs;
}

function wrapContactSegments(
  segments: ContactSegment[],
  maxWidthPt: number,
  fontSizePt: number
): ContactSegment[][] {
  if (segments.length === 0) return [];
  const sep = "  |  ";
  const sepWidth = estimateTextWidthPt(sep, fontSizePt, false);
  const lines: ContactSegment[][] = [];
  let currentLine: ContactSegment[] = [];
  let currentWidth = 0;

  for (const seg of segments) {
    const segWidth = estimateTextWidthPt(seg.text, fontSizePt, false);
    const needed = currentLine.length === 0 ? segWidth : sepWidth + segWidth;
    if (currentLine.length > 0 && currentWidth + needed > maxWidthPt) {
      lines.push(currentLine);
      currentLine = [seg];
      currentWidth = segWidth;
    } else {
      currentLine.push(seg);
      currentWidth += needed;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

function makeSplitRowBlock(params: {
  leftText: string;
  rightText: string;
  fontSizePt: number;
  lineHeightPt: number;
  boldLeft: boolean;
  spaceAfterPt: number;
  keepWithNext?: boolean;
}): Extract<DocumentBlock, { type: "split-row" }> {
  const rightWidth = params.rightText
    ? estimateTextWidthPt(params.rightText, Math.max(9, params.fontSizePt - 0.5), false) + 14
    : 0;
  const maxLeftWidth = Math.max(180, CONTENT_WIDTH_PT - rightWidth);
  const leftLines = wrapTextToLines(
    params.leftText,
    maxLeftWidth,
    params.fontSizePt,
    params.boldLeft
  );
  const safeLines = leftLines.length > 0 ? leftLines : [params.leftText];
  return {
    type: "split-row",
    leftLines: safeLines,
    rightText: params.rightText,
    fontSizePt: params.fontSizePt,
    lineHeightPt: params.lineHeightPt,
    boldLeft: params.boldLeft,
    spaceAfterPt: params.spaceAfterPt,
    heightPt: safeLines.length * params.lineHeightPt + params.spaceAfterPt,
    keepWithNext: params.keepWithNext,
  };
}

export function buildDocumentBlocks(data: ResumeData): {
  blocks: DocumentBlock[];
  hasAnyContent: boolean;
} {
  const blocks: DocumentBlock[] = [];

  const fullName = [data.personal.firstName.trim(), data.personal.lastName.trim()]
    .filter(Boolean)
    .join(" ");
  const headline = data.personal.headline.trim();
  const contactSegments = buildContactSegments(data);
  const contactLines = wrapContactSegments(contactSegments, CONTENT_WIDTH_PT, 9.5);

  const hasHeader = Boolean(fullName || headline || contactLines.length > 0);
  if (hasHeader) {
    let headerHeight = 0;
    if (fullName) headerHeight += 22;
    if (headline) headerHeight += 15;
    if (contactLines.length > 0) headerHeight += contactLines.length * 13 + 3;
    headerHeight += 12; // rule + space below header
    blocks.push({
      type: "header",
      fullName: fullName || "Your Name",
      headline,
      contactLines,
      heightPt: headerHeight,
    });
  }

  let hasBodyContent = false;

  const pushSectionHeading = (title: string) => {
    blocks.push({
      type: "section-heading",
      title: title.toUpperCase(),
      heightPt: 23,
      keepWithNext: true,
    });
  };

  const renderers: Record<ResumeSectionKey, () => void> = {
    summary: () => {
      const summary = data.summary.trim();
      if (!summary) return;
      hasBodyContent = true;
      pushSectionHeading("Professional Summary");
      const paragraphs = summary.split(/\n+/).map((p) => p.trim()).filter(Boolean);
      paragraphs.forEach((para, idx) => {
        const lines = wrapTextToLines(para, CONTENT_WIDTH_PT, 9.5, false);
        const lineHeightPt = 13.5;
        const spaceAfterPt = idx === paragraphs.length - 1 ? 7 : 4;
        blocks.push({
          type: "paragraph",
          lines,
          fontSizePt: 9.5,
          lineHeightPt,
          color: "primary",
          spaceAfterPt,
          heightPt: lines.length * lineHeightPt + spaceAfterPt,
        });
      });
    },

    experience: () => {
      const entries = data.experience.filter(hasExperienceContent);
      if (entries.length === 0) return;
      hasBodyContent = true;
      pushSectionHeading("Work Experience");

      entries.forEach((exp, idx) => {
        const role = exp.jobTitle.trim() || "Role";
        const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
        const companyLine = [exp.company.trim(), exp.location.trim()]
          .filter(Boolean)
          .join(" — ");
        const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);

        blocks.push(
          makeSplitRowBlock({
            leftText: role,
            rightText: dateRange,
            fontSizePt: 10.5,
            lineHeightPt: 14,
            boldLeft: true,
            spaceAfterPt: 1,
            keepWithNext: true,
          })
        );

        if (companyLine) {
          const compLines = wrapTextToLines(companyLine, CONTENT_WIDTH_PT, 9.5, false);
          blocks.push({
            type: "paragraph",
            lines: compLines,
            fontSizePt: 9.5,
            lineHeightPt: 13,
            color: "secondary",
            spaceAfterPt: bullets.length > 0 ? 3 : 2,
            heightPt: compLines.length * 13 + (bullets.length > 0 ? 3 : 2),
          });
        }

        bullets.forEach((bullet, bIdx) => {
          const lines = wrapTextToLines(bullet, CONTENT_WIDTH_PT - 14, 9.5, false);
          const spaceAfterPt = bIdx === bullets.length - 1 ? 2 : 2;
          blocks.push({
            type: "bullet",
            lines,
            fontSizePt: 9.5,
            lineHeightPt: 13.5,
            spaceAfterPt,
            heightPt: lines.length * 13.5 + spaceAfterPt,
          });
        });

        if (idx < entries.length - 1) {
          blocks.push({ type: "entry-gap", heightPt: 6 });
        } else {
          blocks.push({ type: "entry-gap", heightPt: 6 });
        }
      });
    },

    education: () => {
      const entries = data.education.filter(hasEducationContent);
      if (entries.length === 0) return;
      hasBodyContent = true;
      pushSectionHeading("Education");

      entries.forEach((edu, idx) => {
        const degreeTitle = [
          edu.degree.trim(),
          edu.fieldOfStudy.trim() ? `in ${edu.fieldOfStudy.trim()}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.isCurrent);

        blocks.push(
          makeSplitRowBlock({
            leftText: degreeTitle || "Degree",
            rightText: dateRange,
            fontSizePt: 10,
            lineHeightPt: 13.5,
            boldLeft: true,
            spaceAfterPt: 1,
            keepWithNext: true,
          })
        );

        const instParts = [
          edu.institution.trim(),
          edu.location.trim(),
          edu.grade.trim() ? `Grade: ${edu.grade.trim()}` : "",
        ].filter(Boolean);
        if (instParts.length > 0) {
          const instLines = wrapTextToLines(instParts.join(" — "), CONTENT_WIDTH_PT, 9.5, false);
          blocks.push({
            type: "paragraph",
            lines: instLines,
            fontSizePt: 9.5,
            lineHeightPt: 13,
            color: "secondary",
            spaceAfterPt: edu.highlights.trim() ? 2 : 2,
            heightPt: instLines.length * 13 + 2,
          });
        }

        if (edu.highlights.trim()) {
          const hlLines = wrapTextToLines(edu.highlights.trim(), CONTENT_WIDTH_PT, 9.5, false);
          blocks.push({
            type: "paragraph",
            lines: hlLines,
            fontSizePt: 9.5,
            lineHeightPt: 13,
            color: "primary",
            spaceAfterPt: 2,
            heightPt: hlLines.length * 13 + 2,
          });
        }

        blocks.push({
          type: "entry-gap",
          heightPt: idx < entries.length - 1 ? 5 : 6,
        });
      });
    },

    skills: () => {
      const groups = data.skills
        .map((g) => ({
          category: g.category.trim(),
          items: g.items.map((i) => i.trim()).filter(Boolean),
        }))
        .filter((g) => g.items.length > 0);
      if (groups.length === 0) return;
      hasBodyContent = true;
      pushSectionHeading("Skills");

      groups.forEach((group, idx) => {
        const prefix = group.category ? `${group.category}: ` : "";
        const itemsText = group.items.join(", ");
        const fullText = `${prefix}${itemsText}`;
        const rawLines = wrapTextToLines(fullText, CONTENT_WIDTH_PT - 14, 9.5, false);

        const structuredLines = rawLines.map((line, lIdx) => {
          if (lIdx === 0 && prefix && line.startsWith(prefix)) {
            return {
              categoryPrefix: prefix,
              text: line.slice(prefix.length),
            };
          }
          if (lIdx === 0 && prefix && prefix.length > line.length) {
            return {
              categoryPrefix: line,
              text: "",
            };
          }
          return { text: line };
        });

        const spaceAfterPt = idx === groups.length - 1 ? 7 : 3;
        blocks.push({
          type: "skill-line",
          category: group.category,
          itemsText,
          lines: structuredLines,
          fontSizePt: 9.5,
          lineHeightPt: 13.5,
          spaceAfterPt,
          heightPt: structuredLines.length * 13.5 + spaceAfterPt,
        });
      });
    },

    projects: () => {
      const entries = data.projects.filter(hasProjectContent);
      if (entries.length === 0) return;
      hasBodyContent = true;
      pushSectionHeading("Projects");

      entries.forEach((proj, idx) => {
        const title = [proj.name.trim(), proj.role.trim()].filter(Boolean).join(" — ");
        const dateRange = formatDateRange(proj.startDate, proj.endDate, false);
        blocks.push(
          makeSplitRowBlock({
            leftText: title || "Project",
            rightText: dateRange,
            fontSizePt: 10,
            lineHeightPt: 13.5,
            boldLeft: true,
            spaceAfterPt: 1,
            keepWithNext: true,
          })
        );

        const cleanUrl = proj.link.trim() ? normalizeResumeUrl(proj.link) : null;
        if (proj.link.trim()) {
          const linkLines = wrapTextToLines(
            proj.link.trim(),
            CONTENT_WIDTH_PT,
            9,
            false
          );
          blocks.push({
            type: "paragraph",
            lines: linkLines,
            fontSizePt: 9,
            lineHeightPt: 12.5,
            color: "muted",
            spaceAfterPt: 2,
            heightPt: linkLines.length * 12.5 + 2,
            href: cleanUrl || undefined,
          });
        }

        if (proj.description.trim()) {
          const descLines = wrapTextToLines(
            proj.description.trim(),
            CONTENT_WIDTH_PT,
            9.5,
            false
          );
          blocks.push({
            type: "paragraph",
            lines: descLines,
            fontSizePt: 9.5,
            lineHeightPt: 13.5,
            color: "primary",
            spaceAfterPt: 2,
            heightPt: descLines.length * 13.5 + 2,
          });
        }

        const highlights = proj.highlights.map((h) => h.trim()).filter(Boolean);
        highlights.forEach((hl) => {
          const hlLines = wrapTextToLines(hl, CONTENT_WIDTH_PT - 14, 9.5, false);
          blocks.push({
            type: "bullet",
            lines: hlLines,
            fontSizePt: 9.5,
            lineHeightPt: 13.5,
            spaceAfterPt: 2,
            heightPt: hlLines.length * 13.5 + 2,
          });
        });

        blocks.push({
          type: "entry-gap",
          heightPt: idx < entries.length - 1 ? 5 : 6,
        });
      });
    },

    certifications: () => {
      const entries = data.certifications.filter(hasCertificationContent);
      if (entries.length === 0) return;
      hasBodyContent = true;
      pushSectionHeading("Certifications");

      entries.forEach((cert, idx) => {
        const left = [cert.name.trim(), cert.issuer.trim()].filter(Boolean).join(" — ");
        const date = cert.issueDate.trim() ? formatResumeDate(cert.issueDate) : "";
        const cleanUrl = cert.credentialUrl.trim()
          ? normalizeResumeUrl(cert.credentialUrl)
          : null;

        blocks.push(
          makeSplitRowBlock({
            leftText: left || "Certification",
            rightText: date,
            fontSizePt: 9.5,
            lineHeightPt: 13.5,
            boldLeft: false,
            spaceAfterPt: cleanUrl ? 1 : idx === entries.length - 1 ? 7 : 3,
          })
        );

        if (cert.credentialUrl.trim()) {
          const urlLines = wrapTextToLines(
            cert.credentialUrl.trim(),
            CONTENT_WIDTH_PT,
            9,
            false
          );
          const spaceAfterPt = idx === entries.length - 1 ? 7 : 3;
          blocks.push({
            type: "paragraph",
            lines: urlLines,
            fontSizePt: 9,
            lineHeightPt: 12,
            color: "muted",
            spaceAfterPt,
            heightPt: urlLines.length * 12 + spaceAfterPt,
            href: cleanUrl || undefined,
          });
        }
      });
    },

    optional: () => {
      const sections = data.optionalSections.filter(hasOptionalSectionContent);
      if (sections.length === 0) return;

      sections.forEach((sec) => {
        const title = sec.title.trim() || "Additional Information";
        const items = sec.items.map((item) => item.trim()).filter(Boolean);
        if (items.length === 0) return;
        hasBodyContent = true;
        pushSectionHeading(title);

        items.forEach((item, idx) => {
          const lines = wrapTextToLines(item, CONTENT_WIDTH_PT - 14, 9.5, false);
          const spaceAfterPt = idx === items.length - 1 ? 7 : 2;
          blocks.push({
            type: "bullet",
            lines,
            fontSizePt: 9.5,
            lineHeightPt: 13.5,
            spaceAfterPt,
            heightPt: lines.length * 13.5 + spaceAfterPt,
          });
        });
      });
    },
  };

  for (const key of data.sectionOrder) {
    renderers[key]?.();
  }

  return {
    blocks,
    hasAnyContent: hasHeader || hasBodyContent,
  };
}

export function layoutResumeDocument(data: ResumeData): DocumentLayout {
  const { blocks, hasAnyContent } = buildDocumentBlocks(data);
  const usableHeight = A4_HEIGHT_PT - MARGIN_TOP_PT - MARGIN_BOTTOM_PT;
  const pages: DocumentPage[] = [{ pageNumber: 1, blocks: [] }];
  let usedHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Skip trailing spacer at top or bottom of page
    if (block.type === "entry-gap" && pages[pages.length - 1].blocks.length === 0) {
      continue;
    }

    // Calculate lookahead height if this block has keepWithNext
    let requiredHeight = block.heightPt;
    if ("keepWithNext" in block && block.keepWithNext && i + 1 < blocks.length) {
      const nextBlock = blocks[i + 1];
      requiredHeight += nextBlock.heightPt;
      // If section heading -> split-row -> company/body, try to keep heading + next entry header together
      if (
        block.type === "section-heading" &&
        "keepWithNext" in nextBlock &&
        nextBlock.keepWithNext &&
        i + 2 < blocks.length
      ) {
        requiredHeight += Math.min(blocks[i + 2].heightPt, 30);
      }
    }

    const currentPage = pages[pages.length - 1];
    if (
      currentPage.blocks.length > 0 &&
      usedHeight + requiredHeight > usableHeight
    ) {
      // Trim trailing entry-gap on the closing page
      const lastBlock = currentPage.blocks[currentPage.blocks.length - 1];
      if (lastBlock?.type === "entry-gap") {
        currentPage.blocks.pop();
      }
      pages.push({ pageNumber: pages.length + 1, blocks: [] });
      usedHeight = 0;
      if (block.type === "entry-gap") {
        continue;
      }
    }

    pages[pages.length - 1].blocks.push(block);
    usedHeight += block.heightPt;
  }

  return {
    pages,
    hasAnyContent,
  };
}
