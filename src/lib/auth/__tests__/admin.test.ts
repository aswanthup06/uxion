import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createAdminToken,
  verifyAdminToken,
  timingSafeEqualStrings,
  isAuthorizedAdminRequest,
} from "../admin";

describe("src/lib/auth/admin.ts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, ADMIN_KEY: "test-super-secret-admin-key-12345678" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Token Generation and Verification", () => {
    it("creates a token and successfully verifies it", async () => {
      const token = await createAdminToken();
      expect(typeof token).toBe("string");

      const parts = token.split(".");
      expect(parts).toHaveLength(3);

      const isValid = await verifyAdminToken(token);
      expect(isValid).toBe(true);
    });

    it("rejects null, undefined, or empty tokens", async () => {
      expect(await verifyAdminToken(null)).toBe(false);
      expect(await verifyAdminToken(undefined)).toBe(false);
      expect(await verifyAdminToken("")).toBe(false);
    });

    it("rejects malformed token structures", async () => {
      expect(await verifyAdminToken("invalid-token-without-dots")).toBe(false);
      expect(await verifyAdminToken("part1.part2")).toBe(false);
      expect(await verifyAdminToken("part1.part2.part3.part4")).toBe(false);
    });

    it("rejects token with tampered payload or signature", async () => {
      const token = await createAdminToken();
      const [ts, nonce, sig] = token.split(".");

      // Tamper signature
      const tamperedSig = sig.slice(0, -2) + (sig.endsWith("0") ? "1" : "0");
      expect(await verifyAdminToken(`${ts}.${nonce}.${tamperedSig}`)).toBe(false);

      // Tamper nonce
      expect(await verifyAdminToken(`${ts}.tampered-nonce.${sig}`)).toBe(false);
    });

    it("rejects expired tokens older than 24 hours", async () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const fakeToken = `${oldTimestamp}.fake-nonce.${"0".repeat(64)}`;
      expect(await verifyAdminToken(fakeToken)).toBe(false);
    });

    it("rejects tokens with future timestamps > 5 minutes", async () => {
      const futureTimestamp = Date.now() + 10 * 60 * 1000;
      const fakeToken = `${futureTimestamp}.fake-nonce.${"0".repeat(64)}`;
      expect(await verifyAdminToken(fakeToken)).toBe(false);
    });

    it("throws an explicit error if neither ADMIN_KEY nor SUPABASE_SERVICE_ROLE_KEY is configured", async () => {
      delete process.env.ADMIN_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      await expect(createAdminToken()).rejects.toThrowError(/ADMIN_KEY env var is not set/);
    });
  });

  describe("timingSafeEqualStrings", () => {
    it("returns true for exact matching strings", () => {
      expect(timingSafeEqualStrings("secret_key_123", "secret_key_123")).toBe(true);
      expect(timingSafeEqualStrings("", "")).toBe(true);
    });

    it("returns false for different strings of same length", () => {
      expect(timingSafeEqualStrings("abcdef12", "abcdef13")).toBe(false);
    });

    it("returns false for different lengths", () => {
      expect(timingSafeEqualStrings("short", "longer_string")).toBe(false);
    });

    it("returns false for non-string types", () => {
      // @ts-expect-error testing invalid runtime types
      expect(timingSafeEqualStrings(null, "test")).toBe(false);
      // @ts-expect-error testing invalid runtime types
      expect(timingSafeEqualStrings("test", undefined)).toBe(false);
    });
  });

  describe("isAuthorizedAdminRequest", () => {
    it("authorizes request with valid admin-auth cookie", async () => {
      const token = await createAdminToken();
      const mockReq = {
        cookies: {
          get: (name: string) => (name === "admin-auth" ? { value: token } : undefined),
        },
        headers: {
          get: () => null,
        },
      };

      const authorized = await isAuthorizedAdminRequest(mockReq);
      expect(authorized).toBe(true);
    });

    it("authorizes request with valid cookie parsed from Cookie header", async () => {
      const token = await createAdminToken();
      const mockReq = {
        headers: {
          get: (header: string) =>
            header.toLowerCase() === "cookie" ? `session=xyz; admin-auth=${token}; other=1` : null,
        },
      };

      const authorized = await isAuthorizedAdminRequest(mockReq);
      expect(authorized).toBe(true);
    });

    it("authorizes request with Bearer matching ADMIN_KEY", async () => {
      const mockReq = {
        headers: {
          get: (header: string) =>
            header.toLowerCase() === "authorization" ? "Bearer test-super-secret-admin-key-12345678" : null,
        },
      };

      const authorized = await isAuthorizedAdminRequest(mockReq);
      expect(authorized).toBe(true);
    });

    it("denies unauthenticated requests", async () => {
      const mockReq = {
        headers: {
          get: () => null,
        },
      };

      const authorized = await isAuthorizedAdminRequest(mockReq);
      expect(authorized).toBe(false);
    });
  });
});
