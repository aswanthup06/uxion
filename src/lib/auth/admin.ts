// src/lib/auth/admin.ts
// Cryptographic HMAC-SHA256 session token management for administrative routes.
// Compatible with both Node.js server environments and Next.js Edge Middleware.

const MAX_ADMIN_TOKEN_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getAdminSecretKey(): Promise<CryptoKey> {
  const secret =
    process.env.ADMIN_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "zenoway-protected-admin-hmac-fallback-key-2025";

  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed admin session token.
 * Format: `<timestamp>.<nonce>.<hmacSignatureHex>`
 */
export async function createAdminToken(): Promise<string> {
  const key = await getAdminSecretKey();
  const encoder = new TextEncoder();
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const payload = `${timestamp}.${nonce}`;

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}.${signatureHex}`;
}

/**
 * Verifies that an admin token is genuine, untampered, and unexpired.
 */
export async function verifyAdminToken(token?: string | null): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [timestampStr, nonce, signatureHex] = parts;
  if (!timestampStr || !nonce || !signatureHex || signatureHex.length !== 64) {
    return false;
  }

  const timestamp = Number(timestampStr);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  // Reject tokens from the future (> 5 min skew) or older than 24 hours
  if (timestamp > now + 5 * 60 * 1000 || now - timestamp > MAX_ADMIN_TOKEN_AGE_MS) {
    return false;
  }

  try {
    const key = await getAdminSecretKey();
    const encoder = new TextEncoder();
    const payload = `${timestampStr}.${nonce}`;

    const sigBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      const byteVal = parseInt(signatureHex.slice(i * 2, i * 2 + 2), 16);
      if (isNaN(byteVal)) return false;
      sigBytes[i] = byteVal;
    }

    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payload)
    );
  } catch {
    return false;
  }
}

/**
 * Performs timing-safe equality comparison between two strings to defend
 * against timing attacks on secret/password comparisons.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);

  if (bufA.byteLength !== bufB.byteLength) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufA.byteLength; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}

interface RequestLike {
  cookies?: {
    get: (name: string) => { value: string } | undefined;
  };
  headers: {
    get: (name: string) => string | null;
  };
}

/**
 * Comprehensive server-side admin authorization verifier.
 * Checks for a valid signed admin session cookie or an authorized Bearer token.
 */
export async function isAuthorizedAdminRequest(req: RequestLike): Promise<boolean> {
  // 1. Check signed cookie
  let token: string | undefined;

  if (req.cookies && typeof req.cookies.get === "function") {
    token = req.cookies.get("admin-auth")?.value;
  }

  if (!token && typeof req.headers?.get === "function") {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)admin-auth=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (token && (await verifyAdminToken(token))) {
    return true;
  }

  // 2. Check Authorization Bearer header (for automated scripts or service workers)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (bearer) {
      const adminKey = process.env.ADMIN_KEY?.trim();
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

      if (adminKey && timingSafeEqualStrings(bearer, adminKey)) {
        return true;
      }
      if (serviceRoleKey && timingSafeEqualStrings(bearer, serviceRoleKey)) {
        return true;
      }
      if (await verifyAdminToken(bearer)) {
        return true;
      }
    }
  }

  return false;
}
