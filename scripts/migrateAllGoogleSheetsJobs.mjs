// scripts/migrateAllGoogleSheetsJobs.mjs
// Imports all 58 real production job records from Google Sheets into Supabase PostgreSQL.
// Reads credentials from process.env (.env.local / .env).

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { google } from "googleapis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Fallback email map for jobs where employer originally only provided a Google Form or external ATS
const fallbackEmails = {
  JOB1001: "careers@ofbusiness.com",
  JOB1004: "careers@yellowchalk.com",
  JOB1012: "hr@talentrisetechnokrate.com",
  JOB1016: "careers@onwork.ai",
  JOB1017: "careers@onwork.ai",
  JOB1024: "careers@asymmetri.com",
  JOB1042: "hr@omega.ac",
  JOB1043: "careers@sigasystems.com",
};

async function getGoogleSheetsRows() {
  const serviceAccountPath = "C:\\Users\\PAVLION\\Downloads\\zenoway-502614-01cf5f3a2f04.json";
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || "16UcdmMaIrbVXLKeJQVo1qhA9EjVNA3Yjv7DiUe-wfVE";

  if (fs.existsSync(serviceAccountPath)) {
    try {
      console.log("📄 Reading rows directly from Google Sheets API using service account...");
      const creds = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
      const sheets = google.sheets({ version: "v4", auth });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A2:K",
      });
      const rows = res.data.values || [];
      console.log(`✅ Read ${rows.length} rows directly from Google Sheet.`);
      return rows.map((r) => ({
        id: (r[0] || "").trim(),
        title: (r[1] || "").trim(),
        company: (r[2] || "").trim(),
        location: (r[3] || "").trim(),
        experience: (r[4] || "").trim(),
        postedDate: (r[5] || "").trim(),
        salary: (r[6] || "").trim(),
        mail: (r[7] || "").trim(),
        companyLink: (r[8] || "").trim(),
        apply: (r[9] || "").trim(),
        description: (r[10] || "").trim(),
      }));
    } catch (e) {
      console.warn("⚠️ Google Sheets API read failed, falling back to live API:", e.message);
    }
  }

  console.log("🌐 Fetching all jobs from live API endpoint (https://www.zenoway.online/api/jobs)...");
  const response = await fetch("https://www.zenoway.online/api/jobs");
  if (!response.ok) throw new Error(`Live API returned ${response.status}`);
  return await response.json();
}

function parseIsoDate(val) {
  if (!val) return new Date().toISOString();
  const trimmed = val.trim();
  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const d = new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

function deriveWorkMode(location) {
  const loc = (location || "").toLowerCase();
  if (loc.includes("remote")) return "Remote";
  if (loc.includes("hybrid")) return "Hybrid";
  return "Onsite";
}

function deriveEmploymentType(title, exp) {
  const text = `${title} ${exp}`.toLowerCase();
  if (text.includes("intern")) return "INTERN";
  if (text.includes("contract")) return "CONTRACTOR";
  if (text.includes("part-time") || text.includes("part time")) return "PART_TIME";
  return "FULL_TIME";
}

async function run() {
  console.log("🚀 Starting complete migration of all Google Sheets jobs into Supabase...");

  const rawJobs = await getGoogleSheetsRows();
  console.log(`📊 Found ${rawJobs.length} records in Google Sheets source.`);

  const dbRows = rawJobs.map((j) => {
    const mail = (j.mail || "").trim() || fallbackEmails[j.id] || "";
    return {
      id: j.id,
      title: j.title || "Job Title",
      company: j.company || "Company",
      location: j.location || "Remote",
      experience: j.experience || "Fresher",
      posted_date: parseIsoDate(j.postedDate),
      salary: j.salary || "Not Disclosed",
      mail: mail,
      company_link: j.companyLink || "",
      apply: "", // Email-only applications
      description: j.description || "",
      views: typeof j.views === "number" ? j.views : 0,
      employment_type: deriveEmploymentType(j.title, j.experience),
      work_mode: deriveWorkMode(j.location),
      applicant_country: "IN",
      is_test_data: false,
      status: "published",
    };
  });

  console.log(`📦 Upserting ${dbRows.length} jobs into Supabase 'jobs' table...`);

  // Upsert in batches of 20 to avoid request size limitations
  const batchSize = 20;
  for (let i = 0; i < dbRows.length; i += batchSize) {
    const batch = dbRows.slice(i, i + batchSize);
    const { error } = await supabase.from("jobs").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error upserting batch starting at index ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`   - Upserted batch ${i / batchSize + 1} (${batch.length} jobs)`);
  }

  // Verify total count in Supabase
  const { count, error: countErr } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.error("❌ Error verifying count:", countErr.message);
  } else {
    console.log(`\n🎉 Verification: Supabase 'jobs' table now contains ${count} rows!`);
  }
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
