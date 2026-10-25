// src/lib/supabase/client.ts
// Client-side Supabase client using NEXT_PUBLIC_SUPABASE_ANON_KEY.
// Safe for browser execution. Strictly constrained by Row Level Security (RLS).

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

let clientInstance: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}
