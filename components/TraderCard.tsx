import Link from 'next/link';
import { formatCurrency, formatPercentage, formatAddress } from '@/lib/utils';

interface TraderCardProps {
  trader: {
    id: string;
    subscriptionPrice: number;
    performanceFee: number;
    tradingStyles: string[];
    verified: boolean;
    totalFollowers: number;
    activeCopiers: number;
    user: {
      id: string;
      walletAddress: string;
      username: string | null;
      avatarUrl: string | null;
      bio: string | null;
    };
    performance: Array<{
      period: string;
      returnPct: number;
      totalPnl: number;
    }>;
    _count: {
      trades: number;
      subscriptions: number;
    };
  };
}

export function TraderCard({ trader }: TraderCardProps) {
  const allTimePerformance = trader.performance.find(
    (p) => p.period === 'ALL_TIME'
  );

  return (
    <Link href={`/traders/${trader.id}`}>
      <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-blue-500">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
            {trader.user.avatarUrl ? (
              <img
                src={trader.user.avatarUrl}
                alt={trader.user.username || 'Trader'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{(trader.user.username || trader.user.walletAddress)[0].toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold truncate">
                {trader.user.username || formatAddress(trader.user.walletAddress)}
              </h3>
              {trader.verified && (
                <span className="text-blue-500 text-sm" title="Verified Trader">
                  ✓
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {trader.user.bio || 'No bio provided'}
            </p>
          </div>
        </div>

        {/* Trading Styles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {trader.tradingStyles.slice(0, 3).map((style) => (
            <span
              key={style}
              className="px-2 py-1 bg-gray-700 text-xs rounded-md text-gray-300"
            >
              {style}
            </span>
          ))}
          {trader.tradingStyles.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-xs rounded-md text-gray-400">
              +{trader.tradingStyles.length - 3}
            </span>
          )}
        </div>

        {/* Performance Metrics */}
        {allTimePerformance ? (
          <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-gray-700">
            <div>
              <div className="text-xs text-gray-400 mb-1">All-Time Return</div>
              <div
                className={`font-bold ${
                  allTimePerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatPercentage(allTimePerformance.returnPct)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Total P&L</div>
              <div
                className={`font-bold ${
                  allTimePerformance.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(allTimePerformance.totalPnl)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Trades</div>
              <div className="font-bold">{trader._count.trades}</div>
            </div>
          </div>
        ) : (
          <div className="py-3 border-y border-gray-700 mb-4 text-center text-gray-500 text-sm">
            No performance data yet
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          <div>
            <div className="text-gray-400 text-xs">Followers</div>
            <div className="font-semibold">{trader.totalFollowers}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Active Copiers</div>
            <div className="font-semibold">{trader.activeCopiers}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Performance Fee</div>
            <div className="font-semibold">{trader.performanceFee}%</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div>
            <div className="text-xs text-gray-400">Monthly Price</div>
            <div className="text-lg font-bold text-blue-500">
              {formatCurrency(trader.subscriptionPrice / 100)}
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Follow
          </button>
        </div>
      </div>
    </Link>
  );
}

export function TraderCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-700" />
        <div className="flex-1">
          <div className="h-5 bg-gray-700 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-700 rounded w-20" />
        <div className="h-6 bg-gray-700 rounded w-24" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4 py-3">
        <div className="h-12 bg-gray-700 rounded" />
        <div className="h-12 bg-gray-700 rounded" />
        <div className="h-12 bg-gray-700 rounded" />
      </div>
      <div className="flex justify-between items-center pt-3">
        <div className="h-8 bg-gray-700 rounded w-24" />
        <div className="h-10 bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}

