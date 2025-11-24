import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../users/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('Users API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          walletAddress: '0x1234567890123456789012345678901234567890',
          username: 'trader1',
          role: 'TRADER',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'user-2',
          walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          username: 'copier1',
          role: 'COPIER',
          createdAt: new Date('2024-01-02'),
        },
      ]

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockUsers)
      expect(data).toHaveLength(2)
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          walletAddress: true,
          username: true,
          role: true,
          createdAt: true,
        },
        take: 10,
      })
    })

    it('should return empty array when no users exist', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch users' })
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const newUser = {
        walletAddress: '0x1234567890123456789012345678901234567890',
        username: 'new_trader',
        role: 'TRADER',
      }

      const createdUser = {
        id: 'user-new',
        ...newUser,
        bio: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.create).mockResolvedValue(createdUser)

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject({
        walletAddress: newUser.walletAddress,
        username: newUser.username,
        role: newUser.role,
      })
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          walletAddress: newUser.walletAddress,
          username: newUser.username,
          role: newUser.role,
        },
      })
    })

    it('should create user with default COPIER role when role not provided', async () => {
      const userData = {
        walletAddress: '0x1234567890123456789012345678901234567890',
        username: 'new_user',
      }

      const createdUser = {
        id: 'user-new',
        ...userData,
        role: 'COPIER',
        bio: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.create).mockResolvedValue(createdUser)

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.role).toBe('COPIER')
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          walletAddress: userData.walletAddress,
          username: userData.username,
          role: 'COPIER',
        },
      })
    })

    it('should return 400 when wallet address is missing', async () => {
      const invalidData = {
        username: 'new_user',
      }

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Wallet address is required' })
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should return 500 on database error', async () => {
      const userData = {
        walletAddress: '0x1234567890123456789012345678901234567890',
        username: 'new_user',
      }

      vi.mocked(prisma.user.create).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create user' })
    })

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create user' })
    })
  })
})

