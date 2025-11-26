# 🔐 Security Integration Project Plan

**Total Estimated Time:** 4-6 hours  
**Goal:** Integrate all security features and make app production-ready  
**Status:** Ready to Start

---

## 📋 Overview

This plan breaks down the security integration into 5 main phases with detailed micro-tasks.

### Timeline
- ⚡ **Quick Wins** (Phase 1): 20 minutes
- 🗃️ **Database Setup** (Phase 2): 20 minutes
- 🔒 **Backend Security** (Phase 3): 2-3 hours
- 💻 **Frontend Integration** (Phase 4): 1-2 hours
- ✅ **Testing & Validation** (Phase 5): 1 hour

---

## Phase 1: Quick Wins (20 minutes) ⚡

### Task 1.1: Environment Setup (10 min)
- [ ] 1.1.1 - Copy `env.example` to `.env`
- [ ] 1.1.2 - Generate JWT_SECRET: `openssl rand -hex 32`
- [ ] 1.1.3 - Add JWT_SECRET to `.env`
- [ ] 1.1.4 - Get WalletConnect Project ID (if not already set)
- [ ] 1.1.5 - Verify all required env vars are set

### Task 1.2: Dependencies Check (10 min)
- [ ] 1.2.1 - Verify `jose` is installed
- [ ] 1.2.2 - Verify `isomorphic-dompurify` is installed
- [ ] 1.2.3 - Run `npm install` if needed
- [ ] 1.2.4 - Check for any npm warnings/errors

---

## Phase 2: Database Setup (20 minutes) 🗃️

### Task 2.1: PostgreSQL Provider (10 min)
**Choose ONE option:**

**Option A: Neon (Recommended)**
- [ ] 2.1.1a - Go to https://neon.tech
- [ ] 2.1.1b - Sign up with GitHub
- [ ] 2.1.1c - Click "Create Project"
- [ ] 2.1.1d - Name: "dexmirror"
- [ ] 2.1.1e - Copy connection string
- [ ] 2.1.1f - Add to `.env` as `DATABASE_URL`

**Option B: Supabase**
- [ ] 2.1.1a - Go to https://supabase.com
- [ ] 2.1.1b - Create new project
- [ ] 2.1.1c - Get connection string from settings
- [ ] 2.1.1d - Add to `.env` as `DATABASE_URL`

**Option C: Railway**
- [ ] 2.1.1a - Go to https://railway.app
- [ ] 2.1.1b - Create new PostgreSQL database
- [ ] 2.1.1c - Copy connection string
- [ ] 2.1.1d - Add to `.env` as `DATABASE_URL`

### Task 2.2: Database Migration (10 min)
- [ ] 2.2.1 - Run `npm run prisma:generate`
- [ ] 2.2.2 - Run `npm run prisma:migrate dev --name init_security`
- [ ] 2.2.3 - Verify migration succeeded (check terminal output)
- [ ] 2.2.4 - Optional: Run `npm run prisma:seed` for demo data
- [ ] 2.2.5 - Test: Run `npx prisma studio` and verify tables exist

---

## Phase 3: Backend Security (2-3 hours) 🔒

### Task 3.1: Protect Trade Routes (30 min)

**File: `app/api/trades/route.ts`**

- [ ] 3.1.1 - Add imports:
  ```typescript
  import { requireAuth } from '@/lib/auth';
  import { sanitizeText, sanitizeTxHash, sanitizeNumericString } from '@/lib/sanitize';
  ```

- [ ] 3.1.2 - In POST handler, add authentication:
  ```typescript
  const walletAddress = await requireAuth(request);
  ```

- [ ] 3.1.3 - Replace old wallet address logic (line ~14)

- [ ] 3.1.4 - Add input sanitization before validation:
  ```typescript
  const sanitizedBody = {
    tokenIn: sanitizeTokenSymbol(body.tokenIn),
    tokenOut: sanitizeTokenSymbol(body.tokenOut),
    amountIn: sanitizeNumericString(body.amountIn),
    amountOut: sanitizeNumericString(body.amountOut),
    txHash: sanitizeTxHash(body.txHash),
    notes: sanitizeText(body.notes, 5000),
    usdValue: body.usdValue,
  };
  ```

