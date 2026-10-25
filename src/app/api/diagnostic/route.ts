// src/app/api/diagnostic/route.ts
// Temporary server-side diagnostic endpoint to verify environment variable presence.
// Strictly returns boolean presence flags. NEVER prints or exposes variable values.

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const projectRoot = process.cwd();
  const envLocalPath = path.join(projectRoot, ".env.local");
  const envPath = path.join(projectRoot, ".env");

  let envLocalExists = false;
  let envLocalSizeBytes = 0;
  try {
    const stat = fs.statSync(envLocalPath);
    envLocalExists = stat.isFile();
    envLocalSizeBytes = stat.size;
  } catch {
    envLocalExists = false;
  }

  let envExists = false;
  try {
    envExists = fs.existsSync(envPath);
  } catch {
    envExists = false;
  }

  const diagnostic = {
    status: "ok",
    projectRoot,
    files: {
      hasEnvLocal: envLocalExists,
      envLocalSizeBytes: envLocalSizeBytes,
      hasEnv: envExists,
    },
    presence: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim()
      ),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      ADMIN_KEY: Boolean(process.env.ADMIN_KEY?.trim()),
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
    },
  };

  return NextResponse.json(diagnostic);
}
