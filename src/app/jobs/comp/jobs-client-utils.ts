import type { Job } from "@/app/types/job";
import { normalizeWorkMode } from "@/lib/supabase/locations-data";
import { JOB_CATEGORIES } from "@/data/categories";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type WorkMode = "On-site" | "Hybrid" | "Remote";

export const categories = JOB_CATEGORIES;

export const types: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];

export const experiences = [
  "Any experience",
  "Entry level",
  "0–2 years",
  "1–3 years",
  "2–4 years",
  "3–5 years",
  "5+ years",
];

export const PAGE_SIZE = 12;

export const POPULAR_LOCATIONS = [
  "Pan-India",
  "Bengaluru",
  "Kochi",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Delhi NCR",
  "Kerala",
  "Karnataka",
];

export function parseCardLocation(job: Job): {
  workMode: WorkMode;
  officeLabel: string;
  preferenceNote: string | null;
  officeCities: string[];
} {
  const norm = normalizeWorkMode(job.workMode, job.location);
  const workMode: WorkMode =
    norm === "Remote" ? "Remote" : norm === "Hybrid" ? "Hybrid" : "On-site";

  const raw = (job.location || "").trim();
  let officeText = raw;
  let preferenceNote = job.workModeNotes?.trim() || null;

  // Extract from parenthetical if not in workModeNotes
  const parenMatch = raw.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    officeText = parenMatch[1].trim();
    if (!preferenceNote) {
      preferenceNote = parenMatch[2].trim();
    }
  }

  // Count office cities
  let officeCities: string[] = [];
  if (job.physicalLocations && job.physicalLocations.length > 0) {
    officeCities = job.physicalLocations
      .map((pl) => pl.city)
      .filter((c): c is string => Boolean(c));
  } else if (job.primaryCity) {
    officeCities = [job.primaryCity];
  } else if (workMode !== "Remote" && officeText) {
    officeCities = officeText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }

  let officeLabel = "";
  if (workMode === "Remote") {
    const elType = job.remoteEligibilityType?.toUpperCase();
    if (elType === "WORLDWIDE" || officeText.toLowerCase().includes("worldwide")) {
      officeLabel = "Remote · Worldwide";
    } else if (
      elType === "COUNTRIES" ||
      officeText.toLowerCase().includes("pan-india") ||
      officeText.toLowerCase().includes("remote · india") ||
      officeText.toLowerCase() === "remote"
    ) {
      officeLabel = "Remote · Pan-India";
    } else if (elType === "REGIONS" && job.remoteEligibilityRegions && job.remoteEligibilityRegions.length > 0) {
      officeLabel = `Remote · ${job.remoteEligibilityRegions.map((r) => r.region).join(", ")}`;
    } else if (elType === "CITIES" && job.remoteEligibilityCities && job.remoteEligibilityCities.length > 0) {
      officeLabel = `Remote · ${job.remoteEligibilityCities.map((c) => c.city).join(", ")}`;
    } else if (officeText.toLowerCase().startsWith("remote · ")) {
      officeLabel = officeText.replace(/remote · india/i, "Remote · Pan-India");
    } else if (officeText.toLowerCase() === "remote") {
      officeLabel = "Remote · Pan-India";
    } else if (officeText) {
      officeLabel = `Remote · ${officeText}`;
    } else {
      officeLabel = "Remote · Pan-India";
    }

    if (
      officeLabel === "Remote · Pan-India" ||
      officeLabel === "Remote · Worldwide"
    ) {
      preferenceNote = null;
    }
  } else {
    const prefix = workMode === "Hybrid" ? "Hybrid · " : "";
    let cleanPlace = "";

    if (officeCities.length > 2) {
      cleanPlace = `${officeCities[0]} +${officeCities.length - 1} branches`;
    } else if (officeCities.length === 2) {
      cleanPlace = `${officeCities[0]}, ${officeCities[1]}`;
    } else if (job.primaryCity && job.primaryState) {
      cleanPlace = `${job.primaryCity}, ${job.primaryState}`;
    } else if (job.primaryCity) {
      cleanPlace = job.primaryCity;
    } else if (officeText) {
      cleanPlace = officeText.replace(/^hybrid\s*[·-]?\s*/i, "").trim();
    } else {
      cleanPlace = "Location on request";
    }

    officeLabel = workMode === "Hybrid"
      ? (cleanPlace.startsWith("Hybrid") ? cleanPlace : `${prefix}${cleanPlace}`)
      : cleanPlace;
  }

  return {
    workMode,
    officeLabel,
    preferenceNote,
    officeCities,
  };
}

