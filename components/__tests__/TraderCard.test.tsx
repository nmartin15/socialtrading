import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TraderCard, TraderCardSkeleton } from '../TraderCard'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('TraderCard', () => {
  const mockTrader = {
    id: 'trader-123',
    subscriptionPrice: 5000, // $50.00 in cents
    performanceFee: 15,
    tradingStyles: ['Day Trading', 'Swing Trading', 'Scalping'],
    verified: true,
    totalFollowers: 150,
    activeCopiers: 75,
    user: {
      id: 'user-123',
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: 'pro_trader',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Professional day trader with 5 years experience',
    },
    performance: [
      {
        period: 'ALL_TIME',
        returnPct: 45.5,
        totalPnl: 125000,
      },
    ],
    _count: {
      trades: 450,
      subscriptions: 75,
    },
  }

  it('should render trader card with all information', () => {
    render(<TraderCard trader={mockTrader} />)

    // Check username
    expect(screen.getByText('pro_trader')).toBeInTheDocument()

    // Check bio
    expect(
      screen.getByText('Professional day trader with 5 years experience')
    ).toBeInTheDocument()

    // Check verified badge
    expect(screen.getByTitle('Verified Trader')).toBeInTheDocument()

    // Check trading styles
    expect(screen.getByText('Day Trading')).toBeInTheDocument()
    expect(screen.getByText('Swing Trading')).toBeInTheDocument()
    expect(screen.getByText('Scalping')).toBeInTheDocument()

    // Check performance metrics
    expect(screen.getByText('+45.50%')).toBeInTheDocument()
    expect(screen.getByText('$125,000.00')).toBeInTheDocument()
    expect(screen.getByText('450')).toBeInTheDocument()

    // Check stats
    expect(screen.getByText('150')).toBeInTheDocument() // Followers
    expect(screen.getByText('75')).toBeInTheDocument() // Active Copiers

    // Check subscription price
    expect(screen.getByText('$50.00')).toBeInTheDocument()

    // Check performance fee
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('should render trader without username using wallet address', () => {
    const traderWithoutUsername = {
      ...mockTrader,
      user: {
        ...mockTrader.user,
        username: null,
      },
    }

    render(<TraderCard trader={traderWithoutUsername} />)

    // Should show formatted address
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
  })

  it('should render trader without bio with default text', () => {
    const traderWithoutBio = {
      ...mockTrader,
      user: {
        ...mockTrader.user,
        bio: null,
      },
    }

    render(<TraderCard trader={traderWithoutBio} />)

    expect(screen.getByText('No bio provided')).toBeInTheDocument()
  })

  it('should not show verified badge for unverified traders', () => {
    const unverifiedTrader = {
      ...mockTrader,
      verified: false,
    }

    render(<TraderCard trader={unverifiedTrader} />)

    expect(screen.queryByTitle('Verified Trader')).not.toBeInTheDocument()
  })

  it('should show only first 3 trading styles with count for extras', () => {
    const traderWithManyStyles = {
      ...mockTrader,
      tradingStyles: [
        'Day Trading',
        'Swing Trading',
        'Scalping',
        'Position Trading',
        'Arbitrage',
      ],
    }

    render(<TraderCard trader={traderWithManyStyles} />)

    // First 3 styles should be visible
    expect(screen.getByText('Day Trading')).toBeInTheDocument()
    expect(screen.getByText('Swing Trading')).toBeInTheDocument()
    expect(screen.getByText('Scalping')).toBeInTheDocument()

    // +2 indicator for remaining styles
    expect(screen.getByText('+2')).toBeInTheDocument()

    // Last 2 should not be directly visible
    expect(screen.queryByText('Position Trading')).not.toBeInTheDocument()
    expect(screen.queryByText('Arbitrage')).not.toBeInTheDocument()
  })

  it('should show "No performance data yet" when no performance data', () => {
    const traderWithoutPerformance = {
      ...mockTrader,
      performance: [],
    }

    render(<TraderCard trader={traderWithoutPerformance} />)

    expect(screen.getByText('No performance data yet')).toBeInTheDocument()
  })

  it('should display negative returns in red', () => {
    const traderWithLoss = {
      ...mockTrader,
      performance: [
        {
          period: 'ALL_TIME',
          returnPct: -12.5,
          totalPnl: -5000,
        },
      ],
    }

    render(<TraderCard trader={traderWithLoss} />)

    const returnElement = screen.getByText('-12.50%')
    const pnlElement = screen.getByText('-$5,000.00')

    expect(returnElement).toHaveClass('text-red-500')
    expect(pnlElement).toHaveClass('text-red-500')
  })

  it('should display positive returns in green', () => {
    render(<TraderCard trader={mockTrader} />)

    const returnElement = screen.getByText('+45.50%')
    const pnlElement = screen.getByText('$125,000.00')

    expect(returnElement).toHaveClass('text-green-500')
    expect(pnlElement).toHaveClass('text-green-500')
  })

  it('should render avatar image when avatarUrl is provided', () => {
    render(<TraderCard trader={mockTrader} />)

    const avatar = screen.getByAlt('pro_trader')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should render initial letter when no avatar is provided', () => {
    const traderWithoutAvatar = {
      ...mockTrader,
      user: {
        ...mockTrader.user,
        avatarUrl: null,
      },
    }

    render(<TraderCard trader={traderWithoutAvatar} />)

    // Should show first letter of username
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('should have correct link to trader profile', () => {
    const { container } = render(<TraderCard trader={mockTrader} />)

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/traders/trader-123')
  })

  it('should show Follow button', () => {
    render(<TraderCard trader={mockTrader} />)

    const followButton = screen.getByRole('button', { name: /follow/i })
    expect(followButton).toBeInTheDocument()
  })
})

describe('TraderCardSkeleton', () => {
  it('should render skeleton loader', () => {
    const { container } = render(<TraderCardSkeleton />)

    // Check for animate-pulse class
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()

    // Check for placeholder elements
    const placeholders = container.querySelectorAll('.bg-gray-700')
    expect(placeholders.length).toBeGreaterThan(0)
  })

  it('should have same structure as TraderCard', () => {
    const { container } = render(<TraderCardSkeleton />)

    // Should have avatar placeholder
    const avatar = container.querySelector('.w-16.h-16.rounded-full')
    expect(avatar).toBeInTheDocument()

    // Should have grid layouts
    const grids = container.querySelectorAll('.grid')
    expect(grids.length).toBeGreaterThan(0)
  })
})

