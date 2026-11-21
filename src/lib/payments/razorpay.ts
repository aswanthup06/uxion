import Razorpay from "razorpay";
import crypto from "crypto";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export const UNLOCK_PRICE_INR = 5;
export const UNLOCK_PRICE_PAISE = UNLOCK_PRICE_INR * 100; // 500 paise = ₹5

export function isFreeEmailUnlockEnabled(): boolean {
  // Free by default unless explicitly configured as paid (NEXT_PUBLIC_FREE_EMAIL_UNLOCK="false")
  return process.env.NEXT_PUBLIC_FREE_EMAIL_UNLOCK !== "false";
}

let razorpayInstance: Razorpay | null = null;

/**
 * Returns a configured Razorpay instance.
 */
export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
    );
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

/**
 * Verifies Razorpay HMAC-SHA256 payment signature.
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
  secret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const keySecret = secret || process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured for signature verification.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}

/**
 * Masks an email address with full stars for confidential preview before unlock.
 * Completely conceals username and domain to prevent bias against @gmail.com or personal domains.
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return "";
  }

  return "******************";
}

/**
 * Checks whether an authenticated user has unlocked the email for a given job.
 */
export async function isJobEmailUnlocked(userId?: string | null, jobId?: string | null): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId || !jobId) {
    return false;
  }

  try {
    const supabase = getServerSupabase();
    const { data } = await supabase
      .from("unlocked_job_emails")
      .select("id")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .eq("status", "paid")
      .maybeSingle();

    return Boolean(data);
  } catch (error) {
    console.error("isJobEmailUnlocked query error:", error);
    return false;
  }
}
