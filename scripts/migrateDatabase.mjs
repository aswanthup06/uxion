import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function resolveLocationData(job) {
  const loc = (job.location || "").trim();
  const rawLoc = loc;
  const wm = (job.work_mode || "").trim().toLowerCase();
  const isRemote = wm === "remote" || loc.toLowerCase() === "remote" || loc.toLowerCase().includes("remote");

  // Default Candidate Eligibility is Pan-India
  let remoteEligibilityType = "COUNTRIES";
  let remoteEligibilityCountries = ["IN"];
  let isMultiLocation = false;
  let workMode = wm === "remote" ? "Remote" : wm === "hybrid" ? "Hybrid" : "Onsite";

  // City, State, Country defaults
  let primaryCity = "Bengaluru";
  let primaryState = "Karnataka";
  let primaryStateCode = "KA";
  let primaryCountry = "India";
  let primaryCountryCode = "IN";
  let displayLocation = "";

  if (isRemote && (loc === "Remote" || loc === "remote" || loc === "Remote · India")) {
    workMode = "Remote";
    primaryCity = "Bengaluru"; // Company HQ / Office default as requested
    primaryState = "Karnataka";
    primaryStateCode = "KA";
    displayLocation = "Remote · Pan-India";
  } else if (loc.includes("Ludhiana")) {
    workMode = "Hybrid";
    primaryCity = "Ludhiana";
    primaryState = "Punjab";
    primaryStateCode = "PB";
    displayLocation = "Hybrid · Ludhiana, Punjab";
  } else if (loc.includes("Madurai") && loc.includes("Bangalore")) {
    primaryCity = "Madurai";
    primaryState = "Tamil Nadu";
    primaryStateCode = "TN";
    isMultiLocation = true;
    displayLocation = "Madurai, Bengaluru";
  } else if (loc.includes("Trivandrum") || (loc.includes("Cochin") && loc.includes("Trivandrum"))) {
    primaryCity = "Thiruvananthapuram";
    primaryState = "Kerala";
    primaryStateCode = "KL";
    isMultiLocation = true;
    displayLocation = "Thiruvananthapuram, Kochi";
  } else if (loc.toLowerCase().includes("kochi")) {
    primaryCity = "Kochi";
    primaryState = "Kerala";
    primaryStateCode = "KL";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Kochi" : "Kochi, Kerala";
  } else if (loc === "Kerala") {
    primaryCity = "Kochi";
    primaryState = "Kerala";
    primaryStateCode = "KL";
    displayLocation = "Kochi, Kerala";
  } else if (loc.toLowerCase().includes("chennai")) {
    primaryCity = "Chennai";
    primaryState = "Tamil Nadu";
    primaryStateCode = "TN";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Chennai" : "Chennai, Tamil Nadu";
  } else if (loc.toLowerCase().includes("mumbai")) {
    primaryCity = "Mumbai";
    primaryState = "Maharashtra";
    primaryStateCode = "MH";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Mumbai" : "Mumbai, Maharashtra";
  } else if (loc.toLowerCase().includes("pune")) {
    primaryCity = "Pune";
    primaryState = "Maharashtra";
    primaryStateCode = "MH";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Pune" : "Pune, Maharashtra";
  } else if (loc.toLowerCase().includes("hyderabad")) {
    primaryCity = "Hyderabad";
    primaryState = "Telangana";
    primaryStateCode = "TS";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Hyderabad" : "Hyderabad, Telangana";
  } else if (loc.toLowerCase().includes("bangalore") || loc.toLowerCase().includes("bengaluru")) {
    primaryCity = "Bengaluru";
    primaryState = "Karnataka";
    primaryStateCode = "KA";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Bengaluru" : "Bengaluru, Karnataka";
  } else if (loc.toLowerCase().includes("mysore") || loc.toLowerCase().includes("mysuru")) {
    primaryCity = "Mysuru";
    primaryState = "Karnataka";
    primaryStateCode = "KA";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Mysuru" : "Mysuru, Karnataka";
  } else if (loc.toLowerCase().includes("noida")) {
    primaryCity = "Noida";
    primaryState = "Uttar Pradesh";
    primaryStateCode = "UP";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Noida" : "Noida, Uttar Pradesh";
  } else if (loc.toLowerCase().includes("gurgaon") || loc.toLowerCase().includes("gurugram")) {
    primaryCity = "Gurugram";
    primaryState = "Haryana";
    primaryStateCode = "HR";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Gurugram" : "Gurugram, Haryana";
  } else if (loc.toLowerCase().includes("delhi") || loc.toLowerCase().includes("okhla")) {
    primaryCity = "New Delhi";
    primaryState = "Delhi";
    primaryStateCode = "DL";
    displayLocation = workMode === "Hybrid" ? "Hybrid · New Delhi" : "New Delhi, Delhi";
  } else if (loc.toLowerCase().includes("ahmedabad")) {
    primaryCity = "Ahmedabad";
    primaryState = "Gujarat";
    primaryStateCode = "GJ";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Ahmedabad" : "Ahmedabad, Gujarat";
  } else if (loc.toLowerCase().includes("surat")) {
    primaryCity = "Surat";
    primaryState = "Gujarat";
    primaryStateCode = "GJ";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Surat" : "Surat, Gujarat";
  } else if (loc.toLowerCase().includes("indore")) {
    primaryCity = "Indore";
    primaryState = "Madhya Pradesh";
    primaryStateCode = "MP";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Indore" : "Indore, Madhya Pradesh";
  } else if (loc.toLowerCase().includes("mohali")) {
    primaryCity = "Mohali";
    primaryState = "Punjab";
    primaryStateCode = "PB";
    displayLocation = workMode === "Hybrid" ? "Hybrid · Mohali" : "Mohali, Punjab";
  } else {
    // Fallback to Bengaluru Pan-India
    primaryCity = "Bengaluru";
    primaryState = "Karnataka";
    primaryStateCode = "KA";
    displayLocation = isRemote ? "Remote · Pan-India" : "Bengaluru, Karnataka";
  }

  return {
    raw_location: job.raw_location || rawLoc,
    location: displayLocation,
    work_mode: workMode,
    primary_city: primaryCity,
    primary_state: primaryState,
    primary_state_code: primaryStateCode,
    primary_country: primaryCountry,
    primary_country_code: primaryCountryCode,
    is_multi_location: isMultiLocation,
    remote_eligibility_type: remoteEligibilityType,
    remote_eligibility_countries: remoteEligibilityCountries,
  };
}

async function runMigration() {
  console.log("Fetching all jobs from Supabase...");
  const { data: jobs, error } = await supabase.from("jobs").select("*");
  if (error) {
    console.error("Failed to fetch jobs:", error);
    return;
  }

  console.log(`Found ${jobs.length} total jobs.`);
  let updatedCount = 0;

  for (const job of jobs) {
    const patch = resolveLocationData(job);
    const { error: updateError } = await supabase
      .from("jobs")
      .update(patch)
      .eq("id", job.id);

    if (updateError) {
      console.error(`Failed to update job ${job.id}:`, updateError);
    } else {
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully migrated ${updatedCount} / ${jobs.length} jobs in Supabase!`);
  
  // Verify results
  const { data: verified } = await supabase
    .from("jobs")
    .select("id, title, company, work_mode, location, primary_city, primary_state, remote_eligibility_type")
    .limit(10);

  console.log("\nSample of migrated jobs:");
  console.table(verified);
}

runMigration();
