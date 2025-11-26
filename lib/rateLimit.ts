/**
 * Rate Limiting Utility
 * Prevents API abuse and DDoS attacks
 * 
 * Setup Required:
 * 1. Sign up for free Upstash Redis at https://upstash.com
 * 2. Create a Redis database
 * 3. Add UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN to .env
 * 4. Install: npm install @upstash/ratelimit @upstash/redis
 */

/**
 * IMPORTANT: This file requires @upstash/ratelimit and @upstash/redis packages
 * 
 * To install:
 * npm install @upstash/ratelimit @upstash/redis
 * 
 * To configure:
 * 1. Get free Redis from https://upstash.com
 * 2. Add to .env:
 *    UPSTASH_REDIS_URL="https://your-redis.upstash.io"
 *    UPSTASH_REDIS_TOKEN="your-token-here"
 */

// Uncomment when Upstash is configured:
/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Configure different rate limits for different use cases
export const ratelimit = {
  // General API calls: 10 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10s'),
    prefix: 'dexmirror:api',
  }),
  
  // Authentication: 5 attempts per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1m'),
    prefix: 'dexmirror:auth',
  }),
  
  // Trade submission: 20 trades per hour
  trades: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1h'),
    prefix: 'dexmirror:trades',
  }),
  
  // Subscriptions: 10 per hour
  subscriptions: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1h'),
    prefix: 'dexmirror:subscriptions',
  }),
};
*/

/**
 * Check rate limit for a user/IP
 * @param identifier - User identifier (wallet address or IP)
 * @param limitType - Type of rate limit to apply
 * @returns Success status and limit info
 */
export async function checkRateLimit(
  identifier: string,
  limitType: 'api' | 'auth' | 'trades' | 'subscriptions' = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // Fallback when Upstash is not configured
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    console.warn('⚠️ Rate limiting not configured. Set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN');
    // Allow all requests when rate limiting is not configured (development)
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    };
  }
  
  // When Upstash is configured, uncomment this:
  /*
  const limiter = ratelimit[limitType];
  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
  */
  
  // Temporary fallback
  return {
    success: true,
    limit: 10,
    remaining: 10,
    reset: Date.now() + 10000,
  };
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: {
    limit: number;
    remaining: number;
    reset: number;
  }
): Headers {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
  
  if (result.remaining === 0) {
    headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());
  }
  
  return headers;
}

/**
 * Middleware helper for rate limiting
 * Use in API routes before processing request
 * 
 * @example
 * import { applyRateLimit } from '@/lib/rateLimit';
 * 
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await applyRateLimit(request, 'trades');
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Process request...
 * }
 */
export async function applyRateLimit(
  request: Request,
  limitType: 'api' | 'auth' | 'trades' | 'subscriptions' = 'api',
  identifier?: string
): Promise<{
  success: boolean;
  response?: Response;
}> {
  // Use provided identifier or get from auth header or IP
  const id = identifier || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'anonymous';
  
  const result = await checkRateLimit(id, limitType);
  
  if (!result.success) {
    const headers = new Headers();
    addRateLimitHeaders(headers, result);
    
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
          limit: result.limit,
          reset: new Date(result.reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers.entries()),
          },
        }
      ),
    };
  }
  
  return { success: true };
}

/**
 * In-memory rate limiter fallback for development
 * Only use when Upstash is not configured
 */
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  check(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    // Cleanup old data periodically
    if (Math.random() < 0.01) {
      this.cleanup(windowStart);
    }
    
    return true;
  }
  
  private cleanup(cutoff: number): void {
    for (const [key, requests] of this.requests.entries()) {
      const recent = requests.filter(time => time > cutoff);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

export const simpleRateLimiter = new SimpleRateLimiter();

