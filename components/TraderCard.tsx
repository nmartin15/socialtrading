import Link from 'next/link';
import { formatCurrency, formatPercentage, formatAddress } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingUp, Flame } from 'lucide-react';

interface TraderCardProps {
  trader: {
    id: string;
    subscriptionPrice: number;
    performanceFee: number;
    tradingStyles: string[];
    verified: boolean;
    totalFollowers: number;
    activeCopiers: number;
    isHot?: boolean;
    isTrending?: boolean;
    winRate?: number;
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
  const sevenDayPerformance = trader.performance.find(
    (p) => p.period === 'SEVEN_DAYS'
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/traders/${trader.id}`} className="block group">
            <Card className="hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur glow-hover overflow-hidden relative">
        {/* Hot/Trending Badges */}
              {(trader.isHot || trader.isTrending) && (
                <div className="absolute top-3 right-3 flex gap-1 z-10">
                  {trader.isHot && (
                    <Badge variant="destructive" className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
                      <Flame className="w-3 h-3" />
                      Hot
                    </Badge>
                  )}
                  {trader.isTrending && (
                    <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 border-0 shadow-lg">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </Badge>
                  )}
                </div>
              )}
              
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar with glow */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30">
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
                  <Badge variant="default" className="h-5 px-2 bg-primary/20 text-primary border-primary/30">
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {trader.user.bio || 'No bio provided'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Trading Styles with Badges */}
          <div className="flex flex-wrap gap-2">
            {trader.tradingStyles.slice(0, 3).map((style) => (
              <Badge key={style} variant="secondary" className="text-xs">
                {style}
              </Badge>
            ))}
            {trader.tradingStyles.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trader.tradingStyles.length - 3}
              </Badge>
            )}
          </div>

          {/* Performance Metrics */}
          {allTimePerformance ? (
            <div className="grid grid-cols-3 gap-4 py-3 border-y">
              <div>
                <div className="text-xs text-muted-foreground mb-1">All-Time Return</div>
                <div
                  className={`font-bold ${
                    allTimePerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatPercentage(allTimePerformance.returnPct)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
                <div
                  className={`font-bold ${
                    allTimePerformance.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatCurrency(allTimePerformance.totalPnl)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Trades</div>
                <div className="font-bold">{trader._count.trades}</div>
              </div>
            </div>
          ) : (
            <div className="py-3 border-y text-center text-muted-foreground text-sm">
              No performance data yet
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Followers</div>
              <div className="font-semibold">{trader.totalFollowers}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Active Copiers</div>
              <div className="font-semibold">{trader.activeCopiers}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Performance Fee</div>
              <div className="font-semibold">{trader.performanceFee}%</div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div>
            <div className="text-xs text-muted-foreground">Monthly Price</div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(trader.subscriptionPrice / 100)}
            </div>
          </div>
          <Button size="sm" className="shadow-lg shadow-primary/30">
            Follow
          </Button>
        </CardFooter>
            </Card>
          </Link>
        </TooltipTrigger>
        
        {/* Hover Tooltip with Quick Stats */}
        <TooltipContent side="right" className="w-72 p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-base mb-1">
                {trader.user.username || formatAddress(trader.user.walletAddress)}
              </h4>
              <p className="text-xs text-muted-foreground">
                {trader.user.bio || 'No bio provided'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <div className="text-xs text-muted-foreground">All-Time Return</div>
                <div className={`font-bold ${allTimePerformance && allTimePerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {allTimePerformance ? formatPercentage(allTimePerformance.returnPct) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">7-Day Return</div>
                <div className={`font-bold ${sevenDayPerformance && sevenDayPerformance.returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {sevenDayPerformance ? formatPercentage(sevenDayPerformance.returnPct) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className="font-bold text-primary">
                  {trader.winRate ? `${trader.winRate.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Trades</div>
                <div className="font-bold">{trader._count.trades}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Followers</div>
                <div className="font-bold">{trader.totalFollowers}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Active Copiers</div>
                <div className="font-bold">{trader.activeCopiers}</div>
              </div>
            </div>
            
            {trader.tradingStyles.length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">Trading Styles</div>
                <div className="flex flex-wrap gap-1">
                  {trader.tradingStyles.map((style) => (
                    <Badge key={style} variant="secondary" className="text-xs">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TraderCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-5 bg-muted rounded w-32 mb-2" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-6 bg-muted rounded w-24" />
        </div>
        <div className="grid grid-cols-3 gap-4 py-3 border-y">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="h-8 bg-muted rounded w-24" />
        <div className="h-10 bg-muted rounded w-20" />
      </CardFooter>
    </Card>
  );
}

