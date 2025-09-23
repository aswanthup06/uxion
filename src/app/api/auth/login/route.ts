import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Use server-side environment variable
    if (password === process.env.ADMIN_KEY) {
      const response = NextResponse.json({ success: true });
      
      // Set HTTP-only cookie
      response.cookies.set("admin-auth", "true", {
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
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}