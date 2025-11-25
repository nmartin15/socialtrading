import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const traderId = searchParams.get('traderId');

    if (!traderId) {
      return NextResponse.json(
        { error: 'traderId is required' },
        { status: 400 }
      );
    }

    // Verify trader exists
    const trader = await prisma.trader.findUnique({
      where: { id: traderId },
      include: {
        user: {
          select: {
            username: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!trader) {
      return NextResponse.json(
        { error: 'Trader not found' },
        { status: 404 }
      );
    }

    // Get all trades for this trader
    const trades = await prisma.trade.findMany({
      where: { traderId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        tokenIn: true,
        tokenOut: true,
        amountIn: true,
        amountOut: true,
        usdValue: true,
        timestamp: true,
        notes: true,
      },
    });

    // Calculate analytics
    const totalTrades = trades.length;

    // Calculate P&L for trades with usdValue
    const tradesWithValue = trades.filter((t) => t.usdValue !== null);
    
    // Calculate cumulative P&L over time
    let cumulativePnL = 0;
    const pnlOverTime = trades.map((trade) => {
      if (trade.usdValue !== null) {
        // Simplified P&L calculation (in real app, would need entry/exit tracking)
        // For now, assuming positive usdValue means profit
        const tradePnL = trade.usdValue || 0;
        cumulativePnL += tradePnL;
      }
      return {
        date: trade.timestamp,
        pnl: cumulativePnL,
        tradeId: trade.id,
      };
    });

    // Calculate win/loss ratio (simplified - based on positive/negative USD values)
    let wins = 0;
    let losses = 0;
    let totalPnL = 0;

    tradesWithValue.forEach((trade) => {
      if (trade.usdValue! > 0) {
        wins++;
        totalPnL += trade.usdValue!;
      } else if (trade.usdValue! < 0) {
        losses++;
        totalPnL += trade.usdValue!;
      }
    });

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const lossRate = totalTrades > 0 ? (losses / totalTrades) * 100 : 0;

    // Calculate average trade value
    const avgTradeValue =
      tradesWithValue.length > 0
        ? tradesWithValue.reduce((sum, t) => sum + (t.usdValue || 0), 0) /
          tradesWithValue.length
        : 0;

    // Find best and worst trades
    const bestTrade = tradesWithValue.length > 0
      ? tradesWithValue.reduce((best, trade) =>
          (trade.usdValue || 0) > (best.usdValue || 0) ? trade : best
        )
      : null;

    const worstTrade = tradesWithValue.length > 0
      ? tradesWithValue.reduce((worst, trade) =>
          (trade.usdValue || 0) < (worst.usdValue || 0) ? trade : worst
        )
      : null;

    // Trading frequency over time (trades per day)
    const tradesByDay = trades.reduce((acc, trade) => {
      const date = new Date(trade.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tradingFrequency = Object.entries(tradesByDay).map(([date, count]) => ({
      date,
      count,
    }));

    // Token pair distribution
    const tokenPairs = trades.reduce((acc, trade) => {
      const pair = `${trade.tokenIn}/${trade.tokenOut}`;
      acc[pair] = (acc[pair] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTokenPairs = Object.entries(tokenPairs)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Performance periods
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const last7DaysTrades = trades.filter((t) => new Date(t.timestamp) >= sevenDaysAgo);
    const last30DaysTrades = trades.filter((t) => new Date(t.timestamp) >= thirtyDaysAgo);

    const calculate7DayPnL = last7DaysTrades
      .filter((t) => t.usdValue !== null)
      .reduce((sum, t) => sum + (t.usdValue || 0), 0);

    const calculate30DayPnL = last30DaysTrades
      .filter((t) => t.usdValue !== null)
      .reduce((sum, t) => sum + (t.usdValue || 0), 0);

    // Return analytics data
    return NextResponse.json({
      trader: {
        id: trader.id,
        username: trader.user.username,
        walletAddress: trader.user.walletAddress,
      },
      summary: {
        totalTrades,
        totalPnL,
        avgTradeValue,
        winRate,
        lossRate,
        wins,
        losses,
      },
      performance: {
        last7Days: {
          trades: last7DaysTrades.length,
          pnl: calculate7DayPnL,
        },
        last30Days: {
          trades: last30DaysTrades.length,
          pnl: calculate30DayPnL,
        },
        allTime: {
          trades: totalTrades,
          pnl: totalPnL,
        },
      },
      charts: {
        pnlOverTime,
        tradingFrequency,
        topTokenPairs,
      },
      highlights: {
        bestTrade: bestTrade
          ? {
              id: bestTrade.id,
              pair: `${bestTrade.tokenIn}/${bestTrade.tokenOut}`,
              pnl: bestTrade.usdValue,
              date: bestTrade.timestamp,
            }
          : null,
        worstTrade: worstTrade
          ? {
              id: worstTrade.id,
              pair: `${worstTrade.tokenIn}/${worstTrade.tokenOut}`,
              pnl: worstTrade.usdValue,
              date: worstTrade.timestamp,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

