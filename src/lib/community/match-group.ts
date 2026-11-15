// src/lib/community/match-group.ts
import { CATEGORIES, REGIONS } from "@/app/join/job-communities";
import { matchJobCategory } from "@/data/categories";
import type { Job } from "@/app/types/job";
import { normalizeWorkMode } from "@/lib/supabase/locations-data";

export interface MatchedCommunityGroup {
  categoryName: string;
  regionName: string;
  groupName: string;
  groupDescription: string;
  link: string;
}

const REGION_INDEXES = {
  KERALA: 0,
  REMOTE: 1,
  TAMIL_NADU: 2,
  UTTAR_PRADESH: 3,
  KARNATAKA: 4,
  MAHARASHTRA: 5,
  TELANGANA: 6,
  DELHI_NCR: 7,
  OTHER_STATES: 8,
} as const;

function getCategoryName(job: Job): string {
  // 1. Direct match on job.category if available
  if (job.category) {
    const direct = CATEGORIES.find(
      (c) => c.name.toLowerCase() === job.category?.toLowerCase()
    );
    if (direct) return direct.name;
  }

  // 2. Canonical category from matchJobCategory
  const canonical = matchJobCategory(job.title);
  switch (canonical) {
    case "UI/UX & Product Design":
    case "Graphic & Visual Design":
    case "Motion & 3D Design":
      return "UI/UX & Design";

    case "Frontend & UI Engineering":
    case "Backend & Systems Engineering":
    case "Full Stack Development":
      return "Software Development";

    case "DevOps, Cloud & Infrastructure":
      return "DevOps & Cloud";

    case "QA & Automation Testing":
      return "Quality Assurance (QA)";

    case "Data Science & AI / ML":
      return "Data & AI";

    case "Product Management":
      return "Product & Project Management";

    case "Marketing, SEO & Growth":
      return "Marketing";

    case "HR, Recruitment & Talent":
      return "Human Resources (HR)";

    case "Sales & Business Development":
    case "Customer Success & Support":
      return "Sales & Customer Success";

    default:
      break;
  }

  // 3. Fallback title keywords check for other categories in CATEGORIES
  const titleLower = job.title.toLowerCase();
  for (const cat of CATEGORIES) {
    if (titleLower.includes(cat.name.toLowerCase())) {
      return cat.name;
    }
    for (const sub of cat.subs) {
      if (titleLower.includes(sub.toLowerCase())) {
        return cat.name;
      }
    }
  }

  return "UI/UX & Design"; // Default fallback
}

function getRegionIndex(job: Job): number {
  const workMode = normalizeWorkMode(job.workMode, job.location);
  const locText = [
    job.primaryCity,
    job.primaryState,
    job.location,
    job.rawLocation,
    job.workModeNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // If remote and does not have a strict physical state preference
  if (workMode === "Remote" && !job.primaryState) {
    return REGION_INDEXES.REMOTE;
  }

  // Check state & major cities
  if (
    /\b(kerala|kochi|cochin|kozhikode|calicut|thiruvananthapuram|trivandrum|thrissur|kollam|malappuram|kannur|palakkad|kottayam|alappuzha)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.KERALA;
  }

  if (
    /\b(tamil nadu|tamilnadu|chennai|madras|coimbatore|tirunelveli|madurai|trichy|salem|vellore|erode)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.TAMIL_NADU;
  }

  if (
    /\b(karnataka|bangalore|bengaluru|mangalore|mangaluru|mysore|mysuru|hubli|belgaum|belagavi)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.KARNATAKA;
  }

  if (
    /\b(maharashtra|mumbai|bombay|pune|navi mumbai|thane|nagpur|nashik|aurangabad)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.MAHARASHTRA;
  }

  if (
    /\b(telangana|hyderabad|secunderabad|warangal|nizamabad|khammam)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.TELANGANA;
  }

  if (
    /\b(delhi|new delhi|gurgaon|gurugram|faridabad|ncr)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.DELHI_NCR;
  }

  if (
    /\b(uttar pradesh|up|noida|greater noida|ghaziabad|lucknow|kanpur|agra|prayagraj|allahabad|varanasi)\b/i.test(
      locText
    )
  ) {
    return REGION_INDEXES.UTTAR_PRADESH;
  }

  if (workMode === "Remote" || locText.includes("remote")) {
    return REGION_INDEXES.REMOTE;
  }

  return REGION_INDEXES.OTHER_STATES;
}

export function matchCommunityGroup(job: Job): MatchedCommunityGroup {
  const categoryName = getCategoryName(job);
  const regionIndex = getRegionIndex(job);

  const matchedCat =
    CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[0];
  const matchedGroup = matchedCat.groups[regionIndex] || matchedCat.groups[1];
  const regionInfo = REGIONS[regionIndex] || REGIONS[1];

  const cleanRegion = regionInfo.name.replace(/\s+Jobs(\s+Group)?$/i, "").trim();

  return {
    categoryName: matchedCat.name,
    regionName: cleanRegion,
    groupName: matchedGroup.name,
    groupDescription: matchedGroup.description,
    link: matchedGroup.link || "https://whatsapp.com/channel/0029VbC4AMcJpe8dy0vGfc1x",
  };
}
