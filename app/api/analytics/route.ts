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

    // Get subscriptions data
    const subscriptions = await prisma.subscription.findMany({
      where: { traderId },
      include: {
        copySettings: true,
      },
      orderBy: { startDate: 'asc' },
    });

    // Get profile view history
    const profileViews = await prisma.profileView.findMany({
      where: { traderId },
      orderBy: { viewedAt: 'asc' },
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

    // Calculate win/loss ratio and detailed stats
    let wins = 0;
    let losses = 0;
    let totalPnL = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentStreakType: 'win' | 'loss' | null = null;

    tradesWithValue.forEach((trade) => {
      const pnl = trade.usdValue!;
      totalPnL += pnl;

      if (pnl > 0) {
        wins++;
        totalWinAmount += pnl;
        
        if (currentStreakType === 'win') {
          currentStreak++;
        } else {
          currentStreakType = 'win';
          currentStreak = 1;
        }
        longestWinStreak = Math.max(longestWinStreak, currentStreak);
      } else if (pnl < 0) {
        losses++;
        totalLossAmount += Math.abs(pnl);
        
        if (currentStreakType === 'loss') {
          currentStreak++;
        } else {
          currentStreakType = 'loss';
          currentStreak = 1;
        }
        longestLossStreak = Math.max(longestLossStreak, currentStreak);
      }
    });

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const lossRate = totalTrades > 0 ? (losses / totalTrades) * 100 : 0;
    const avgWin = wins > 0 ? totalWinAmount / wins : 0;
    const avgLoss = losses > 0 ? totalLossAmount / losses : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;

    // Calculate average trade value
    const avgTradeValue =
      tradesWithValue.length > 0
        ? tradesWithValue.reduce((sum, t) => sum + (t.usdValue || 0), 0) /
          tradesWithValue.length
        : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    pnlOverTime.forEach((point) => {
      if (point.pnl > peak) {
        peak = point.pnl;
      }
      const drawdown = peak - point.pnl;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

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

    // Subscriber analytics
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === 'ACTIVE'
    );
    const totalSubscribers = subscriptions.length;
    const activeSubscribers = activeSubscriptions.length;

    // Subscriber growth over time
    const subscriberGrowth = subscriptions.reduce((acc, sub) => {
      const date = new Date(sub.startDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Calculate cumulative subscribers
    let cumulativeSubscribers = 0;
    const subscriberGrowthData = Object.entries(subscriberGrowth)
      .map(([date, count]) => {
        cumulativeSubscribers += count;
        return {
          date,
          count: cumulativeSubscribers,
          newSubscribers: count,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Profile views over time
    const viewsByDay = profileViews.reduce((acc, view) => {
      const date = new Date(view.viewedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const profileViewsData = Object.entries(viewsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Conversion rate (subscriptions / profile views)
    const totalViews = trader.profileViews || 0;
    const conversionRate =
      totalViews > 0 ? (totalSubscribers / totalViews) * 100 : 0;

    // Revenue calculations
    const monthlyRevenue = activeSubscriptions.reduce(
      (sum, sub) => sum + sub.monthlyPrice,
      0
    );
    const annualRevenue = monthlyRevenue * 12;

    // Average revenue per subscriber
    const avgRevenuePerSubscriber =
      activeSubscribers > 0 ? monthlyRevenue / activeSubscribers : 0;

    // Subscriber demographics
    const subscriberDemographics = {
      avgCopyAmount: 0,
      riskProfiles: {
        conservative: 0,
        moderate: 0,
        aggressive: 0,
      },
      copyAmountTypes: {
        PERCENTAGE: 0,
        FIXED: 0,
        PROPORTIONAL: 0,
      },
    };

    activeSubscriptions.forEach((sub) => {
      if (sub.copySettings) {
        // Calculate average copy amount
        subscriberDemographics.avgCopyAmount += sub.copySettings.copyAmount;

        // Count copy amount types
        const type = sub.copySettings.copyAmountType as keyof typeof subscriberDemographics.copyAmountTypes;
        subscriberDemographics.copyAmountTypes[type]++;

        // Categorize risk profile based on settings
        if (
          sub.copySettings.stopLossPercent &&
          sub.copySettings.stopLossPercent <= 5
        ) {
          subscriberDemographics.riskProfiles.conservative++;
        } else if (
          sub.copySettings.maxTradeSize &&
          sub.copySettings.maxTradeSize <= 1000
        ) {
          subscriberDemographics.riskProfiles.moderate++;
        } else {
          subscriberDemographics.riskProfiles.aggressive++;
        }
      }
    });

    if (activeSubscribers > 0) {
      subscriberDemographics.avgCopyAmount /= activeSubscribers;
    }

    // Recent subscriber activity (last 30 days)
    const recentSubscriptions = subscriptions.filter(
      (s) =>
        new Date(s.startDate).getTime() >=
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime()
    );

    // Profile views in last 30 days
    const recentViews = profileViews.filter(
      (v) =>
        new Date(v.viewedAt).getTime() >=
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime()
    );

    // Calculate monthly performance breakdown
    const monthlyPerformance = trades.reduce((acc, trade) => {
      const monthKey = new Date(trade.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          trades: 0,
          pnl: 0,
          wins: 0,
          losses: 0,
        };
      }
      
      acc[monthKey].trades++;
      if (trade.usdValue !== null) {
        acc[monthKey].pnl += trade.usdValue;
        if (trade.usdValue > 0) {
          acc[monthKey].wins++;
        } else if (trade.usdValue < 0) {
          acc[monthKey].losses++;
        }
      }
      
      return acc;
    }, {} as Record<string, { month: string; trades: number; pnl: number; wins: number; losses: number }>);

    const monthlyStats = Object.values(monthlyPerformance).map((month) => ({
      ...month,
      winRate: month.trades > 0 ? (month.wins / month.trades) * 100 : 0,
    }));

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
        avgWin,
        avgLoss,
        profitFactor,
        maxDrawdown,
        longestWinStreak,
        longestLossStreak,
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
        monthlyStats,
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
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        growth: subscriberGrowthData,
        recentGrowth: recentSubscriptions.length,
      },
      profileMetrics: {
        totalViews: totalViews,
        recentViews: recentViews.length,
        conversionRate,
        viewsOverTime: profileViewsData,
      },
      revenue: {
        monthly: monthlyRevenue,
        annual: annualRevenue,
        avgPerSubscriber: avgRevenuePerSubscriber,
        projectedAnnual: annualRevenue, // Same as annual for now
      },
      demographics: subscriberDemographics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

