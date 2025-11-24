import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all traders with their performance
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get('verified');
    const style = searchParams.get('style');
    
    const where: any = {};
    
    if (verified === 'true') {
      where.verified = true;
    }
    
    // Note: SQLite doesn't support array operations, so we filter in-memory for styles

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
        performance: {
          where: {
            period: 'ALL_TIME',
          },
        },
        _count: {
          select: {
            trades: true,
            subscriptions: true,
          },
        },
      },
      orderBy: {
        totalFollowers: 'desc',
      },
      take: 50,
    });
    
    // Parse JSON tradingStyles and filter by style if needed
    const parsedTraders = traders.map(trader => ({
      ...trader,
      tradingStyles: JSON.parse(trader.tradingStyles || '[]'),
    })).filter(trader => {
      if (style) {
        return trader.tradingStyles.includes(style);
      }
      return true;
    });
    
    return NextResponse.json(parsedTraders);
  } catch (error) {
    console.error('Error fetching traders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traders' },
      { status: 500 }
    );
  }
}