- [ ] 3.1.5 - Update Prisma query to use sanitized data

- [ ] 3.1.6 - Test: Try to submit trade without auth (should fail 401)

### Task 3.2: Protect Trade Edit/Delete (20 min)

**File: `app/api/trades/[id]/route.ts`**

- [ ] 3.2.1 - Add auth imports
- [ ] 3.2.2 - Add `requireAuth()` to PUT handler
- [ ] 3.2.3 - Add `requireAuth()` to DELETE handler
- [ ] 3.2.4 - Verify user owns the trade before edit/delete:
  ```typescript
  const trade = await prisma.trade.findUnique({
    where: { id: params.id },
    include: { trader: { include: { user: true } } }
  });
  
  if (trade?.trader.user.walletAddress !== walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  ```

- [ ] 3.2.5 - Add input sanitization for PUT
- [ ] 3.2.6 - Test: Try to edit someone else's trade (should fail 403)

### Task 3.3: Protect Trader Registration (20 min)

**File: `app/api/traders/register/route.ts`**

- [ ] 3.3.1 - Add auth imports
- [ ] 3.3.2 - Add `requireAuth()` at start of POST
- [ ] 3.3.3 - Add sanitization:
  ```typescript
  const sanitized = {
    tradingStyles: sanitizeStringArray(
      body.tradingStyles, 
      sanitizeTradingStyle, 
      10
    ),
    performanceFee: Math.min(20, Math.max(0, body.performanceFee)),
    subscriptionPrice: Math.max(0, body.subscriptionPrice),
  };
  ```

- [ ] 3.3.4 - Verify walletAddress matches authenticated user
- [ ] 3.3.5 - Test: Try to register without auth (should fail 401)

### Task 3.4: Protect User Routes (20 min)

**File: `app/api/users/route.ts`**

- [ ] 3.4.1 - Add auth imports
- [ ] 3.4.2 - Add `requireAuth()` to PUT handler
- [ ] 3.4.3 - Add sanitization:
  ```typescript
  const sanitized = {
    username: sanitizeUsername(body.username),
    bio: sanitizeText(body.bio, 500),
    avatarUrl: body.avatarUrl ? sanitizeUrl(body.avatarUrl) : null,
  };
  ```

- [ ] 3.4.4 - Verify user can only update their own profile
- [ ] 3.4.5 - Test: Try to update without auth (should fail 401)

### Task 3.5: Protect Subscription Routes (30 min)

**File: `app/api/subscriptions/route.ts`**

- [ ] 3.5.1 - Add auth imports
- [ ] 3.5.2 - Add `requireAuth()` to POST handler
- [ ] 3.5.3 - Add sanitization for copy settings
- [ ] 3.5.4 - Verify authenticated user is the copier

**File: `app/api/subscriptions/[id]/route.ts`**

- [ ] 3.5.5 - Add auth to PUT handler
- [ ] 3.5.6 - Add auth to DELETE handler
- [ ] 3.5.7 - Verify user owns the subscription
- [ ] 3.5.8 - Test: Try to modify someone else's subscription (should fail 403)

### Task 3.6: Protect Copy Settings (20 min)

**File: `app/api/copy-settings/[id]/route.ts`**

- [ ] 3.6.1 - Add auth imports
- [ ] 3.6.2 - Add `requireAuth()` to PUT handler
- [ ] 3.6.3 - Add validation for numeric limits (max trade size, etc.)
- [ ] 3.6.4 - Verify user owns the settings
- [ ] 3.6.5 - Test: Try to update without auth (should fail 401)

### Task 3.7: Update Error Handling (20 min)

**All protected routes:**

- [ ] 3.7.1 - Replace try-catch to handle auth errors:
  ```typescript
  try {
    const walletAddress = await requireAuth(request);
    // ... rest of handler
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  ```

- [ ] 3.7.2 - Update 5 protected routes with proper error handling
- [ ] 3.7.3 - Test: Verify error messages don't leak sensitive info

---

