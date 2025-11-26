# Critical Fixes Checklist - DexMirror

This checklist covers **CRITICAL** security and stability issues that MUST be fixed before any production deployment.

## 🔴 BLOCKERS - Fix Immediately

### 1. Database Migration (PostgreSQL)
**Current Issue:** Using SQLite which cannot handle concurrent writes  
**Risk Level:** CRITICAL - Data corruption possible

- [ ] Update `prisma/schema.prisma` datasource to `postgresql`
- [ ] Set up PostgreSQL database (local or cloud)
- [ ] Update `DATABASE_URL` in environment variables
- [ ] Run migrations: `npx prisma migrate dev --name init_postgresql`
- [ ] Update README.md instructions
- [ ] Test all database operations

**Files to modify:**
- `prisma/schema.prisma` (line 8-11)
- `env.example` (line 2)
- `README.md` (line 10, 20, 41-50)

---

### 2. Authentication System
**Current Issue:** No wallet signature verification - anyone can impersonate any wallet  
**Risk Level:** CRITICAL - Complete security breach

- [ ] Install dependencies: `npm install jose siwe`
- [ ] Create `lib/auth.ts` with signature verification
- [ ] Update middleware to verify signatures
- [ ] Add JWT session management
- [ ] Update API routes to check authentication
- [ ] Add authentication to frontend

**Files to create:**
- `lib/auth.ts`
- `lib/session.ts`

**Files to modify:**
- `middleware.ts`
- `app/api/trades/route.ts`
- `app/api/traders/route.ts`
- All protected API routes

**Example Implementation:**
```typescript
// lib/auth.ts
import { verifyMessage } from 'viem';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

export async function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return valid;
  } catch {
    return false;
  }
}

export async function createAuthToken(walletAddress: string): Promise<string> {
  return await new SignJWT({ walletAddress })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.walletAddress as string;
  } catch {
    return null;
  }
}
```

---

### 3. Environment Variable Validation
**Current Issue:** App runs without required config, fails at runtime  
**Risk Level:** HIGH - Unpredictable failures

- [ ] Install dependency: `npm install zod`
- [ ] Create `lib/env.ts` with validation schema
- [ ] Import in `next.config.js` to fail at build time
- [ ] Update `.env.example` with all required variables
- [ ] Add `JWT_SECRET` to environment variables

**File to create:**
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Web3
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_CODEX_RPC_URL: z.string().url(),
  NEXT_PUBLIC_CODEX_CHAIN_ID: z.string().default('1776'),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);

// Type-safe environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
```

**Add to `.env.example`:**
```bash
JWT_SECRET="generate-a-random-32-character-string-here-do-not-use-this-example"
```

---

### 4. Rate Limiting
**Current Issue:** API can be abused with unlimited requests  
**Risk Level:** HIGH - DDoS vulnerability, cost explosion

- [ ] Install: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Set up Upstash Redis (free tier available)
- [ ] Create `lib/rateLimit.ts`
- [ ] Add rate limiting to all API routes
- [ ] Add rate limit headers to responses

**Files to create:**
```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10s'),
  prefix: 'dexmirror',
});

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  return { success, limit, remaining, reset };
}
```

**Usage in API routes:**
```typescript
// app/api/trades/route.ts
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const walletAddress = // ... get from auth
  
  const { success, limit, remaining, reset } = await checkRateLimit(walletAddress);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }
  
  // ... rest of handler
}
```

**Add to `.env.example`:**
```bash
UPSTASH_REDIS_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_TOKEN="your-token"
```

---

### 5. Input Sanitization
**Current Issue:** User input (bio, username, notes) not sanitized - XSS risk  
**Risk Level:** HIGH - Cross-site scripting attacks

- [ ] Install: `npm install isomorphic-dompurify`
- [ ] Create `lib/sanitize.ts`
- [ ] Sanitize all user inputs in API routes
- [ ] Add length limits
- [ ] Test with malicious inputs

**File to create:**
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeText(input: string, maxLength: number = 5000): string {
  if (!input) return '';
  
  // Remove HTML tags
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  // Trim whitespace and limit length
  return clean.trim().slice(0, maxLength);
}

export function sanitizeUsername(input: string): string {
  if (!input) return '';
  
  // Only alphanumeric, underscore, hyphen
  return input
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 30)
    .toLowerCase();
}

export function sanitizeWalletAddress(input: string): string {
  if (!input) return '';
  
  // Must be valid Ethereum address format
  const cleaned = input.trim().toLowerCase();
  
  if (!/^0x[a-f0-9]{40}$/i.test(cleaned)) {
    throw new Error('Invalid wallet address format');
  }
  
  return cleaned;
}
```

