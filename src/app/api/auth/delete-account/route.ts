import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient, getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user from session cookies
    const supabase = await createServerAuthClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete your account." },
        { status: 401 }
      );
    }

    const userId = user.id;
    const serviceSupabase = getServiceSupabase();

    // 2. Delete candidate profile data
    const { error: profileDeleteError } = await serviceSupabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("Error deleting candidate profile row:", profileDeleteError);
    }

    // 3. Delete user from auth.users via service role
    const { error: authDeleteError } = await serviceSupabase.auth.admin.deleteUser(
      userId
    );

    if (authDeleteError) {
      console.error("Error deleting user from auth.users:", authDeleteError);
      return NextResponse.json(
        { error: authDeleteError.message || "Failed to delete account authentication record." },
        { status: 500 }
      );
    }

    // 4. Invalidate session
    await supabase.auth.signOut();

    const response = NextResponse.json({
      success: true,
      message: "Account and profile data deleted successfully.",
    });

    // Expire common Supabase cookies on response
    response.cookies.set("sb-access-token", "", { maxAge: 0, path: "/" });
    response.cookies.set("sb-refresh-token", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Failed to delete account:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

