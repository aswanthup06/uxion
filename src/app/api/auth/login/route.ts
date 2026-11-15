import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, timingSafeEqualStrings } from "@/lib/auth/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// Rate limit: 5 failed attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
};

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const limit = checkRateLimit("admin-login", clientIp, LOGIN_RATE_LIMIT);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(
            limit.retryAfterSec / 60
          )} minutes.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        }
      );
    }

    const { password } = await request.json().catch(() => ({}));

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const adminKey = process.env.ADMIN_KEY?.trim();
    if (!adminKey) {
      console.error("ADMIN_KEY environment variable is not configured.");
      return NextResponse.json(
        { error: "Admin authentication service unavailable" },
        { status: 503 }
      );
    }

    // Timing-safe password comparison
    const isValid = timingSafeEqualStrings(password.trim(), adminKey);

    if (isValid) {
      // Issue cryptographically signed HMAC token
      const token = await createAdminToken();
      const response = NextResponse.json({ success: true });

      response.cookies.set("admin-auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
