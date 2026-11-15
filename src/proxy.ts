// src/proxy.ts
// Next.js 16 Proxy / Middleware convention
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes (exclude login page and public assets)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const authCookie = request.cookies.get("admin-auth");
    const isValidAdmin = await verifyAdminToken(authCookie?.value);

    if (!isValidAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
