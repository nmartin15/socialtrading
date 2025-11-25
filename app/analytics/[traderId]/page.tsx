import { Navigation } from '@/components/Navigation';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';

interface AnalyticsPageProps {
  params: Promise<{
    traderId: string;
  }>;
}

async function getAnalytics(traderId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/analytics?traderId=${traderId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { traderId } = await params;
  const analytics = await getAnalytics(traderId);

  if (!analytics) {
    notFound();
  }

  const { trader, summary, performance, charts, highlights } = analytics;

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/traders/${traderId}`}
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            ← Back to Trader Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400">
                Performance insights for {trader.username || 'Trader'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Total Trades
            </div>
            <div className="text-3xl font-bold text-white">
              {summary.totalTrades}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Total P&L
            </div>
            <div
              className={`text-3xl font-bold ${
                summary.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatCurrency(summary.totalPnL)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Win Rate
            </div>
            <div className="text-3xl font-bold text-purple-500">
              {formatPercentage(summary.winRate)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {summary.wins} wins / {summary.losses} losses
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-pink-500">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Avg Trade Value
            </div>
            <div className="text-3xl font-bold text-pink-500">
              {formatCurrency(summary.avgTradeValue)}
            </div>
          </div>
        </div>

        {/* Performance Periods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              7-Day Performance
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Trades</div>
                <div className="text-2xl font-bold">
                  {performance.last7Days.trades}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">P&L</div>
                <div
                  className={`text-2xl font-bold ${
                    performance.last7Days.pnl >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {formatCurrency(performance.last7Days.pnl)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">
              30-Day Performance
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Trades</div>
                <div className="text-2xl font-bold">
                  {performance.last30Days.trades}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">P&L</div>
                <div
                  className={`text-2xl font-bold ${
                    performance.last30Days.pnl >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {formatCurrency(performance.last30Days.pnl)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-pink-400">
              All-Time Performance
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Trades</div>
                <div className="text-2xl font-bold">
                  {performance.allTime.trades}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">P&L</div>
                <div
                  className={`text-2xl font-bold ${
                    performance.allTime.pnl >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {formatCurrency(performance.allTime.pnl)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <AnalyticsCharts charts={charts} />

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Best Trade */}
          <div className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-lg p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              🏆 Best Trade
            </h3>
            {highlights.bestTrade ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pair</span>
                  <span className="font-mono font-semibold">
                    {highlights.bestTrade.pair}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">P&L</span>
                  <span className="text-2xl font-bold text-green-500">
                    {formatCurrency(highlights.bestTrade.pnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date</span>
                  <span className="text-sm">
                    {new Date(highlights.bestTrade.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No trade data available</p>
            )}
          </div>

          {/* Worst Trade */}
          <div className="bg-gradient-to-br from-red-900/20 to-gray-800 rounded-lg p-6 border border-red-500/30">
            <h3 className="text-lg font-semibold mb-4 text-red-400">
              📉 Worst Trade
            </h3>
            {highlights.worstTrade ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pair</span>
                  <span className="font-mono font-semibold">
                    {highlights.worstTrade.pair}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">P&L</span>
                  <span className="text-2xl font-bold text-red-500">
                    {formatCurrency(highlights.worstTrade.pnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date</span>
                  <span className="text-sm">
                    {new Date(highlights.worstTrade.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No trade data available</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

