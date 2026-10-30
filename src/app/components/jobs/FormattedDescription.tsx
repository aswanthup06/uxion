"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface FormattedDescriptionProps {
  content?: string | null;
  className?: string;
}

/**
 * Renders job descriptions with clear typography hierarchy:
 * - Bold headings for sections (e.g. Responsibilities, Requirements)
 * - Option 3 ChevronRight bullet icons in Zenoway emerald green
 * - Relaxed paragraph spacing for regular text
 */
export default function FormattedDescription({
  content,
  className = "",
}: FormattedDescriptionProps) {
  if (!content || !content.trim()) {
    return (
      <p className="text-sm leading-relaxed text-text-muted">
        A detailed description for this position has not been provided yet.
      </p>
    );
  }

  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="my-2 space-y-1.5">
          {currentList.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm sm:text-[14.5px] leading-relaxed text-text-secondary"
            >
              <ChevronRight
                className="mt-1 h-3.5 w-3.5 shrink-0 text-brand"
                strokeWidth={2.4}
              />
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    // Empty line -> flush list if any
    if (!line) {
      flushList(index);
      return;
    }

    // Check if it's a bullet point line (starts with •, -, *, ›, > or 1.)
    const bulletMatch = line.match(/^([•\-\*›\>]|\d+[\.\)])\s+(.*)/);
    if (bulletMatch) {
      currentList.push(bulletMatch[2]);
      return;
    }

    // Check if it's a section heading
    const isMarkdownHeading = /^#{1,4}\s+(.*)/.test(line);
    const isColonHeading =
      line.endsWith(":") &&
      line.length <= 60 &&
      !line.toLowerCase().includes("email") &&
      !line.toLowerCase().includes("http");
    const isCommonTitle =
      /^(about the role|about the company|responsibilities|key responsibilities|what you('ll| will) do|requirements|qualifications|what we('re| are) looking for|skills required|perks & benefits|benefits|nice to have|how to apply)$/i.test(
        line.replace(/[:#]/g, "").trim()
      );

    if (isMarkdownHeading || isColonHeading || isCommonTitle) {
      flushList(index);
      const cleanTitle = line
        .replace(/^#{1,4}\s+/, "")
        .replace(/:$/, "")
        .trim();

      elements.push(
        <h4
          key={`heading-${index}`}
          className="mt-5 mb-2 text-[15px] font-bold text-text-primary first:mt-1"
        >
          {cleanTitle}
        </h4>
      );
      return;
    }

    // Otherwise, normal paragraph
    flushList(index);
    elements.push(
      <p
        key={`p-${index}`}
        className="my-2 text-sm sm:text-[14.5px] leading-relaxed text-text-secondary"
      >
        {line}
      </p>
    );
  });

  // Flush remaining list items if ended with bullets
  flushList(lines.length);

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}

