// src/lib/supabase/server.ts
// Server-side Supabase client for Next.js App Router and API routes.
// Privileged operations (INSERT, UPDATE, DELETE) use SUPABASE_SERVICE_ROLE_KEY.
// The service role key is NEVER exposed to the browser or prefixed with NEXT_PUBLIC_.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serviceClientInstance: SupabaseClient | null = null;
let serverReadClientInstance: SupabaseClient | null = null;

/**
 * Checks whether Supabase environment variables are present without throwing.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url?.trim() && key?.trim());
}

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || !url.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured. Please set it in .env.local (e.g. NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co)."
    );
  }
  return url.trim();
}

/**
 * Privileged server-side client for administrative/mutation operations.
 * Uses SUPABASE_SERVICE_ROLE_KEY to perform verified writes and bypass RLS safely.
 * NEVER call this from client components.
 */
export function getServiceSupabase(): SupabaseClient {
  if (serviceClientInstance) return serviceClientInstance;

  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    // Fall back to anon key with a warning if service role key is not yet provided in dev
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (anonKey) {
      console.warn(
        "⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anon key for server operations."
      );
      serviceClientInstance = createClient(url, anonKey, {
        auth: { persistSession: false },
      });
      return serviceClientInstance;
    }

    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Privileged server operations require this environment variable."
    );
  }

  serviceClientInstance = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return serviceClientInstance;
}

/**
 * Standard server-side client for reading public data in server components and routes.
 */
export function getServerSupabase(): SupabaseClient {
  if (serverReadClientInstance) return serverReadClientInstance;

  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is configured."
    );
  }

  serverReadClientInstance = createClient(url, key, {
    auth: { persistSession: false },
  });

  return serverReadClientInstance;
}
