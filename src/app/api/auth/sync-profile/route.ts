import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient, getServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;
    let email: string | null = null;
    let fullName: string = "Candidate";
    let avatarUrl: string = "";

    // 1. Try to read user from authenticated session cookies
    try {
      const supabase = await createServerAuthClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        email = user.email || null;
        fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Candidate";
        avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "";
      }
    } catch {
      // Fall through to body parsing if cookies aren't set yet
    }

    // 2. Fallback to payload body if session wasn't found in cookies immediately
    if (!userId) {
      try {
        const body = await request.json();
        if (body?.id && body?.email) {
          userId = body.id;
          email = body.email;
          if (body.full_name) fullName = body.full_name;
          if (body.avatar_url) avatarUrl = body.avatar_url;
        }
      } catch {
        // Body was empty or invalid
      }
    }

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing user information" }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();

    const { error: upsertError } = await serviceSupabase.from("profiles").upsert(
      {
        id: userId,
        email: email,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: "candidate",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: false }
    );

    if (upsertError) {
      console.warn("Could not upsert profile in /api/auth/sync-profile:", upsertError.message);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error syncing profile";
    console.error("Profile sync exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

