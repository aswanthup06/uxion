import { NextRequest, NextResponse } from "next/server";
import {
  type DbResumeRow,
  UUID_REGEX,
  isMigrationMissingError,
  mapDbResumeToRecord,
  migrationRequiredResponse,
  requireAuthenticatedResumeClient,
} from "@/lib/resume/server-db";
import { sanitizeResumeData } from "@/lib/resume/validation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid resume identifier." }, { status: 400 });
  }

  const auth = await requireAuthenticatedResumeClient();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isMigrationMissingError(error)) return migrationRequiredResponse();
    console.error("Failed to fetch resume:", error);
    return NextResponse.json({ error: "Failed to load resume." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json(
    { resume: mapDbResumeToRecord(data as DbResumeRow) },
    { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid resume identifier." }, { status: 400 });
  }

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

  const { data, error } = await supabase
    .from("resumes")
    .update({
      title,
      template: "classic-ats",
      data: sanitized.data,
      target_job_description: targetJobDescription,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isMigrationMissingError(error)) return migrationRequiredResponse();
    console.error("Failed to update resume:", error);
    return NextResponse.json({ error: "Could not update resume." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json(
    { resume: mapDbResumeToRecord(data as DbResumeRow) },
    { status: 200 }
  );
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid resume identifier." }, { status: 400 });
  }

  const auth = await requireAuthenticatedResumeClient();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isMigrationMissingError(error)) return migrationRequiredResponse();
    console.error("Failed to delete resume:", error);
    return NextResponse.json({ error: "Could not delete resume." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 200 });
}

