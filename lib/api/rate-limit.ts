// =============================================================================
// Rate Limiting Middleware
// In-memory rate limiter for API endpoints
// =============================================================================

import { NextRequest } from "next/server";
import { errorResponse, jsonResponse, StatusCodes } from "./response";

// Rate limit configuration
export const RateLimitConfig = {
  public: {
    requests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  admin: {
    requests: 500,
    windowMs: 60 * 1000, // 1 minute
  },
  search: {
    requests: 30,
    windowMs: 60 * 1000, // 1 minute (more restrictive for expensive searches)
  },
} as const;

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a hash of user-agent + some other identifiers
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua-${hashString(userAgent)}`;
}

/**
 * Simple string hash for fallback identification
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Rate limit result
 */
export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof RateLimitConfig = "public"
): RateLimitResult {
  cleanupStore();
  
  const config = RateLimitConfig[type];
  const clientId = getClientId(request);
  const key = `${type}:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  const remaining = Math.max(0, config.requests - entry.count);
  const reset = Math.ceil(entry.resetTime / 1000); // Unix timestamp in seconds
  
  return {
    success: entry.count <= config.requests,
    limit: config.requests,
    remaining,
    reset,
  };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult
): Record<string, string> {
  return {
    ...headers,
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  type: keyof typeof RateLimitConfig = "public"
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const result = checkRateLimit(request, type);
    
    if (!result.success) {
      return jsonResponse(
        errorResponse("RATE_LIMITED", "Too many requests. Please try again later."),
        StatusCodes.TOO_MANY_REQUESTS,
        addRateLimitHeaders({}, result)
      );
    }
    
    // Call original handler
    const response = await handler(request, ...args);
    
    // Clone response and add rate limit headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Limit", String(result.limit));
    newHeaders.set("X-RateLimit-Remaining", String(result.remaining));
    newHeaders.set("X-RateLimit-Reset", String(result.reset));
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}
