// scripts/upgradeAllJobs.mjs
// Batch script to assign canonical categories and enhance job descriptions for all jobs in Supabase.
// Usage:
//   node scripts/upgradeAllJobs.mjs --dry-run   (Preview only)
//   node scripts/upgradeAllJobs.mjs --write     (Update database)

import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

const isWriteMode = process.argv.includes("--write");

function matchJobCategory(input) {
  const text = (input || "").toLowerCase().trim();

  if (/\b(ui\/?ux|ux\/?ui|user experience|user interface|product designer|product design|interaction design|interaction designer|design system|wirefram|figma|ux researcher|ux research)\b/i.test(text)) {
    return "UI/UX & Product Design";
  }
  if (/\b(graphic|visual design|visual designer|brand designer|branding|illustrator|illustration|creatives|photoshop|banner designer|canva|print design)\b/i.test(text)) {
    return "Graphic & Visual Design";
  }
  if (/\b(motion|motion graphics|3d|3d artist|animator|animation|vfx|after effects|cinema 4d|blender|video editor|video editing)\b/i.test(text)) {
    return "Motion & 3D Design";
  }
  if (/\b(frontend|front-end|front end|ui developer|ui engineer|react|reactjs|next\.js|nextjs|vue|angular|web developer|javascript developer|typescript developer|css|html|tailwind)\b/i.test(text)) {
    return "Frontend & UI Engineering";
  }
  if (/\b(full stack|fullstack|mern|mean|software engineer|software developer|sde|web application developer)\b/i.test(text)) {
    return "Full Stack Development";
  }
  if (/\b(backend|back-end|back end|node\.?js|express|django|flask|spring boot|java developer|golang|go developer|rust developer|c\+\+|php developer|laravel|ruby|database engineer)\b/i.test(text)) {
    return "Backend & Systems Engineering";
  }
  if (/\b(devops|cloud engineer|aws|azure|gcp|docker|kubernetes|k8s|sre|site reliability|infrastructure|sysadmin|linux admin)\b/i.test(text)) {
    return "DevOps, Cloud & Infrastructure";
  }
  if (/\b(qa|quality assurance|tester|test engineer|automation test|selenium|cypress|playwright|sdet|manual testing)\b/i.test(text)) {
    return "QA & Automation Testing";
  }
  if (/\b(data science|data scientist|data analyst|machine learning|deep learning|ai engineer|mlops|nlp|big data|business intelligence|power bi|tableau|sql developer)\b/i.test(text)) {
    return "Data Science & AI / ML";
  }
  if (/\b(product manager|product management|pm|scrum master|agile coach|product owner|technical product manager)\b/i.test(text)) {
    return "Product Management";
  }
  if (/\b(marketing|seo|growth hacker|content writer|copywriter|social media|sem|campaign manager|brand manager|email marketer|performance marketing)\b/i.test(text)) {
    return "Marketing, SEO & Growth";
  }
  if (/\b(human resources|hr manager|hr executive|hr generalist|talent acquisition|recruiter|recruitment|people operations|sourcer|technical sourcer)\b/i.test(text)) {
    return "HR, Recruitment & Talent";
  }
  if (/\b(sales|business development|bde|sdr|bdr|account executive|account manager|client acquisition|telecaller)\b/i.test(text)) {
    return "Sales & Business Development";
  }
  if (/\b(customer support|customer service|customer success|client success|technical support|helpdesk|service desk representative)\b/i.test(text)) {
    return "Customer Success & Support";
  }

  return "UI/UX & Product Design";
}

async function enhanceWithGemini(job) {
  if (!ai) return null;
  const prompt = `
You are an expert HR copywriter and tech recruiter.
Enhance and clean up the following job description for a job listing website.

Role: ${job.title}
Company: ${job.company}
Raw Description:
${job.description}

Guidelines:
- Organize with clear section titles: "About the Role:", "Key Responsibilities:", "Requirements & Qualifications:", "Perks & Benefits:" (if applicable).
- Use clean bullet points (•) and line breaks.
- Preserve all existing specific requirements, technologies, contact emails, and facts without inventing fake details.
- Return ONLY the clean formatted text. Do not wrap in markdown code blocks (\`\`\`).
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
    return (res.text ?? "").trim();
  } catch (err) {
    console.warn(`⚠️ Gemini enhancement failed for ${job.id}:`, err.message);
    return null;
  }
}

async function main() {
  console.log(`\n🚀 Starting Job Categorization & Description Upgrade...`);
  console.log(`Mode: ${isWriteMode ? "🔴 WRITE MODE (Updating Database)" : "🟡 DRY RUN MODE (Preview Only)"}`);
  console.log(`Gemini AI: ${ai ? "✅ Active" : "ℹ️ No GEMINI_API_KEY found (running fast rules-based categorization)"}`);

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, company, description")
    .order("posted_date", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch jobs:", error);
    process.exit(1);
  }

  console.log(`📋 Found ${jobs.length} jobs in database.\n`);

  let updatedCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const category = job.category || matchJobCategory(job.title);

    let enhancedDescription = null;
    if (ai) {
      process.stdout.write(`[${i + 1}/${jobs.length}] Enhancing "${job.title}" with Gemini... `);
      enhancedDescription = await enhanceWithGemini(job);
      // Brief pause to respect API rate limits
      await new Promise((r) => setTimeout(r, 800));
    }

    const payload = {};
    if (category) payload.category = category;
    if (enhancedDescription) payload.description = enhancedDescription;

    if (isWriteMode) {
      const { error: updateError } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", job.id);

      if (updateError) {
        console.log(`❌ Error: ${updateError.message}`);
      } else {
        console.log(`✅ Updated`);
        updatedCount++;
      }
    } else {
      if (i < 5) {
        console.log(`[Preview ${i + 1}] ID: ${job.id}`);
        console.log(`  Role: "${job.title}" @ ${job.company}`);
        console.log(`  Category: 🏷️  ${category}`);
        if (enhancedDescription) {
          console.log(`  Enhanced Description Preview:\n${enhancedDescription.slice(0, 150)}...\n`);
        }
      }
    }
  }

  if (!isWriteMode) {
    console.log(`\n✨ Dry run preview completed for ${jobs.length} jobs.`);
    console.log(`To execute and save these updates to Supabase, run:\n  node scripts/upgradeAllJobs.mjs --write\n`);
  } else {
    console.log(`\n🎉 Successfully upgraded ${updatedCount} jobs in Supabase!`);
  }
}

main();
