import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { JOB_CATEGORIES, matchJobCategory } from "@/data/categories";

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

  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const config: Record<string, unknown> = {};
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

function buildFallbackEnhanced(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/^[-*]\s+/gm, "• ");
  return cleaned;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, job, title, company, category, experience, currentDescription, skills } = body;

    // Action 1: Generate description from basic role details
    if (action === "generate-description") {
      if (!title?.trim()) {
        return NextResponse.json(
          { success: false, error: "Job title is required to generate a description." },
          { status: 400 }
        );
      }

      const prompt = `
You are an expert HR copywriter and tech recruiter specializing in creative and software engineering roles.
Write a clear, structured, and modern job description for the following role:

- Job Title: ${title.trim()}
- Company Name: ${company?.trim() || "Our Company"}
- Category: ${category?.trim() || "UI/UX & Product Design"}
- Experience Level: ${experience?.trim() || "Experienced"}
${skills?.length ? `- Desired Skills/Keywords: ${Array.isArray(skills) ? skills.join(", ") : skills}` : ""}

Guidelines:
- Return ONLY plain text with clean line breaks and bullet points (•).
- Structure into 4 clean sections:
  1. About the Role
  2. Key Responsibilities (4-6 actionable bullet points)
  3. Requirements & Qualifications (4-6 realistic bullet points)
  4. Nice to Have / Bonus Points (2-3 bullet points)
- Do NOT output markdown code blocks (no \`\`\` fences). Write natural, human-sounding text.
`;

      const aiText = await generateWithGemini(prompt);
      const description = aiText || buildFallbackDescription(title, company, category, experience, skills);

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

      const prompt = `
You are a professional editor for tech job postings.
Polish, organize, and format the following job description.

Input text:
${currentDescription}

Guidelines:
- Fix grammar, awkward phrasing, and spelling errors.
- Preserve all existing specific requirements, tools, company names, perks, and contact details without inventing new facts.
- Use clear section headings (e.g., "About the Role:", "Key Responsibilities:", "Requirements:") and standard bullet points (•).
- Return ONLY the polished text. Do not wrap in markdown code blocks (\`\`\`).
`;

      const aiText = await generateWithGemini(prompt);
      const description = aiText || buildFallbackEnhanced(currentDescription);

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
- description: well-structured job description with responsibilities and requirements
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