**Apply in API routes:**
```typescript
// app/api/users/route.ts
import { sanitizeText, sanitizeUsername, sanitizeWalletAddress } from '@/lib/sanitize';

const user = await prisma.user.create({
  data: {
    walletAddress: sanitizeWalletAddress(body.walletAddress),
    username: sanitizeUsername(body.username),
    bio: sanitizeText(body.bio, 500),
  },
});
```

---

### 6. Fix TypeScript `any` Types
**Current Issue:** 72 instances of `any` - type safety compromised  
**Risk Level:** MEDIUM-HIGH - Runtime errors, harder debugging

Priority files to fix:
- [ ] `app/api/traders/route.ts` (line 16)
- [ ] `app/api/analytics/route.ts`
- [ ] `lib/tradeScanner.ts` (line 76, 79)
- [ ] Test files

**Example fix:**
```typescript
// app/api/traders/route.ts - BEFORE
const where: any = {};

// app/api/traders/route.ts - AFTER
interface TraderWhereInput {
  verified?: boolean;
}
const where: TraderWhereInput = {};
```

---

### 7. Error Boundaries
**Current Issue:** No React error boundaries - entire app crashes on error  
**Risk Level:** MEDIUM-HIGH - Poor UX

- [ ] Create `components/ErrorBoundary.tsx`
- [ ] Wrap app in `app/layout.tsx`
- [ ] Create fallback UI component
- [ ] Add error logging

**File to create:**
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Log to monitoring service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update `app/layout.tsx`:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 🟡 High Priority - Fix Within 1 Week

### 8. Replace console.log with Proper Logging
- [ ] Install: `npm install pino pino-pretty`
- [ ] Create `lib/logger.ts`
- [ ] Replace all console.log/error/warn
- [ ] Configure log levels for production

### 9. Add Monitoring (Sentry)
- [ ] Install: `npm install @sentry/nextjs`
- [ ] Run: `npx @sentry/wizard@latest -i nextjs`
- [ ] Configure error tracking
- [ ] Add performance monitoring

### 10. Database Migrations Strategy
- [ ] Stop using `prisma db push`
- [ ] Create migrations for all schema changes
- [ ] Document migration process in README

### 11. Redis Caching
- [ ] Set up Redis (can use Upstash free tier)
- [ ] Cache trader list
- [ ] Cache performance metrics
- [ ] Add cache invalidation

### 12. Comprehensive Health Check
- [ ] Test database connectivity
- [ ] Test Redis connectivity
- [ ] Test blockchain RPC
- [ ] Return proper status codes

### 13. CSRF Protection
- [ ] Add origin checking to middleware
- [ ] Implement CSRF tokens for state-changing operations
- [ ] Configure CORS properly

### 14. Increase Test Coverage
- [ ] Test copy trading service
- [ ] Test trade scanner
- [ ] Test authentication flow
- [ ] Test rate limiting
- [ ] Aim for 80%+ coverage

---

## Verification Checklist

Before considering the app production-ready:

- [ ] All PostgreSQL migrations work
- [ ] Authentication works end-to-end
- [ ] Rate limiting prevents abuse
- [ ] All user inputs are sanitized
- [ ] No TypeScript `any` in critical paths
- [ ] Error boundaries catch React errors
- [ ] All environment variables validated
- [ ] Health endpoint shows all services
- [ ] Monitoring is capturing errors
- [ ] Logs are properly structured
- [ ] Database has proper indexes
- [ ] All tests passing (unit + e2e)
- [ ] No console.log in production code
- [ ] Security headers configured
- [ ] HTTPS enforced in production

---

## Estimated Timeline

| Task | Estimated Time |
|------|----------------|
| 1. PostgreSQL Migration | 4-6 hours |
| 2. Authentication System | 8-12 hours |
| 3. Environment Validation | 2-3 hours |
| 4. Rate Limiting | 3-4 hours |
| 5. Input Sanitization | 4-6 hours |
| 6. Fix TypeScript `any` | 6-8 hours |
| 7. Error Boundaries | 2-3 hours |

**Total: 29-42 hours (4-6 business days for 1 developer)**

---

## Testing After Fixes

After implementing critical fixes, test:

1. **Authentication Flow**
   - Sign message with wallet
   - Verify JWT is created
   - Try accessing protected routes without auth (should fail)
   - Try with expired token (should fail)

2. **Rate Limiting**
   - Make 11 requests rapidly (11th should fail)
   - Wait 10 seconds, should work again

3. **Input Sanitization**
   - Try submitting `<script>alert('xss')</script>` in bio
   - Should be sanitized

4. **PostgreSQL**
   - Submit multiple trades concurrently
   - No race conditions or errors

5. **Error Handling**
   - Simulate API errors
   - App should not crash
   - User should see friendly error

---

## Questions?

Review the full audit in `CODEBASE_AUDIT.md` for detailed explanations and code examples.

**DO NOT DEPLOY TO PRODUCTION UNTIL ALL 🔴 CRITICAL ITEMS ARE COMPLETE.**

