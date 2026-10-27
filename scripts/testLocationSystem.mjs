// scripts/testLocationSystem.mjs
// Automated verification test suite for Zenoway's upgraded location system

import {
  resolveLocationAliases,
  normalizeWorkMode,
  formatLocationLabel,
  jobMatchesLocation,
  COUNTRIES,
  INDIAN_STATES,
  CANONICAL_CITIES,
} from "../src/lib/supabase/locations-data.ts";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}${details ? ` - ${details}` : ""}`);
    failedCount++;
  }
}

console.log("================================================================");
console.log("   ZENOWAY GLOBAL LOCATION SYSTEM — AUTOMATED VERIFICATION   ");
console.log("================================================================\n");

// -----------------------------------------------------------------------------
// Test 1: Canonical Data Dictionary Validation
// -----------------------------------------------------------------------------
assert(COUNTRIES.length >= 15, "Test 1.1: Pre-configured countries exist and extensible", `Count: ${COUNTRIES.length}`);
assert(INDIAN_STATES.length === 36, "Test 1.2: All 28 Indian States & 8 Union Territories seeded", `Count: ${INDIAN_STATES.length}`);
assert(CANONICAL_CITIES.length >= 40, "Test 1.3: Major Indian & Global tech hubs present", `Count: ${CANONICAL_CITIES.length}`);

// -----------------------------------------------------------------------------
// Test 2: Alias Resolution (Bengaluru <-> Bangalore, Kochi <-> Cochin, Gurugram <-> Gurgaon, Mumbai <-> Bombay)
// -----------------------------------------------------------------------------
const blrAliases = resolveLocationAliases("bengaluru");
assert(
  blrAliases.includes("bangalore") && blrAliases.includes("bengaluru") && blrAliases.includes("karnataka"),
  "Test 2.1: 'bengaluru' resolves to bangalore, bengaluru, and karnataka",
  JSON.stringify(blrAliases)
);

const bangaloreAliases = resolveLocationAliases("bangalore");
assert(
  bangaloreAliases.includes("bengaluru") && bangaloreAliases.includes("bangalore"),
  "Test 2.2: 'bangalore' resolves to bengaluru and bangalore",
  JSON.stringify(bangaloreAliases)
);

const cochinAliases = resolveLocationAliases("cochin");
assert(
  cochinAliases.includes("kochi") && cochinAliases.includes("cochin"),
  "Test 2.3: 'cochin' resolves to kochi and cochin",
  JSON.stringify(cochinAliases)
);

const gurgaonAliases = resolveLocationAliases("gurgaon");
assert(
  gurgaonAliases.includes("gurugram") && gurgaonAliases.includes("gurgaon"),
  "Test 2.4: 'gurgaon' resolves to gurugram and gurgaon",
  JSON.stringify(gurgaonAliases)
);

const mumbaiAliases = resolveLocationAliases("bombay");
assert(
  mumbaiAliases.includes("mumbai") && mumbaiAliases.includes("bombay"),
  "Test 2.5: 'bombay' resolves to mumbai and bombay",
  JSON.stringify(mumbaiAliases)
);

// -----------------------------------------------------------------------------
// Test 3: State-Level Query Alias Expansion
// -----------------------------------------------------------------------------
const karnatakaAliases = resolveLocationAliases("karnataka");
assert(
  karnatakaAliases.includes("bengaluru") && karnatakaAliases.includes("bangalore") && karnatakaAliases.includes("mysore"),
  "Test 3.1: Searching 'Karnataka' expands to include Bengaluru, Bangalore, Mysore",
  JSON.stringify(karnatakaAliases)
);

const keralaAliases = resolveLocationAliases("kerala");
assert(
  keralaAliases.includes("kochi") && keralaAliases.includes("thiruvananthapuram") && keralaAliases.includes("calicut"),
  "Test 3.2: Searching 'Kerala' expands to include Kochi, Thiruvananthapuram, Calicut",
  JSON.stringify(keralaAliases)
);

// -----------------------------------------------------------------------------
// Test 4: Work Mode Normalization
// -----------------------------------------------------------------------------
assert(normalizeWorkMode("Remote", "") === "Remote", "Test 4.1: 'Remote' normalizes to Remote");
assert(normalizeWorkMode(undefined, "remote") === "Remote", "Test 4.2: location='remote' normalizes to Remote");
assert(normalizeWorkMode(undefined, "Remote") === "Remote", "Test 4.3: location='Remote' normalizes to Remote");
assert(normalizeWorkMode(undefined, "fully remote") === "Remote", "Test 4.4: location='fully remote' normalizes to Remote");
assert(normalizeWorkMode("Hybrid", "Bengaluru") === "Hybrid", "Test 4.5: 'Hybrid' normalizes to Hybrid");
assert(normalizeWorkMode(undefined, "Hybrid - Kochi") === "Hybrid", "Test 4.6: location='Hybrid - Kochi' normalizes to Hybrid");
assert(normalizeWorkMode("Onsite", "Kochi, Kerala") === "Onsite", "Test 4.7: 'Onsite' normalizes to Onsite");
assert(normalizeWorkMode(undefined, "Chennai, Tamil Nadu") === "Onsite", "Test 4.8: Standard city/state normalizes to Onsite");

// -----------------------------------------------------------------------------
// Test 5: Location Label Formatting
// -----------------------------------------------------------------------------
const onsiteJob = {
  location: "Bangalore",
  primaryCity: "Bengaluru",
  primaryState: "Karnataka",
  primaryCountry: "India",
  workMode: "Onsite",
};
assert(
  formatLocationLabel(onsiteJob) === "Bengaluru, Karnataka",
  "Test 5.1: On-site job displays 'Bengaluru, Karnataka'",
  formatLocationLabel(onsiteJob)
);

const hybridJob = {
  location: "Kochi, Kerala",
  primaryCity: "Kochi",
  primaryState: "Kerala",
  primaryCountry: "India",
  workMode: "Hybrid",
};
assert(
  formatLocationLabel(hybridJob) === "Hybrid · Kochi, Kerala",
  "Test 5.2: Hybrid job displays 'Hybrid · Kochi, Kerala'",
  formatLocationLabel(hybridJob)
);

const remoteWorldwideJob = {
  location: "Remote",
  workMode: "Remote",
  remoteEligibilityType: "WORLDWIDE",
};
assert(
  formatLocationLabel(remoteWorldwideJob) === "Remote · Worldwide",
  "Test 5.3: Remote worldwide displays 'Remote · Worldwide'",
  formatLocationLabel(remoteWorldwideJob)
);

const remoteIndiaJob = {
  location: "Remote",
  workMode: "Remote",
  remoteEligibilityType: "COUNTRIES",
  remoteEligibilityCountries: ["IN"],
};
assert(
  formatLocationLabel(remoteIndiaJob) === "Remote · India",
  "Test 5.4: Remote India-only displays 'Remote · India'",
  formatLocationLabel(remoteIndiaJob)
);

const stateOnlyJob = {
  location: "Kerala",
  primaryState: "Kerala",
  primaryCountry: "India",
  workMode: "Onsite",
};
assert(
  formatLocationLabel(stateOnlyJob) === "Kerala, India",
  "Test 5.5: State-only job displays 'Kerala, India' without inventing cities",
  formatLocationLabel(stateOnlyJob)
);

// -----------------------------------------------------------------------------
// Test 6: Alias-Aware and Structured Location Matching (jobMatchesLocation)
// -----------------------------------------------------------------------------
// Scenario A: Job stored with legacy "Bangalore", user searches "Bengaluru"
const legacyBangaloreJob = {
  location: "Bangalore",
  primaryCity: "Bengaluru",
  primaryState: "Karnataka",
  workMode: "Onsite",
};
assert(
  jobMatchesLocation(legacyBangaloreJob, "Bengaluru") === true,
  "Test 6.1: Searching 'Bengaluru' matches job stored as 'Bangalore'"
);
assert(
  jobMatchesLocation(legacyBangaloreJob, "blr") === true,
  "Test 6.2: Searching 'blr' matches job stored as 'Bangalore'"
);
assert(
  jobMatchesLocation(legacyBangaloreJob, "Karnataka") === true,
  "Test 6.3: Searching state 'Karnataka' matches Bangalore job"
);

// Scenario B: Job stored with "kochi , Kerala", user searches "Cochin"
const kochiJob = {
  location: "kochi , Kerala",
  primaryCity: "Kochi",
  primaryState: "Kerala",
  workMode: "Onsite",
};
assert(
  jobMatchesLocation(kochiJob, "cochin") === true,
  "Test 6.4: Searching 'cochin' matches job stored as 'kochi , Kerala'"
);
assert(
  jobMatchesLocation(kochiJob, "Kochi") === true,
  "Test 6.5: Searching 'Kochi' matches job stored as 'kochi , Kerala'"
);

// Scenario C: Remote search
assert(
  jobMatchesLocation(remoteIndiaJob, "remote") === true,
  "Test 6.6: Searching 'remote' matches Remote India job"
);
assert(
  jobMatchesLocation(remoteIndiaJob, "India") === true,
  "Test 6.7: Searching 'India' matches Remote India job"
);
assert(
  jobMatchesLocation(remoteWorldwideJob, "worldwide") === true,
  "Test 6.8: Searching 'worldwide' matches Remote Worldwide job"
);

// Scenario D: On-site job does not falsely match "remote"
assert(
  jobMatchesLocation(onsiteJob, "remote") === false,
  "Test 6.9: On-site Bangalore job does not match search for 'remote'"
);

// Scenario E: Remote State-Only Job (e.g. Kerala only)
const remoteKeralaJob = {
  location: "Remote · Kerala",
  workMode: "Remote",
  remoteEligibilityType: "REGIONS",
  primaryState: "Kerala",
  remoteEligibilityRegions: [{ countryCode: "IN", region: "Kerala" }],
};
assert(
  formatLocationLabel(remoteKeralaJob) === "Remote · Kerala",
  "Test 6.10: Remote state job displays 'Remote · Kerala'",
  formatLocationLabel(remoteKeralaJob)
);
assert(
  jobMatchesLocation(remoteKeralaJob, "Kerala") === true,
  "Test 6.11: Candidate searching 'Kerala' matches Remote Kerala job"
);
assert(
  jobMatchesLocation(remoteKeralaJob, "Remote") === true,
  "Test 6.12: Candidate searching 'Remote' matches Remote Kerala job"
);
assert(
  jobMatchesLocation(remoteKeralaJob, "Karnataka") === false,
  "Test 6.13: Candidate searching 'Karnataka' does NOT match Remote Kerala job"
);

// Scenario F: Option C Multi-Office On-site Job (e.g. Bangalore & Kochi branches)
const multiOfficeJob = {
  location: "Bangalore, Kochi",
  workMode: "Onsite",
  isMultiLocation: true,
  primaryCity: "Bengaluru",
  primaryState: "Karnataka",
  physicalLocations: [
    { city: "Bengaluru", state: "Karnataka" },
    { city: "Kochi", state: "Kerala" },
  ],
};
assert(
  jobMatchesLocation(multiOfficeJob, "Kochi") === true,
  "Test 6.14: Candidate searching 'Kochi' matches multi-office job (Bangalore, Kochi)"
);
assert(
  jobMatchesLocation(multiOfficeJob, "Bengaluru") === true,
  "Test 6.15: Candidate searching 'Bengaluru' matches multi-office job (Bangalore, Kochi)"
);

// Scenario G: Option C Multi-State Remote Job (e.g. Kerala & Karnataka)
const multiStateRemoteJob = {
  location: "Remote · Kerala, Karnataka",
  workMode: "Remote",
  remoteEligibilityType: "REGIONS",
  remoteEligibilityRegions: [
    { countryCode: "IN", region: "Kerala" },
    { countryCode: "IN", region: "Karnataka" },
  ],
};
assert(
  formatLocationLabel(multiStateRemoteJob) === "Remote · Kerala, Karnataka",
  "Test 6.16: Multi-state remote job formats as 'Remote · Kerala, Karnataka'",
  formatLocationLabel(multiStateRemoteJob)
);
assert(
  jobMatchesLocation(multiStateRemoteJob, "Kerala") === true &&
    jobMatchesLocation(multiStateRemoteJob, "Karnataka") === true &&
    jobMatchesLocation(multiStateRemoteJob, "Maharashtra") === false,
  "Test 6.17: Multi-state remote job matches Kerala & Karnataka, rejects Maharashtra"
);

// Scenario H: Compound Mode + Location Queries (e.g. "remote kerala", "hybrid kochi")
assert(
  jobMatchesLocation(remoteKeralaJob, "remote kerala") === true,
  "Test 6.18: Candidate searching 'remote kerala' matches Remote Kerala job"
);
assert(
  jobMatchesLocation(kochiJob, "remote kerala") === false,
  "Test 6.19: On-site Kochi job does NOT match 'remote kerala'"
);
const hybridKochiJob = {
  location: "Hybrid · Kochi, Kerala",
  primaryCity: "Kochi",
  primaryState: "Kerala",
  workMode: "Hybrid",
};
assert(
  jobMatchesLocation(hybridKochiJob, "hybrid kochi") === true,
  "Test 6.20: Hybrid Kochi job matches 'hybrid kochi'"
);
assert(
  jobMatchesLocation(onsiteJob, "hybrid bangalore") === false,
  "Test 6.21: On-site Bangalore job does NOT match 'hybrid bangalore'"
);

// -----------------------------------------------------------------------------
// Test 7: Google Jobs Structured Data Verification (JSON-LD)
// -----------------------------------------------------------------------------
function buildTestJsonLd(job) {
  const mode = normalizeWorkMode(job.workMode, job.location);
  const isRemote = mode === "Remote";

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
  };

  if (isRemote) {
    const elType = job.remoteEligibilityType?.toUpperCase();
    const countries = job.remoteEligibilityCountries || (job.applicantCountry ? [job.applicantCountry] : ["IN"]);

    if (elType === "WORLDWIDE") {
      return {
        ...baseSchema,
        jobLocationType: "TELECOMMUTE",
      };
    }

    if (elType === "REGIONS") {
      const regions = job.remoteEligibilityRegions;
      if (Array.isArray(regions) && regions.length > 1) {
        return {
          ...baseSchema,
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: regions.map((r) => ({
            "@type": "AdministrativeArea",
            name: r.region,
          })),
        };
      }
      const stateName = job.primaryState || job.remoteEligibilityRegions?.[0]?.region;
      return {
        ...baseSchema,
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: {
          "@type": "AdministrativeArea",
          name: stateName || "India",
        },
      };
    }

    const applicantRequirements =
      countries.length === 1
        ? { "@type": "Country", name: "India" }
        : countries.map((c) => ({ "@type": "Country", name: c }));

    return {
      ...baseSchema,
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: applicantRequirements,
    };
  }

  if (job.physicalLocations && job.physicalLocations.length > 1) {
    return {
      ...baseSchema,
      jobLocation: job.physicalLocations.map((pl) => ({
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: pl.city,
          addressRegion: pl.state,
          addressCountry: pl.countryCode || "IN",
        },
      })),
    };
  }

  return {
    ...baseSchema,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.locality ? { streetAddress: job.locality } : {}),
        addressLocality: job.primaryCity || "Unknown",
        addressRegion: job.primaryState,
        addressCountry: job.primaryCountryCode || "IN",
      },
    },
  };
}

const remoteJsonLd = buildTestJsonLd({
  title: "Senior Frontend Engineer",
  company: "Acme Corp",
  description: "Exciting remote position",
  workMode: "Remote",
  remoteEligibilityType: "WORLDWIDE",
});
assert(
  remoteJsonLd.jobLocationType === "TELECOMMUTE" && remoteJsonLd.applicantLocationRequirements === undefined,
  "Test 7.1: Google Jobs JSON-LD for Remote Worldwide has TELECOMMUTE and omits applicantLocationRequirements"
);

const countryRestrictedJsonLd = buildTestJsonLd({
  title: "Staff Backend Engineer",
  company: "Zenoway",
  description: "Remote in India",
  workMode: "Remote",
  remoteEligibilityType: "COUNTRIES",
  remoteEligibilityCountries: ["IN"],
});
assert(
  countryRestrictedJsonLd.jobLocationType === "TELECOMMUTE" &&
    countryRestrictedJsonLd.applicantLocationRequirements["@type"] === "Country",
  "Test 7.2: Google Jobs JSON-LD for Remote Country-Restricted has TELECOMMUTE and applicantLocationRequirements Country"
);

const onsiteJsonLd = buildTestJsonLd({
  title: "DevOps Architect",
  company: "Zenoway",
  description: "On-site role",
  workMode: "Onsite",
  primaryCity: "Bengaluru",
  primaryState: "Karnataka",
  primaryCountryCode: "IN",
  locality: "Koramangala",
});
assert(
  onsiteJsonLd.jobLocation["@type"] === "Place" &&
    onsiteJsonLd.jobLocation.address.addressLocality === "Bengaluru" &&
    onsiteJsonLd.jobLocation.address.addressRegion === "Karnataka" &&
    onsiteJsonLd.jobLocation.address.streetAddress === "Koramangala",
  "Test 7.3: Google Jobs JSON-LD for On-site has valid Place, locality, city, region, and country"
);

const stateRestrictedJsonLd = buildTestJsonLd({
  title: "React Native Developer",
  company: "Infopark Tech",
  description: "Remote in Kerala",
  workMode: "Remote",
  remoteEligibilityType: "REGIONS",
  primaryState: "Kerala",
  remoteEligibilityRegions: [{ countryCode: "IN", region: "Kerala" }],
});
assert(
  stateRestrictedJsonLd.jobLocationType === "TELECOMMUTE" &&
    stateRestrictedJsonLd.applicantLocationRequirements["@type"] === "AdministrativeArea" &&
    stateRestrictedJsonLd.applicantLocationRequirements.name === "Kerala",
  "Test 7.4: Google Jobs JSON-LD for Remote State-Restricted emits AdministrativeArea for the specific state"
);

const multiOfficeJsonLd = buildTestJsonLd({
  title: "Cloud Consultant",
  company: "Zenoway",
  description: "On-site across hubs",
  workMode: "Onsite",
  physicalLocations: [
    { city: "Bengaluru", state: "Karnataka", countryCode: "IN" },
    { city: "Kochi", state: "Kerala", countryCode: "IN" },
  ],
});
assert(
  Array.isArray(multiOfficeJsonLd.jobLocation) &&
    multiOfficeJsonLd.jobLocation.length === 2 &&
    multiOfficeJsonLd.jobLocation[0].address.addressLocality === "Bengaluru" &&
    multiOfficeJsonLd.jobLocation[1].address.addressLocality === "Kochi",
  "Test 7.5: Google Jobs JSON-LD for Multi-Office emits array of Place objects"
);

const multiStateRemoteJsonLd = buildTestJsonLd({
  title: "Mobile Lead",
  company: "Zenoway",
  description: "Remote in South India",
  workMode: "Remote",
  remoteEligibilityType: "REGIONS",
  remoteEligibilityRegions: [
    { countryCode: "IN", region: "Kerala" },
    { countryCode: "IN", region: "Karnataka" },
  ],
});
assert(
  multiStateRemoteJsonLd.jobLocationType === "TELECOMMUTE" &&
    Array.isArray(multiStateRemoteJsonLd.applicantLocationRequirements) &&
    multiStateRemoteJsonLd.applicantLocationRequirements.length === 2 &&
    multiStateRemoteJsonLd.applicantLocationRequirements[0].name === "Kerala" &&
    multiStateRemoteJsonLd.applicantLocationRequirements[1].name === "Karnataka",
  "Test 7.6: Google Jobs JSON-LD for Multi-State Remote emits array of AdministrativeArea objects"
);

console.log("\n================================================================");
console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("================================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
