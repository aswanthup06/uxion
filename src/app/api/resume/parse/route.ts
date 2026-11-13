import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeResumeData } from "@/lib/resume/validation";
import zlib from "zlib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

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

  if (rateLimitStore.size > 1000) {
    for (const [k, vals] of rateLimitStore.entries()) {
      if (vals.every((v) => v <= windowStart)) {
        rateLimitStore.delete(k);
      }
    }
  }

  return { allowed: true, retryAfterSec: 0 };
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  return `ip:${ip}`;
}

/**
 * Extracts plain text from a Word .docx buffer without external dependencies.
 * .docx files are PKZip archives containing word/document.xml.
 */
function extractTextFromDocx(buffer: Buffer): string | null {
  try {
    let offset = 0;
    while (offset < buffer.length - 30) {
      if (buffer.readUInt32LE(offset) === 0x04034b50) {
        const method = buffer.readUInt16LE(offset + 8);
        const compSize = buffer.readUInt32LE(offset + 18);
        const fnLen = buffer.readUInt16LE(offset + 26);
        const extraLen = buffer.readUInt16LE(offset + 28);
        const filename = buffer.toString("utf8", offset + 30, offset + 30 + fnLen);
        const dataOffset = offset + 30 + fnLen + extraLen;

        if (filename === "word/document.xml") {
          const slice = buffer.subarray(dataOffset, dataOffset + compSize);
          const xml =
            method === 8 ? zlib.inflateRawSync(slice).toString("utf8") : slice.toString("utf8");

          const text = xml
            .replace(/<w:tab[^>]*\/>/gi, "\t")
            .replace(/<w:br[^>]*\/>/gi, "\n")
            .replace(/<\/w:p>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

          return text || null;
        }

        offset = dataOffset + compSize;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn("Failed to extract text from DOCX:", err);
  }
  return null;
}

const RESUME_PARSER_SYSTEM_INSTRUCTION = `You are a professional ATS resume parser and career documentation specialist.
Your task is to accurately extract all factual career information from the provided resume into the exact JSON schema requested.

CRITICAL INSTRUCTIONS:
1. ONLY extract information that is present in the document. NEVER fabricate or invent employers, job titles, degrees, institutions, or metrics that are not in the document.
2. Separate the person's name into firstName and lastName cleanly.
3. Extract professional headline/title if present (e.g. "Senior Product Designer", "Full Stack Developer").
4. Extract contact info: email, phone, city/location, and web links (LinkedIn, GitHub, Portfolio, Twitter/X, personal website).
5. Extract the summary or objective paragraph if present.
6. For each work experience entry:
   - Extract jobTitle, company, location (if any), startDate, endDate.
   - If currently employed or marked "Present" / "Current", set isCurrent: true.
   - Extract individual bullet points cleanly into an array of strings. Do not truncate bullet points.
7. For education entries:
   - Extract degree, fieldOfStudy, institution, location, startDate, endDate, isCurrent, grade/GPA, highlights.
8. Group skills logically into categories (e.g. "Design & Tools", "Technical Skills", "Languages", "Frameworks", "Core Competencies").
9. For projects, certifications, or additional sections (languages, awards, publications), extract them into the appropriate schema fields.
10. Return strictly valid JSON adhering to the schema.`;

const resumeParseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    personal: {
      type: Type.OBJECT,
      properties: {
        firstName: { type: Type.STRING },
        lastName: { type: Type.STRING },
        headline: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        city: { type: Type.STRING },
        links: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["label", "url"],
          },
        },
      },
      required: ["firstName", "lastName"],
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          isCurrent: { type: Type.BOOLEAN },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["jobTitle", "company"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          fieldOfStudy: { type: Type.STRING },
          institution: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          isCurrent: { type: Type.BOOLEAN },
          grade: { type: Type.STRING },
          highlights: { type: Type.STRING },
        },
        required: ["degree", "institution"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["category", "items"],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          link: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.STRING },
          highlights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["name"],
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          issueDate: { type: Type.STRING },
          credentialUrl: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
    optionalSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "items"],
      },
    },
  },
  required: ["personal", "summary", "experience", "education", "skills"],
};

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const limitCheck = checkRateLimit(clientId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many import requests. Please wait ${limitCheck.retryAfterSec} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limitCheck.retryAfterSec) },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          code: "AI_NOT_CONFIGURED",
          error: "Resume parsing is unavailable because GEMINI_API_KEY is not configured.",
        },
        { status: 503 }
      );
    }

    let fileBuffer: Buffer | null = null;
    let fileName = "";
    let mimeType = "";
    let rawTextContent = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const fileEntry = formData.get("file");
      const textEntry = formData.get("text");

      if (typeof textEntry === "string" && textEntry.trim()) {
        rawTextContent = textEntry.trim();
      }

      if (fileEntry instanceof File) {
        if (fileEntry.size > MAX_FILE_BYTES) {
          return NextResponse.json(
            { success: false, error: "Uploaded file exceeds 10 MB limit." },
            { status: 413 }
          );
        }
        fileName = fileEntry.name || "resume";
        mimeType = fileEntry.type || "application/octet-stream";
        const arrayBuffer = await fileEntry.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      // JSON body option with base64 or raw text
      const body = (await request.json().catch(() => ({}))) as {
        base64?: string;
        fileName?: string;
        mimeType?: string;
        text?: string;
      };

      if (body.text?.trim()) {
        rawTextContent = body.text.trim();
      }
      if (body.base64?.trim()) {
        fileBuffer = Buffer.from(body.base64.trim(), "base64");
        fileName = body.fileName || "resume";
        mimeType = body.mimeType || "application/octet-stream";
      }
    }

    if (!fileBuffer && !rawTextContent) {
      return NextResponse.json(
        { success: false, error: "Please upload a resume file or paste resume text." },
        { status: 400 }
      );
    }

    // Direct JSON resume shortcut (e.g. Zenoway draft or JSON Resume format)
    const lowerName = fileName.toLowerCase();
    if ((lowerName.endsWith(".json") || mimeType === "application/json") && fileBuffer) {
      try {
        const jsonText = fileBuffer.toString("utf8");
        const parsed = JSON.parse(jsonText);
        const sanitized = sanitizeResumeData(parsed.data || parsed);
        if (sanitized.ok && (sanitized.data.personal.firstName || sanitized.data.experience.length > 0)) {
          const candidateName =
            `${sanitized.data.personal.firstName} ${sanitized.data.personal.lastName}`.trim() ||
            "Imported Resume";
          return NextResponse.json({
            success: true,
            data: sanitized.data,
            detectedTitle: `${candidateName} - Resume`,
            sourceType: "json",
          });
        }
      } catch {
        // Fall back to AI extraction if not direct schema match
      }
    }

    const ai = new GoogleGenAI({ apiKey });
    const models = ["gemini-3.5-flash-lite", "gemini-3-flash-preview"];
    let parsedResult: unknown = null;
    let lastError: unknown = null;

    // Determine content format for Gemini
    let geminiContents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

    const isPdf =
      lowerName.endsWith(".pdf") ||
      mimeType === "application/pdf" ||
      (fileBuffer && fileBuffer.subarray(0, 4).toString("utf8") === "%PDF");

    const isDocx =
      lowerName.endsWith(".docx") ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      (fileBuffer && fileBuffer.length > 4 && fileBuffer.readUInt32LE(0) === 0x04034b50);

    if (isPdf && fileBuffer) {
      geminiContents = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBuffer.toString("base64"),
          },
        },
        "Extract this resume into the structured JSON schema. Preserve all factual roles, metrics, dates, and bullet points.",
      ];
    } else if (isDocx && fileBuffer) {
      const extractedText = extractTextFromDocx(fileBuffer);
      if (!extractedText) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not read text from this Word (.docx) file. Please save it as a PDF or copy/paste the text.",
          },
          { status: 422 }
        );
      }
      geminiContents = [
        `Here is the text extracted from the candidate's Word resume:\n\n${extractedText.slice(0, 30_000)}\n\nExtract this resume into the structured JSON schema. Preserve all factual roles, metrics, dates, and bullet points.`,
      ];
    } else if (fileBuffer) {
      // Plain text or markdown file
      const text = fileBuffer.toString("utf8");
      geminiContents = [
        `Here is the candidate's resume content:\n\n${text.slice(0, 30_000)}\n\nExtract this resume into the structured JSON schema. Preserve all factual roles, metrics, dates, and bullet points.`,
      ];
    } else {
      // Pasted raw text
      geminiContents = [
        `Here is the candidate's resume text:\n\n${rawTextContent.slice(0, 30_000)}\n\nExtract this resume into the structured JSON schema. Preserve all factual roles, metrics, dates, and bullet points.`,
      ];
    }

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: geminiContents,
          config: {
            systemInstruction: RESUME_PARSER_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseJsonSchema: resumeParseSchema,
            temperature: 0.1,
            httpOptions: { timeout: 35000 },
          },
        });

        const raw = (response.text ?? "").trim();
        if (!raw) throw new Error("Empty AI response received.");

        const cleaned = raw
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```$/, "")
          .trim();

        parsedResult = JSON.parse(cleaned);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Resume parser with model ${model} failed:`, err instanceof Error ? err.message : err);
      }
    }

    if (!parsedResult) {
      throw lastError instanceof Error ? lastError : new Error("Failed to parse resume document.");
    }

    const sanitized = sanitizeResumeData(parsedResult);
    if (!sanitized.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume details could not be formatted into the ATS structure.",
        },
        { status: 422 }
      );
    }

    const candidateName =
      `${sanitized.data.personal.firstName} ${sanitized.data.personal.lastName}`.trim() ||
      "Imported Resume";

    return NextResponse.json({
      success: true,
      data: sanitized.data,
      detectedTitle: `${candidateName} - Resume`,
      stats: {
        hasSummary: Boolean(sanitized.data.summary.trim()),
        experienceCount: sanitized.data.experience.length,
        educationCount: sanitized.data.education.length,
        skillsCount: sanitized.data.skills.reduce((acc, g) => acc + g.items.length, 0),
        projectsCount: sanitized.data.projects.length,
        certificationsCount: sanitized.data.certifications.length,
      },
    });
  } catch (error) {
    console.error("Resume parse API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred while parsing the resume.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

