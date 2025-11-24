import { ConnectButton } from '@/components/ConnectButton';
import { ProfileActions } from '@/components/ProfileActions';
import Link from 'next/link';
import { formatCurrency, formatPercentage, formatAddress, getExplorerUrl } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface TraderProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTrader(id: string) {
  try {
    const trader = await prisma.trader.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
        performance: true,
        trades: {
          take: 10,
          orderBy: {
            timestamp: 'desc',
          },
        },
        _count: {
          select: {
            trades: true,
            subscriptions: true,
          },
        },
      },
    });

    return trader;
  } catch (error) {
    return null;
  }
}

export default async function TraderProfilePage({ params }: TraderProfilePageProps) {
  const { id } = await params;
  const trader = await getTrader(id);

  if (!trader) {
    notFound();
  }

  // Parse trading styles from JSON string (SQLite stores as string)
  const tradingStyles = typeof trader.tradingStyles === 'string' 
    ? JSON.parse(trader.tradingStyles) 
    : trader.tradingStyles;

  const allTimePerformance = trader.performance.find(
    (p) => p.period === 'ALL_TIME'
  );
  const monthlyPerformance = trader.performance.find(
    (p) => p.period === 'THIRTY_DAYS'
  );
  const weeklyPerformance = trader.performance.find(
    (p) => p.period === 'SEVEN_DAYS'
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Social Trading
          </Link>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/traders"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          ← Back to Traders
        </Link>

        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {trader.user.avatarUrl ? (
                <img
                  src={trader.user.avatarUrl}
                  alt={trader.user.username || 'Trader'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>
                  {(trader.user.username || trader.user.walletAddress)[0].toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {trader.user.username || formatAddress(trader.user.walletAddress)}
                </h1>
                {trader.verified && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-4">{trader.user.bio || 'No bio provided'}</p>

              {/* Trading Styles */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tradingStyles.map((style: string) => (
                  <span
                    key={style}
                    className="px-3 py-1 bg-gray-700 text-sm rounded-md"
                  >
                    {style}
                  </span>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-6">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Followers</div>
                  <div className="text-4xl font-bold text-blue-500 leading-none">{trader.totalFollowers}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active Copiers</div>
                  <div className="text-4xl font-bold text-purple-500 leading-none">{trader.activeCopiers}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Trades</div>
                  <div className="text-4xl font-bold text-green-500 leading-none">{trader._count.trades}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Performance Fee</div>
                  <div className="text-4xl font-bold text-pink-500 leading-none">{trader.performanceFee}%</div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <ProfileActions 
              traderWalletAddress={trader.user.walletAddress}
              subscriptionPrice={trader.subscriptionPrice}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">7-Day Performance</h3>
            {weeklyPerformance ? (
              <>
                <div
                  className={`text-3xl font-bold mb-2 ${
                    weeklyPerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatPercentage(weeklyPerformance.returnPct)}
                </div>
                <div className="text-sm text-gray-400">
                  P&L: {formatCurrency(weeklyPerformance.totalPnl)}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">30-Day Performance</h3>
            {monthlyPerformance ? (
              <>
                <div
                  className={`text-3xl font-bold mb-2 ${
                    monthlyPerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatPercentage(monthlyPerformance.returnPct)}
                </div>
                <div className="text-sm text-gray-400">
                  P&L: {formatCurrency(monthlyPerformance.totalPnl)}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">All-Time Performance</h3>
            {allTimePerformance ? (
              <>
                <div
                  className={`text-3xl font-bold mb-2 ${
                    allTimePerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatPercentage(allTimePerformance.returnPct)}
                </div>
                <div className="text-sm text-gray-400">
                  P&L: {formatCurrency(allTimePerformance.totalPnl)}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Trades</h3>
          {trader.trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Pair</th>
                    <th className="pb-3">Amount In</th>
                    <th className="pb-3">Amount Out</th>
                    <th className="pb-3">USD Value</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {trader.trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-700 last:border-0">
                      <td className="py-3 font-mono text-sm">
                        {trade.tokenIn} → {trade.tokenOut}
                      </td>
                      <td className="py-3">{trade.amountIn}</td>
                      <td className="py-3">{trade.amountOut}</td>
                      <td className="py-3">
                        {trade.usdValue ? formatCurrency(trade.usdValue) : '-'}
                      </td>
                      <td className="py-3 text-gray-400 text-sm">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <a
                          href={getExplorerUrl(trade.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-400 font-mono text-sm inline-flex items-center gap-1"
                        >
                          {formatAddress(trade.txHash)}
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No trades yet
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

