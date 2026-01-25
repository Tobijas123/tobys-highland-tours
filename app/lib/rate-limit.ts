/**
 * Simple in-memory rate limiter (resets on server restart)
 * For production, consider using Redis or similar
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitConfig = {
  maxRequests: number
  windowMs: number
}

// Separate stores for different endpoints
const stores = new Map<string, Map<string, RateLimitEntry>>()

function getStore(storeName: string): Map<string, RateLimitEntry> {
  let store = stores.get(storeName)
  if (!store) {
    store = new Map()
    stores.set(storeName, store)
  }
  return store
}

/**
 * Check if an IP is rate limited for a specific endpoint
 * @param storeName - Name of the rate limit store (e.g., 'contact', 'bookings')
 * @param ip - Client IP address
 * @param config - Rate limit configuration
 * @returns true if rate limited, false if allowed
 */
export function isRateLimited(
  storeName: string,
  ip: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 1000 }
): boolean {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return false
  }

  const store = getStore(storeName)
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + config.windowMs })
    return false
  }

  if (entry.count >= config.maxRequests) {
    return true
  }

  entry.count++
  return false
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

// Preset configurations
export const RATE_LIMITS = {
  contact: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  bookings: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
} as const
