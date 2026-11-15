import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient, getServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;
    let email: string | null = null;
    let fullName: string = "Candidate";
    let avatarUrl: string = "";

    // 1. Authenticate user from session cookies
    try {
      const supabase = await createServerAuthClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      // Cookies not yet established or SSR client error
    }

    // 2. Alternatively authenticate via verified Bearer token
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace(/^Bearer\s+/i, "").trim();
          const service = getServiceSupabase();
          const {
            data: { user },
          } = await service.auth.getUser(token);
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
          // Token invalid
        }
      }
    }

    // Strictly reject unauthenticated requests to prevent IDOR / arbitrary profile overwrite
    if (!userId || !email) {
      return NextResponse.json(
        { error: "Unauthorized. Valid user authentication session is required." },
        { status: 401 }
      );
    }

    const serviceSupabase = getServiceSupabase();

    const { error: upsertError } = await serviceSupabase.from("profiles").upsert(
      {
        id: userId,
        email: email,
        full_name: fullName.slice(0, 100),
        avatar_url: avatarUrl.slice(0, 500),
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
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
