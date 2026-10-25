// scripts/testSupabase.mjs
// Test script for Supabase connection, querying, and permissions.

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Checking Supabase Configuration...");
console.log(`URL: ${supabaseUrl || "❌ Not configured"}`);
console.log(`Key available: ${supabaseKey ? "✅ Yes" : "❌ No"}`);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase environment variables are missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  try {
    console.log("📡 Fetching jobs from Supabase...");
    const { data, error, count } = await supabase
      .from("jobs")
      .select("id, title, company, location, salary, posted_date, status, is_test_data", {
        count: "exact",
      })
      .order("posted_date", { ascending: false })
      .limit(5);

    if (error) {
      console.error("❌ Supabase query failed:", error.message);
      process.exit(1);
    }

    console.log(`✅ Total jobs in database: ${count}`);
    console.log("📋 Recent jobs sample:");
    console.table(data);
    console.log("🎉 Supabase connection test successful!");
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

runTest();
