# Security Implementation Guide - DexMirror

This guide walks you through implementing the critical security fixes for DexMirror.

## ✅ Completed Security Implementations

The following security features have been implemented:

### 1. ✅ Environment Variable Validation (`lib/env.ts`)
- **What:** Validates all required environment variables on startup
- **Why:** Prevents app from running with missing configuration
- **Status:** COMPLETE - App will fail fast if config is missing

### 2. ✅ Input Sanitization (`lib/sanitize.ts`)
- **What:** Utilities to clean and validate all user inputs
- **Why:** Prevents XSS attacks and malicious data
- **Status:** COMPLETE - Functions ready to use

### 3. ✅ Web3 Authentication (`lib/auth.ts`)
- **What:** Wallet signature verification and JWT session management
- **Why:** Prevents wallet address spoofing
- **Status:** COMPLETE - Ready to integrate

### 4. ✅ Error Boundaries (`components/ErrorBoundary.tsx`)
- **What:** React error boundaries to catch component errors
- **Why:** Prevents entire app crash and information leaks
- **Status:** COMPLETE - Already added to app layout

### 5. ✅ Database Migration (PostgreSQL)
- **What:** Changed Prisma schema from SQLite to PostgreSQL
- **Why:** PostgreSQL supports concurrent writes and is production-ready
- **Status:** COMPLETE - Schema updated

### 6. ✅ Logging System (`lib/logger.ts`)
- **What:** Structured logging utility (replaces console.log)
- **Why:** Better debugging and monitoring
- **Status:** COMPLETE - Ready to use throughout app

### 7. ✅ Authentication API (`app/api/auth/route.ts`)
- **What:** API endpoints for wallet authentication flow
- **Why:** Provides secure login/logout functionality
- **Status:** COMPLETE - Ready to use

---

## 🔧 Next Steps for Full Integration

### Step 1: Set Up PostgreSQL Database

You need a PostgreSQL database. Choose one option:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt install postgresql

# Create database
createdb dexmirror

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/dexmirror?schema=public"
```

**Option B: Cloud PostgreSQL (Recommended)**
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app
- **Heroku Postgres** (free tier): https://heroku.com

After creating database, copy connection string to `.env`:
```bash
DATABASE_URL="your-postgresql-connection-string"
```

### Step 2: Generate JWT Secret

```bash
# Generate a secure random string (32+ characters)
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Add to .env
JWT_SECRET="your-generated-secret-here"
```

### Step 3: Run Database Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate dev --name init_postgresql

# Seed database (optional)
npm run prisma:seed
```

### Step 4: Update Protected API Routes

You need to add authentication checks to protected routes. Here's how:

**Example: Update `app/api/trades/route.ts`**

```typescript
import { requireAuth } from '@/lib/auth';
import { sanitizeText, sanitizeTxHash, sanitizeNumericString } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    // ✅ Require authentication
    const walletAddress = await requireAuth(request);
    
    const body = await request.json();

    // ✅ Sanitize all inputs
    const validatedData = {
      tokenIn: sanitizeTokenSymbol(body.tokenIn),
      tokenOut: sanitizeTokenSymbol(body.tokenOut),
      amountIn: sanitizeNumericString(body.amountIn),
      amountOut: sanitizeNumericString(body.amountOut),
      txHash: sanitizeTxHash(body.txHash),
      notes: sanitizeText(body.notes, 5000),
      usdValue: body.usdValue ? parseFloat(body.usdValue) : null,
    };

    // Find user by authenticated wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { trader: true },
    });

    if (!user?.trader) {
      return NextResponse.json(
        { error: 'Only traders can submit trades' },
        { status: 403 }
      );
    }

    // Rest of your trade creation logic...
    const trade = await prisma.trade.create({
      data: {
        traderId: user.trader.id,
        ...validatedData,
      },
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    // Handle errors appropriately
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}
```

### Step 5: Update Frontend to Use Authentication

**Create authentication hook:**

```typescript
// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSignMessage } from 'wagmi';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Load token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
  }, []);

  const authenticate = async () => {
    if (!address) throw new Error('No wallet connected');
    
    setIsAuthenticating(true);
    try {
      // 1. Get message to sign
      const response = await fetch(`/api/auth?walletAddress=${address}`);
      const { message } = await response.json();

      // 2. Sign message with wallet
      const signature = await signMessageAsync({ message });

      // 3. Authenticate and get JWT
      const authResponse = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, message, signature }),
      });

      const { token } = await authResponse.json();

      // 4. Store token
      localStorage.setItem('authToken', token);
      setAuthToken(token);

      return token;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  return {
    address,
    isConnected,
    isAuthenticated: !!authToken,
    authToken,
    authenticate,
    logout,
    isAuthenticating,
  };
}
```

**Update components to use authentication:**

```typescript
// Example usage in a component
'use client';

import { useAuth } from '@/hooks/useAuth';

export function TradeSubmitButton() {
  const { isAuthenticated, authenticate, authToken } = useAuth();

  const submitTrade = async (tradeData: any) => {
    // Authenticate if not already
    if (!isAuthenticated) {
      await authenticate();
    }

    // Make authenticated request
    const response = await fetch('/api/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(tradeData),
    });

    return response.json();
  };

  return (
    <button onClick={submitTrade}>
      Submit Trade
    </button>
  );
}
```

