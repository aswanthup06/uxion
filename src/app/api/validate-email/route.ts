import { NextRequest, NextResponse } from "next/server";
import { validateEmailDomain } from "@/lib/validation/email";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const VALIDATE_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 30,
};

export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const limit = checkRateLimit("validate-email", clientIp, VALIDATE_RATE_LIMIT);
    if (!limit.allowed) {
      return NextResponse.json(
        { valid: false, reason: "Too many email validation requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { valid: false, reason: "Email query parameter is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().slice(0, 150);
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
    const clientIp = getClientIp(req);
    const limit = checkRateLimit("validate-email", clientIp, VALIDATE_RATE_LIMIT);
    if (!limit.allowed) {
      return NextResponse.json(
        { valid: false, reason: "Too many email validation requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail = body?.email;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { valid: false, reason: "Email field is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().slice(0, 150);
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
