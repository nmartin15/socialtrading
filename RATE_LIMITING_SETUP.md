# Rate Limiting Setup Guide

Rate limiting is **highly recommended** for production to prevent API abuse and DDoS attacks.

## Why You Need Rate Limiting

Without rate limiting:
- ❌ Bots can spam your API
- ❌ DDoS attacks will take down your server
- ❌ Unexpected infrastructure costs
- ❌ Poor user experience for legitimate users

With rate limiting:
- ✅ Protected from API abuse
- ✅ Predictable costs
- ✅ Better performance for real users
- ✅ Professional security standards

## Current Status

Rate limiting infrastructure is **prepared but not active** because it requires:
1. Upstash Redis account (free tier available)
2. Environment variables configured
3. npm packages installed

**Fallback:** Currently allows all requests (suitable for development only)

## Setup Instructions

### Step 1: Sign Up for Upstash (Free)

1. Go to https://upstash.com
2. Sign up with GitHub or email
3. Click "Create Database"
4. Choose:
   - **Type:** Redis
   - **Region:** Closest to your app deployment
   - **Name:** dexmirror-ratelimit
5. Click "Create"

### Step 2: Get Connection Details

After creating database:
1. Click on your database name
2. Find "REST API" section
3. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### Step 3: Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 4: Add to Environment Variables

Add to your `.env` file:

```bash
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_TOKEN="your-token-here"
```

### Step 5: Uncomment Code in `lib/rateLimit.ts`

Open `lib/rateLimit.ts` and:
1. Uncomment the imports at the top
2. Uncomment the `ratelimit` configuration
3. Uncomment the rate limiting logic in `checkRateLimit()`

### Step 6: Test Rate Limiting

```bash
# Start your dev server
npm run dev

# Test by making rapid requests
for i in {1..15}; do
  curl http://localhost:3000/api/traders
  echo "Request $i"
done

# After 10 requests, should receive 429 Too Many Requests
```

## Rate Limit Configuration

Current limits (can be adjusted in `lib/rateLimit.ts`):

| Endpoint Type | Limit | Window | Reason |
|--------------|-------|--------|--------|
| General API | 10 requests | 10 seconds | Normal browsing |
| Authentication | 5 attempts | 1 minute | Prevent brute force |
| Trade Submission | 20 trades | 1 hour | Prevent spam |
| Subscriptions | 10 actions | 1 hour | Prevent abuse |

### Adjusting Limits

Edit `lib/rateLimit.ts`:

```typescript
// More permissive (for high-traffic apps)
api: new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '10s'), // 30 per 10 seconds
  prefix: 'dexmirror:api',
}),

// More restrictive (for sensitive operations)
auth: new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '5m'), // 3 per 5 minutes
  prefix: 'dexmirror:auth',
}),
```

## Using Rate Limiting in API Routes

### Method 1: Automatic Helper

```typescript
import { applyRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = await applyRateLimit(request, 'trades');
  if (!rateLimitResult.success) {
    return rateLimitResult.response; // Returns 429 with headers
  }
  
  // Process request normally
  // ...
}
```

### Method 2: Manual Check

```typescript
import { checkRateLimit, addRateLimitHeaders } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const walletAddress = await requireAuth(request);
  
  // Check rate limit
  const result = await checkRateLimit(walletAddress, 'trades');
  
  if (!result.success) {
    const headers = new Headers();
    addRateLimitHeaders(headers, result);
    
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers }
    );
  }
  
  // Process request
  // ...
}
```

## Recommended Rate Limiting Strategy

### Public Endpoints (No Auth Required)
Use IP-based rate limiting:
```typescript
await applyRateLimit(request, 'api'); // Uses IP address
```

### Protected Endpoints (Auth Required)
Use wallet address:
```typescript
const walletAddress = await requireAuth(request);
await checkRateLimit(walletAddress, 'trades');
```

### By Endpoint Type

**High-frequency endpoints:**
- `GET /api/traders` - 30 per 10 seconds
- `GET /api/trades` - 30 per 10 seconds

