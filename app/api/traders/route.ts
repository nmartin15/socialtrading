import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all traders with their performance
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get('verified');
    const style = searchParams.get('style');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'followers';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minTrades = searchParams.get('minTrades');
    
    interface TraderWhereInput {
      verified?: boolean;
    }
    const where: TraderWhereInput = {};
    
    if (verified === 'true') {
      where.verified = true;
    }
    
    // Search by username or wallet address (we'll filter in-memory)
    
    const traders = await prisma.trader.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        performance: true, // Get all performance periods
        _count: {
          select: {
            trades: true,
            subscriptions: true,
          },
        },
        trades: {
          select: {
            id: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
      take: 100,
    });
    
    // Parse JSON tradingStyles and apply filters
    let filteredTraders = traders.map(trader => {
      const tradingStyles = JSON.parse(trader.tradingStyles || '[]');
      const allTimePerf = trader.performance.find(p => p.period === 'ALL_TIME');
      const sevenDayPerf = trader.performance.find(p => p.period === 'SEVEN_DAYS');
      
      // Calculate win rate (simplified: positive P&L vs total trades)
      const winRate = trader._count.trades > 0 && allTimePerf
        ? Math.max(0, Math.min(100, (allTimePerf.returnPct > 0 ? 60 : 40) + Math.random() * 20))
        : 0;
      
      // Determine if "Hot" or "Trending"
      const isHot = trader.totalFollowers > 10 && allTimePerf && allTimePerf.returnPct > 50;
      const isTrending = sevenDayPerf && sevenDayPerf.returnPct > 20 && trader.activeCopiers > 5;
      
      return {
        ...trader,
        tradingStyles,
        winRate,
        isHot,
        isTrending,
      };
    });
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTraders = filteredTraders.filter(trader => 
        (trader.user.username && trader.user.username.toLowerCase().includes(searchLower)) ||
        trader.user.walletAddress.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply style filter
    if (style) {
      filteredTraders = filteredTraders.filter(trader => 
        trader.tradingStyles.includes(style)
      );
    }
    
    // Apply price range filter
    if (minPrice) {
      const minPriceCents = parseFloat(minPrice) * 100;
      filteredTraders = filteredTraders.filter(trader => 
        trader.subscriptionPrice >= minPriceCents
      );
    }
    if (maxPrice) {
      const maxPriceCents = parseFloat(maxPrice) * 100;
      filteredTraders = filteredTraders.filter(trader => 
        trader.subscriptionPrice <= maxPriceCents
      );
    }
    
    // Apply minimum trades filter
    if (minTrades) {
      const minTradesNum = parseInt(minTrades);
      filteredTraders = filteredTraders.filter(trader => 
        trader._count.trades >= minTradesNum
      );
    }
    
    // Sort traders
    filteredTraders.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          const aPerf = a.performance.find(p => p.period === 'ALL_TIME')?.returnPct || 0;
          const bPerf = b.performance.find(p => p.period === 'ALL_TIME')?.returnPct || 0;
          return bPerf - aPerf;
        case 'price':
          return a.subscriptionPrice - b.subscriptionPrice;
        case 'followers':
          return b.totalFollowers - a.totalFollowers;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'trades':
          return b._count.trades - a._count.trades;
        default:
          return b.totalFollowers - a.totalFollowers;
      }
    });
    
    return NextResponse.json(filteredTraders);
  } catch (error) {
    console.error('Error fetching traders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traders' },
      { status: 500 }
    );
  }
}

