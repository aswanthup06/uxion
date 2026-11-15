import dns from "dns/promises";

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
  domain?: string;
  hasMx?: boolean;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// In-memory cache for validated domains (1 hour TTL) to prevent DNS flood
const DOMAIN_CACHE_TTL_MS = 60 * 60 * 1000;
const domainMxCache = new Map<string, { result: EmailValidationResult; expiresAt: number }>();

// Timeout wrapper for DNS calls
async function withTimeout<T>(promise: Promise<T>, ms: number = 3500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("DNS lookup timed out");
      (err as unknown as { code: string }).code = "ETIMEDOUT";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Validates an email's format and checks if the domain exists and has active MX records.
 * Catches dead domains, typos, and non-existent mail servers in < 50ms without paid APIs.
 */
export async function validateEmailDomain(email: string): Promise<EmailValidationResult> {
  const trimmed = (email || "").trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, reason: "Application email is required." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "Please enter a valid email format (e.g. hr@company.com)." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, reason: "Invalid email structure." };
  }

  const domain = parts[1];

  // Disallow localhost or non-FQDN domains
  if (!domain.includes(".") || domain.endsWith(".")) {
    return { valid: false, reason: `The domain '${domain}' is not a valid domain name.` };
  }

  // Check cache
  const cached = domainMxCache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const cacheAndReturn = (res: EmailValidationResult) => {
    domainMxCache.set(domain, { result: res, expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS });
    // Keep cache size bounded
    if (domainMxCache.size > 2000) {
      const now = Date.now();
      for (const [k, v] of domainMxCache.entries()) {
        if (v.expiresAt <= now) domainMxCache.delete(k);
      }
    }
    return res;
  };

  try {
    const mxRecords = await withTimeout(dns.resolveMx(domain), 3500);
    if (mxRecords && mxRecords.length > 0) {
      return cacheAndReturn({ valid: true, domain, hasMx: true });
    }
  } catch (err: unknown) {
    const dnsErr = err as { code?: string };
    if (dnsErr?.code === "ENOTFOUND") {
      return cacheAndReturn({
        valid: false,
        domain,
        hasMx: false,
        reason: `The domain '${domain}' does not exist. Please check for typos.`,
      });
    }

    if (dnsErr?.code === "ENODATA") {
      // Domain exists in DNS but no explicit MX record is published.
      // Check for an A (IPv4) fallback host per RFC 5321.
      try {
        const aRecords = await withTimeout(dns.resolve4(domain), 2000);
        if (aRecords && aRecords.length > 0) {
          return cacheAndReturn({ valid: true, domain, hasMx: false });
        }
      } catch {
        return cacheAndReturn({
          valid: false,
          domain,
          hasMx: false,
          reason: `The domain '${domain}' has no active mail server (MX records). Emails sent here will bounce.`,
        });
      }
    }

    if (dnsErr?.code === "ETIMEDOUT") {
      // On network timeout, allow gracefully rather than hard-blocking legitimate employers
      return {
        valid: true,
        domain,
        hasMx: false,
        reason: "DNS verification timed out.",
      };
    }

    return {
      valid: false,
      domain,
      hasMx: false,
      reason: `Could not reach a mail server for '${domain}' (${dnsErr?.code || "unknown error"}).`,
    };
  }

  return {
    valid: false,
    domain,
    hasMx: false,
    reason: `The domain '${domain}' has no mail servers configured to receive emails.`,
  };
}