**Normal endpoints:**
- `GET /api/analytics` - 10 per 10 seconds

**Write operations:**
- `POST /api/trades` - 20 per hour
- `POST /api/subscriptions` - 10 per hour

**Sensitive operations:**
- `POST /api/auth` - 5 per minute
- `DELETE /api/trades/[id]` - 10 per hour

## Monitoring Rate Limits

### Check Redis Usage

1. Go to Upstash dashboard
2. Click on your database
3. View "Metrics" tab
4. Monitor:
   - Request count
   - Memory usage
   - Error rate

### Add Logging

```typescript
import { logger } from '@/lib/logger';

const result = await checkRateLimit(identifier, 'trades');

if (!result.success) {
  logger.warn('Rate limit exceeded', {
    identifier,
    limitType: 'trades',
    reset: new Date(result.reset),
  });
}
```

## Cost Estimation

Upstash pricing (as of 2024):

**Free Tier:**
- 10,000 requests/day
- 256 MB storage
- Perfect for development and small apps

**Pay-as-you-go:**
- $0.2 per 100k requests
- $0.25 per GB storage

**Example costs:**
- 1M requests/month = ~$2/month
- 10M requests/month = ~$20/month

Much cheaper than the cost of a DDoS attack!

## Alternative: Simple In-Memory Rate Limiting

If you don't want to use Upstash, there's a built-in simple rate limiter:

```typescript
import { simpleRateLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  const allowed = simpleRateLimiter.check(
    ip,
    10, // max requests
    10000 // window in ms (10 seconds)
  );
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Process request
}
```

**Limitations:**
- ❌ Doesn't work across multiple servers
- ❌ Resets when server restarts
- ❌ Uses server memory
- ✅ Good for development
- ✅ No external dependencies

## FAQ

### Q: Is rate limiting required?
**A:** Not required for development, but **highly recommended** for production. Without it, your app is vulnerable to abuse.

### Q: What if I don't set it up?
**A:** The app will still work, but won't have rate limiting protection. A warning will be logged.

### Q: Can I use a different provider?
**A:** Yes! You can adapt the code to use:
- Redis (self-hosted)
- Vercel KV
- Cloudflare Workers KV
- Any Redis-compatible service

### Q: How much traffic can Upstash free tier handle?
**A:** 10,000 requests/day = about 300k/month. Good for early-stage apps.

### Q: What happens when rate limit is hit?
**A:** User receives a 429 status with headers indicating:
- How many requests are allowed
- How many remain
- When they can try again

### Q: Can users bypass rate limits?
**A:** Rate limits are enforced server-side, so users cannot bypass them. However:
- VPNs can change IP addresses
- Multiple wallets can be used
- Consider implementing additional security measures

## Testing

### Test Script

```bash
#!/bin/bash
# test-rate-limit.sh

echo "Testing rate limiting..."

for i in {1..15}; do
  response=$(curl -s -w "%{http_code}" http://localhost:3000/api/traders)
  status_code=${response: -3}
  
  if [ "$status_code" = "429" ]; then
    echo "✅ Request $i: Rate limited (429)"
  else
    echo "Request $i: Success ($status_code)"
  fi
  
  sleep 0.5
done

echo "Test complete!"
```

### Expected Output

```
Request 1: Success (200)
Request 2: Success (200)
...
Request 10: Success (200)
✅ Request 11: Rate limited (429)
✅ Request 12: Rate limited (429)
```

## Production Checklist

Before deploying:

- [ ] Upstash Redis configured
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Code uncommented in `lib/rateLimit.ts`
- [ ] Rate limiting added to critical endpoints
- [ ] Tested rate limits work
- [ ] Monitoring set up
- [ ] Appropriate limits configured for your use case

## Support

- **Upstash Docs:** https://docs.upstash.com/redis
- **Rate Limit Library:** https://github.com/upstash/ratelimit

---

**Status:** ⏳ Ready to configure when you're ready for production
**Priority:** High (before public launch)
**Effort:** 15-30 minutes setup

