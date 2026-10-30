import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { JOB_CATEGORIES } from "@/data/categories";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });

      const text = (response.text ?? "").trim();
      return NextResponse.json({ success: true, description: text });
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

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });

      const text = (response.text ?? "").trim();
      return NextResponse.json({ success: true, description: text });
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

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    let rawText = (response.text ?? "").trim();
    // Strip markdown code fences if Gemini wraps in ```json ... ```
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
    }

    return NextResponse.json({
      success: true,
      data: rawText,
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
