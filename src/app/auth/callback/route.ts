import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/jobs";

  // Prevent open redirect attacks by ensuring `next` is a relative path
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/jobs";

  if (code) {
    const response = NextResponse.redirect(`${origin}${safeNext}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie") ?? "";
          return cookieHeader
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const [name, ...val] = c.split("=");
              return { name, value: val.join("=") };
            });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback exchange error:", error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      const user = data?.user;

      if (user) {
        // Ensure profile row exists in public.profiles
        try {
          const serviceSupabase = getServiceSupabase();
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Candidate";
          const avatarUrl =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            "";

          await serviceSupabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email,
              full_name: fullName,
              avatar_url: avatarUrl,
              role: "candidate",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id", ignoreDuplicates: false }
          );
        } catch (profileError) {
          console.warn("Could not upsert profile in callback:", profileError);
        }
      }

      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected auth error";
      console.error("Auth callback unexpected error:", message);
      return NextResponse.redirect(`${origin}/login?error=unexpected`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
