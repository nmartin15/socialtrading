'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { TraderCard, TraderCardSkeleton } from '@/components/TraderCard';
import { TraderDiscoveryFilters } from '@/components/TraderDiscoveryFilters';
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

interface FilterState {
  search: string;
  sortBy: string;
  verified: boolean | null;
  styles: string[];
  minPrice: string;
  maxPrice: string;
  minTrades: string;
}

export default function TradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'followers',
    verified: null,
    styles: [],
    minPrice: '',
    maxPrice: '',
    minTrades: '',
  });

  useEffect(() => {
    fetchTraders();
  }, [filters]);

  const fetchTraders = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.verified !== null) params.append('verified', String(filters.verified));
      if (filters.styles.length > 0) params.append('style', filters.styles[0]); // For simplicity, use first style
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minTrades) params.append('minTrades', filters.minTrades);
      
      const url = `/api/traders${params.toString() ? `?${params.toString()}` : ''}`;
      
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
          <div>
            <h1 className="text-4xl font-bold mb-2">Discover Top Traders</h1>
            <p className="text-muted-foreground">
              Find and follow the best traders. {traders.length} trader{traders.length !== 1 ? 's' : ''} found.
            </p>
          </div>
          <Button asChild>
            <Link href="/become-trader">
              Become a Trader
            </Link>
          </Button>
        </div>
        
        {/* Enhanced Discovery Filters */}
        <div className="mb-8">
          <TraderDiscoveryFilters onFilterChange={setFilters} />
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
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No Traders Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search criteria.
            </p>
            <Button 
              onClick={() => setFilters({
                search: '',
                sortBy: 'followers',
                verified: null,
                styles: [],
                minPrice: '',
                maxPrice: '',
                minTrades: '',
              })}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

