# 🧪 Automated Testing Guide - Social Trading Platform

## Overview

This project uses a comprehensive testing stack to ensure code quality and reliability:

- **Vitest** - Fast unit and integration testing
- **Testing Library** - React component testing
- **Playwright** - End-to-end testing
- **Coverage Reports** - Code coverage tracking

---

## 📦 Quick Start

### Run All Tests

```bash
# Run unit/integration tests (watch mode)
npm test

# Run all tests once
npm run test:run

# Run E2E tests
npm run test:e2e

# Run everything
npm run test:all
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory and display in your terminal.

---

## 🎯 Testing Stack

### Unit & Integration Tests (Vitest)

**Location**: `**/__tests__/*.test.ts(x)`

**What we test:**
- ✅ Utility functions (`lib/utils.ts`)
- ✅ Validation schemas (`lib/validations/*.ts`)
- ✅ API routes (`app/api/**/*.ts`)
- ✅ React components (`components/*.tsx`)

**Example test structure:**

```typescript
import { describe, it, expect } from 'vitest'
import { formatAddress } from '../utils'

describe('formatAddress', () => {
  it('should format Ethereum addresses correctly', () => {
    const address = '0x1234567890123456789012345678901234567890'
    expect(formatAddress(address)).toBe('0x1234...7890')
  })
})
```

### Component Tests (Testing Library)

**Location**: `components/__tests__/*.test.tsx`

**What we test:**
- ✅ Component rendering
- ✅ User interactions
- ✅ Props and state
- ✅ Conditional rendering
- ✅ Event handlers

**Example component test:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectButton } from '../ConnectButton'

it('should call connect when clicked', () => {
  render(<ConnectButton />)
  const button = screen.getByRole('button', { name: /connect wallet/i })
  fireEvent.click(button)
  expect(mockConnect).toHaveBeenCalled()
})
```

### E2E Tests (Playwright)

**Location**: `e2e/*.spec.ts`

**What we test:**
- ✅ User flows (registration, browsing)
- ✅ Page navigation
- ✅ API integration
- ✅ Responsive design
- ✅ Accessibility

**Example E2E test:**

```typescript
import { test, expect } from '@playwright/test'

test('should complete trader registration', async ({ page }) => {
  await page.goto('/become-trader')
  await page.fill('[name="username"]', 'test_trader')
  await page.fill('[name="bio"]', 'Test trader bio...')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/traders\/.*/)
})
```

---

## 📂 Test File Structure

```
Social Trading/
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts           # ✅ 100+ assertions
│   │   └── ...
│   └── validations/
│       └── __tests__/
│           └── trader.test.ts      # ✅ 50+ assertions
├── app/
│   └── api/
│       └── __tests__/
│           ├── health.test.ts      # ✅ API health checks
│           ├── users.test.ts       # ✅ User endpoints
│           └── traders.test.ts     # ✅ Trader endpoints
├── components/
│   └── __tests__/
│       ├── TraderCard.test.tsx     # ✅ Component tests
│       └── ConnectButton.test.tsx  # ✅ Web3 integration
├── e2e/
│   ├── homepage.spec.ts            # ✅ Homepage flows
│   ├── traders.spec.ts             # ✅ Traders listing
│   ├── trader-registration.spec.ts # ✅ Registration flow
│   └── api.spec.ts                 # ✅ API testing
├── test/
│   ├── setup.ts                    # Test configuration
│   └── helpers.tsx                 # Test utilities
├── vitest.config.ts                # Vitest configuration
└── playwright.config.ts            # Playwright configuration
```

---

## 🎨 Available Test Scripts

### Unit/Integration Tests

```bash
# Watch mode (recommended for development)
npm test

# Run once
npm run test:run

# UI mode (visual test runner)
npm run test:ui

# Watch mode (explicit)
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Headless mode (CI/default)
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (watch browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug
```

### Combined

```bash
# Run all tests
npm run test:all
```

---

## 📊 Test Coverage

### Current Coverage

Our test suite includes:

- **100+ unit tests** for utilities and validations
- **80+ component tests** for React components
- **70+ integration tests** for API routes
- **40+ E2E tests** for critical user flows

### Coverage Goals

| Type       | Current | Goal |
|------------|---------|------|
| Lines      | 70%     | 80%  |
| Functions  | 70%     | 80%  |
| Branches   | 70%     | 75%  |
| Statements | 70%     | 80%  |

### View Coverage Report

```bash
# Generate and view coverage
npm run test:coverage

# Open HTML report (after running coverage)
# Windows
start coverage/index.html

# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

---

## 🔧 Configuration Files

### `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
```

### `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 🧩 Writing Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { myFunction } from '../myModule'

describe('myFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow()
  })
})
```

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path')
  })

  test('should complete user flow', async ({ page }) => {
    await page.fill('[name="input"]', 'value')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/success/)
  })
})
```

---

## 🎯 Testing Best Practices

### 1. Follow AAA Pattern

```typescript
it('should format currency', () => {
  // Arrange
  const amount = 1234.56

  // Act
  const result = formatCurrency(amount)

  // Assert
  expect(result).toBe('$1,234.56')
})
```