---

## 🛡️ Routes Requiring Authentication

Update these API routes to use `requireAuth()`:

### Critical Priority (Handles Money/Data)
- ✅ `app/api/trades/route.ts` - POST (submit trade)
- ✅ `app/api/trades/[id]/route.ts` - PUT, DELETE
- ✅ `app/api/traders/register/route.ts` - POST
- ✅ `app/api/subscriptions/route.ts` - POST
- ✅ `app/api/subscriptions/[id]/route.ts` - PUT, DELETE
- ✅ `app/api/copy-settings/[id]/route.ts` - PUT

### Medium Priority (User Data)
- ✅ `app/api/users/route.ts` - PUT (update profile)
- ✅ `app/api/notifications/route.ts` - GET (user's notifications)

### Low Priority (Can Remain Public)
- ❌ `app/api/traders/route.ts` - GET (public trader list)
- ❌ `app/api/trades/route.ts` - GET (public trades)
- ❌ `app/api/analytics/route.ts` - GET (public stats)

---

## 🔐 Rate Limiting (Optional but Recommended)

To add rate limiting:

### 1. Sign up for Upstash Redis (Free Tier)
- Go to https://upstash.com
- Create a Redis database
- Copy URL and token

### 2. Add to `.env`
```bash
UPSTASH_REDIS_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_TOKEN="your-token-here"
```

### 3. Install rate limiting package
```bash
npm install @upstash/ratelimit @upstash/redis
```

### 4. Create rate limit utility
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
  prefix: 'dexmirror:ratelimit',
});
```

### 5. Add to API routes
```typescript
import { ratelimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const walletAddress = await requireAuth(request);
  
  // Check rate limit
  const { success } = await ratelimit.limit(walletAddress);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // Rest of handler...
}
```

---

## 🧪 Testing the Security Implementation

### Test 1: Environment Validation
```bash
# Remove DATABASE_URL from .env temporarily
npm run dev
# Should fail with clear error message
```

### Test 2: Authentication
```bash
# Try to submit trade without auth token
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"tokenIn":"ETH","tokenOut":"USDC"}'
# Should return 401 Unauthorized
```

### Test 3: Input Sanitization
```bash
# Try to submit XSS attack in bio
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"<script>alert(\"xss\")</script>"}'
# Should strip HTML tags
```

### Test 4: Error Boundary
```javascript
// Temporarily add to a component to test error boundary
throw new Error('Test error');
// Should show error UI, not crash app
```

---

## 📊 Security Checklist

Before deploying to production:

- [ ] PostgreSQL database set up and connected
- [ ] JWT_SECRET generated and added to .env (32+ characters)
- [ ] All protected API routes use `requireAuth()`
- [ ] All user inputs use sanitization functions
- [ ] Error boundaries added to app layout
- [ ] Frontend authentication flow implemented
- [ ] Rate limiting configured (optional but recommended)
- [ ] Environment variables validated on startup
- [ ] Test authentication flow end-to-end
- [ ] Test with malicious inputs (XSS attempts)
- [ ] Verify error handling doesn't leak information
- [ ] Review all console.log and replace with logger

---

## 🚀 Deployment Security

### Environment Variables for Production

```bash
# Production .env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-secure-production-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Optional but recommended
UPSTASH_REDIS_URL="your-redis-url"
UPSTASH_REDIS_TOKEN="your-redis-token"
SENTRY_DSN="your-sentry-dsn"
```

### Additional Production Recommendations

1. **Use HTTPS everywhere** - No exceptions
2. **Enable CORS properly** - Only allow your domain
3. **Set up monitoring** - Sentry or similar
4. **Regular backups** - Automated database backups
5. **Security headers** - Already added to middleware
6. **Rate limiting** - Essential for production
7. **Input validation** - Already implemented
8. **Error logging** - Don't expose errors to users

---

## 📚 Additional Resources

- **Prisma PostgreSQL Guide**: https://www.prisma.io/docs/concepts/database-connectors/postgresql
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **Web3 Auth Patterns**: https://eips.ethereum.org/EIPS/eip-4361
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## 🆘 Troubleshooting

### "Authentication required" on every request
- Check that frontend is storing the JWT token
- Verify token is being sent in Authorization header
- Check JWT_SECRET matches on server

### "Invalid signature" error
- Ensure message format hasn't changed between request and signing
- Verify wallet is signing with correct chain
- Check that message is recent (within 5 minutes)

### Database connection errors
- Verify DATABASE_URL is correct
- Check database server is running
- Ensure firewall allows connection
- Test with `npx prisma db pull`

### Rate limiting blocking legitimate requests
- Increase limits in production
- Use wallet address as identifier, not IP
- Consider different limits for different endpoints

---

## ✅ Completion Status

You've successfully implemented:
1. ✅ Environment validation
2. ✅ Input sanitization  
3. ✅ Web3 authentication
4. ✅ Error boundaries
5. ✅ PostgreSQL migration
6. ✅ Structured logging
7. ✅ Authentication API

**Next:** Integrate authentication into your existing API routes and frontend!

