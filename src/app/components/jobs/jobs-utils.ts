import type { Job } from "@/app/types/job";

export type Range = [number, number];
export type Posted = "any" | "1" | "7" | "30";
export type Sort = "newest" | "oldest";

export const EXP_MAX = 15;
export const ANY: Range = [0, EXP_MAX];

export interface Filters {
  search: string;
  locations: string[];
  experience: Range;
  posted: Posted;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  locations: [],
  experience: ANY,
  posted: "any",
};

export const EXP_PRESETS: { label: string; range: Range }[] = [
  { label: "Any", range: ANY },
  { label: "Fresher", range: [0, 0] },
  { label: "0–2 yrs", range: [0, 2] },
  { label: "2–5 yrs", range: [2, 5] },
  { label: "5+ yrs", range: [5, EXP_MAX] },
];

export const POSTED_OPTIONS: { value: Posted; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

export const isAnyExp = (r: Range) => r[0] === ANY[0] && r[1] === ANY[1];

export function countActive(f: Filters) {
  return (
    (f.search.trim() ? 1 : 0) +
    f.locations.length +
    (isAnyExp(f.experience) ? 0 : 1) +
    (f.posted === "any" ? 0 : 1)
  );
}

/** "Fresher" -> [0,0], "2-4" -> [2,4], "5+" -> [5,∞], "3" -> [3,3], unknown -> null */
export function parseExperience(exp?: string | null): Range | null {
  if (!exp) return null;
  const s = exp.trim().toLowerCase();
  if (s === "fresher" || s === "0" || s === "0-0") return [0, 0];
  const m = s.match(/(\d+)\s*(?:([-–+])\s*(\d+)?)?/);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  if (m[2] === "+" && !m[3]) return [min, Infinity];
  return [min, m[3] ? parseInt(m[3], 10) : min];
}

export function rangeLabel([a, b]: Range) {
  if (a === 0 && b === EXP_MAX) return "Any experience";
  if (a === 0 && b === 0) return "Fresher";
  if (b === EXP_MAX) return `${a}+ years`;
  return `${a}–${b} years`;
}

/** Pass `skip: "locations"` to get the base set used for location counts. */
export function applyFilters(jobs: Job[], f: Filters, skip?: "locations" | "experience") {
  const q = f.search.trim().toLowerCase();
  const days = f.posted === "any" ? 0 : Number(f.posted);
  const cutoff = days ? Date.now() - days * 86_400_000 : 0;
  const hi = f.experience[1] === EXP_MAX ? Infinity : f.experience[1];
  const anyExp = skip === "experience" || isAnyExp(f.experience);

  return jobs.filter((job) => {
    if (q && !job.title.toLowerCase().includes(q)) return false;
    if (skip !== "locations" && f.locations.length && !f.locations.includes(job.location)) return false;
    if (!anyExp) {
      const r = parseExperience(job.experience);
      if (r && !(r[0] <= hi && r[1] >= f.experience[0])) return false; // ranges overlap
    }
    if (cutoff && new Date(job.postedDate).getTime() < cutoff) return false;
    return true;
  });
}

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units: [string, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

export const isRecent = (d: string, days = 3) =>
  Date.now() - new Date(d).getTime() < days * 86_400_000;
