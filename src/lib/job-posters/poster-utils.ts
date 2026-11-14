import type { Job } from "@/app/types/job";
import { formatLocationLabel, normalizeWorkMode } from "@/lib/supabase/locations-data";

export type PosterTemplateId =
  | "bold"
  | "portrait"
  | "minimal"
  | "corporate"
  | "compact";
export type PosterFormatId = "feed" | "square" | "story";
export type PosterQualityScale = 1 | 2;
export type PosterPortraitId =
  | "man-1"
  | "man-2"
  | "man-3"
  | "woman-1"
  | "woman-2"
  | "woman-3";

export interface PosterPortraitOption {
  id: PosterPortraitId;
  name: string;
  label: string;
  gender: "male" | "female";
  src: string;
  description: string;
}

export const POSTER_PORTRAITS: PosterPortraitOption[] = [
  {
    id: "man-1",
    name: "Rohan",
    label: "Glasses & Sweater",
    gender: "male",
    src: "/posters/portraits/man-1.jpg",
    description: "Indian male professional with glasses & knit sweater",
  },
  {
    id: "man-2",
    name: "Aryan",
    label: "Tailored Blazer",
    gender: "male",
    src: "/posters/portraits/man-2.jpg",
    description: "Indian male tech lead in modern navy blazer",
  },
  {
    id: "man-3",
    name: "Kabir",
    label: "Casual Collar",
    gender: "male",
    src: "/posters/portraits/man-3.jpg",
    description: "Indian male creative lead in charcoal shirt",
  },
  {
    id: "woman-1",
    name: "Priya",
    label: "Glasses & Blazer",
    gender: "female",
    src: "/posters/portraits/woman-1.jpg",
    description: "Indian female engineer with stylish glasses",
  },
  {
    id: "woman-2",
    name: "Aanya",
    label: "Smart Casual",
    gender: "female",
    src: "/posters/portraits/woman-2.jpg",
    description: "Indian female professional in layered knitwear",
  },
  {
    id: "woman-3",
    name: "Diya",
    label: "Olive Knit",
    gender: "female",
    src: "/posters/portraits/woman-3.jpg",
    description: "Indian female designer in modern olive knit",
  },
];
export type PosterFontId =
  | "manrope"
  | "space-grotesk"
  | "plus-jakarta"
  | "playfair"
  | "syne";

export interface PosterFontMeta {
  id: PosterFontId;
  name: string;
  category: string;
  fontFamily: string;
  previewSample: string;
}

export const POSTER_FONTS: PosterFontMeta[] = [
  {
    id: "manrope",
    name: "Manrope",
    category: "Modern Sans",
    fontFamily: 'var(--font-manrope), "Manrope", sans-serif',
    previewSample: "Aa · Clean Tech",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "Creative Display",
    fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif',
    previewSample: "Aa · Studio",
  },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta",
    category: "Clean Geometric",
    fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
    previewSample: "Aa · Product",
  },
  {
    id: "playfair",
    name: "Playfair",
    category: "Editorial Serif",
    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
    previewSample: "Aa · Executive",
  },
  {
    id: "syne",
    name: "Syne",
    category: "Bold Display",
    fontFamily: 'var(--font-syne), "Syne", sans-serif',
    previewSample: "Aa · Billboard",
  },
];

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
    id: "portrait",
    name: "Editorial Portrait",
    tagline: "Indian model split layout (Men & Women)",
    bestFor: "LinkedIn, WhatsApp & Social outreach",
  },
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
  if (
    lower === "not specified" ||
    lower === "n/a" ||
    lower === "na" ||
    lower === "none" ||
    lower === "-" ||
    lower === "--"
  ) {
    return null;
  }

  if (
    lower === "fresher" ||
    lower === "freshers" ||
    lower === "0" ||
    lower === "0-0" ||
    lower === "entry level" ||
    lower === "fresher / entry level"
  ) {
    return "Entry Level / Fresher";
  }

  // Range e.g. "5-6", "5 - 6", "5 to 6", "5–6 yrs", "5–6 years", "2 - 5 years"
  const rangeMatch = raw.match(
    /^(\d+)\s*[-–—to]+\s*(\d+)\s*(?:yrs?|years?)?(?:\s*exp(?:erience)?)?$/i
  );
  if (rangeMatch) {
    return `${rangeMatch[1]} – ${rangeMatch[2]} years Experience`;
  }

  // Plus e.g. "5+", "5 +", "5+ yrs", "5+ years"
  const plusMatch = raw.match(/^(\d+)\s*\+\s*(?:yrs?|years?)?(?:\s*exp(?:erience)?)?$/i);
  if (plusMatch) {
    return `${plusMatch[1]}+ years Experience`;
  }

  // Single number e.g. "1 year", "2 years", "3"
  const singleMatch = raw.match(/^(\d+)\s*(?:yrs?|years?)?(?:\s*exp(?:erience)?)?$/i);
  if (singleMatch) {
    const count = parseInt(singleMatch[1], 10);
    return count === 1 ? "1 year Experience" : `${count} years Experience`;
  }

  if (/exp/i.test(raw)) {
    return raw
      .replace(/yrs?\.?/gi, "years")
      .replace(/exp(?:erience)?\.?/gi, "Experience")
      .trim();
  }

  return `${raw} Experience`;
}

