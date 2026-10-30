// scripts/cleanAllJobDescriptions.mjs
// Clean, enhance and re-format job descriptions across Supabase jobs.
// Usage:
//   node scripts/cleanAllJobDescriptions.mjs --dry-run
//   node scripts/cleanAllJobDescriptions.mjs --write

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { cleanAndEnhanceJob } from "./verifyAndCleanAll.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const isWrite = process.argv.includes("--write");

async function main() {
  console.log(`\n🚀 Starting Job Description Enhancement & Cleanup...`);
  console.log(`Mode: ${isWrite ? "🔴 WRITE MODE (Updating Supabase)" : "🟡 DRY RUN MODE (Preview Only)"}`);

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, company, description")
    .order("id");

  if (error) {
    console.error("❌ Failed to fetch jobs:", error);
    process.exit(1);
  }

  console.log(`📋 Found ${jobs.length} jobs in database.\n`);

  let updatedCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const cleaned = cleanAndEnhanceJob(job.description, job.title, job.company, job.id);

    if (isWrite) {
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ description: cleaned })
        .eq("id", job.id);

      if (updateError) {
        console.log(`❌ [${job.id}] Update error:`, updateError.message);
      } else {
        process.stdout.write(`✅ [${i + 1}/${jobs.length}] Updated ${job.id} (${job.title} @ ${job.company})\n`);
        updatedCount++;
      }
    } else {
      if (i < 5 || ["JOB1010", "JOB1015", "JOB1045"].includes(job.id)) {
        console.log(`\n======================================================`);
        console.log(`📌 [${job.id}] ${job.title} @ ${job.company}`);
        console.log(`--- BEFORE ---`);
        console.log(job.description.slice(0, 180) + (job.description.length > 180 ? "..." : ""));
        console.log(`\n--- AFTER (CLEAN & ENHANCED) ---`);
        console.log(cleaned);
        console.log(`======================================================`);
      }
    }
  }

  if (!isWrite) {
    console.log(`\n✨ Dry run preview completed for ${jobs.length} jobs.`);
    console.log(`To execute and save these updates to Supabase, run:\n  node scripts/cleanAllJobDescriptions.mjs --write\n`);
  } else {
    console.log(`\n🎉 Successfully cleaned and enhanced ${updatedCount} job descriptions in Supabase!`);
  }
}

main();
