import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// 1. RATE LIMITING PROVIDERS
// ============================================================================

export interface RateLimiterProvider {
  /**
   * Checks if a given identifier has exceeded the limit.
   * @param identifier - e.g., IP address or User ID
   * @param limit - max requests
   * @param windowMs - time window in ms
   * @returns boolean true if allowed, false if rate limited
   */
  check(identifier: string, limit: number, windowMs: number): Promise<boolean>;
}

export class MemoryRateLimiter implements RateLimiterProvider {
  private store = new Map<string, { count: number; expiresAt: number }>();

  async check(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || record.expiresAt < now) {
      this.store.set(identifier, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count += 1;
    return true;
  }
}

export class RedisRateLimiter implements RateLimiterProvider {
  async check(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    // TODO: Implement Upstash Redis or ioredis rate limiting logic
    // This is a stub for future enterprise scaling
    console.warn("RedisRateLimiter not implemented yet, using fallback true");
    return true;
  }
}

// Current active provider (can be swapped via env variables)
const activeRateLimiter = new MemoryRateLimiter();

// ============================================================================
// 2. CSRF ABSTRACTION LAYER
// ============================================================================

export class CSRFProtector {
  static async validate(req: NextRequest): Promise<boolean> {
    // Only mutating requests need CSRF protection
    const method = req.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    // Strictly validate Origin and Referer for non-GET requests if present
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) return false;
    }

    if (referer && host) {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) return false;
    }

    // Double-submit token logic stub for future
    const csrfHeader = req.headers.get("x-csrf-token");
    // If strict token validation is enabled later:
    // const csrfCookie = req.cookies.get("csrf_token")?.value;
    // if (!csrfHeader || csrfHeader !== csrfCookie) return false;

    return true;
  }
}

// ============================================================================
// 3. NOSQL INJECTION SANITIZATION
// ============================================================================

export function sanitizePayload(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    // Strip keys starting with $ or . (MongoDB operators)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizePayload(value);
  }
  
  return sanitized;
}

// ============================================================================
// 4. CENTRALIZED PIPELINE
// ============================================================================

interface SecurityOptions<T> {
  requireCsrf?: boolean;
  rateLimit?: { key: string; limit: number; windowMs: number };
  schema?: z.ZodSchema<T>;
}

export async function processSecurityPipeline<T = any>(
  req: NextRequest,
  options: SecurityOptions<T>
): Promise<{ success: false; response: NextResponse } | { success: true; sanitizedBody: T }> {
  // 1. Rate Limiting
  if (options.rateLimit) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const key = `${options.rateLimit.key}_${ip}`;
    const allowed = await activeRateLimiter.check(key, options.rateLimit.limit, options.rateLimit.windowMs);
    if (!allowed) {
      return { success: false, response: NextResponse.json({ error: "Too Many Requests" }, { status: 429 }) };
    }
  }

  // 2. CSRF Protection
  if (options.requireCsrf !== false) {
    const isCsrfSafe = await CSRFProtector.validate(req);
    if (!isCsrfSafe) {
      return { success: false, response: NextResponse.json({ error: "CSRF token mismatch or invalid origin" }, { status: 403 }) };
    }
  }

  // 3. Parse, Sanitize, and Validate Body
  let parsedData: any = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
    try {
      const cloned = req.clone();
      const rawBody = await cloned.json();
      
      // Sanitization BEFORE validation
      const sanitizedBody = sanitizePayload(rawBody);

      if (options.schema) {
        const result = options.schema.safeParse(sanitizedBody);
        if (!result.success) {
          return { success: false, response: NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 }) };
        }
        parsedData = result.data;
      } else {
        parsedData = sanitizedBody;
      }
    } catch (e) {
      return { success: false, response: NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }) };
    }
  }

  return { success: true, sanitizedBody: parsedData };
}
