import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Mock Prisma client for testing
 */
export const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  trader: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  trade: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  subscription: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $disconnect: vi.fn(),
}

/**
 * Mock trader data for testing
 */
export const mockTrader = {
  id: 'trader-123',
  userId: 'user-123',
  subscriptionPrice: 100,
  performanceFee: 15,
  tradingStyles: ['DAY_TRADING', 'SWING_TRADING'],
  isVerified: false,
  followerCount: 0,
  copierCount: 0,
  totalTrades: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: {
    id: 'user-123',
    walletAddress: '0x1234567890123456789012345678901234567890',
    username: 'test_trader',
    bio: 'Test trader bio',
    avatarUrl: null,
    role: 'TRADER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

/**
 * Mock trade data for testing
 */
export const mockTrade = {
  id: 'trade-123',
  traderId: 'trader-123',
  tokenIn: '0xToken1',
  tokenOut: '0xToken2',
  amountIn: '1000000000000000000',
  amountOut: '2000000000000000000',
  txHash: '0xabcdef1234567890',
  timestamp: new Date('2024-01-01'),
  usdValue: 1500,
}

/**
 * Wait for promises to resolve
 */
export const waitForPromises = () => new Promise((resolve) => setImmediate(resolve))

