// src/app/api/jobs/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { incrementJobViews } from "@/lib/supabase/jobs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const id = body?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Valid job ID is required" },
        { status: 400 }
      );
    }

    await incrementJobViews(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error incrementing job view:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

