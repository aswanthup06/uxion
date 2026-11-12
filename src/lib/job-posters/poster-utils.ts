import type { Job } from "@/app/types/job";
import { formatLocationLabel, normalizeWorkMode } from "@/lib/supabase/locations-data";

export type PosterTemplateId = "minimal" | "corporate" | "bold" | "compact";
export type PosterFormatId = "feed" | "square" | "story";
export type PosterQualityScale = 1 | 2;

export interface PosterFormatSpec {
  id: PosterFormatId;
  label: string;
  ratio: string;
  width: number;
  height: number;
  hint: string;
}

export interface PosterTemplateMeta {
  id: PosterTemplateId;
  name: string;
  tagline: string;
  bestFor: string;
}

export interface NormalizedPosterJob {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyLogoUrl: string | null;
  companyWebsiteDisplay: string | null;
  location: string | null;
  workMode: "Onsite" | "Hybrid" | "Remote";
  salary: string | null;
  experience: string | null;
  employmentType: string | null;
  category: string | null;
  postedDateLabel: string | null;
  summary: string | null;
  bullets: string[];
  highlights: string[];
  jobUrl: string;
  displayUrl: string;
}

export const PRODUCTION_SITE_URL = "https://www.zenoway.online";

export const POSTER_FORMATS: Record<PosterFormatId, PosterFormatSpec> = {
  feed: {
    id: "feed",
    label: "Feed Post",
    ratio: "4:5",
    width: 1080,
    height: 1350,
    hint: "LinkedIn & Feed",
  },
  square: {
    id: "square",
    label: "Square",
    ratio: "1:1",
    width: 1080,
    height: 1080,
    hint: "Instagram & X",
  },
  story: {
    id: "story",
    label: "Story",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    hint: "WhatsApp & IG Story",
  },
};

export const POSTER_TEMPLATES: PosterTemplateMeta[] = [
  {
    id: "bold",
    name: "Bold Hiring",
    tagline: "3D megaphone campaign",
    bestFor: "Instagram & spotlight",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Swiss gallery typography",
    bestFor: "Editorial & brand sharing",
  },
  {
    id: "corporate",
    name: "Corporate",
    tagline: "Executive split layout",
    bestFor: "LinkedIn announcements",
  },
  {
    id: "compact",
    name: "Compact",
    tagline: "High-contrast dark flyer",
    bestFor: "WhatsApp & quick scan",
  },
];

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contract",
  INTERN: "Internship",
  TEMPORARY: "Temporary",
  VOLUNTEER: "Volunteer",
  PER_DIEM: "Per diem",
};

const UNAVAILABLE_SALARY_PATTERNS = new Set([
  "not disclosed",
  "not specified",
  "undisclosed",
  "n/a",
  "na",
  "none",
  "tbd",
  "-",
  "--",
]);

export function getJobPublicUrl(jobId: string): string {
  return `${PRODUCTION_SITE_URL}/jobs/${encodeURIComponent(jobId)}`;
}

export function getJobDisplayUrl(jobId: string): string {
  return `zenoway.online/jobs/${jobId}`;
}

export function formatEmploymentType(employmentType?: string | null): string | null {
  const raw = employmentType?.trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  if (upper === "OTHER") return null;
  if (EMPLOYMENT_TYPE_LABELS[upper]) {
    return EMPLOYMENT_TYPE_LABELS[upper];
  }

  return raw
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function formatOptionalSalary(salary?: string | null): string | null {
  const raw = salary?.trim();
  if (!raw) return null;
  if (UNAVAILABLE_SALARY_PATTERNS.has(raw.toLowerCase())) {
    return null;
  }
  return raw;
}

export function formatOptionalExperience(experience?: string | null): string | null {
  const raw = experience?.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === "not specified" || lower === "n/a" || lower === "na") {
    return null;
  }
  return raw;
}

export function formatOptionalLocation(job: Job): string | null {
  const formatted = formatLocationLabel(job).trim();
  if (!formatted || formatted.toLowerCase() === "location not specified") {
    return null;
  }
  return formatted;
}

export function formatPostedDateLabel(dateString?: string | null): string | null {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
}

const SOCIAL_OR_BOARD_HOSTS = [
  "linkedin.com",
  "lnkd.in",
  "instagram.com",
  "facebook.com",
  "fb.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "youtu.be",
  "indeed.com",
  "naukri.com",
  "glassdoor.com",
  "internshala.com",
  "wellfound.com",
  "angel.co",
];

export function formatWebsiteDomain(rawUrl?: string | null): string | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (
      SOCIAL_OR_BOARD_HOSTS.some(
        (blocked) => host === blocked || host.endsWith(`.${blocked}`)
      )
    ) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

