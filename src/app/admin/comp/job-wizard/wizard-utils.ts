import { CANONICAL_CITIES } from "@/lib/supabase/locations-data";
import type { Job } from "@/app/types/job";
import type { OfficeLocation } from "./types";

let globalCscCities: Array<{ name: string; state: string; countryCode: string }> | null = null;
let cscCitiesPromise: Promise<Array<{ name: string; state: string; countryCode: string }>> | null = null;

export function getCachedCscCities(): Array<{ name: string; state: string; countryCode: string }> {
  return globalCscCities || [];
}

export function fetchCscCities(): Promise<Array<{ name: string; state: string; countryCode: string }>> {
  if (globalCscCities) return Promise.resolve(globalCscCities);
  if (cscCitiesPromise) return cscCitiesPromise;
  cscCitiesPromise = fetch("/api/locations?country=IN&type=cities")
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        globalCscCities = data;
        return data;
      }
      return [];
    })
    .catch((err) => {
      console.warn("Could not load extended cities from API:", err);
      return [];
    });
  return cscCitiesPromise;
}

export function resolveOfficeState(cityName: string): string {
  if (!cityName) return "";
  const cityLower = cityName.trim().toLowerCase();
  const canonical = CANONICAL_CITIES.find(
    (c) => c.name.toLowerCase() === cityLower || c.aliases?.some((a) => a.toLowerCase() === cityLower)
  );
  if (canonical?.state) return canonical.state;

  if (globalCscCities) {
    const csc = globalCscCities.find((c) => c.name.toLowerCase() === cityLower);
    if (csc?.state) return csc.state;
  }
  return "";
}

export function getOfficeStates(offices: OfficeLocation[]): string[] {
  const states: string[] = [];
  for (const o of offices) {
    let st = (o.state || "").trim();
    if (!st && o.city) {
      st = resolveOfficeState(o.city);
    }
    if (st && !states.some((existing) => existing.toLowerCase() === st.toLowerCase())) {
      states.push(st);
    }
  }
  return states;
}

export function formatExperienceLabel(minVal: string, maxVal: string): string {
  const minNum = minVal.trim() === "" ? 0 : Number(minVal);
  const hasMax = maxVal.trim() !== "";
  const maxNum = hasMax ? Number(maxVal) : null;

  if (minNum === 0 && (maxNum === null || maxNum === 0)) {
    return "Fresher";
  }
  if (minNum === 0 && maxNum !== null && maxNum > 0) {
    return `0–${maxNum} years`;
  }
  if (maxNum !== null && maxNum > minNum) {
    return `${minNum}–${maxNum} years`;
  }
  if (maxNum !== null && maxNum === minNum) {
    return `${minNum} year${minNum === 1 ? "" : "s"}`;
  }
  return `${minNum}+ years`;
}

export function parseExperienceFromJob(job: Job): { min: string; max: string } {
  const value = (job.experience || "").trim();
  if (!value || /^fresher$/i.test(value)) {
    return { min: "0", max: "0" };
  }
  const range = value.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (range) {
    return { min: range[1], max: range[2] };
  }
  const plus = value.match(/(\d+(?:\.\d+)?)\s*\+/);
  if (plus) {
    return { min: plus[1], max: "" };
  }
  const single = value.match(/(\d+(?:\.\d+)?)/);
  if (single) {
    return { min: single[1], max: single[1] };
  }
  return { min: "0", max: "0" };
}

export function dateForInput(value?: string): string {
  if (!value) return "";
  const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];
  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function computeSubmitPostedDate(
  formPostedDate: string,
  todayStr: string,
  mode: string,
  initialJobPostedDate?: string
): string {
  if (mode === "edit" && initialJobPostedDate) {
    const initialInputDate = dateForInput(initialJobPostedDate);
    if (initialInputDate === formPostedDate) {
      const isMidnight =
        /T00:00:00(\.000)?Z?$/i.test(initialJobPostedDate) ||
        /00:00:00/.test(initialJobPostedDate);
      if (formPostedDate === todayStr && isMidnight) {
        return new Date().toISOString();
      }
      return initialJobPostedDate;
    }
  }

  if (formPostedDate === todayStr) {
    return new Date().toISOString();
  }

  return new Date(`${formPostedDate}T12:00:00.000Z`).toISOString();
}

export const WIZARD_STEPS = [
  {
    num: 1,
    tag: "01",
    label: "Role",
    brief: "Job title, company & type",
  },
  {
    num: 2,
    tag: "02",
    label: "Location",
    brief: "Offices & candidate residency",
  },
  {
    num: 3,
    tag: "03",
    label: "Compensation",
    brief: "Experience, salary & contact email",
  },
  {
    num: 4,
    tag: "04",
    label: "Review",
    brief: "Job description & publish",
  },
];

export function cleanDescriptionText(raw: string): string {
  if (!raw) return "";
  let text = raw;

  // 1. Remove leading metadata block if any (Role Title:, Company:, etc.)
  const lines = text.split("\n");
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^(role|job title|company|location|work mode|experience|salary|contact email):/i.test(l)) {
      startIdx = i + 1;
    } else if (l === "" && startIdx > 0) {
      // Empty line after metadata block
      startIdx = i + 1;
      break;
    } else {
      break;
    }
  }

  if (startIdx > 0) {
    text = lines.slice(startIdx).join("\n").trim();
  }

  // 2. Normalize section headers to standard format with line breaks
  text = text.replace(/^(About the (Role|Company)|Key Responsibilities|Responsibilities|Requirements|Skills|What we offer|Perks|Benefits):/gim, "\n\n$1:\n");

  // 3. Clean up excessive consecutive blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

export const inputClass =
  "w-full rounded-control border border-border-default bg-surface-card px-3.5 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-subtle";

export const labelClass =
  "mb-1.5 block text-xs font-semibold text-text-secondary";

export const SAMPLE_JOB_DESCRIPTION = `Role: Senior Frontend Engineer
Company: Zenoway Tech
Location: Bengaluru, Karnataka (Hybrid)
Employment Type: Full-time
Experience: 3 to 6 years
Salary: ₹18,00,000 - ₹26,00,000 per annum
Contact Email: careers@zenoway.online

About the Role:
We are looking for an experienced Senior Frontend Engineer to build high-performance web applications using Next.js, React, and TypeScript. You will collaborate closely with UI/UX designers and backend engineers to craft responsive, accessible interfaces.

Key Responsibilities:
- Build modular, accessible web interfaces using Next.js App Router and Tailwind CSS.
- Optimize web application performance, Core Web Vitals, and responsive layouts.
- Collaborate with product designers in Figma to implement design systems and reusable components.

Requirements:
- 3+ years of experience with React, Next.js, and TypeScript.
- Strong knowledge of modern CSS, Tailwind, state management, and web performance.
- Passion for great developer experience, automated testing, and semantic HTML.`;
