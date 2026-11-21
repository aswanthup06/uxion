import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";
import * as adminAuth from "@/lib/auth/admin";

describe("src/middleware.ts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string, cookieValue?: string) {
    const req = new NextRequest(new URL(url, "http://localhost:3000"));
    if (cookieValue) {
      req.cookies.set("admin-auth", cookieValue);
    }
    return req;
  }

  it("redirects unauthorized /admin request to /admin/login with 'from' query param", async () => {
    vi.spyOn(adminAuth, "verifyAdminToken").mockResolvedValue(false);

    const req = createMockRequest("http://localhost:3000/admin/dashboard");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/admin/login");
    expect(location).toContain("from=%2Fadmin%2Fdashboard");
  });

  it("allows access to /admin/login without redirection even without auth cookie", async () => {
    const req = createMockRequest("http://localhost:3000/admin/login");
    const res = await middleware(req);

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows access to /admin routes when valid admin token is present in cookie", async () => {
    vi.spyOn(adminAuth, "verifyAdminToken").mockResolvedValue(true);

    const req = createMockRequest("http://localhost:3000/admin/dashboard", "valid-signed-token");
    const res = await middleware(req);

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows public non-admin routes without redirection", async () => {
    const req = createMockRequest("http://localhost:3000/jobs");
    const res = await middleware(req);

    expect(res.status).not.toBe(307);
  });
});