export function getCompanyLogoUrl(job: Job): string | null {
  const maybeRecord = job as Job & {
    companyLogo?: string | null;
    logoUrl?: string | null;
    logo?: string | null;
  };
  const candidate =
    maybeRecord.companyLogo?.trim() ||
    maybeRecord.logoUrl?.trim() ||
    maybeRecord.logo?.trim() ||
    "";

  if (!candidate) return null;
  if (candidate.startsWith("/")) return candidate;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function getCompanyInitials(company?: string | null): string {
  const words = (company || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "Z";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, Math.max(0, maxLength - 1));
  const lastSpace = sliced.lastIndexOf(" ");
  const boundary = lastSpace > maxLength * 0.6 ? lastSpace : sliced.length;
  return `${sliced.slice(0, boundary).trimEnd().replace(/[,;:\-–—]+$/, "")}…`;
}

/**
 * Formats poster bullets cleanly at complete clause/phrase boundaries
 * so posters never render awkward mid-sentence "..." ellipsis cutoffs.
 */
export function formatCleanBullet(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
  if (clean.length <= maxLength) return clean;

  const minAcceptable = Math.max(24, Math.floor(maxLength * 0.45));
  const slice = clean.slice(0, maxLength);

  // Prefer natural clause separators (period, semicolon, em/en dash, comma)
  const clauseMatch = slice.match(/^(.+[.;—–,])\s+/);
  if (clauseMatch && clauseMatch[1].length >= minAcceptable) {
    return clauseMatch[1].replace(/[,;:\-–—.]+$/, "").trim();
  }

  // Otherwise stop cleanly at last full word, stripping trailing connector words
  const lastSpace = slice.lastIndexOf(" ");
  let trimmed = (lastSpace >= minAcceptable ? slice.slice(0, lastSpace) : slice).trim();
  const trailingStopwords =
    /\s+(?:a|an|the|to|for|with|and|or|of|in|on|at|by|into|from|across|through|their|our)$/i;
  while (trailingStopwords.test(trimmed) && trimmed.length > minAcceptable) {
    trimmed = trimmed.replace(trailingStopwords, "").trim();
  }

  return trimmed.replace(/[,;:\-–—]+$/, "").trim();
}

function stripMarkdownFormatting(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDescriptionPreview(
  description?: string | null,
  options?: { maxSummaryLength?: number; maxBullets?: number; maxBulletLength?: number }
): { summary: string | null; bullets: string[] } {
  const maxSummaryLength = options?.maxSummaryLength ?? 220;
  const maxBullets = options?.maxBullets ?? 4;
  const maxBulletLength = options?.maxBulletLength ?? 78;

  if (!description || !description.trim()) {
    return { summary: null, bullets: [] };
  }

  const lines = description.split(/\r?\n/);
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const bulletMatch = trimmed.match(
      /^([•\-*›>]|\d+[.)]|[✅✔👉🔹▪️][\u{1F3FB}-\u{1F3FF}\uFE0F]?)\s*(.+)$/u
    );
    if (bulletMatch) {
      const cleanedBullet = stripMarkdownFormatting(bulletMatch[2]);
      if (cleanedBullet.length >= 6 && bullets.length < maxBullets) {
        bullets.push(formatCleanBullet(cleanedBullet, maxBulletLength));
      }
      continue;
    }

    const cleaned = stripMarkdownFormatting(trimmed);
    if (!cleaned) continue;

    // Skip generic section headers so the summary uses actual role prose
    if (
      /^(about\s+(the\s+|this\s+)?(role|job|position|company|us)|overview|summary|job\s+description|responsibilities|key\s+responsibilities|requirements|qualifications|what\s+we('re|\s+are)\s+looking\s+for|skills\s+required|benefits|perks\s*&\s*benefits|how\s+to\s+apply):?$/i.test(
        cleaned
      )
    ) {
      continue;
    }

    if (cleaned.endsWith(":") && cleaned.length <= 48) {
      continue;
    }

    paragraphs.push(cleaned);
  }

  const combinedProse = paragraphs.join(" ");
  const summary = combinedProse
    ? formatCleanBullet(combinedProse, maxSummaryLength)
    : bullets.length > 0
      ? bullets.join(" · ")
      : null;

  return { summary, bullets };
}

export function normalizePosterJobData(
  job: Job,
  format: PosterFormatId
): NormalizedPosterJob {
  const isStory = format === "story";
  const isSquare = format === "square";
  const { summary, bullets } = extractDescriptionPreview(job.description, {
    maxSummaryLength: isStory ? 260 : isSquare ? 150 : 200,
    maxBullets: isStory ? 4 : isSquare ? 2 : 3,
    maxBulletLength: isStory ? 96 : isSquare ? 80 : 92,
  });

  const title = job.title?.trim() || "Open Position";
  const company = job.company?.trim() || "Hiring Partner";
  const category = job.category?.trim() || null;
  const location = formatOptionalLocation(job);
  const salary = formatOptionalSalary(job.salary);
  const experience = formatOptionalExperience(job.experience);
  const employmentType = formatEmploymentType(job.employmentType);

  const fallbackFactBullets = [
    location ? `Location: ${location}` : null,
    salary ? `Compensation: ${salary}` : null,
    employmentType ? `Role type: ${employmentType}` : null,
    experience ? `Experience: ${experience}` : null,
  ].filter((item): item is string => item !== null);

  const maxHighlights = isStory ? 4 : isSquare ? 2 : 3;
  const highlights =
    bullets.length > 0
      ? bullets.slice(0, maxHighlights)
      : fallbackFactBullets.slice(0, maxHighlights);

  return {
    id: job.id,
    title,
    company,
    companyInitials: getCompanyInitials(company),
    companyLogoUrl: getCompanyLogoUrl(job),
    companyWebsiteDisplay: formatWebsiteDomain(job.companyLink),
    location,
    workMode: normalizeWorkMode(job.workMode, job.location),
    salary,
    experience,
    employmentType,
    category: category || null,
    postedDateLabel: formatPostedDateLabel(job.postedDate),
    summary,
    bullets,
    highlights,
    jobUrl: getJobPublicUrl(job.id),
    displayUrl: getJobDisplayUrl(job.id),
  };
}

function toFilenameSlug(raw: string, maxLength: number): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

export function getPosterFilename(
  job: Job,
  format: PosterFormatId,
  template?: PosterTemplateId
): string {
  const titleSlug = toFilenameSlug(job.title || "", 38) || job.id.toLowerCase();
  const companySlug = toFilenameSlug(job.company || "", 22);
  const parts = ["zenoway", titleSlug];

  if (companySlug && companySlug !== titleSlug) {
    parts.push(companySlug);
  }
  if (template) {
    parts.push(template);
  }
  parts.push(format);

  return `${parts.join("-")}.png`;
}
