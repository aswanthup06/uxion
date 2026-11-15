import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { JOB_CATEGORIES, matchJobCategory } from "@/data/categories";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const MAX_PAYLOAD_BYTES = 70_000;
const RATE_LIMIT_CONFIG = {
  windowMs: 60_000,
  maxRequests: 12,
};

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

async function generateWithGemini(prompt: string, responseJson = false): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
  for (const model of models) {
    try {
      const config: Record<string, unknown> = {
        httpOptions: { timeout: 12000 },
      };
      if (responseJson) {
        config.responseMimeType = "application/json";
      }
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      const text = (response.text ?? "").trim();
      if (text) return text;
    } catch (err) {
      console.warn(`Gemini generation with ${model} failed, trying next:`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}

function buildFallbackDescription(
  title: string,
  company?: string,
  category?: string,
  experience?: string,
  skills?: string[] | string
): string {
  const companyName = company?.trim() || "our company";
  const cat = category?.trim() || "technology";
  const exp = experience?.trim() ? `${experience.trim()}` : "relevant";
  const skillsList = Array.isArray(skills) ? skills.join(", ") : skills;

  return `About the Role:
We are looking for a skilled and motivated ${title.trim()} to join ${companyName}. In this role, you will collaborate with cross-functional teams to design, build, and maintain high-quality solutions, contributing directly to our core products and business goals.

Key Responsibilities:
• Design, implement, and maintain scalable solutions aligned with industry best practices.
• Collaborate closely with team members across engineering, product, and design.
• Write clean, maintainable, and well-tested code or production assets.
• Identify and resolve performance bottlenecks, bugs, and workflow inefficiencies.
• Participate in design discussions, code reviews, and ongoing team improvements.

Requirements & Qualifications:
• ${exp} experience in ${cat} or related fields.
${skillsList ? `• Hands-on proficiency with: ${skillsList}.\n` : ""}• Strong analytical, problem-solving, and critical thinking skills.
• Solid communication and interpersonal skills to collaborate across teams.
• High attention to detail and a commitment to quality and user experience.

Nice to Have:
• Experience working in modern agile team environments.
• Familiarity with modern collaboration tools, version control, and cloud workflows.`;
}

function stripEmojis(str: string): string {
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{FE0F}\p{Extended_Pictographic}]/gu, "")
    .replace(/[👉📍🚀✨💼✅🔥🎉🛠️🤝👩‍💻🔑🧑‍💼🎨🧪📐📩📧📌🎓🚨🎯🔹❤️🕒🏢🌐📢⏳💰👇🔷📅📱💻🌱✓✔]/gu, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function buildFallbackEnhanced(
  text: string,
  context?: { title?: string; company?: string; category?: string; experience?: string }
): string {
  let cleaned = stripEmojis(text.trim());
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/^[-_=*~]{3,}\s*$/gm, "");

  const rawLines = cleaned.split(/\n/).map((l) => l.trim());

  let section: "ABOUT" | "RESPONSIBILITIES" | "REQUIREMENTS" | "NICE_TO_HAVE" | "PERKS" | "SKIP" = "ABOUT";
  const aboutLines: string[] = [];
  const respLines: string[] = [];
  const reqLines: string[] = [];
  const niceLines: string[] = [];
  const perkLines: string[] = [];

  for (const line of rawLines) {
    if (!line) continue;

    // Filter out metadata and contact lines that belong in structured fields
    if (/^(position|role|job title|company|designation|department|open positions?|working hours|timing)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(location|workplace|work location|job location|work mode|place|office)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(salary|stipend|ctc|package|compensation|experience|exp)\s*[:–—\-].*$/i.test(line)) continue;
    if (/^(to apply|apply now|how to apply|send your (resume|cv|portfolio)|mail your|email your|submit your resume|subject line|ps:|p\.s\.)/i.test(line)) {
      section = "SKIP";
      continue;
    }
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(line) && line.length < 80) continue;

    const trimmedHeader = line.replace(/[:#*]/g, "").trim().toLowerCase();

    if (/^(what you('ll| will) do|responsibilities|key responsibilities|job responsibilities|role & responsibilities|you'll work on)$/i.test(trimmedHeader)) {
      section = "RESPONSIBILITIES";
      continue;
    }
    if (/^(what we('re| are) looking for|what you should have|requirements|skills required|required skills|skills & tools|eligibility|qualifications|must-have skills|key requirements|requirements & qualifications)$/i.test(trimmedHeader)) {
      section = "REQUIREMENTS";
      continue;
    }
    if (/^(nice to have|good to have|bonus points|preferred qualifications)$/i.test(trimmedHeader)) {
      section = "NICE_TO_HAVE";
      continue;
    }
    if (/^(what we offer|why join us|perks & benefits|perks|benefits|what we are offering|why work with us)$/i.test(trimmedHeader)) {
      section = "PERKS";
      continue;
    }
    if (/^(about the role|role overview|job overview|about the job|about us|company overview)$/i.test(trimmedHeader)) {
      section = "ABOUT";
      continue;
    }

    if (section === "SKIP") continue;

    // Clean bullet prefixes
    const cleanItem = line.replace(/^([•\-\*›\>✓✔]|\d+[\.\)])\s*/, "").trim();
    if (!cleanItem) continue;

    if (section === "RESPONSIBILITIES") {
      respLines.push(cleanItem);
    } else if (section === "REQUIREMENTS") {
      reqLines.push(cleanItem);
    } else if (section === "NICE_TO_HAVE") {
      niceLines.push(cleanItem);
    } else if (section === "PERKS") {
      perkLines.push(cleanItem);
    } else {
      if (/^([•\-\*›\>✓✔]|\d+[\.\)])/.test(line)) {
        respLines.push(cleanItem);
      } else {
        aboutLines.push(cleanItem);
      }
    }
  }

  const sections: string[] = [];
  const roleTitle = context?.title?.trim() || "this position";
  const companyName = context?.company?.trim() || "our team";

  if (aboutLines.length > 0) {
    sections.push(`About the Role:\n${aboutLines.join("\n\n")}`);
  } else {
    sections.push(`About the Role:\nWe are looking for a dedicated and skilled ${roleTitle} to join ${companyName}. In this role, you will collaborate with cross-functional teams to deliver impactful, user-centered solutions.`);
  }

  if (respLines.length > 0) {
    sections.push(`Key Responsibilities:\n${respLines.map((l) => `• ${l}`).join("\n")}`);
  }

  if (reqLines.length > 0) {
    sections.push(`Requirements & Qualifications:\n${reqLines.map((l) => `• ${l}`).join("\n")}`);
  }

  if (niceLines.length > 0) {
    sections.push(`Nice to Have:\n${niceLines.map((l) => `• ${l}`).join("\n")}`);
  }

  if (perkLines.length > 0) {
    sections.push(`Perks & Benefits:\n${perkLines.map((l) => `• ${l}`).join("\n")}`);
  }

  return sections.join("\n\n");
}

function buildFallbackParsed(jobText: string) {
  // Extract email
  const emailMatch = jobText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Extract experience
  let expMin = "";
  let expMax = "";
  const expRangeMatch = jobText.match(/(\d+)\s*(?:[-–to]|\+)?\s*(\d+)?\s*(?:years?|yrs?)/i);
  if (expRangeMatch) {
    expMin = expRangeMatch[1] || "";
    expMax = expRangeMatch[2] || "";
  }
  if (/\bfresher\b/i.test(jobText)) {
    expMin = "0";
    expMax = "1";
  }

  // Extract company
  let company = "";
  const companyMatch =
    jobText.match(/(?:at|company[:\s]+|hiring for|join|welcome to)\s+([A-Z][A-Za-z0-9&.,\s]{2,30}?)(?:[\n,.]|\s+is|\s+in)/i) ||
    jobText.match(/Company:\s*([^\n]+)/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  // Extract Indian cities
  const popularCities = [
    "Bengaluru", "Bangalore", "Kochi", "Cochin", "Mumbai", "Delhi", "New Delhi",
    "Gurugram", "Gurgaon", "Noida", "Hyderabad", "Pune", "Chennai", "Kolkata",
    "Ahmedabad", "Thiruvananthapuram", "Trivandrum", "Calicut", "Kozhikode", "Coimbatore"
  ];
  let foundCity = "";
  for (const city of popularCities) {
    const reg = new RegExp(`\\b${city}\\b`, "i");
    if (reg.test(jobText)) {
      foundCity = city === "Bangalore" ? "Bengaluru" : city === "Cochin" ? "Kochi" : city === "Gurgaon" ? "Gurugram" : city;
      break;
    }
  }

  // Extract salary
  let salary = "";
  const salaryMatch =
    jobText.match(/(?:₹|INR|Rs\.?|\$)\s*[0-9]+(?:\.[0-9]+)?\s*(?:[-–to]\s*[0-9]+(?:\.[0-9]+)?)?\s*(?:LPA|L|lakhs?|k|p\.a\.|per annum)?/i) ||
    jobText.match(/\b\d+(?:\.\d+)?\s*(?:[-–to]\s*\d+(?:\.\d+)?)?\s*LPA\b/i);
  if (salaryMatch) {
    salary = salaryMatch[0].trim();
  }

  // Work mode
  let workMode: "Onsite" | "Hybrid" | "Remote" = "Onsite";
  if (/\bremote\b/i.test(jobText)) workMode = "Remote";
  else if (/\bhybrid\b/i.test(jobText)) workMode = "Hybrid";

  // Clean title extraction
  const lines = jobText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || "";
  for (const line of lines.slice(0, 5)) {
    if (
      !/^(about us|about the company|job description|we are hiring|hiring|role overview|careers|overview):?$/i.test(line) &&
      line.length >= 3 &&
      line.length <= 60
    ) {
      title = line.replace(/^(job title|role|position):\s*/i, "").trim();
      break;
    }
  }
  if (title.length > 70) title = title.substring(0, 70);

  // Detect category
  const detectedCategory = matchJobCategory(jobText) || "UI/UX & Product Design";

  return {
    title,
    company,
    category: detectedCategory,
    city: foundCity,
    location: foundCity,
    workMode,
    employmentType: "FULL_TIME",
    experience: expMin ? (expMax ? `${expMin}-${expMax} years` : `${expMin} years`) : "",
    experienceMin: expMin,
    experienceMax: expMax,
    salary,
    description: jobText.trim(),
    skills: [],
    requirements: [],
    responsibilities: [],
    email,
  };
}

export function stripLeadingMetadata(text: string): string {
  if (!text) return "";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();

  // Strip leading metadata lines like "Role Title: ...", "Company: ...", "Work Mode: ...", etc.
  const lines = cleaned.split("\n");
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (startIndex === i) startIndex = i + 1;
      continue;
    }
    if (
      /^(role(\s+title)?|job\s+title|company(\s+name)?|category|experience(\s+level)?|work\s+mode|location|workplace|employment\s+type)\s*[:–—\-]/i.test(
        line
      )
    ) {
      startIndex = i + 1;
      continue;
    }
    break;
  }
  return lines.slice(startIndex).join("\n").trim();
}

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const limit = checkRateLimit("ai-job", clientIp, RATE_LIMIT_CONFIG);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many AI requests. Please wait ${limit.retryAfterSec} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        }
      );
    }

    const rawText = await req.text();
    if (rawText.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds allowed size limit." },
        { status: 413 }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const action = typeof body.action === "string" ? body.action : "";
    const job = typeof body.job === "string" ? body.job.trim().slice(0, 25000) : "";
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";
    const category = typeof body.category === "string" ? body.category.trim().slice(0, 80) : "";
    const experience = typeof body.experience === "string" ? body.experience.trim().slice(0, 60) : "";
    const workMode = typeof body.workMode === "string" ? body.workMode.trim().slice(0, 30) : "";
    const currentDescription =
      typeof body.currentDescription === "string" ? body.currentDescription.trim().slice(0, 25000) : "";
    const instruction =
      typeof body.instruction === "string" ? body.instruction.trim().slice(0, 1000) : "";
    const skills = Array.isArray(body.skills)
      ? body.skills.filter((s): s is string => typeof s === "string").slice(0, 30)
      : typeof body.skills === "string"
      ? body.skills.trim().slice(0, 500)
      : undefined;

    // Action 1: Generate description from basic role details
    if (action === "generate-description") {
      if (!title?.trim()) {
        return NextResponse.json(
          { success: false, error: "Job title is required to generate a description." },
          { status: 400 }
        );
      }

      const customInstruction = instruction?.trim() || "";

      const prompt = `
You are an expert HR copywriter and tech recruiter specializing in creative and software engineering roles.
Write a clear, structured, and modern job description for the following role:

Context:
- Job Title: ${title.trim()}
- Company Name: ${company?.trim() || "Our Company"}
- Category: ${category?.trim() || "UI/UX & Product Design"}
- Experience Level: ${experience?.trim() || "Experienced"}
${skills?.length ? `- Desired Skills/Keywords: ${Array.isArray(skills) ? skills.join(", ") : skills}` : ""}
${customInstruction ? `- User Custom Instructions: ${customInstruction}` : ""}

CRITICAL RULES:
- Do NOT output or repeat the metadata header block (e.g. "Role Title:", "Company:", "Category:", "Experience Level:", "Work Mode:").
- Output ONLY the description body, starting directly with "About the Role:".
- Structure into 4 clean sections:
  About the Role: (2-3 compelling sentences)
  Key Responsibilities: (5-8 actionable bullet points starting with "• ")
  Requirements & Qualifications: (5-8 realistic bullet points starting with "• ")
  Nice to Have: (2-4 bonus points starting with "• ")
- Plain text only with bullet points (•). Do NOT wrap in markdown code blocks (\`\`\`).
`;

      const aiText = await generateWithGemini(prompt);
      const rawDesc = aiText || buildFallbackDescription(title, company, category, experience, skills);
      const description = stripLeadingMetadata(rawDesc);

      return NextResponse.json({
        success: true,
        description,
        isAiPowered: Boolean(aiText),
      });
    }

    // Action 2: Enhance & polish an existing description
    if (action === "enhance-description") {
      if (!currentDescription?.trim()) {
        return NextResponse.json(
          { success: false, error: "Please enter or paste a description first to enhance it." },
          { status: 400 }
        );
      }

      const roleTitle = title?.trim() || "";
      const companyName = company?.trim() || "";
      const cat = category?.trim() || "";
      const exp = experience?.trim() || "";
      const mode = workMode?.trim() || "";
      const skillsList = Array.isArray(skills) ? skills.join(", ") : skills?.trim();
      const customInstruction = instruction?.trim() || "";

      const prompt = `
You are a senior tech recruiter and copy editor specializing in high-converting job posts for design, product, engineering, and creative talent.
Elevate, organize, expand, and polish the following job description into a clean, modern, professional job listing.

Context:
${roleTitle ? `- Role Title: ${roleTitle}` : ""}
${companyName ? `- Company: ${companyName}` : ""}
${cat ? `- Category: ${cat}` : ""}
${exp ? `- Experience Level: ${exp}` : ""}
${mode ? `- Work Mode: ${mode}` : ""}
${skillsList ? `- Key Skills / Tools: ${skillsList}` : ""}
${customInstruction ? `- User Custom Instructions: ${customInstruction}` : ""}

Original Description / Draft Notes:
${currentDescription}

CRITICAL RULES:
1. Do NOT repeat or output any header metadata lines (e.g. "Role Title:", "Company:", "Category:", "Experience Level:", "Work Mode:", "Location:"). The Zenoway platform displays these in dedicated UI badges.
2. Start directly with "About the Role:" or a compelling introductory paragraph.
3. If the input is brief or only a few bullet points, expand it thoughtfully into complete, high-quality sections:
   - "About the Role:" (2-3 engaging sentences introducing the mission, impact, and context).
   - "Key Responsibilities:" (5-8 clear, action-oriented bullet points starting with "• ").
   - "Requirements & Qualifications:" (5-8 realistic requirements starting with "• ").
   - "Nice to Have:" (2-4 bonus points or preferred tools starting with "• ").
4. Quality & Cleanliness:
   - Preserve all authentic technical requirements, specific tools, and domain constraints.
   - Remove recruiter clutter, emojis (🚀, 📌, 👉), markdown hashes (#), and asterisks (**).
   - Use standard bullet points ("• ") for all list items.
   - Do NOT wrap in markdown code blocks (\`\`\`). Output plain ready-to-publish text directly.
`;

      const aiText = await generateWithGemini(prompt);
      const rawDesc = aiText || buildFallbackEnhanced(currentDescription, {
        title: roleTitle,
        company: companyName,
        category: cat,
        experience: exp,
      });
      const description = stripLeadingMetadata(rawDesc);

      return NextResponse.json({
        success: true,
        description,
        isAiPowered: Boolean(aiText),
      });
    }

    // Default Action: Parse raw job text into structured fields + auto-classify category
    if (!job?.trim()) {
      return NextResponse.json(
        { success: false, error: "Job text is required for parsing." },
        { status: 400 }
      );
    }

    const categoryList = JOB_CATEGORIES.map((c) => `- "${c}"`).join("\n");

    const prompt = `
You are an expert AI recruiting assistant. Extract the provided raw job draft into clean, structured JSON.

For the "category" field, select strictly ONE category from this list:
${categoryList}

Extract:
- title: concise job title (e.g. "Senior React Developer")
- company: company name
- category: one category from above list
- city: primary office city (e.g. "Bengaluru", "Mumbai", "Kochi", "Hyderabad", "Pune", "Delhi", "Remote", etc.)
- state: state if known
- country: "India" or country name
- location: formatted location string
- workMode: "Onsite" or "Hybrid" or "Remote"
- employmentType: "FULL_TIME" or "PART_TIME" or "CONTRACTOR" or "INTERN"
- experienceMin: numeric string of min years required (e.g. "0" for fresher, "3")
- experienceMax: numeric string of max years (e.g. "5")
- salary: formatted salary range (e.g. "₹12–18 LPA" or "Not Disclosed")
- description: well-structured plain-text job description using clean section headings separated by blank lines ("About the Role:", "Key Responsibilities:", "Requirements:", and "Nice to Have:" or "Perks & Benefits:" whenever present in the source text) and "• " bullet points for every list item. Preserve ALL responsibilities, tools, requirements (including years of experience if stated), and "Good to Have" / "Nice to Have" points from the source without omitting sections, while removing emojis and redundant application email/header lines that belong in the structured fields above.
- skills: array of key technical/design skills extracted from the text
- email: application email address

Return ONLY valid JSON matching this exact structure:
{
  "title": "",
  "company": "",
  "category": "",
  "city": "",
  "state": "",
  "country": "India",
  "location": "",
  "workMode": "Onsite",
  "employmentType": "FULL_TIME",
  "experienceMin": "",
  "experienceMax": "",
  "salary": "",
  "description": "",
  "skills": [],
  "email": ""
}

Job text:
${job}
`;

    const aiText = await generateWithGemini(prompt, true);
    let parsedData = "";

    if (aiText) {
      let cleaned = aiText.trim();
      // Strip markdown code fences if Gemini wraps in ```json ... ```
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
      }
      parsedData = cleaned;
    } else {
      parsedData = JSON.stringify(buildFallbackParsed(job));
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      isAiPowered: Boolean(aiText),
    });
  } catch (err) {
    console.error("AI Job Route Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "AI operation failed",
      },
      { status: 500 }
    );
  }
}
