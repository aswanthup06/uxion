import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get("admin-auth");
  const isAuthenticated = await verifyAdminToken(authCookie?.value);

  if (isAuthenticated) {
    return NextResponse.json({ authenticated: true });
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
