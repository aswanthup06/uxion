import { NextRequest, NextResponse } from "next/server";
import {
  type DbResumeRow,
  isMigrationMissingError,
  mapDbResumeToRecord,
  migrationRequiredResponse,
  requireAuthenticatedResumeClient,
} from "@/lib/resume/server-db";
import { sanitizeResumeData } from "@/lib/resume/validation";

export const dynamic = "force-dynamic";

const MAX_RESUMES_PER_USER = 25;

export async function GET() {
  const auth = await requireAuthenticatedResumeClient();
  if (!auth.ok) return auth.response;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(MAX_RESUMES_PER_USER);

  if (error) {
    if (isMigrationMissingError(error)) {
      return migrationRequiredResponse();
    }
    console.error("Failed to list resumes:", error);
    return NextResponse.json(
      { error: "Could not load saved resumes." },
      { status: 500 }
    );
  }

  const resumes = (data as DbResumeRow[] | null || []).map(mapDbResumeToRecord);
  return NextResponse.json(
    { resumes },
    { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedResumeClient();
  if (!auth.ok) return auth.response;

  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const payload = body as {
    title?: unknown;
    template?: unknown;
    data?: unknown;
    targetJobDescription?: unknown;
  };

  const sanitized = sanitizeResumeData(payload.data);
  if (!sanitized.ok) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim().slice(0, 120)
      : "Untitled Resume";

  const targetJobDescription =
    typeof payload.targetJobDescription === "string"
      ? payload.targetJobDescription.slice(0, 8000)
      : "";

  // Enforce per-user saved resume count cap
  const { count, error: countError } = await supabase
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    if (isMigrationMissingError(countError)) {
      return migrationRequiredResponse();
    }
    return NextResponse.json(
      { error: "Could not verify saved resume quota." },
      { status: 500 }
    );
  }

  if ((count ?? 0) >= MAX_RESUMES_PER_USER) {
    return NextResponse.json(
      {
        error: `You can save up to ${MAX_RESUMES_PER_USER} resumes. Delete an older resume first.`,
      },
      { status: 400 }
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      template: "classic-ats",
      data: sanitized.data,
      target_job_description: targetJobDescription,
    })
    .select("*")
    .single();

  if (insertError) {
    if (isMigrationMissingError(insertError)) {
      return migrationRequiredResponse();
    }
    console.error("Failed to create resume:", insertError);
    return NextResponse.json(
      { error: "Could not save resume to your account." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { resume: mapDbResumeToRecord(inserted as DbResumeRow) },
    { status: 201 }
  );
}

