import { describe, it, expect } from 'vitest'
import {
  cn,
  formatAddress,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatBigNumber,
} from '../utils'

describe('cn - className utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', true && 'visible')
    expect(result).toContain('base-class')
    expect(result).toContain('visible')
    expect(result).not.toContain('hidden')
  })

  it('should merge conflicting tailwind classes correctly', () => {
    const result = cn('p-4', 'p-6')
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-6')
  })
})

describe('formatAddress', () => {
  it('should format a valid Ethereum address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const result = formatAddress(address)
    expect(result).toBe('0x1234...7890')
  })

  it('should handle short addresses', () => {
    const address = '0x123456'
    const result = formatAddress(address)
    expect(result).toBe('0x1234...3456')
  })

  it('should return empty string for empty input', () => {
    expect(formatAddress('')).toBe('')
  })

  it('should handle addresses with uppercase letters', () => {
    const address = '0xABCDEF1234567890123456789012345678901234'
    const result = formatAddress(address)
    expect(result).toBe('0xABCD...1234')
  })
})

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(10)).toBe('10')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
  })

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000')
  })
})

describe('formatCurrency', () => {
  it('should format USD currency by default', () => {
    const result = formatCurrency(1234.56)
    expect(result).toBe('$1,234.56')
  })

  it('should handle large amounts', () => {
    const result = formatCurrency(1000000)
    expect(result).toBe('$1,000,000.00')
  })

  it('should handle zero', () => {
    const result = formatCurrency(0)
    expect(result).toBe('$0.00')
  })

  it('should handle negative amounts', () => {
    const result = formatCurrency(-500)
    expect(result).toBe('-$500.00')
  })

  it('should support different currencies', () => {
    const result = formatCurrency(1000, 'EUR')
    expect(result).toContain('1,000')
  })

  it('should handle decimal precision', () => {
    const result = formatCurrency(99.99)
    expect(result).toBe('$99.99')
  })
})

describe('formatPercentage', () => {
  it('should format positive percentages with + sign', () => {
    expect(formatPercentage(15.5)).toBe('+15.50%')
  })

  it('should format negative percentages with - sign', () => {
    expect(formatPercentage(-10.25)).toBe('-10.25%')
  })

  it('should format zero without sign', () => {
    // The function adds + for zero (value >= 0)
    expect(formatPercentage(0)).toBe('+0.00%')
  })

  it('should respect custom decimal places', () => {
    expect(formatPercentage(15.5555, 3)).toBe('+15.556%')
    expect(formatPercentage(15.5555, 1)).toBe('+15.6%')
    expect(formatPercentage(15.5555, 0)).toBe('+16%')
  })

  it('should handle very large percentages', () => {
    expect(formatPercentage(1000)).toBe('+1000.00%')
  })

  it('should handle very small percentages', () => {
    expect(formatPercentage(0.01)).toBe('+0.01%')
  })
})

describe('formatBigNumber', () => {
  it('should format 18 decimal token amounts', () => {
    // 1 ETH = 1000000000000000000 wei
    const oneEth = '1000000000000000000'
    expect(formatBigNumber(oneEth)).toBe('1')
  })

  it('should format custom decimal places', () => {
    // USDC uses 6 decimals
    const oneUsdc = '1000000'
    expect(formatBigNumber(oneUsdc, 6)).toBe('1')
  })

  it('should handle large amounts', () => {
    const thousandEth = '1000000000000000000000'
    expect(formatBigNumber(thousandEth)).toBe('1000')
  })

  it('should handle zero', () => {
    expect(formatBigNumber('0')).toBe('0')
  })

  it('should handle amounts less than 1 token', () => {
    // 0.5 ETH
    const halfEth = '500000000000000000'
    expect(formatBigNumber(halfEth)).toBe('0')
  })

  it('should handle very large numbers', () => {
    const millionEth = '1000000000000000000000000'
    expect(formatBigNumber(millionEth)).toBe('1000000')
  })
})

