import { NextResponse } from "next/server";
import { createServerAuthClient, getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ unlockedJobIds: [] });
    }

    const authClient = await createServerAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ unlockedJobIds: [] });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("unlocked_job_emails")
      .select("job_id")
      .eq("user_id", user.id)
      .eq("status", "paid");

    if (error) {
      console.error("Error fetching unlocked job IDs:", error);
      return NextResponse.json({ unlockedJobIds: [] });
    }

    const unlockedJobIds = (data || []).map((row: { job_id: string }) => row.job_id);
    return NextResponse.json({ unlockedJobIds });
  } catch (err) {
    console.error("GET /api/jobs/unlocked error:", err);
    return NextResponse.json({ unlockedJobIds: [] });
  }
}