## Phase 4: Frontend Integration (1-2 hours) 💻

### Task 4.1: Create Authentication Hook (40 min)

**Create: `hooks/useAuth.ts`**

- [ ] 4.1.1 - Create file `hooks/useAuth.ts`
- [ ] 4.1.2 - Add imports (wagmi, useState, useEffect)
- [ ] 4.1.3 - Implement hook structure:
  ```typescript
  export function useAuth() {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    // ... rest of implementation
  }
  ```

- [ ] 4.1.4 - Implement `authenticate()` function:
  - Get message from API
  - Sign message
  - Get JWT token
  - Store in localStorage

- [ ] 4.1.5 - Implement `logout()` function

- [ ] 4.1.6 - Add useEffect to load token on mount

- [ ] 4.1.7 - Test: Console log to verify hook works

### Task 4.2: Create Auth Context (20 min)

**Create: `contexts/AuthContext.tsx`**

- [ ] 4.2.1 - Create file `contexts/AuthContext.tsx`
- [ ] 4.2.2 - Create React context with useAuth
- [ ] 4.2.3 - Create AuthProvider component
- [ ] 4.2.4 - Wrap app in `app/providers.tsx`:
  ```typescript
  import { AuthProvider } from '@/contexts/AuthContext';
  
  export function Providers({ children }) {
    return (
      <WagmiConfig>
        <AuthProvider>
          {children}
        </AuthProvider>
      </WagmiConfig>
    );
  }
  ```

- [ ] 4.2.5 - Test: Access auth state from any component

### Task 4.3: Update API Client (30 min)

**Create: `lib/apiClient.ts`**

- [ ] 4.3.1 - Create API client helper:
  ```typescript
  export async function authenticatedFetch(
    url: string, 
    options: RequestInit = {}
  ) {
    const token = localStorage.getItem('authToken');
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
  }
  ```

- [ ] 4.3.2 - Add error handling for 401 responses
- [ ] 4.3.3 - Add automatic token refresh logic
- [ ] 4.3.4 - Test: Make authenticated request

### Task 4.4: Update Trade Submission (20 min)

**File: `app/submit-trade/page.tsx`**

- [ ] 4.4.1 - Import `useAuth` hook
- [ ] 4.4.2 - Add authentication check before form:
  ```typescript
  const { isAuthenticated, authenticate } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthPrompt onAuth={authenticate} />;
  }
  ```

- [ ] 4.4.3 - Update form submission to use `authenticatedFetch`
- [ ] 4.4.4 - Add loading state during authentication
- [ ] 4.4.5 - Test: Submit trade with authentication

### Task 4.5: Update Other Forms (20 min)

- [ ] 4.5.1 - Update trader registration form
- [ ] 4.5.2 - Update profile edit form
- [ ] 4.5.3 - Update subscription dialog
- [ ] 4.5.4 - Update copy settings dialog
- [ ] 4.5.5 - Test: All forms require authentication

### Task 4.6: Add Auth UI Components (20 min)

**Create: `components/AuthButton.tsx`**

- [ ] 4.6.1 - Create sign-in button component
- [ ] 4.6.2 - Show wallet address when authenticated
- [ ] 4.6.3 - Add logout functionality
- [ ] 4.6.4 - Add to navigation bar
- [ ] 4.6.5 - Test: Sign in/out flow

---

## Phase 5: Testing & Validation (1 hour) ✅

### Task 5.1: Authentication Flow Testing (20 min)

- [ ] 5.1.1 - Test: Connect wallet
- [ ] 5.1.2 - Test: Sign authentication message
- [ ] 5.1.3 - Test: Receive and store JWT token
- [ ] 5.1.4 - Test: Token persists after page refresh
- [ ] 5.1.5 - Test: Logout clears token
- [ ] 5.1.6 - Test: Try protected route without token (should fail)
- [ ] 5.1.7 - Test: Try protected route with token (should succeed)

### Task 5.2: Input Sanitization Testing (15 min)

