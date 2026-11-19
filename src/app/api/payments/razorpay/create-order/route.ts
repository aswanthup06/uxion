import { NextResponse } from "next/server";
import { createServerAuthClient, getServiceSupabase } from "@/lib/supabase/server";
import { getJobById } from "@/lib/supabase/jobs";
import {
  getRazorpayClient,
  isJobEmailUnlocked,
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
        { error: "Please log in to unlock this contact email." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { jobId } = body;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "A valid jobId is required." },
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

    if (!job.mail || !job.mail.trim()) {
      return NextResponse.json(
        { error: "This job opportunity has no direct recruitment email to unlock." },
        { status: 400 }
      );
    }

    // Check if the user already unlocked this job's email
    const alreadyUnlocked = await isJobEmailUnlocked(user.id, jobId);
    if (alreadyUnlocked) {
      return NextResponse.json({
        alreadyUnlocked: true,
        email: job.mail.trim(),
      });
    }

    // Create Razorpay order
    const razorpay = getRazorpayClient();
    const sanitizedJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 10);
    const receipt = `rcpt_${sanitizedJobId}_${Date.now().toString().slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: UNLOCK_PRICE_PAISE,
      currency: "INR",
      receipt,
      notes: {
        userId: user.id,
        userEmail: user.email || "",
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        purpose: "job_email_unlock",
      },
    });

    // Record pending unlock in Supabase
    try {
      const serviceSupabase = getServiceSupabase();
      await serviceSupabase.from("unlocked_job_emails").upsert(
        {
          user_id: user.id,
          job_id: job.id,
          amount: UNLOCK_PRICE_PAISE,
          currency: "INR",
          razorpay_order_id: order.id,
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,job_id" }
      );
    } catch (dbErr) {
      console.warn("Failed to record pending unlock in DB (migration may be pending):", dbErr);
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to initiate payment. Please verify your Razorpay credentials.",
      },
      { status: 500 }
    );
  }
}
