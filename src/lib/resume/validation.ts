import {
  DEFAULT_SECTION_ORDER,
  type ResumeCertificationItem,
  type ResumeData,
  type ResumeEducationItem,
  type ResumeExperienceItem,
  type ResumeFontFamily,
  type ResumeLink,
  type ResumeOptionalSection,
  type ResumePersonalDetails,
  type ResumeProjectItem,
  type ResumeSectionKey,
  type ResumeSkillGroup,
  createId,
} from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const FULL_MONTH_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

export interface ParsedResumeDate {
  valid: boolean;
  empty: boolean;
  precision?: "year" | "month";
  year?: number;
  month?: number;
  sortKey?: number;
  formatted: string;
  error?: string;
}

export function parseResumeDate(raw: string): ParsedResumeDate {
  const value = raw.trim();
  if (!value) {
    return { valid: true, empty: true, formatted: "" };
  }

  // Format: YYYY
  const yearOnly = /^(\d{4})$/.exec(value);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    if (year < 1950 || year > 2035) {
      return {
        valid: false,
        empty: false,
        formatted: value,
        error: "Year must be between 1950 and 2035.",
      };
    }
    return {
      valid: true,
      empty: false,
      precision: "year",
      year,
      sortKey: year * 100 + 1,
      formatted: String(year),
    };
  }

  // Format: YYYY-MM or YYYY/MM
  const yearMonth = /^(\d{4})[-/](\d{1,2})$/.exec(value);
  if (yearMonth) {
    const year = Number(yearMonth[1]);
    const month = Number(yearMonth[2]);
    if (year < 1950 || year > 2035) {
      return {
        valid: false,
        empty: false,
        formatted: value,
        error: "Year must be between 1950 and 2035.",
      };
    }
    if (month < 1 || month > 12) {
      return {
        valid: false,
        empty: false,
        formatted: value,
        error: "Month must be between 01 and 12.",
      };
    }
    return {
      valid: true,
      empty: false,
      precision: "month",
      year,
      month,
      sortKey: year * 100 + month,
      formatted: `${MONTH_NAMES[month - 1]} ${year}`,
    };
  }

  // Format: MMM YYYY or MMMM YYYY (e.g., "Jan 2024", "March 2022")
  const monthYearText = /^([a-zA-Z]+)\s+(\d{4})$/.exec(value);
  if (monthYearText) {
    const month = FULL_MONTH_MAP[monthYearText[1].toLowerCase()];
    const year = Number(monthYearText[2]);
    if (month && year >= 1950 && year <= 2035) {
      return {
        valid: true,
        empty: false,
        precision: "month",
        year,
        month,
        sortKey: year * 100 + month,
        formatted: `${MONTH_NAMES[month - 1]} ${year}`,
      };
    }
  }

  return {
    valid: false,
    empty: false,
    formatted: value,
    error: "Use YYYY-MM (e.g. 2024-03) or YYYY (e.g. 2024).",
  };
}

export function formatResumeDate(raw: string): string {
  const parsed = parseResumeDate(raw);
  return parsed.formatted;
}

export function formatDateRange(
  startRaw: string,
  endRaw: string,
  isCurrent = false
): string {
  const start = formatResumeDate(startRaw);
  const end = isCurrent ? "Present" : formatResumeDate(endRaw);

  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return "";
}

export function isEndBeforeStart(
  startRaw: string,
  endRaw: string,
  isCurrent = false
): boolean {
  if (isCurrent) return false;
  const start = parseResumeDate(startRaw);
  const end = parseResumeDate(endRaw);
  if (!start.valid || !end.valid || start.empty || end.empty) return false;
  if (start.sortKey === undefined || end.sortKey === undefined) return false;

  // If both are year-only or one is year-only with equal years, allow same year.
  if (
    (start.precision === "year" || end.precision === "year") &&
    start.year !== undefined &&
    end.year !== undefined
  ) {
    return end.year < start.year;
  }

  return end.sortKey < start.sortKey;
}

export function normalizeResumeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Reject dangerous schemes explicitly
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= 160 && EMAIL_REGEX.test(trimmed);
}

export function buildResumeFilename(
  personal: Pick<ResumePersonalDetails, "firstName" | "lastName">,
  fallbackTitle?: string
): string {
  const cleanPart = (value: string) =>
    value
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const first = cleanPart(personal.firstName);
  const last = cleanPart(personal.lastName);

  if (first && last) return `${first}-${last}-Resume.pdf`;
  if (first) return `${first}-Resume.pdf`;
  if (last) return `${last}-Resume.pdf`;

  const fallback = cleanPart(fallbackTitle || "");
  if (fallback) return `${fallback}-Resume.pdf`;

  return "Zenoway-ATS-Resume.pdf";
}

