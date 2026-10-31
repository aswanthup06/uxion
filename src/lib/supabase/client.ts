// src/lib/supabase/client.ts
// Client-side Supabase client using @supabase/ssr.
// Automatically manages cookies in browser for Next.js App Router.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY) are missing."
    );
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseKey);
  return clientInstance;
}

export function getBrowserSupabase(): SupabaseClient | null {
  try {
    return createClient();
  } catch {
    return null;
  }
}