export function cleanPosterLocation(rawLocation?: string | null): string | null {
  if (!rawLocation || !rawLocation.trim()) return null;
  let loc = rawLocation.trim();

  // Strip trailing country name (e.g. ", India", ", USA", ", United States")
  loc = loc.replace(/,\s*(?:India|United States|USA|UK|United Kingdom)$/i, "");

  // Convert "City, State" into "City (State)" if not already parenthesized
  const cityStateMatch = loc.match(/^([A-Za-z\s]+),\s*([A-Za-z\s]+)$/);
  if (cityStateMatch) {
    const city = cityStateMatch[1].trim();
    const state = cityStateMatch[2].trim();
    if (city.toLowerCase() === state.toLowerCase()) {
      return city;
    }
    return `${city} (${state})`;
  }

  return loc;
}

export function formatOptionalLocation(job: Job): string | null {
  const formatted = formatLocationLabel(job).trim();
  if (!formatted || formatted.toLowerCase() === "location not specified") {
    return null;
  }
  return cleanPosterLocation(formatted);
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

export function cleanPosterJobTitle(rawTitle?: string | null): string {
  if (!rawTitle || !rawTitle.trim()) return "Open Position";
  let title = rawTitle.trim();

  // Strip prefixes like "URGENT:", "URGENT HIRING:", "Hiring for:", etc.
  title = title.replace(
    /^(?:urgent(?:\s*(?:hiring|requirement|opening))?[:\-\s]*|immediate\s*joiners?[:\-\s]*|hiring\s*(?:for)?[:\-\s]*)/i,
    ""
  );

  // Strip parenthetical or bracketed noise tags: (Urgent), [Immediate Joiner], (M/F), [Remote], etc.
  title = title.replace(
    /\s*[\(\[](?:urgent|immediate\s*joiners?|m[\/\\]f|immediate|full[\-\s]*time|part[\-\s]*time|remote|onsite|hybrid)[\)\]]\s*/gi,
    " "
  );

  // Normalize slashes and spacing
  title = title.replace(/\s*\/\s*/g, " / ");
  title = title.replace(/\s+/g, " ");

  // Trim trailing punctuation like colons, dashes, slashes
  title = title.replace(/[:\-\/\s]+$/, "").replace(/^[:\-\/\s]+/, "");

  return title.trim() || "Open Position";
}

export function cleanPosterSummaryHook(
  rawProse?: string | null,
  maxLen = 130
): string {
  if (!rawProse || !rawProse.trim()) {
    return "Build and maintain high-quality products and websites at scale.";
  }

  let text = rawProse.replace(/\s+/g, " ").trim();

  // Strip section headers
  text = text.replace(
    /^(?:about\s+(?:the\s+|this\s+)?(?:role|job|company)|job\s+summary|overview|role\s+overview):?\s*/i,
    ""
  );

  // Strip trailing hanging phrases (e.g. "... In this role", "... In this role you will", "... You will be")
  text = text.replace(
    /[\s,;—–-]+(?:in this role|you will(?: be)?|as an?|the ideal candidate|we are seeking|responsibilities include)[\s:.,\-–—]*$/i,
    ""
  );

  // Strip redundant experience mentions from within summary hook e.g. "with 5–6 years of experience"
  text = text.replace(
    /\s*(?:with|having)\s+\d+(?:\s*[-–—to]+\s*\d+)?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:exp(?:erience)?)?\s*/gi,
    " "
  );

  // Clean trailing punctuation
  text = text.replace(/[\s,;:\-–—]+$/, "").trim();

  // Ensure first sentence or trimmed length is clean
  if (text.length > maxLen) {
    const firstSentenceMatch = text.match(/^([^.!?]+[.!?])/);
    if (
      firstSentenceMatch &&
      firstSentenceMatch[1].length <= maxLen &&
      firstSentenceMatch[1].length >= 35
    ) {
      text = firstSentenceMatch[1].trim();
    } else {
      const truncated = text.slice(0, maxLen);
      const lastSpace = truncated.lastIndexOf(" ");
      text = (lastSpace > 35 ? truncated.slice(0, lastSpace) : truncated).trim();
    }
  }

  // Clean trailing hanging words like "to", "and", "or", "for", "with", "in"
  text = text.replace(/[\s,;:\-–—]+(?:to|and|or|for|with|in|of|as|the|a|an)\s*$/i, "").trim();

  // Ensure proper ending punctuation
  if (!/[.!?]$/.test(text)) {
    text += ".";
  }

  return text;
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
  const { summary: rawSummary, bullets } = extractDescriptionPreview(job.description, {
    maxSummaryLength: isStory ? 260 : isSquare ? 150 : 200,
    maxBullets: isStory ? 4 : isSquare ? 2 : 3,
    maxBulletLength: isStory ? 96 : isSquare ? 80 : 92,
  });

  const title = cleanPosterJobTitle(job.title);
  const company = job.company?.trim() || "Hiring Partner";
  const category = job.category?.trim() || null;
  const location = formatOptionalLocation(job);
  const salary = formatOptionalSalary(job.salary);
  const experience = formatOptionalExperience(job.experience);
  const employmentType = formatEmploymentType(job.employmentType);
  const summary = cleanPosterSummaryHook(
    rawSummary,
    isStory ? 170 : isSquare ? 115 : 130
  );

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
