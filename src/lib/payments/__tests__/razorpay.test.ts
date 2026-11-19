import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { maskEmail, verifyRazorpaySignature, UNLOCK_PRICE_INR, UNLOCK_PRICE_PAISE } from "../razorpay";

describe("Razorpay payment helpers", () => {
  it("has correct ₹5 pricing constants", () => {
    expect(UNLOCK_PRICE_INR).toBe(5);
    expect(UNLOCK_PRICE_PAISE).toBe(500);
  });

  describe("maskEmail", () => {
    it("masks email addresses completely with full stars", () => {
      expect(maskEmail("careers@example.com")).toBe("******************");
      expect(maskEmail("recruitment@zenoway.com")).toBe("******************");
      expect(maskEmail("founder@gmail.com")).toBe("******************");
    });

    it("handles invalid or empty inputs safely", () => {
      expect(maskEmail("")).toBe("");
      expect(maskEmail(null)).toBe("");
      expect(maskEmail(undefined)).toBe("");
      expect(maskEmail("invalid-email")).toBe("");
    });
  });

  describe("verifyRazorpaySignature", () => {
    const testSecret = "test_razorpay_secret_12345";
    const orderId = "order_O6bZ3lK8Wq1s";
    const paymentId = "pay_P8cM4rL9Xt2y";

    it("verifies valid HMAC-SHA256 signature", () => {
      const validSignature = crypto
        .createHmac("sha256", testSecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const result = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret: testSecret,
      });

      expect(result).toBe(true);
    });

    it("rejects invalid signature", () => {
      const invalidSignature = crypto
        .createHmac("sha256", "wrong_secret")
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const result = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature: invalidSignature,
        secret: testSecret,
      });

      expect(result).toBe(false);
    });
  });
});
