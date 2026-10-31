import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminCookie = req.cookies.get("admin-auth");
  if (adminCookie?.value === "true") return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token && (token === process.env.ADMIN_KEY || token === process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data: candidates, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If table does not exist yet in dev, return empty array gracefully
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return NextResponse.json({ candidates: [] }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ candidates: candidates || [] }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