- [ ] 5.2.1 - Test: Submit XSS attempt in bio: `<script>alert('xss')</script>`
- [ ] 5.2.2 - Verify: Script tags are removed
- [ ] 5.2.3 - Test: Submit HTML in trade notes
- [ ] 5.2.4 - Verify: HTML is stripped
- [ ] 5.2.5 - Test: Invalid wallet address format
- [ ] 5.2.6 - Verify: Clear error message
- [ ] 5.2.7 - Test: Invalid transaction hash
- [ ] 5.2.8 - Verify: Clear error message

### Task 5.3: Authorization Testing (15 min)

- [ ] 5.3.1 - Test: User A creates trade
- [ ] 5.3.2 - Test: User B tries to edit User A's trade (should fail 403)
- [ ] 5.3.3 - Test: User B tries to delete User A's trade (should fail 403)
- [ ] 5.3.4 - Test: User can edit own trade (should succeed)
- [ ] 5.3.5 - Test: User can delete own trade (should succeed)

### Task 5.4: Error Handling Testing (10 min)

- [ ] 5.4.1 - Test: Disconnect wallet mid-session
- [ ] 5.4.2 - Verify: Graceful error message
- [ ] 5.4.3 - Test: Expired JWT token
- [ ] 5.4.4 - Verify: Prompted to re-authenticate
- [ ] 5.4.5 - Test: Network error during authentication
- [ ] 5.4.6 - Verify: Clear error message

---

## 🎯 Success Criteria

### Must Pass Before Production

**Security:**
- ✅ All protected routes require authentication
- ✅ Users can only modify their own data
- ✅ All user inputs are sanitized
- ✅ XSS attempts are blocked
- ✅ Error messages don't leak sensitive info

**Functionality:**
- ✅ Users can sign in with wallet
- ✅ JWT tokens are stored and used correctly
- ✅ Users can sign out
- ✅ Authentication persists across page refreshes
- ✅ All forms work with authentication

**User Experience:**
- ✅ Clear error messages
- ✅ Loading states during authentication
- ✅ Smooth sign-in flow
- ✅ No crashes or white screens
- ✅ Mobile responsive

---

## 📝 Progress Tracking

### Phase Completion
- [ ] Phase 1: Quick Wins (20 min)
- [ ] Phase 2: Database Setup (20 min)
- [ ] Phase 3: Backend Security (2-3 hours)
- [ ] Phase 4: Frontend Integration (1-2 hours)
- [ ] Phase 5: Testing & Validation (1 hour)

### Estimated vs Actual Time
- **Estimated Total:** 4-6 hours
- **Actual Time Spent:** ___ hours
- **Completion Date:** ___________

---

## 🆘 Troubleshooting Quick Reference

### Common Issues

**"DATABASE_URL required"**
- Check `.env` file exists
- Verify DATABASE_URL is set
- Ensure it starts with `postgresql://`

**"JWT_SECRET must be at least 32 characters"**
- Run: `openssl rand -hex 32`
- Copy output to `.env`

**"Authentication required" on every request**
- Check localStorage for token
- Verify token is being sent in headers
- Check JWT_SECRET matches on server

**"Invalid signature"**
- Ensure message format is correct
- Try disconnecting and reconnecting wallet
- Clear browser cache and try again

**Migration errors**
- Check DATABASE_URL is correct
- Try: `npx prisma migrate reset`
- Verify PostgreSQL is running

**CORS errors**
- Update `middleware.ts` with your domain
- Check API routes return correct headers

---

## 📚 Reference Documentation

- `QUICK_START_SECURITY.md` - Quick setup guide
- `SECURITY_IMPLEMENTATION_GUIDE.md` - Detailed integration steps
- `SECURITY_FIXES_COMPLETE.md` - What's implemented
- `lib/auth.ts` - Authentication utilities
- `lib/sanitize.ts` - Sanitization functions

---

## 🎉 Completion Checklist

Before marking as complete:

- [ ] All phases completed
- [ ] All success criteria met
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No linting errors
- [ ] No console errors in browser
- [ ] Tested on mobile
- [ ] Tested in different browsers
- [ ] Ready for production deployment

---

**Good luck! You've got this!** 🚀

Remember: Take breaks, test frequently, commit often.

