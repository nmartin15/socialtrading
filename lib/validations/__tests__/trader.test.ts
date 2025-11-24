import { describe, it, expect } from 'vitest'
import { traderRegistrationSchema, TRADING_STYLES } from '../trader'
import { z } from 'zod'

describe('traderRegistrationSchema', () => {
  const validData = {
    username: 'test_trader_123',
    bio: 'This is a valid bio with more than 10 characters.',
    subscriptionPrice: 50,
    performanceFee: 15,
    tradingStyles: ['Day Trading', 'Swing Trading'],
    avatarUrl: 'https://example.com/avatar.png',
  }

  describe('username validation', () => {
    it('should accept valid usernames', () => {
      const data = { ...validData, username: 'valid_user_123' }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should reject usernames shorter than 3 characters', () => {
      const data = { ...validData, username: 'ab' }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Username must be at least 3 characters'
      )
    })

    it('should reject usernames longer than 20 characters', () => {
      const data = { ...validData, username: 'a'.repeat(21) }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Username must be less than 20 characters'
      )
    })

    it('should reject usernames with special characters', () => {
      const data = { ...validData, username: 'user@name!' }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Username can only contain letters, numbers, and underscores'
      )
    })

    it('should reject usernames with spaces', () => {
      const data = { ...validData, username: 'user name' }
      expect(() => traderRegistrationSchema.parse(data)).toThrow()
    })

    it('should accept usernames with underscores', () => {
      const data = { ...validData, username: 'user_name_123' }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })
  })

  describe('bio validation', () => {
    it('should accept valid bios', () => {
      const data = { ...validData, bio: 'Valid bio with sufficient length.' }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should reject bios shorter than 10 characters', () => {
      const data = { ...validData, bio: 'Short' }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Bio must be at least 10 characters'
      )
    })

    it('should reject bios longer than 500 characters', () => {
      const data = { ...validData, bio: 'a'.repeat(501) }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Bio must be less than 500 characters'
      )
    })

    it('should accept maximum length bio', () => {
      const data = { ...validData, bio: 'a'.repeat(500) }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })
  })

  describe('subscriptionPrice validation', () => {
    it('should accept valid prices', () => {
      const data = { ...validData, subscriptionPrice: 99 }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should reject negative prices', () => {
      const data = { ...validData, subscriptionPrice: -10 }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Price cannot be negative'
      )
    })

    it('should reject prices exceeding maximum', () => {
      const data = { ...validData, subscriptionPrice: 10001 }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Price cannot exceed $100'
      )
    })

    it('should accept zero price', () => {
      const data = { ...validData, subscriptionPrice: 0 }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should accept maximum allowed price', () => {
      const data = { ...validData, subscriptionPrice: 10000 }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })
  })

  describe('performanceFee validation', () => {
    it('should accept valid performance fees', () => {
      const data = { ...validData, performanceFee: 10 }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should reject negative fees', () => {
      const data = { ...validData, performanceFee: -5 }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Fee cannot be negative'
      )
    })

    it('should reject fees exceeding 20%', () => {
      const data = { ...validData, performanceFee: 21 }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Fee cannot exceed 20%'
      )
    })

    it('should accept zero fee', () => {
      const data = { ...validData, performanceFee: 0 }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should accept maximum allowed fee', () => {
      const data = { ...validData, performanceFee: 20 }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })
  })

  describe('tradingStyles validation', () => {
    it('should accept valid trading styles', () => {
      const data = {
        ...validData,
        tradingStyles: ['Day Trading', 'Scalping', 'Arbitrage'],
      }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should reject empty trading styles array', () => {
      const data = { ...validData, tradingStyles: [] }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Select at least one trading style'
      )
    })

    it('should reject more than 5 trading styles', () => {
      const data = {
        ...validData,
        tradingStyles: [
          'Style 1',
          'Style 2',
          'Style 3',
          'Style 4',
          'Style 5',
          'Style 6',
        ],
      }
      expect(() => traderRegistrationSchema.parse(data)).toThrow(
        'Select at most 5 trading styles'
      )
    })

    it('should accept exactly 5 trading styles', () => {
      const data = {
        ...validData,
        tradingStyles: ['Style 1', 'Style 2', 'Style 3', 'Style 4', 'Style 5'],
      }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should accept single trading style', () => {
      const data = { ...validData, tradingStyles: ['Day Trading'] }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })
  })

  describe('avatarUrl validation', () => {
    it('should accept valid URLs', () => {
      const data = { ...validData, avatarUrl: 'https://example.com/avatar.jpg' }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should accept empty string', () => {
      const data = { ...validData, avatarUrl: '' }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })

    it('should accept undefined', () => {
      const { avatarUrl, ...dataWithoutAvatar } = validData
      expect(() => traderRegistrationSchema.parse(dataWithoutAvatar)).not.toThrow()
    })

    it('should reject invalid URLs', () => {
      const data = { ...validData, avatarUrl: 'not-a-valid-url' }
      expect(() => traderRegistrationSchema.parse(data)).toThrow('Must be a valid URL')
    })

    it('should accept http URLs', () => {
      const data = { ...validData, avatarUrl: 'http://example.com/avatar.jpg' }
      expect(() => traderRegistrationSchema.parse(data)).not.toThrow()
    })
  })

  describe('complete validation', () => {
    it('should accept completely valid data', () => {
      const result = traderRegistrationSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject data with multiple errors', () => {
      const invalidData = {
        username: 'ab',
        bio: 'short',
        subscriptionPrice: -10,
        performanceFee: 25,
        tradingStyles: [],
        avatarUrl: 'invalid',
      }
      expect(() => traderRegistrationSchema.parse(invalidData)).toThrow()
    })
  })
})

describe('TRADING_STYLES constant', () => {
  it('should contain expected trading styles', () => {
    expect(TRADING_STYLES).toContain('Day Trading')
    expect(TRADING_STYLES).toContain('Swing Trading')
    expect(TRADING_STYLES).toContain('Scalping')
    expect(TRADING_STYLES).toContain('DeFi Farming')
  })

  it('should have 10 trading styles', () => {
    expect(TRADING_STYLES).toHaveLength(10)
  })

  it('should be a readonly tuple', () => {
    // TypeScript will prevent mutations, but we can verify it's an array
    expect(Array.isArray(TRADING_STYLES)).toBe(true)
  })
})

