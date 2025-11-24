import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CODEX_CHAIN_ID = '1776'
process.env.NEXT_PUBLIC_CODEX_RPC_URL = 'http://node-mainnet.thecodex.net/'
process.env.NEXT_PUBLIC_CODEX_NATIVE_TOKEN = 'DEX'
process.env.DATABASE_URL = 'file:./test.db'