export function getWorkMode(job: Job): WorkMode {
  const norm = normalizeWorkMode(job.workMode, job.location);
  if (norm === "Remote") return "Remote";
  if (norm === "Hybrid") return "Hybrid";
  return "On-site";
}

export function getJobType(job: Job): JobType {
  const t = (job.employmentType || "").toUpperCase();
  const title = (job.title || "").toLowerCase();
  if (t === "INTERN" || title.includes("intern")) return "Internship";
  if (t === "CONTRACTOR" || title.includes("contract")) return "Contract";
  if (t === "PART_TIME" || title.includes("part-time")) return "Part-time";
  return "Full-time";
}

export function parseMonthlySalary(input?: Job | string | null): number {
  if (!input) return 0;

  if (typeof input === "object") {
    const job = input;
    if (job.salaryIsDisclosed === false) return 0;

    if (job.salaryMax !== undefined || job.salaryMin !== undefined) {
      const amount = job.salaryMax ?? job.salaryMin ?? 0;
      if (job.salaryPeriod === "MONTH") return Math.round(amount);
      if (job.salaryPeriod === "HOUR") return Math.round(amount * 160);
      return Math.round(amount / 12);
    }

    return parseMonthlySalary(job.salary);
  }

  const salaryStr = input;
  if (!salaryStr || /not disclosed/i.test(salaryStr)) return 0;
  const lpaMatch = salaryStr.match(/(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?\s*lpa/i);
  if (lpaMatch) {
    const maxLpa = lpaMatch[2] ? parseFloat(lpaMatch[2]) : parseFloat(lpaMatch[1]);
    return Math.round((maxLpa * 100000) / 12);
  }
  const clean = salaryStr.replace(/,/g, "");
  const kMatch = clean.match(/(\d+(?:\.\d+)?)\s*k/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }
  const numMatch = clean.match(/(\d{4,})/);
  if (numMatch) {
    const val = parseInt(numMatch[1], 10);
    if (val > 100000) return Math.round(val / 12);
    return val;
  }
  return 0;
}

const EMPTY_SAVED: string[] = [];
let savedCache: { raw: string | null; parsed: string[] } = {
  raw: null,
  parsed: EMPTY_SAVED,
};

export function subscribeSavedJobs(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("zenoway_saved_changed", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("zenoway_saved_changed", onStoreChange);
  };
}

export function getSavedJobsSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_SAVED;
  try {
    const raw = localStorage.getItem("zenoway_saved_jobs");
    if (raw === savedCache.raw) return savedCache.parsed;
    const parsed = raw ? JSON.parse(raw) : EMPTY_SAVED;
    savedCache = { raw, parsed: Array.isArray(parsed) ? parsed : EMPTY_SAVED };
    return savedCache.parsed;
  } catch {
    return EMPTY_SAVED;
  }
}

export function getSavedJobsServerSnapshot(): string[] {
  return EMPTY_SAVED;
}

export function toggleSavedJob(id: string): void {
  const current = getSavedJobsSnapshot();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    localStorage.setItem("zenoway_saved_jobs", JSON.stringify(next));
    window.dispatchEvent(new Event("zenoway_saved_changed"));
  } catch {
    // Local storage unavailable
  }
}
