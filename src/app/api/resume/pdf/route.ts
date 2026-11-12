import { NextRequest, NextResponse } from "next/server";
import { generateResumePdfBytes } from "@/lib/resume/pdf";
import { sanitizeResumeData, validateResumeData } from "@/lib/resume/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 200_000;

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Resume payload is too large." },
        { status: 413 }
      );
    }

    const rawText = await request.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Resume payload is too large." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const payload = body as { data?: unknown; title?: unknown };
    const sanitized = sanitizeResumeData(payload.data);
    if (!sanitized.ok) {
      return NextResponse.json({ error: sanitized.error }, { status: 400 });
    }

    const validation = validateResumeData(sanitized.data, {
      requireContactForExport: true,
    });
    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            validation.issues[0]?.message ||
            "Please resolve validation errors before exporting your PDF.",
          issues: validation.issues,
        },
        { status: 400 }
      );
    }

    const title = typeof payload.title === "string" ? payload.title.slice(0, 120) : undefined;
    const { bytes, filename, pageCount } = await generateResumePdfBytes(
      sanitized.data,
      title
    );

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
        "X-Resume-Page-Count": String(pageCount),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("PDF export route error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF document. Please try again." },
      { status: 500 }
    );
  }
}