export interface ValidationIssue {
  key: string;
  section: "personal" | ResumeSectionKey;
  message: string;
}

export function hasExperienceContent(item: ResumeExperienceItem): boolean {
  return Boolean(
    (item.jobTitle || "").trim() ||
      (item.company || "").trim() ||
      (item.location || "").trim() ||
      (item.startDate || "").trim() ||
      (item.endDate || "").trim() ||
      (item.bullets || []).some((b) => (b || "").trim())
  );
}

export function hasEducationContent(item: ResumeEducationItem): boolean {
  return Boolean(
    (item.degree || "").trim() ||
      (item.fieldOfStudy || "").trim() ||
      (item.institution || "").trim() ||
      (item.location || "").trim() ||
      (item.startDate || "").trim() ||
      (item.endDate || "").trim() ||
      (item.grade || "").trim() ||
      (item.highlights || "").trim()
  );
}

export function hasProjectContent(item: ResumeProjectItem): boolean {
  return Boolean(
    (item.name || "").trim() ||
      (item.role || "").trim() ||
      (item.link || "").trim() ||
      (item.startDate || "").trim() ||
      (item.endDate || "").trim() ||
      (item.description || "").trim() ||
      (item.highlights || []).some((h) => (h || "").trim())
  );
}

export function hasCertificationContent(item: ResumeCertificationItem): boolean {
  return Boolean(
    (item.name || "").trim() ||
      (item.issuer || "").trim() ||
      (item.issueDate || "").trim() ||
      (item.credentialUrl || "").trim()
  );
}

export function hasOptionalSectionContent(item: ResumeOptionalSection): boolean {
  return Boolean(
    (item.title || "").trim() ||
      (item.items || []).some((entry) => (entry || "").trim())
  );
}

