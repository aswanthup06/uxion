import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerAuthClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { SavedResumeRecord } from "./types";
import { sanitizeResumeData } from "./validation";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface DbResumeRow {
  id: string;
  user_id: string;
  title: string;
  template: string;
  data: unknown;
  target_job_description: string | null;
  created_at: string;
  updated_at: string;
}

export function isMigrationMissingError(error: {
  code?: string;
  message?: string;
} | null): boolean {
  if (!error) return false;
  const code = error.code || "";
  const msg = (error.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

export function mapDbResumeToRecord(row: DbResumeRow): SavedResumeRecord {
  const sanitized = sanitizeResumeData(row.data);
  if (!sanitized.ok) {
    throw new Error("Stored resume data is malformed.");
  }
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title || "Untitled Resume",
    template: "classic-ats",
    data: sanitized.data,
    targetJobDescription: row.target_job_description || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function requireAuthenticatedResumeClient(): Promise<
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; response: NextResponse }
> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Supabase database persistence is not configured.",
          code: "SUPABASE_NOT_CONFIGURED",
        },
        { status: 503 }
      ),
    };
  }

  try {
    const supabase = await createServerAuthClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Please sign in to access your saved resumes.", code: "UNAUTHORIZED" },
          { status: 401 }
        ),
      };
    }

    return { ok: true, supabase, user };
  } catch (err) {
    console.error("Auth client initialization failed:", err);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication service is unavailable." },
        { status: 503 }
      ),
    };
  }
}

export function migrationRequiredResponse() {
  return NextResponse.json(
    {
      error:
        "Cloud resume storage table is not set up yet. Apply supabase/migrations/20261110000001_create_resumes_table.sql in Supabase.",
      code: "MIGRATION_REQUIRED",
    },
    { status: 503 }
  );
}

