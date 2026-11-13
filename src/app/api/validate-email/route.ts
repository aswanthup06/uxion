import { NextRequest, NextResponse } from "next/server";
import { validateEmailDomain } from "@/lib/validation/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { valid: false, reason: "Email query parameter is required." },
        { status: 400 }
      );
    }

    const result = await validateEmailDomain(email);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Email validation API error:", error);
    return NextResponse.json(
      { valid: false, reason: "Server error during email validation." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { valid: false, reason: "Email field is required." },
        { status: 400 }
      );
    }

    const result = await validateEmailDomain(email);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Email validation API error:", error);
    return NextResponse.json(
      { valid: false, reason: "Server error during email validation." },
      { status: 500 }
    );
  }
}
