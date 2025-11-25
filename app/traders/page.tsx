'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { TraderCard, TraderCardSkeleton } from '@/components/TraderCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Trader = {
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

export default function TradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified'>('all');

  useEffect(() => {
    fetchTraders();
  }, [filter]);

  const fetchTraders = async () => {
    setLoading(true);
    try {
      const url = filter === 'verified' 
        ? '/api/traders?verified=true' 
        : '/api/traders';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTraders(data);
      }
    } catch (error) {
      console.error('Failed to fetch traders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🔮 DexMirror
          </Link>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Top Traders</h1>
          <Button asChild>
            <Link href="/become-trader">
              Become a Trader
            </Link>
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
          >
            All Traders
          </Button>
          <Button
            onClick={() => setFilter('verified')}
            variant={filter === 'verified' ? 'default' : 'outline'}
          >
            Verified Only
          </Button>
        </div>

        {/* Trader Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <TraderCardSkeleton key={i} />
            ))}
          </div>
        ) : traders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {traders.map((trader) => (
              <TraderCard key={trader.id} trader={trader} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">No Traders Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to join and start earning from your trades!
            </p>
            <Button asChild size="lg">
              <Link href="/become-trader">
                Become a Trader
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

