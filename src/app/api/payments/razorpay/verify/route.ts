import { NextResponse } from "next/server";
import { createServerAuthClient, getServiceSupabase } from "@/lib/supabase/server";
import { getJobById } from "@/lib/supabase/jobs";
import {
  verifyRazorpaySignature,
  UNLOCK_PRICE_PAISE,
} from "@/lib/payments/razorpay";

export async function POST(req: Request) {
  try {
    const authClient = await createServerAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to complete verification." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { jobId, orderId, paymentId, signature } = body;

    if (!jobId || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required payment verification details." },
        { status: 400 }
      );
    }

    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Job opportunity not found." },
        { status: 404 }
      );
    }

    // Verify cryptographic HMAC-SHA256 signature
    const isValidSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature received." },
        { status: 400 }
      );
    }

    // Record the verified unlock in Supabase
    try {
      const serviceSupabase = getServiceSupabase();
      await serviceSupabase.from("unlocked_job_emails").upsert(
        {
          user_id: user.id,
          job_id: job.id,
          amount: UNLOCK_PRICE_PAISE,
          currency: "INR",
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          status: "paid",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,job_id" }
      );
    } catch (dbErr) {
      console.error("Failed to persist unlock record in DB:", dbErr);
    }

    // Return the unmasked email securely
    return NextResponse.json({
      success: true,
      isUnlocked: true,
      email: (job.mail || "").trim(),
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An unexpected error occurred while verifying your payment.",
      },
      { status: 500 }
    );
  }
}
