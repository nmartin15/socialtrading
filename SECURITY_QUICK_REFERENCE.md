# Security Quick Reference

**One-page cheat sheet for security integration**

---

## Environment Variables

```bash
DATABASE_URL="postgresql://..."  # PostgreSQL connection string
JWT_SECRET="$(openssl rand -hex 32)"  # Generate secure secret
```

---

## Key Functions

```typescript
// Backend
import { requireAuth } from '@/lib/auth';
const walletAddress = await requireAuth(request);

import { sanitizeText, sanitizeTxHash } from '@/lib/sanitize';
const clean = sanitizeText(input, maxLength);

import { logger } from '@/lib/logger';
logger.info('Action', { context });

// Frontend
import { useAuth } from '@/hooks/useAuth';
const { isAuthenticated, authenticate, authToken } = useAuth();

import { authenticatedPost } from '@/lib/apiClient';
await authenticatedPost('/api/endpoint', data);
```

---

## Route Protection Template

```typescript
export async function POST(request: NextRequest) {
  try {
    const walletAddress = await requireAuth(request);
    const body = await request.json();
    const clean = { field: sanitizeText(body.field) };
    // ... process request
    return NextResponse.json({ result });
  } catch (error) {
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## Protected Routes

- `POST /api/trades`
- `PUT,DELETE /api/trades/[id]`
- `POST /api/traders/register`
- `PUT /api/users`
- `POST /api/subscriptions`
- `PATCH,DELETE /api/subscriptions/[id]`
- `PATCH /api/copy-settings/[id]`

---

## Common Commands

```bash
openssl rand -hex 32              # Generate JWT secret
npm run prisma:generate            # Generate Prisma client
npm run prisma:migrate dev         # Run migrations
npx prisma studio                  # View database
```

---

## Quick Tests

```bash
# Test auth API
curl "http://localhost:3000/api/auth?walletAddress=0x..."

# Test protected route (should fail without token)
curl -X POST http://localhost:3000/api/trades

# Check token in browser
# DevTools → Application → Local Storage → authToken
```

---

**Full Guide:** See `SECURITY_GUIDE.md`