### 2. Test Behavior, Not Implementation

```typescript
// ❌ Bad - testing implementation
it('should call useState', () => {
  // Testing internal React details
})

// ✅ Good - testing behavior
it('should update count when clicked', () => {
  // Testing user-visible behavior
})
```

### 3. Use Descriptive Test Names

```typescript
// ❌ Bad
it('test1', () => {})

// ✅ Good
it('should return empty string for invalid address', () => {})
```

### 4. Mock External Dependencies

```typescript
// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))
```

### 5. Clean Up After Tests

```typescript
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

### 6. Use Test Helpers

```typescript
// test/helpers.tsx
export const mockTrader = {
  id: 'trader-123',
  username: 'test_trader',
  // ... other props
}

// In your test
import { mockTrader } from '../test/helpers'
```

---

## 🐛 Debugging Tests

### Vitest Debugging

```bash
# Run tests with UI
npm run test:ui

# Run specific test file
npx vitest run lib/__tests__/utils.test.ts

# Run tests matching pattern
npx vitest run --grep "formatAddress"
```

### Playwright Debugging

```bash
# Debug mode (step through)
npm run test:e2e:debug

# Run specific test
npx playwright test e2e/homepage.spec.ts

# Run with UI mode
npm run test:e2e:ui

# Show test trace
npx playwright show-trace trace.zip
```

### Common Issues

#### Issue: "Module not found"

```bash
# Solution: Regenerate Prisma client
npm run prisma:generate

# Restart tests
npm test
```

#### Issue: "Port already in use" (E2E)

```bash
# Solution: Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### Issue: Tests timeout

```typescript
// Increase timeout in vitest.config.ts
export default defineConfig({
  test: {
    timeout: 30000, // 30 seconds
  },
})

// Or in specific test
test('slow test', { timeout: 60000 }, async () => {
  // ...
})
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:run
      
      - name: Run coverage
        run: npm run test:coverage
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
```

---

## 📚 Resources

### Documentation

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)

### Test Examples

All test files include comprehensive examples:

- **Unit Tests**: See `lib/__tests__/utils.test.ts`
- **Validation Tests**: See `lib/validations/__tests__/trader.test.ts`
- **API Tests**: See `app/api/__tests__/*.test.ts`
- **Component Tests**: See `components/__tests__/*.test.tsx`
- **E2E Tests**: See `e2e/*.spec.ts`

---

## ✅ Test Checklist

Before committing code, ensure:

- [ ] All existing tests pass: `npm run test:run`
- [ ] New features have tests
- [ ] Coverage meets thresholds: `npm run test:coverage`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] No test.only or test.skip left in code
- [ ] Tests are well-named and documented

---

## 🎉 Test-Driven Development (TDD)

### TDD Workflow

1. **Write failing test** first

```typescript
it('should format percentage', () => {
  expect(formatPercentage(15.5)).toBe('+15.50%')
})
```

2. **Implement minimal code** to pass

```typescript
export function formatPercentage(value: number): string {
  return `+${value.toFixed(2)}%`
}
```

3. **Refactor** while tests pass

```typescript
export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}
```

4. **Add more tests** for edge cases

```typescript
it('should handle negative percentages', () => {
  expect(formatPercentage(-10.25)).toBe('-10.25%')
})
```

---

## 📈 Continuous Improvement

### Adding Tests to Existing Code

1. Identify untested code: `npm run test:coverage`
2. Start with critical paths (API routes, utilities)
3. Add component tests for user-facing features
4. Include E2E tests for complete flows
5. Aim for incremental coverage increases

### Test Metrics to Track

- **Pass Rate**: Should be 100%
- **Coverage**: Trending upward toward 80%
- **Test Count**: Growing with new features
- **Test Speed**: Keep under 30 seconds for unit tests
- **Flakiness**: Zero flaky tests

---

## 🔒 Security Testing

### What We Test

- ✅ Input validation
- ✅ API authentication (when implemented)
- ✅ XSS prevention
- ✅ SQL injection prevention (via Prisma)
- ✅ CORS headers

### Example Security Test

```typescript
it('should reject invalid wallet addresses', () => {
  const invalidAddress = 'not-an-address'
  expect(() => validateAddress(invalidAddress)).toThrow()
})
```

---

## 🎯 Next Steps

1. **Run tests now**: `npm test`
2. **Check coverage**: `npm run test:coverage`
3. **Run E2E tests**: `npm run test:e2e`
4. **Write tests for new features** as you build
5. **Review test reports** regularly

---

## 💡 Tips for Success

- **Test early, test often**: Don't wait until the end
- **Keep tests simple**: One assertion per test when possible
- **Use descriptive names**: Tests are documentation
- **Mock wisely**: Only mock what you must
- **Watch mode is your friend**: Keep tests running during development
- **Coverage isn't everything**: 100% coverage ≠ bug-free code
- **Test user flows**: E2E tests catch integration issues

---

**Happy Testing! 🚀**

If you have questions or need help with testing, refer to the examples in the codebase or check the official documentation.

Remember: **Good tests = Confident deployments**

