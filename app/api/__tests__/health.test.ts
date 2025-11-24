import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../health/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe('Health API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 OK when database is connected', async () => {
    // Mock successful database query
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      status: 'ok',
      database: 'connected',
    })
    expect(data.timestamp).toBeDefined()
    expect(typeof data.timestamp).toBe('string')
  })

  it('should return 500 error when database connection fails', async () => {
    // Mock database error
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Connection refused'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toMatchObject({
      status: 'error',
      database: 'disconnected',
      error: 'Connection refused',
    })
  })

  it('should handle unknown errors', async () => {
    // Mock unknown error (not an Error instance)
    vi.mocked(prisma.$queryRaw).mockRejectedValue('Unknown error')

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toMatchObject({
      status: 'error',
      database: 'disconnected',
      error: 'Unknown error',
    })
  })

  it('should return valid ISO timestamp', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1])

    const response = await GET()
    const data = await response.json()

    // Verify timestamp is valid ISO string
    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })
})

