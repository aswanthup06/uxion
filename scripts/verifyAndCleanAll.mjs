// scripts/verifyAndCleanAll.mjs
import fs from "fs";
import { CUSTOM_JOB_DESCRIPTIONS } from "./enhanceAllJobsData.mjs";

function stripEmojis(str) {
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // strip zero-width characters
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{FE0F}\p{Extended_Pictographic}]/gu, "")
    .replace(/[👉📍🚀✨💼✅🔥🎉🛠️🤝👩‍💻🔑🧑‍💼🎨🧪📐📩📧📌🎓🚨🎯🔹❤️🕒🏢🌐📢⏳💰👇🔷📅📱💻🌱✓✔]/gu, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

export function cleanAndEnhanceJob(raw, title, company, id) {
  if (CUSTOM_JOB_DESCRIPTIONS[id]) {
    return CUSTOM_JOB_DESCRIPTIONS[id].trim();
  }

  if (!raw) return "";

  let cleaned = stripEmojis(raw);
  cleaned = cleaned.replace(/^[-_=*~]{3,}\s*$/gm, "");

  const rawLines = cleaned.split(/\r?\n/).map(l => l.trim());

  let section = "ABOUT";
  const aboutLines = [];
  const respLines = [];
  const reqLines = [];
  const perkLines = [];

  for (let line of rawLines) {
    if (!line) continue;

    // Filter out metadata lines
    if (/^(position|role|job title|company|designation|department|open positions?|position details?)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(location|workplace|work location|job location|work mode|place|office|work arrangement)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(schedule|timing|work timings|time|working hours|start date|duration|type|job type|working time|joining)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(salary|stipend|ctc|package|compensation)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(experience|work experience|years of experience|exp|experience required)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(to apply|apply now|how to apply|send your (resume|cv|portfolio)|share your (resume|cv|portfolio)|mail your (resume|cv)|email your (resume|cv)|submit your resume|subject line|subject|send your resume & portfolio|huge request to people applying|if interested|apply through the apply section|apply through|how to apply:?|application instructions:?)\b.*$/i.test(line)) {
      section = "SKIP";
      continue;
    }
    if (/^(p\.s\.|ps:)\s*skip the generic ai-written email.*$/i.test(line)) continue;
    if (/^ready to take the next step.*$/i.test(line)) continue;
    if (/^if this sounds like what you're looking for.*$/i.test(line)) continue;
    if (/^if you're excited to design impactful digital experiences.*we'd love to hear.*$/i.test(line)) continue;
    if (/^if you're passionate about design and innovation, apply now with us.*$/i.test(line)) continue;
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(line) && line.length < 80) continue;
    if (/^(noida|gurgaon|bangalore|bengaluru|mumbai|delhi|kochi|pune|indore|surat|chennai|hyderabad)\s*\|.*experience/i.test(line)) continue;
    if (/^eligibility:\s*candidates must be currently based in.*$/i.test(line)) continue;
    if (/^job description:?$/i.test(line)) continue;
    if (/^why join(\s+us)?\??$/i.test(line.replace(/[:#]/g, "").trim())) {
      section = "PERKS";
      continue;
    }

    // Section triggers
    const trimmedHeader = line.replace(/[:#]/g, "").trim().toLowerCase();

    if (/^(what you'll do|responsibilities|key responsibilities|job responsibilities|role & responsibilities|you'll work on|what you'll work on)$/i.test(trimmedHeader)) {
      section = "RESPONSIBILITIES";
      continue;
    }
    if (/^(what we're looking for|what you should have|requirements|skills required|required skills|skills & tools|tools & skills|eligibility|qualifications|you should have|skills & experience|what you bring|key requirements|required skills & qualifications|must-have skills|key skills|requirements & qualifications|what we look for \(requirements\)|what we look for)$/i.test(trimmedHeader)) {
      section = "REQUIREMENTS";
      continue;
    }
    if (/^(what we offer|why join us|perks & benefits|perks|benefits|what we are offering|why work with us|why join|why apply)$/i.test(trimmedHeader)) {
      section = "PERKS";
      continue;
    }
    if (/^(about the role|role overview|job overview|about the job|about us|company overview)$/i.test(trimmedHeader)) {
      section = "ABOUT";
      continue;
    }
    if (/^(how to apply|how to apply\?|to apply|application instructions)$/i.test(trimmedHeader)) {
      section = "SKIP";
      continue;
    }

    // Filter announcement headers in ABOUT section
    if (section === "ABOUT") {
      if (/^(we're hiring|hiring alert|immediate requirement|urgent requirement|job alert|we are hiring|join our team|join our creative team|join our growing team|career opportunity|hiring)\b.*$/i.test(line)) continue;
      if (/.*is hiring:?.*$/i.test(line)) continue;
      if (/^(internship opportunity|looking for a ui\/ux|looking for a visual|looking for a frontend|location|remote \(work from home).*/i.test(line)) continue;
      if (line.toLowerCase() === title.toLowerCase()) continue;
      if (line.toLowerCase().startsWith(title.toLowerCase() + " -")) continue;
      if (line.toLowerCase().startsWith(title.toLowerCase() + " (")) continue;
    }

    // Clean bullet prefixes
    let cleanItem = line.replace(/^([•\-\*›\>✓✔]|\d+[\.\)])\s*/, "").trim();
    if (!cleanItem) continue;

    // Filter individual metadata items in bullet lists
    if (/^(comfortable with a wfo|based in [a-z]+ \(onsite preferred\)|immediate joiner|open for immediate joining)/i.test(cleanItem)) continue;
    if (/^if you're excited about shaping intuitive.*we'd love to hear from you/i.test(cleanItem)) continue;
    if (/^if you're passionate about designing products.*right fit/i.test(cleanItem)) continue;
    if (/^employment type:\s*paid internship/i.test(cleanItem)) continue;
    if (/^experience required:\s*minimum \d+/i.test(cleanItem)) continue;

    if (section === "RESPONSIBILITIES") {
      respLines.push(cleanItem);
    } else if (section === "REQUIREMENTS") {
      reqLines.push(cleanItem);
    } else if (section === "PERKS") {
      perkLines.push(cleanItem);
    } else if (section === "ABOUT") {
      aboutLines.push(line);
    }
  }

  const parts = [];

  // Overview paragraph (no redundant "About the Role:" prefix since UI container has its own header)
  let aboutText = aboutLines.join("\n\n").trim();
  if (!aboutText || aboutText.length < 50) {
    aboutText = `${company} is looking for a talented ${title} to join our team. In this role, you will collaborate with cross-functional partners to build intuitive, high-impact digital experiences and products that delight users.`;
  }
  parts.push(aboutText);

  // Key Responsibilities
  if (respLines.length > 0) {
    const bullets = respLines.map(r => `• ${r}`).join("\n");
    parts.push(`Key Responsibilities:\n${bullets}`);
  }

  // Requirements
  if (reqLines.length > 0) {
    const bullets = reqLines.map(r => `• ${r}`).join("\n");
    parts.push(`Requirements:\n${bullets}`);
  }

  // Perks & Benefits
  if (perkLines.length > 0) {
    const bullets = perkLines.map(r => `• ${r}`).join("\n");
    parts.push(`Perks & Benefits:\n${bullets}`);
  }

  return parts.join("\n\n");
}

const jobs = JSON.parse(fs.readFileSync("scripts/all_jobs.json", "utf-8"));

console.log(`Auditing all ${jobs.length} jobs with new cleaner...\n`);

let totalWarnings = 0;
const results = [];

jobs.forEach(job => {
  const result = cleanAndEnhanceJob(job.description, job.title, job.company, job.id);
  results.push({ id: job.id, title: job.title, company: job.company, description: result });

  const warnings = [];
  if (result.length < 350) warnings.push(`Short length (${result.length} chars)`);
  if (!result.includes("Key Responsibilities:")) warnings.push("Missing Key Responsibilities");
  if (!result.includes("Requirements:")) warnings.push("Missing Requirements");
  if (/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\p{Extended_Pictographic}]/u.test(result)) {
    warnings.push("Contains emojis");
  }
  if (/\b(apply now|how to apply|send your resume|email your resume|mail your resume|salary:|stipend:|workplace:)\b/i.test(result)) {
    warnings.push("Contains metadata keywords");
  }

  if (warnings.length > 0) {
    totalWarnings++;
    console.log(`⚠️  [${job.id}] ${job.title} @ ${job.company}:`, warnings.join(" | "));
  }
});

console.log(`\nAudit completed: ${jobs.length - totalWarnings}/${jobs.length} jobs pass all strict checks.`);
if (totalWarnings > 0) {
  console.log(`Remaining jobs with warnings: ${totalWarnings}`);
}

fs.writeFileSync("scripts/all_jobs_cleaned_preview.json", JSON.stringify(results, null, 2));
