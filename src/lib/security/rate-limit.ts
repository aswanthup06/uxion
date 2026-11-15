// src/lib/security/rate-limit.ts
// In-memory sliding-window rate limiter for serverless route handlers.

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

const stores = new Map<string, Map<string, number[]>>();

export function checkRateLimit(
  namespace: string,
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, maxRequests: 15 }
): { allowed: boolean; retryAfterSec: number; remaining: number } {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map<string, number[]>();
    stores.set(namespace, store);
  }

  const now = Date.now();
  const windowStart = now - options.windowMs;
  const timestamps = (store.get(key) || []).filter((ts) => ts > windowStart);

  if (timestamps.length >= options.maxRequests) {
    const oldest = timestamps[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    store.set(key, timestamps);
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  // Prevent memory growth in long-running processes
  if (store.size > 2000) {
    for (const [k, vals] of store.entries()) {
      if (vals.every((v) => v <= windowStart)) {
        store.delete(k);
      }
    }
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: options.maxRequests - timestamps.length,
  };
}

export function getClientIp(req: Request | { headers: { get: (name: string) => string | null } }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "anonymous";
}
