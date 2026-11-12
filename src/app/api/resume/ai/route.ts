import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sanitizeResumeData, hasExperienceContent, hasProjectContent } from "@/lib/resume/validation";
import type { ResumeData } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AiAction =
  | "improve-summary"
  | "rewrite-bullets"
  | "suggest-skills"
  | "tailor-to-jd";

const MAX_BODY_BYTES = 80_000;
const MAX_JD_LENGTH = 8_000;
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const timestamps = (rateLimitStore.get(key) || []).filter((ts) => ts > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000));
    rateLimitStore.set(key, timestamps);
    return { allowed: false, retryAfterSec };
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);

  // Prevent unbounded growth in long-running processes
  if (rateLimitStore.size > 1000) {
    for (const [k, vals] of rateLimitStore.entries()) {
      if (vals.every((v) => v <= windowStart)) {
        rateLimitStore.delete(k);
      }
    }
  }

  return { allowed: true, retryAfterSec: 0 };
}

function getClientIdentifier(request: NextRequest, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  return `ip:${ip}`;
}

const SYSTEM_INSTRUCTION = `You are a careful, truthful career writing editor helping a candidate refine their ATS-friendly resume.
STRICT RULES:
1. NEVER fabricate, invent, or infer employers, job titles, employment dates, degrees, institutions, certifications, tools, skills, or numerical metrics/percentages/counts that were not explicitly provided in the candidate's input.
2. Only polish, clarify, and reorganize the candidate's existing factual information into clear, concise, achievement-focused English.
3. If an achievement lacks a measurable metric, write a strong factual statement without inventing numbers (never insert fake percentages or dollar/rupee figures).
4. Do not use emojis, markdown code fences, or decorative symbols.
5. Output valid JSON matching the requested schema.`;

