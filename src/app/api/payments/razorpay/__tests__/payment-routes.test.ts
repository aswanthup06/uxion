import { describe, it, expect, vi } from "vitest";

// Mock server auth and razorpay
vi.mock("@/lib/supabase/server", () => ({
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
  getServerSupabase: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "job-123", mail: "hr@company.com", title: "Dev", company: "Acme" },
        error: null,
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  }),
  createServerAuthClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error("Unauthorized"),
      }),
    },
  }),
  getServiceSupabase: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  }),
}));

import { POST as createOrderPost } from "../create-order/route";
import { POST as verifyPost } from "../verify/route";

describe("Payment API Routes", () => {
  describe("create-order route", () => {
    it("handles free unlock gracefully when unauthenticated in free mode", async () => {
      process.env.NEXT_PUBLIC_FREE_EMAIL_UNLOCK = "true";
      const req = new Request("http://localhost:3000/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: "job-123" }),
      });

      const res = await createOrderPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isFree).toBe(true);
      expect(data.email).toBe("hr@company.com");
    });

    it("returns 401 when user is not authenticated in paid mode", async () => {
      process.env.NEXT_PUBLIC_FREE_EMAIL_UNLOCK = "false";
      const req = new Request("http://localhost:3000/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: "job-123" }),
      });

      const res = await createOrderPost(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Please log in");
    });
  });

  describe("verify route", () => {
    it("returns 401 when user is not authenticated", async () => {
      const req = new Request("http://localhost:3000/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: "job-123",
          orderId: "order_123",
          paymentId: "pay_123",
          signature: "sig_123",
        }),
      });

      const res = await verifyPost(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Please log in");
    });
  });
});