export function validateResumeData(
  data: ResumeData,
  options: { requireContactForExport?: boolean } = {}
): {
  valid: boolean;
  issues: ValidationIssue[];
  byKey: Record<string, string>;
} {
  const issues: ValidationIssue[] = [];
  const add = (key: string, section: ValidationIssue["section"], message: string) => {
    issues.push({ key, section, message });
  };

  if (options.requireContactForExport) {
    if (!data.personal.firstName.trim()) {
      add("personal.firstName", "personal", "First name is required.");
    }
    if (!data.personal.lastName.trim()) {
      add("personal.lastName", "personal", "Last name is required.");
    }
    if (!data.personal.email.trim()) {
      add("personal.email", "personal", "Email address is required.");
    }
  }

  if (data.personal.email.trim() && !isValidEmail(data.personal.email)) {
    add("personal.email", "personal", "Enter a valid email address.");
  }

  if (data.personal.phone.trim()) {
    const digits = data.personal.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 16) {
      add(
        "personal.phone",
        "personal",
        "Phone number should contain 7 to 16 digits."
      );
    }
  }

  data.personal.links.forEach((link) => {
    const hasAny = Boolean(link.label.trim() || link.url.trim());
    if (!hasAny) return;
    if (!link.label.trim()) {
      add(`personal.links.${link.id}.label`, "personal", "Add a link label (e.g. LinkedIn).");
    }
    if (!link.url.trim()) {
      add(`personal.links.${link.id}.url`, "personal", "Add a URL for this link.");
    } else if (!normalizeResumeUrl(link.url)) {
      add(
        `personal.links.${link.id}.url`,
        "personal",
        "Enter a valid web URL (e.g. https://linkedin.com/in/name)."
      );
    }
  });

  data.experience.forEach((exp) => {
    if (!hasExperienceContent(exp)) return;
    if (!exp.jobTitle.trim()) {
      add(`experience.${exp.id}.jobTitle`, "experience", "Job title is required for this entry.");
    }
    if (!exp.company.trim()) {
      add(`experience.${exp.id}.company`, "experience", "Company name is required for this entry.");
    }
    if (!exp.startDate.trim()) {
      add(`experience.${exp.id}.startDate`, "experience", "Start date is required.");
    } else {
      const startParsed = parseResumeDate(exp.startDate);
      if (!startParsed.valid) {
        add(`experience.${exp.id}.startDate`, "experience", startParsed.error || "Invalid start date.");
      }
    }
    if (!exp.isCurrent) {
      if (!exp.endDate.trim()) {
        add(
          `experience.${exp.id}.endDate`,
          "experience",
          "End date is required unless you currently work here."
        );
      } else {
        const endParsed = parseResumeDate(exp.endDate);
        if (!endParsed.valid) {
          add(`experience.${exp.id}.endDate`, "experience", endParsed.error || "Invalid end date.");
        } else if (isEndBeforeStart(exp.startDate, exp.endDate, false)) {
          add(
            `experience.${exp.id}.endDate`,
            "experience",
            "End date cannot be earlier than start date."
          );
        }
      }
    }
  });

  data.education.forEach((edu) => {
    if (!hasEducationContent(edu)) return;
    if (!edu.degree.trim()) {
      add(`education.${edu.id}.degree`, "education", "Degree or qualification is required.");
    }
    if (!edu.institution.trim()) {
      add(`education.${edu.id}.institution`, "education", "Institution name is required.");
    }
    if (edu.startDate.trim()) {
      const startParsed = parseResumeDate(edu.startDate);
      if (!startParsed.valid) {
        add(`education.${edu.id}.startDate`, "education", startParsed.error || "Invalid start date.");
      }
    }
    if (!edu.isCurrent && edu.endDate.trim()) {
      const endParsed = parseResumeDate(edu.endDate);
      if (!endParsed.valid) {
        add(`education.${edu.id}.endDate`, "education", endParsed.error || "Invalid end date.");
      } else if (edu.startDate.trim() && isEndBeforeStart(edu.startDate, edu.endDate, false)) {
        add(
          `education.${edu.id}.endDate`,
          "education",
          "End date cannot be earlier than start date."
        );
      }
    }
  });

  data.projects.forEach((proj) => {
    if (!hasProjectContent(proj)) return;
    if (!proj.name.trim()) {
      add(`projects.${proj.id}.name`, "projects", "Project name is required.");
    }
    if (proj.link.trim() && !normalizeResumeUrl(proj.link)) {
      add(`projects.${proj.id}.link`, "projects", "Enter a valid project URL.");
    }
    if (proj.startDate.trim()) {
      const sp = parseResumeDate(proj.startDate);
      if (!sp.valid) {
        add(`projects.${proj.id}.startDate`, "projects", sp.error || "Invalid start date.");
      }
    }
    if (proj.endDate.trim()) {
      const ep = parseResumeDate(proj.endDate);
      if (!ep.valid) {
        add(`projects.${proj.id}.endDate`, "projects", ep.error || "Invalid end date.");
      } else if (proj.startDate.trim() && isEndBeforeStart(proj.startDate, proj.endDate, false)) {
        add(
          `projects.${proj.id}.endDate`,
          "projects",
          "Project end date cannot be earlier than start date."
        );
      }
    }
  });

  data.certifications.forEach((cert) => {
    if (!hasCertificationContent(cert)) return;
    if (!cert.name.trim()) {
      add(`certifications.${cert.id}.name`, "certifications", "Certification name is required.");
    }
    if (cert.issueDate.trim()) {
      const d = parseResumeDate(cert.issueDate);
      if (!d.valid) {
        add(`certifications.${cert.id}.issueDate`, "certifications", d.error || "Invalid issue date.");
      }
    }
    if (cert.credentialUrl.trim() && !normalizeResumeUrl(cert.credentialUrl)) {
      add(
        `certifications.${cert.id}.credentialUrl`,
        "certifications",
        "Enter a valid credential URL."
      );
    }
  });

  data.optionalSections.forEach((opt) => {
    if (!hasOptionalSectionContent(opt)) return;
    if (!opt.title.trim()) {
      add(`optional.${opt.id}.title`, "optional", "Section title is required.");
    }
  });

  const byKey: Record<string, string> = {};
  for (const issue of issues) {
    if (!byKey[issue.key]) {
      byKey[issue.key] = issue.message;
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    byKey,
  };
}

function clampString(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").slice(0, maxLen);
}

function clampId(value: unknown, prefix: string): string {
  if (typeof value === "string" && /^[a-zA-Z0-9_-]{2,48}$/.test(value)) {
    return value;
  }
  return createId(prefix);
}

