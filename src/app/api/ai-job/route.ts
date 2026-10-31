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

async function generateWithGemini(prompt: string): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
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

  // Extract title from first line or common patterns
  const lines = jobText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || "";
  if (title.length > 80) title = title.substring(0, 80);

  // Extract experience
  let exp = "";
  const expMatch = jobText.match(/(\d+)\s*(?:[-–to]\s*(\d+))?\s*(?:years?|yrs?)/i);
  if (expMatch) {
    exp = expMatch[2] ? `${expMatch[1]}-${expMatch[2]} years` : `${expMatch[1]} years`;
  }

  // Detect category
  const detectedCategory = matchJobCategory(jobText) || "UI/UX & Product Design";

  return {
    title,
    company: "",
    category: detectedCategory,
    location: "",
    employmentType: "FULL_TIME",
    experience: exp,
    salary: "",
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
Extract the following job posting into structured JSON.

For the "category" field, analyze the title, responsibilities, and skills, then select strictly ONE category from this list:
${categoryList}

Return ONLY valid JSON matching this exact structure:
{
  "title": "",
  "company": "",
  "category": "",
  "location": "",
  "employmentType": "",
  "experience": "",
  "salary": "",
  "description": "",
  "skills": [],
  "requirements": [],
  "responsibilities": [],
  "email": ""
}

Job text:
${job}
`;

    const aiText = await generateWithGemini(prompt);
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
