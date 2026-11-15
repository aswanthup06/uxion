import { NextResponse } from "next/server";
import { google } from "googleapis";
import { isAuthorizedAdminRequest } from "@/lib/auth/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const ALLOWED_HOSTS = new Set([
  "zenoway.com",
  "www.zenoway.com",
  "localhost",
  "127.0.0.1",
]);

export async function POST(request: Request) {
  try {
    // 1. Enforce admin authentication
    const isAuthorized = await isAuthorizedAdminRequest(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    // 2. IP rate limiting to avoid exceeding Google Indexing API quotas
    const clientIp = getClientIp(request);
    const limit = checkRateLimit("index-job", clientIp, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many indexing requests. Please wait a minute." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const { jobUrl, action } = await request.json().catch(() => ({}));

    if (!jobUrl || typeof jobUrl !== "string" || !action || typeof action !== "string") {
      return NextResponse.json(
        { error: "Valid jobUrl and action are required." },
        { status: 400 }
      );
    }

    if (action !== "URL_UPDATED" && action !== "URL_DELETED") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'URL_UPDATED' or 'URL_DELETED'." },
        { status: 400 }
      );
    }

    // 3. Domain validation: prevent indexing third-party or arbitrary URLs
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(jobUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid jobUrl format." },
        { status: 400 }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowedHost =
      ALLOWED_HOSTS.has(hostname) ||
      hostname.endsWith(".zenoway.com") ||
      (process.env.NEXT_PUBLIC_SITE_URL &&
        hostname === new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.toLowerCase());

    if (!isAllowedHost) {
      return NextResponse.json(
        { error: `Unauthorized URL host '${hostname}'. Only official site domains are permitted.` },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Google Indexing credentials are not configured on this server." },
        { status: 503 }
      );
    }

    // 4. Authenticate with Google's Indexing API
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const indexer = google.indexing({
      version: "v3",
      auth: auth,
    });

    // 5. Publish the indexing request notification
    const response = await indexer.urlNotifications.publish({
      requestBody: {
        url: jobUrl,
        type: action,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Google Jobs notified successfully!",
      data: response.data,
    });
  } catch (error) {
    console.error("Google Indexing API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
