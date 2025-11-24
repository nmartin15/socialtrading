import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../traders/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    trader: {
      findMany: vi.fn(),
    },
  },
}))

describe('Traders API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/traders', () => {
    const mockTraders = [
      {
        id: 'trader-1',
        userId: 'user-1',
        subscriptionPrice: 100,
        performanceFee: 15,
        tradingStyles: JSON.stringify(['Day Trading', 'Swing Trading']),
        verified: true,
        totalFollowers: 100,
        totalCopiers: 50,
        totalTrades: 200,
        user: {
          id: 'user-1',
          walletAddress: '0x1234567890123456789012345678901234567890',
          username: 'pro_trader',
          avatarUrl: 'https://example.com/avatar1.jpg',
          bio: 'Professional trader',
        },
        performance: [
          {
            id: 'perf-1',
            period: 'ALL_TIME',
            returnPercentage: 25.5,
            totalPnL: 50000,
          },
        ],
        _count: {
          trades: 200,
          subscriptions: 50,
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'trader-2',
        userId: 'user-2',
        subscriptionPrice: 50,
        performanceFee: 10,
        tradingStyles: JSON.stringify(['Scalping']),
        verified: false,
        totalFollowers: 25,
        totalCopiers: 10,
        totalTrades: 50,
        user: {
          id: 'user-2',
          walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          username: 'scalper_pro',
          avatarUrl: null,
          bio: 'Fast scalping strategies',
        },
        performance: [],
        _count: {
          trades: 50,
          subscriptions: 10,
        },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ]

    it('should return all traders without filters', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue(mockTraders)

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].tradingStyles).toEqual(['Day Trading', 'Swing Trading'])
      expect(data[1].tradingStyles).toEqual(['Scalping'])
      expect(prisma.trader.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { totalFollowers: 'desc' },
        take: 50,
      })
    })

    it('should filter verified traders only', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue([mockTraders[0]])

      const request = new Request('http://localhost/api/traders?verified=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].verified).toBe(true)
      expect(prisma.trader.findMany).toHaveBeenCalledWith({
        where: { verified: true },
        include: expect.any(Object),
        orderBy: { totalFollowers: 'desc' },
        take: 50,
      })
    })

    it('should filter traders by trading style', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue(mockTraders)

      const request = new Request('http://localhost/api/traders?style=Scalping')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].tradingStyles).toContain('Scalping')
    })

    it('should filter by both verified and style', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue([mockTraders[0]])

      const request = new Request(
        'http://localhost/api/traders?verified=true&style=Day Trading'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].verified).toBe(true)
      expect(data[0].tradingStyles).toContain('Day Trading')
    })

    it('should return empty array when no traders match', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue([])

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should parse trading styles from JSON', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue([mockTraders[0]])

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data[0].tradingStyles)).toBe(true)
      expect(data[0].tradingStyles).toEqual(['Day Trading', 'Swing Trading'])
    })

    it('should handle empty trading styles JSON', async () => {
      const traderWithEmptyStyles = {
        ...mockTraders[0],
        tradingStyles: '[]',
      }
      vi.mocked(prisma.trader.findMany).mockResolvedValue([traderWithEmptyStyles])

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].tradingStyles).toEqual([])
    })

    it('should handle null trading styles', async () => {
      const traderWithNullStyles = {
        ...mockTraders[0],
        tradingStyles: null,
      }
      vi.mocked(prisma.trader.findMany).mockResolvedValue([traderWithNullStyles])

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].tradingStyles).toEqual([])
    })

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.trader.findMany).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch traders' })
    })

    it('should limit results to 50 traders', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue(mockTraders)

      const request = new Request('http://localhost/api/traders')
      await GET(request)

      expect(prisma.trader.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 })
      )
    })

    it('should order traders by follower count descending', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue(mockTraders)

      const request = new Request('http://localhost/api/traders')
      await GET(request)

      expect(prisma.trader.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { totalFollowers: 'desc' },
        })
      )
    })

    it('should include user information and performance data', async () => {
      vi.mocked(prisma.trader.findMany).mockResolvedValue(mockTraders)

      const request = new Request('http://localhost/api/traders')
      const response = await GET(request)
      const data = await response.json()

      expect(data[0].user).toBeDefined()
      expect(data[0].user.walletAddress).toBeDefined()
      expect(data[0].user.username).toBeDefined()
      expect(data[0].performance).toBeDefined()
    })
  })
})