async function callGeminiJson<T>(prompt: string, schema: Schema): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = ["gemini-3.5-flash-lite", "gemini-3-flash-preview"];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          temperature: 0.2,
          httpOptions: { timeout: 25000 },
        },
      });

      const raw = (response.text ?? "").trim();
      if (!raw) {
        throw new Error("Empty model response");
      }

      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/, "")
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (err) {
      lastError = err;
      console.warn(
        `Gemini resume AI (${model}) failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI request failed");
}

function summarizeCandidateFacts(data: ResumeData): string {
  const experiences = data.experience
    .filter(hasExperienceContent)
    .map((e) => ({
      id: e.id,
      jobTitle: e.jobTitle,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.isCurrent ? "Present" : e.endDate,
      bullets: e.bullets.filter((b) => b.trim()),
    }));

  const projects = data.projects
    .filter(hasProjectContent)
    .map((p) => ({
      name: p.name,
      role: p.role,
      description: p.description,
      highlights: p.highlights.filter((h) => h.trim()),
    }));

  const skills = data.skills
    .map((g) => ({ category: g.category, items: g.items }))
    .filter((g) => g.items.length > 0);

  return JSON.stringify(
    {
      headline: data.personal.headline,
      summary: data.summary,
      experience: experiences,
      education: data.education.map((ed) => ({
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        institution: ed.institution,
      })),
      skills,
      projects,
      certifications: data.certifications.map((c) => ({
        name: c.name,
        issuer: c.issuer,
      })),
    },
    null,
    2
  );
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      return NextResponse.json(
        {
          success: false,
          code: "AI_NOT_CONFIGURED",
          error:
            "AI assistance is unavailable because GEMINI_API_KEY is not configured on the server.",
        },
        { status: 503 }
      );
    }

    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds the 80 KB limit." },
        { status: 413 }
      );
    }

    const rawText = await request.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds the 80 KB limit." },
        { status: 413 }
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerAuthClient();
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id ?? null;
      } catch {
        // Guest users can still use AI within rate limits
      }
    }

    const rate = checkRateLimit(getClientIdentifier(request, userId));
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "RATE_LIMITED",
          error: `Too many AI requests. Please wait ${rate.retryAfterSec} seconds and try again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    const body = parsedBody as {
      action?: unknown;
      data?: unknown;
      experienceId?: unknown;
      jobDescription?: unknown;
    };

    const action = body.action as AiAction;
    if (
      action !== "improve-summary" &&
      action !== "rewrite-bullets" &&
      action !== "suggest-skills" &&
      action !== "tailor-to-jd"
    ) {
      return NextResponse.json(
        { success: false, error: "Unsupported AI action." },
        { status: 400 }
      );
    }

    const sanitized = sanitizeResumeData(body.data);
    if (!sanitized.ok) {
      return NextResponse.json(
        { success: false, error: sanitized.error },
        { status: 400 }
      );
    }
    const resume = sanitized.data;

    const jobDescription =
      typeof body.jobDescription === "string"
        ? body.jobDescription.trim().slice(0, MAX_JD_LENGTH)
        : "";

    if (action === "improve-summary") {
      const hasContext = Boolean(
        resume.summary.trim() ||
          resume.personal.headline.trim() ||
          resume.experience.some(hasExperienceContent) ||
          resume.projects.some(hasProjectContent) ||
          resume.skills.some((s) => s.items.length > 0)
      );
      if (!hasContext) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Add an existing summary, headline, experience, projects, or skills first so AI has factual context to work from.",
          },
          { status: 400 }
        );
      }

      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          suggestedSummary: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
        required: ["suggestedSummary", "rationale"],
      };

      const prompt = `Rewrite or draft a clear, concise 2-4 sentence ATS-friendly Professional Summary using ONLY the facts provided below. Never invent years of experience, companies, skills, or metrics not present in the data.

Candidate Facts:
${summarizeCandidateFacts(resume)}
${jobDescription ? `\nTarget Job Description (highlight matching genuine strengths only):\n${jobDescription}` : ""}`;

      const result = await callGeminiJson<{
        suggestedSummary: string;
        rationale: string;
      }>(prompt, schema);

      return NextResponse.json({
        success: true,
        action,
        suggestion: result,
      });
    }

    if (action === "rewrite-bullets") {
      const expId = typeof body.experienceId === "string" ? body.experienceId : "";
      const targetExp = resume.experience.find((e) => e.id === expId);
      if (!targetExp) {
        return NextResponse.json(
          { success: false, error: "Selected experience entry was not found." },
          { status: 400 }
        );
      }

      const sourceBullets = targetExp.bullets.map((b) => b.trim()).filter(Boolean);
      if (sourceBullets.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Add at least one bullet point to this experience entry before requesting an AI rewrite.",
          },
          { status: 400 }
        );
      }

      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          note: { type: Type.STRING },
        },
        required: ["bullets", "note"],
      };

      const prompt = `Rewrite these experience bullet points into crisp, action-verb-led, achievement-focused ATS resume bullets.
Keep the exact factual scope, tools, and numbers supplied—do NOT invent metrics, percentages, team sizes, or technologies not mentioned by the candidate. Return the same number of bullets or fewer if two overlap.

Role: ${targetExp.jobTitle || "Candidate role"}
Company: ${targetExp.company || "Employer"}
Original Bullets:
${sourceBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}
${jobDescription ? `\nOptional Job Description context (use aligned terminology only when factually accurate):\n${jobDescription}` : ""}`;

      const result = await callGeminiJson<{ bullets: string[]; note: string }>(
        prompt,
        schema
      );

      return NextResponse.json({
        success: true,
        action,
        experienceId: expId,
        suggestion: {
          bullets: Array.isArray(result.bullets)
            ? result.bullets.map((b) => String(b).trim()).filter(Boolean)
            : [],
          note: result.note || "",
        },
      });
    }

    if (action === "suggest-skills") {
      const hasEvidence = Boolean(
        resume.summary.trim() ||
          resume.experience.some(hasExperienceContent) ||
          resume.projects.some(hasProjectContent)
      );
      if (!hasEvidence) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Add work experience, projects, or a summary first so AI can extract skills grounded in your actual background.",
          },
          { status: 400 }
        );
      }

      const existingSkills = new Set(
        resume.skills.flatMap((g) => g.items.map((s) => s.trim().toLowerCase()))
      );

      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          suggestedSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          rationale: { type: Type.STRING },
        },
        required: ["suggestedSkills", "rationale"],
      };

      const prompt = `Based STRICTLY on the candidate's actual experience, projects, education, and summary below, list relevant technical or professional skills explicitly demonstrated or directly named in their work that are NOT already in their skills list.
Do NOT invent unrelated skills or technologies they have not worked with.

Candidate Facts:
${summarizeCandidateFacts(resume)}`;

      const result = await callGeminiJson<{
        suggestedSkills: string[];
        rationale: string;
      }>(prompt, schema);

      const filtered = (result.suggestedSkills || [])
        .map((s) => String(s).trim())
        .filter((s) => s && !existingSkills.has(s.toLowerCase()))
        .slice(0, 15);

      return NextResponse.json({
        success: true,
        action,
        suggestion: {
          suggestedSkills: filtered,
          rationale: result.rationale || "",
        },
      });
    }

    // action === "tailor-to-jd"
    if (!jobDescription || jobDescription.length < 30) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please paste a job description (at least 30 characters) to generate tailoring suggestions.",
        },
        { status: 400 }
      );
    }

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summarySuggestion: { type: Type.STRING },
        experienceSuggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              experienceId: { type: Type.STRING },
              roleLabel: { type: Type.STRING },
              suggestedBullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["experienceId", "roleLabel", "suggestedBullets"],
          },
        },
        alignmentNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        missingRequirementsToVerify: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        "summarySuggestion",
        "experienceSuggestions",
        "alignmentNotes",
        "missingRequirementsToVerify",
      ],
    };

    const prompt = `Review the candidate's resume against the supplied Job Description and propose factual tailoring suggestions for user approval.
CRITICAL RULES:
- NEVER fabricate employers, job titles, dates, degrees, skills, or metrics.
- Only rephrase existing summary and existing experience bullets (using their exact experienceId) to clarify genuine alignment with the target role.
- List any job requirements NOT evidenced in the resume under "missingRequirementsToVerify" so the candidate can decide if they actually possess them.

Candidate Facts:
${summarizeCandidateFacts(resume)}

Target Job Description:
${jobDescription}`;

    const result = await callGeminiJson<{
      summarySuggestion: string;
      experienceSuggestions: Array<{
        experienceId: string;
        roleLabel: string;
        suggestedBullets: string[];
      }>;
      alignmentNotes: string[];
      missingRequirementsToVerify: string[];
    }>(prompt, schema);

    const validExpIds = new Set(resume.experience.map((e) => e.id));
    const safeExpSuggestions = (result.experienceSuggestions || []).filter(
      (item) => validExpIds.has(item.experienceId) && item.suggestedBullets?.length > 0
    );

    return NextResponse.json({
      success: true,
      action,
      suggestion: {
        summarySuggestion: (result.summarySuggestion || "").trim(),
        experienceSuggestions: safeExpSuggestions,
        alignmentNotes: result.alignmentNotes || [],
        missingRequirementsToVerify: result.missingRequirementsToVerify || [],
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          success: false,
          code: "AI_NOT_CONFIGURED",
          error: "Gemini API key is not configured on this server.",
        },
        { status: 503 }
      );
    }

    console.error("Resume AI endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "AI suggestion could not be generated right now. Your resume edits remain untouched.",
      },
      { status: 502 }
    );
  }
}

