// src/lib/supabase/locations-data.ts
// Authoritative global geographic reference, alias dictionary, and formatting utilities for Zenoway.

export type { RemoteEligibilityType } from "@/app/types/job";

export interface CountryOption {
  code: string; // ISO 3166-1 alpha-2
  name: string;
}

export interface StateOption {
  code: string;
  name: string;
  countryCode: string;
}

export interface CityOption {
  name: string;
  state: string;
  stateCode: string;
  countryCode: string;
  aliases: string[];
}

// ============================================================================
// 1. Globally Extensible Countries (Pre-configured popular hubs + full support)
// ============================================================================
export const COUNTRIES: CountryOption[] = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "DE", name: "Germany" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NL", name: "Netherlands" },
  { code: "IE", name: "Ireland" },
  { code: "CH", name: "Switzerland" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SE", name: "Sweden" },
  { code: "NZ", name: "New Zealand" },
];

export const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c.name]));

// ============================================================================
// 2. All 28 Indian States & 8 Union Territories
// ============================================================================
export const INDIAN_STATES: StateOption[] = [
  { code: "AN", name: "Andaman and Nicobar Islands", countryCode: "IN" },
  { code: "AP", name: "Andhra Pradesh", countryCode: "IN" },
  { code: "AR", name: "Arunachal Pradesh", countryCode: "IN" },
  { code: "AS", name: "Assam", countryCode: "IN" },
  { code: "BR", name: "Bihar", countryCode: "IN" },
  { code: "CH", name: "Chandigarh", countryCode: "IN" },
  { code: "CT", name: "Chhattisgarh", countryCode: "IN" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu", countryCode: "IN" },
  { code: "DL", name: "Delhi", countryCode: "IN" },
  { code: "GA", name: "Goa", countryCode: "IN" },
  { code: "GJ", name: "Gujarat", countryCode: "IN" },
  { code: "HR", name: "Haryana", countryCode: "IN" },
  { code: "HP", name: "Himachal Pradesh", countryCode: "IN" },
  { code: "JK", name: "Jammu and Kashmir", countryCode: "IN" },
  { code: "JH", name: "Jharkhand", countryCode: "IN" },
  { code: "KA", name: "Karnataka", countryCode: "IN" },
  { code: "KL", name: "Kerala", countryCode: "IN" },
  { code: "LA", name: "Ladakh", countryCode: "IN" },
  { code: "LD", name: "Lakshadweep", countryCode: "IN" },
  { code: "MP", name: "Madhya Pradesh", countryCode: "IN" },
  { code: "MH", name: "Maharashtra", countryCode: "IN" },
  { code: "MN", name: "Manipur", countryCode: "IN" },
  { code: "ML", name: "Meghalaya", countryCode: "IN" },
  { code: "MZ", name: "Mizoram", countryCode: "IN" },
  { code: "NL", name: "Nagaland", countryCode: "IN" },
  { code: "OR", name: "Odisha", countryCode: "IN" },
  { code: "PY", name: "Puducherry", countryCode: "IN" },
  { code: "PB", name: "Punjab", countryCode: "IN" },
  { code: "RJ", name: "Rajasthan", countryCode: "IN" },
  { code: "SK", name: "Sikkim", countryCode: "IN" },
  { code: "TN", name: "Tamil Nadu", countryCode: "IN" },
  { code: "TS", name: "Telangana", countryCode: "IN" },
  { code: "TR", name: "Tripura", countryCode: "IN" },
  { code: "UP", name: "Uttar Pradesh", countryCode: "IN" },
  { code: "UK", name: "Uttarakhand", countryCode: "IN" },
  { code: "WB", name: "West Bengal", countryCode: "IN" },
];

// Common global regions for top technology markets
export const GLOBAL_REGIONS: StateOption[] = [
  ...INDIAN_STATES,
  { code: "CA", name: "California", countryCode: "US" },
  { code: "NY", name: "New York", countryCode: "US" },
  { code: "WA", name: "Washington", countryCode: "US" },
  { code: "TX", name: "Texas", countryCode: "US" },
  { code: "ENG", name: "England", countryCode: "GB" },
  { code: "SCT", name: "Scotland", countryCode: "GB" },
  { code: "DU", name: "Dubai", countryCode: "AE" },
  { code: "AZ", name: "Abu Dhabi", countryCode: "AE" },
  { code: "ON", name: "Ontario", countryCode: "CA" },
  { code: "BC", name: "British Columbia", countryCode: "CA" },
  { code: "NSW", name: "New South Wales", countryCode: "AU" },
  { code: "VIC", name: "Victoria", countryCode: "AU" },
  { code: "BE", name: "Berlin", countryCode: "DE" },
  { code: "BY", name: "Bavaria", countryCode: "DE" },
  { code: "SG", name: "Singapore", countryCode: "SG" },
];

// ============================================================================
// 3. Common Cities & Canonical Aliases (India-First & Global Ready)
// ============================================================================
export const CANONICAL_CITIES: CityOption[] = [
  // Karnataka
  { name: "Bengaluru", state: "Karnataka", stateCode: "KA", countryCode: "IN", aliases: ["Bangalore", "BLR"] },
  { name: "Mysuru", state: "Karnataka", stateCode: "KA", countryCode: "IN", aliases: ["Mysore"] },
  { name: "Mangaluru", state: "Karnataka", stateCode: "KA", countryCode: "IN", aliases: ["Mangalore"] },
  { name: "Hubballi", state: "Karnataka", stateCode: "KA", countryCode: "IN", aliases: ["Hubli"] },

  // Kerala
  { name: "Kochi", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Cochin", "Ernakulam"] },
  { name: "Thiruvananthapuram", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Trivandrum", "TVM"] },
  { name: "Kozhikode", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Calicut"] },
  { name: "Thrissur", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Trichur"] },
  { name: "Kollam", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Quilon"] },
  { name: "Kannur", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Cannanore"] },
  { name: "Kottayam", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: [] },
  { name: "Palakkad", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Palghat"] },
  { name: "Alappuzha", state: "Kerala", stateCode: "KL", countryCode: "IN", aliases: ["Alleppey"] },

  // Tamil Nadu
  { name: "Chennai", state: "Tamil Nadu", stateCode: "TN", countryCode: "IN", aliases: ["Madras"] },
  { name: "Coimbatore", state: "Tamil Nadu", stateCode: "TN", countryCode: "IN", aliases: ["Kovai"] },
  { name: "Madurai", state: "Tamil Nadu", stateCode: "TN", countryCode: "IN", aliases: [] },
  { name: "Tiruchirappalli", state: "Tamil Nadu", stateCode: "TN", countryCode: "IN", aliases: ["Trichy"] },
  { name: "Salem", state: "Tamil Nadu", stateCode: "TN", countryCode: "IN", aliases: [] },

  // Telangana & Andhra Pradesh
  { name: "Hyderabad", state: "Telangana", stateCode: "TS", countryCode: "IN", aliases: ["Secunderabad", "Cyberabad"] },
  { name: "Warangal", state: "Telangana", stateCode: "TS", countryCode: "IN", aliases: [] },
  { name: "Visakhapatnam", state: "Andhra Pradesh", stateCode: "AP", countryCode: "IN", aliases: ["Vizag"] },
  { name: "Vijayawada", state: "Andhra Pradesh", stateCode: "AP", countryCode: "IN", aliases: [] },

  // Maharashtra
  { name: "Mumbai", state: "Maharashtra", stateCode: "MH", countryCode: "IN", aliases: ["Bombay", "Navi Mumbai", "Thane"] },
  { name: "Pune", state: "Maharashtra", stateCode: "MH", countryCode: "IN", aliases: ["Poona"] },
  { name: "Nagpur", state: "Maharashtra", stateCode: "MH", countryCode: "IN", aliases: [] },
  { name: "Nashik", state: "Maharashtra", stateCode: "MH", countryCode: "IN", aliases: [] },

  // NCR & Northern India
  { name: "New Delhi", state: "Delhi", stateCode: "DL", countryCode: "IN", aliases: ["Delhi", "NCT", "NCR"] },
  { name: "Gurugram", state: "Haryana", stateCode: "HR", countryCode: "IN", aliases: ["Gurgaon"] },
  { name: "Faridabad", state: "Haryana", stateCode: "HR", countryCode: "IN", aliases: [] },
  { name: "Noida", state: "Uttar Pradesh", stateCode: "UP", countryCode: "IN", aliases: ["Greater Noida"] },
  { name: "Lucknow", state: "Uttar Pradesh", stateCode: "UP", countryCode: "IN", aliases: [] },
  { name: "Kanpur", state: "Uttar Pradesh", stateCode: "UP", countryCode: "IN", aliases: [] },
  { name: "Mohali", state: "Punjab", stateCode: "PB", countryCode: "IN", aliases: ["SAS Nagar", "Sahibzada Ajit Singh Nagar"] },
  { name: "Ludhiana", state: "Punjab", stateCode: "PB", countryCode: "IN", aliases: [] },
  { name: "Chandigarh", state: "Chandigarh", stateCode: "CH", countryCode: "IN", aliases: [] },

  // Gujarat & Central India
  { name: "Ahmedabad", state: "Gujarat", stateCode: "GJ", countryCode: "IN", aliases: ["Amdavad"] },
  { name: "Surat", state: "Gujarat", stateCode: "GJ", countryCode: "IN", aliases: [] },
  { name: "Vadodara", state: "Gujarat", stateCode: "GJ", countryCode: "IN", aliases: ["Baroda"] },
  { name: "Gandhinagar", state: "Gujarat", stateCode: "GJ", countryCode: "IN", aliases: ["GIFT City"] },
  { name: "Indore", state: "Madhya Pradesh", stateCode: "MP", countryCode: "IN", aliases: [] },
  { name: "Bhopal", state: "Madhya Pradesh", stateCode: "MP", countryCode: "IN", aliases: [] },

  // Eastern & Western India
  { name: "Kolkata", state: "West Bengal", stateCode: "WB", countryCode: "IN", aliases: ["Calcutta"] },
  { name: "Bhubaneswar", state: "Odisha", stateCode: "OR", countryCode: "IN", aliases: [] },
  { name: "Jaipur", state: "Rajasthan", stateCode: "RJ", countryCode: "IN", aliases: [] },

  // International Tech Hubs
  { name: "San Francisco", state: "California", stateCode: "CA", countryCode: "US", aliases: ["SF", "Bay Area", "Silicon Valley"] },
  { name: "New York", state: "New York", stateCode: "NY", countryCode: "US", aliases: ["NYC"] },
  { name: "Seattle", state: "Washington", stateCode: "WA", countryCode: "US", aliases: [] },
  { name: "London", state: "England", stateCode: "ENG", countryCode: "GB", aliases: [] },
  { name: "Dubai", state: "Dubai", stateCode: "DU", countryCode: "AE", aliases: [] },
  { name: "Singapore", state: "Singapore", stateCode: "SG", countryCode: "SG", aliases: [] },
  { name: "Berlin", state: "Berlin", stateCode: "BE", countryCode: "DE", aliases: [] },
  { name: "Toronto", state: "Ontario", stateCode: "ON", countryCode: "CA", aliases: [] },
  { name: "Sydney", state: "New South Wales", stateCode: "NSW", countryCode: "AU", aliases: [] },
];

// Quick alias dictionary: maps lowercase alias -> canonical CityOption
const ALIAS_MAP = new Map<string, CityOption>();
for (const city of CANONICAL_CITIES) {
  ALIAS_MAP.set(city.name.toLowerCase(), city);
  for (const alias of city.aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), city);
  }
}

// ============================================================================
// 4. Helper Functions
// ============================================================================

export function getStatesForCountry(countryCode: string): StateOption[] {
  const code = countryCode.toUpperCase();
  return GLOBAL_REGIONS.filter((r) => r.countryCode === code);
}

export function getCitiesForState(countryCode: string, stateNameOrCode: string): CityOption[] {
  const cCode = countryCode.toUpperCase();
  const sTarget = stateNameOrCode.toLowerCase().trim();
  return CANONICAL_CITIES.filter(
    (c) =>
      c.countryCode === cCode &&
      (c.state.toLowerCase() === sTarget || c.stateCode.toLowerCase() === sTarget)
  );
}

/**
 * Resolves any search query (city, alias, state, or country) to canonical match terms.
 */
export function resolveLocationAliases(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = new Set<string>([q]);

  // Check city & alias dictionary
  const matchedCity = ALIAS_MAP.get(q);
  if (matchedCity) {
    terms.add(matchedCity.name.toLowerCase());
    terms.add(matchedCity.state.toLowerCase());
    for (const a of matchedCity.aliases) terms.add(a.toLowerCase());
  }

  // Check state dictionary
  for (const state of GLOBAL_REGIONS) {
    if (state.name.toLowerCase() === q || state.code.toLowerCase() === q) {
      terms.add(state.name.toLowerCase());
      terms.add(state.code.toLowerCase());
      // Add all cities in this state
      for (const city of CANONICAL_CITIES) {
        if (city.state.toLowerCase() === state.name.toLowerCase()) {
          terms.add(city.name.toLowerCase());
          for (const a of city.aliases) terms.add(a.toLowerCase());
        }
      }
    }
  }

  return Array.from(terms);
}

/**
 * Normalizes work mode to one of: 'Onsite' | 'Hybrid' | 'Remote'.
 */
export function normalizeWorkMode(workMode?: string | null, locationStr?: string | null): "Onsite" | "Hybrid" | "Remote" {
  const wm = (workMode || "").toLowerCase();
  const loc = (locationStr || "").toLowerCase();

  if (wm.includes("remote") || /^(fully\s+)?remote$/i.test(loc.trim())) {
    return "Remote";
  }
  if (wm.includes("hybrid") || loc.includes("hybrid")) {
    return "Hybrid";
  }
  return "Onsite";
}

/**
 * Formats a clean, readable location label for cards and detail headers.
 */
export function formatLocationLabel(job: {
  location?: string | null;
  workMode?: string | null;
  primaryCity?: string | null;
  primaryState?: string | null;
  primaryCountry?: string | null;
  locality?: string | null;
  isMultiLocation?: boolean;
  remoteEligibilityType?: string | null;
  remoteEligibilityCountries?: string[] | null;
}): string {
  const mode = normalizeWorkMode(job.workMode, job.location);

  if (mode === "Remote") {
    const elType = job.remoteEligibilityType?.toUpperCase();
    if (elType === "WORLDWIDE") {
      return "Remote · Worldwide";
    }
    if (elType === "REGIONS") {
      const regions = (job as { remoteEligibilityRegions?: Array<{ region: string }> }).remoteEligibilityRegions;
      if (Array.isArray(regions) && regions.length > 0) {
        return `Remote · ${regions.map((r) => r.region).join(", ")}`;
      }
      const state = job.primaryState;
      return state ? `Remote · ${state}` : "Remote · State restricted";
    }
    if (elType === "COUNTRIES" && job.remoteEligibilityCountries && job.remoteEligibilityCountries.length > 0) {
      if (job.remoteEligibilityCountries.length === 1) {
        const countryName = COUNTRY_BY_CODE.get(job.remoteEligibilityCountries[0]) || job.remoteEligibilityCountries[0];
        return `Remote · ${countryName}`;
      }
      return `Remote · ${job.remoteEligibilityCountries.length} countries`;
    }
    // Fallback for legacy or regional
    if (job.location && job.location !== "Remote" && job.location !== "remote") {
      return job.location;
    }
    return "Remote";
  }

  // Physical on-site or hybrid
  let placeStr = "";
  if (job.isMultiLocation && job.location) {
    placeStr = job.location;
  } else if (job.primaryCity && job.primaryState) {
    placeStr = `${job.primaryCity}, ${job.primaryState}`;
  } else if (job.primaryState && job.primaryCountry) {
    placeStr = `${job.primaryState}, ${job.primaryCountry}`;
  } else if (job.location) {
    placeStr = job.location;
  } else {
    placeStr = "Location not specified";
  }

  if (mode === "Hybrid") {
    return placeStr.startsWith("Hybrid") ? placeStr : `Hybrid · ${placeStr}`;
  }

  return placeStr;
}

/**
 * Checks if a job matches a location query term, taking into account aliases,
 * canonical city/state/country names, remote eligibility, and work modes.
 */
export function jobMatchesLocation(
  job: {
    location?: string | null;
    workMode?: string | null;
    primaryCity?: string | null;
    primaryState?: string | null;
    primaryCountry?: string | null;
    locality?: string | null;
    remoteEligibilityType?: string | null;
    remoteEligibilityCountries?: string[] | null;
    remoteEligibilityRegions?: Array<{ region: string }> | null;
    physicalLocations?: Array<{ city?: string; state?: string }> | null;
    workModeNotes?: string | null;
  },
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const mode = normalizeWorkMode(job.workMode, job.location);

  // If query is "remote", match remote jobs
  if (q === "remote" && mode === "Remote") return true;

  // If query is "hybrid", match hybrid jobs
  if (q === "hybrid" && mode === "Hybrid") return true;

  // If query is "onsite" or "on-site", match onsite jobs
  if ((q === "onsite" || q === "on-site") && mode === "Onsite") return true;

  // Support compound mode + location queries (e.g. "remote kerala", "hybrid kochi", "remote india", "onsite bengaluru")
  const modePrefixes = [
    { prefix: "remote", requiredMode: "Remote" as const },
    { prefix: "hybrid", requiredMode: "Hybrid" as const },
    { prefix: "onsite", requiredMode: "Onsite" as const },
    { prefix: "on-site", requiredMode: "Onsite" as const },
  ];

  for (const { prefix, requiredMode } of modePrefixes) {
    if (q.startsWith(prefix) || q.endsWith(prefix)) {
      const locPart = q.replace(prefix, "").replace(/^[-–\s,]+|[-–\s,]+$/g, "").trim();
      if (locPart) {
        if (mode !== requiredMode) return false;
        return jobMatchesLocation({ ...job, workMode: requiredMode }, locPart);
      }
    }
  }

  // Check aliases
  const aliasTerms = resolveLocationAliases(q);

  // Text blobs from job
  const jobStrings = [
    job.location || "",
    job.primaryCity || "",
    job.primaryState || "",
    job.primaryCountry || "",
    job.locality || "",
    job.workModeNotes || "",
  ];

  if (Array.isArray(job.physicalLocations)) {
    for (const pl of job.physicalLocations) {
      if (pl.city) jobStrings.push(pl.city);
      if (pl.state) jobStrings.push(pl.state);
    }
  }

  const lowerJobStrings = jobStrings.map((s) => s.toLowerCase());

  for (const term of aliasTerms) {
    if (lowerJobStrings.some((s) => s.includes(term))) {
      return true;
    }
  }

  // If job is remote, check if the search term matches any remote eligibility country/region
  if (mode === "Remote") {
    if (job.remoteEligibilityType === "WORLDWIDE") {
      if (q === "worldwide" || q === "global" || q === "anywhere") return true;
    }
    if (job.remoteEligibilityType === "REGIONS") {
      const regions = job.remoteEligibilityRegions;
      const stateNames = Array.isArray(regions) && regions.length > 0
        ? regions.map((r) => r.region.toLowerCase())
        : [((job.primaryState || "")).toLowerCase()].filter(Boolean);

      for (const st of stateNames) {
        if (st.includes(q)) return true;
        for (const term of aliasTerms) {
          if (st.includes(term)) return true;
        }
      }
    }
    if (job.remoteEligibilityCountries && job.remoteEligibilityCountries.length > 0) {
      for (const countryCode of job.remoteEligibilityCountries) {
        const countryName = COUNTRY_BY_CODE.get(countryCode)?.toLowerCase() || "";
        if (countryCode.toLowerCase() === q || countryName.includes(q)) {
          return true;
        }
        for (const term of aliasTerms) {
          if (countryName.includes(term) || countryCode.toLowerCase() === term) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