export function sanitizeResumeData(
  input: unknown
): { ok: true; data: ResumeData } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Resume data must be an object." };
  }

  const raw = input as Record<string, unknown>;
  const rawPersonal =
    raw.personal && typeof raw.personal === "object" && !Array.isArray(raw.personal)
      ? (raw.personal as Record<string, unknown>)
      : {};

  const rawLinks = Array.isArray(rawPersonal.links) ? rawPersonal.links.slice(0, 10) : [];
  const links: ResumeLink[] = rawLinks
    .filter((l): l is Record<string, unknown> => Boolean(l && typeof l === "object"))
    .map((l) => ({
      id: clampId(l.id, "lnk"),
      label: clampString(l.label, 60),
      url: clampString(l.url, 300),
    }));

  const rawExp = Array.isArray(raw.experience) ? raw.experience.slice(0, 25) : [];
  const experience: ResumeExperienceItem[] = rawExp
    .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
    .map((e) => ({
      id: clampId(e.id, "exp"),
      jobTitle: clampString(e.jobTitle, 120),
      company: clampString(e.company, 120),
      location: clampString(e.location, 120),
      startDate: clampString(e.startDate, 32),
      endDate: clampString(e.endDate, 32),
      isCurrent: Boolean(e.isCurrent),
      bullets: Array.isArray(e.bullets)
        ? e.bullets.slice(0, 20).map((b) => clampString(b, 600))
        : [],
    }));

  const rawEdu = Array.isArray(raw.education) ? raw.education.slice(0, 15) : [];
  const education: ResumeEducationItem[] = rawEdu
    .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
    .map((e) => ({
      id: clampId(e.id, "edu"),
      degree: clampString(e.degree, 140),
      fieldOfStudy: clampString(e.fieldOfStudy, 140),
      institution: clampString(e.institution, 160),
      location: clampString(e.location, 120),
      startDate: clampString(e.startDate, 32),
      endDate: clampString(e.endDate, 32),
      isCurrent: Boolean(e.isCurrent),
      grade: clampString(e.grade, 60),
      highlights: clampString(e.highlights, 600),
    }));

  const rawSkills = Array.isArray(raw.skills) ? raw.skills.slice(0, 20) : [];
  const skills: ResumeSkillGroup[] = rawSkills
    .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === "object"))
    .map((s) => ({
      id: clampId(s.id, "skill"),
      category: clampString(s.category, 80),
      items: Array.isArray(s.items)
        ? s.items
            .slice(0, 50)
            .map((item) => clampString(item, 60).trim())
            .filter(Boolean)
        : [],
    }));

  const rawProjects = Array.isArray(raw.projects) ? raw.projects.slice(0, 20) : [];
  const projects: ResumeProjectItem[] = rawProjects
    .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === "object"))
    .map((p) => ({
      id: clampId(p.id, "proj"),
      name: clampString(p.name, 140),
      role: clampString(p.role, 100),
      link: clampString(p.link, 300),
      startDate: clampString(p.startDate, 32),
      endDate: clampString(p.endDate, 32),
      description: clampString(p.description, 1000),
      highlights: Array.isArray(p.highlights)
        ? p.highlights.slice(0, 10).map((h) => clampString(h, 500))
        : [],
    }));

  const rawCerts = Array.isArray(raw.certifications)
    ? raw.certifications.slice(0, 25)
    : [];
  const certifications: ResumeCertificationItem[] = rawCerts
    .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === "object"))
    .map((c) => ({
      id: clampId(c.id, "cert"),
      name: clampString(c.name, 160),
      issuer: clampString(c.issuer, 140),
      issueDate: clampString(c.issueDate, 32),
      credentialUrl: clampString(c.credentialUrl, 300),
    }));

  const rawOptional = Array.isArray(raw.optionalSections)
    ? raw.optionalSections.slice(0, 10)
    : [];
  const optionalSections: ResumeOptionalSection[] = rawOptional
    .filter((o): o is Record<string, unknown> => Boolean(o && typeof o === "object"))
    .map((o) => ({
      id: clampId(o.id, "opt"),
      title: clampString(o.title, 80),
      items: Array.isArray(o.items)
        ? o.items.slice(0, 25).map((item) => clampString(item, 400))
        : [],
    }));

  const validOrderKeys = new Set<ResumeSectionKey>(DEFAULT_SECTION_ORDER);
  const rawOrder = Array.isArray(raw.sectionOrder) ? raw.sectionOrder : [];
  const seen = new Set<ResumeSectionKey>();
  const sectionOrder: ResumeSectionKey[] = [];
  for (const key of rawOrder) {
    if (
      typeof key === "string" &&
      validOrderKeys.has(key as ResumeSectionKey) &&
      !seen.has(key as ResumeSectionKey)
    ) {
      seen.add(key as ResumeSectionKey);
      sectionOrder.push(key as ResumeSectionKey);
    }
  }
  for (const fallbackKey of DEFAULT_SECTION_ORDER) {
    if (!seen.has(fallbackKey)) {
      sectionOrder.push(fallbackKey);
    }
  }

  const fontFamily: ResumeFontFamily =
    raw.fontFamily === "times" ? "times" : "helvetica";

  return {
    ok: true,
    data: {
      fontFamily,
      personal: {
        firstName: clampString(rawPersonal.firstName, 80),
        lastName: clampString(rawPersonal.lastName, 80),
        headline: clampString(rawPersonal.headline, 140),
        email: clampString(rawPersonal.email, 160),
        phone: clampString(rawPersonal.phone, 40),
        city: clampString(rawPersonal.city, 120),
        links,
      },
      summary: clampString(raw.summary, 2500),
      experience,
      education,
      skills,
      projects,
      certifications,
      optionalSections,
      sectionOrder,
    },
  };
}

