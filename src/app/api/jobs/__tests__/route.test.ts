import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import * as adminAuth from "@/lib/auth/admin";
import * as supabaseJobs from "@/lib/supabase/jobs";
import * as supabaseServer from "@/lib/supabase/server";
import * as emailValidation from "@/lib/validation/email";

vi.mock("@/lib/supabase/jobs", () => ({
  getAllJobs: vi.fn(),
  getJobById: vi.fn(),
  getPendingJobs: vi.fn(),
  approveJob: vi.fn(),
  createJob: vi.fn(),
  updateJob: vi.fn(),
  deleteJob: vi.fn(),
  getRecentJobCountByUser: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(),
  getServiceSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/validation/email", () => ({
  validateEmailDomain: vi.fn().mockResolvedValue({ valid: true }),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("API /api/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(emailValidation, "validateEmailDomain").mockResolvedValue({ valid: true });
  });

  describe("GET /api/jobs", () => {
    it("returns 401 when check_limit=true is requested without authentication", async () => {
      vi.spyOn(supabaseServer, "createServerAuthClient").mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as unknown as Awaited<ReturnType<typeof supabaseServer.createServerAuthClient>>);

      const req = new NextRequest("http://localhost:3000/api/jobs?check_limit=true");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Authentication required");
    });

    it("returns jobs list successfully on public GET", async () => {
      const mockJobs = [
        { id: "1", title: "Frontend Engineer", company: "Zenoway", status: "published" },
      ];
      vi.spyOn(supabaseJobs, "getAllJobs").mockResolvedValue(
        mockJobs as unknown as Awaited<ReturnType<typeof supabaseJobs.getAllJobs>>
      );

      const req = new NextRequest("http://localhost:3000/api/jobs");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockJobs);
    });
  });

  describe("POST /api/jobs", () => {
    it("rejects unauthorized public requests without logged-in session", async () => {
      vi.spyOn(adminAuth, "isAuthorizedAdminRequest").mockResolvedValue(false);
      vi.spyOn(supabaseServer, "createServerAuthClient").mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as unknown as Awaited<ReturnType<typeof supabaseServer.createServerAuthClient>>);

      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        body: JSON.stringify({ title: "New Job" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Authentication required");
    });

    it("returns 400 when missing required fields (title, company, description)", async () => {
      // Simulate authenticated admin
      vi.spyOn(adminAuth, "isAuthorizedAdminRequest").mockResolvedValue(true);

      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: "Senior UI Designer",
          company: "", // Missing company
          description: "Sample description",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("returns 400 when title exceeds max length of 120 characters", async () => {
      vi.spyOn(adminAuth, "isAuthorizedAdminRequest").mockResolvedValue(true);

      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: "A".repeat(125),
          company: "Zenoway",
          description: "Valid description",
          mail: "jobs@zenoway.com",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Job title cannot exceed 120 characters");
    });

    it("returns 400 when application email is invalid", async () => {
      vi.spyOn(adminAuth, "isAuthorizedAdminRequest").mockResolvedValue(true);
      vi.spyOn(emailValidation, "validateEmailDomain").mockResolvedValue({
        valid: false,
        reason: "Invalid MX domain records",
      });

      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: "UI Developer",
          company: "Zenoway",
          description: "Valid description",
          mail: "fake@invalid-nonexistent-domain.xyz",
          location: "Bengaluru",
          workMode: "Onsite",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid MX domain records");
    });

    it("returns 400 for on-site/hybrid job with missing physical location", async () => {
      vi.spyOn(adminAuth, "isAuthorizedAdminRequest").mockResolvedValue(true);

      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: "UI Developer",
          company: "Zenoway",
          description: "Valid description",
          mail: "careers@zenoway.com",
          workMode: "Onsite",
          location: "",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Physical work location");
    });
  });
});
