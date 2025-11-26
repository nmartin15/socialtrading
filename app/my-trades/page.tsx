'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { TradeHistoryTable, TradeHistoryTableSkeleton } from '@/components/TradeHistoryTable';
import { TradeEditModal } from '@/components/TradeEditModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EnhancedTradeNotes } from '@/components/EnhancedTradeNotes';
import { TradeFilters } from '@/components/TradeFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';

interface Trade {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  txHash: string;
  timestamp: Date | string;
  usdValue: number | null;
  notes: string;
  trader: {
    id: string;
    user: {
      username: string | null;
      walletAddress: string;
    };
  };
}

export default function MyTradesPage() {
  const { address, isConnected } = useAccount();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traderInfo, setTraderInfo] = useState<{
    id: string;
    username?: string;
    walletAddress: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Edit/Delete state
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'token'>('date');
  
  // Toast hook
  const { toast } = useToast();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchMyTrades() {
      if (!mounted || !isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First, get the current user and their trader info
        const userResponse = await fetch(`/api/users?walletAddress=${address}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();

        if (!userData.trader) {
          setError('You must be registered as a trader to view trades.');
          setIsLoading(false);
          return;
        }

        setTraderInfo({
          id: userData.trader.id,
          username: userData.username,
          walletAddress: userData.walletAddress,
        });

        // Fetch trades for this trader
        const tradesResponse = await fetch(`/api/trades?traderId=${userData.trader.id}`);
        if (!tradesResponse.ok) {
          throw new Error('Failed to fetch trades');
        }

        const tradesData = await tradesResponse.json();
        setTrades(tradesData.trades || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyTrades();
  }, [mounted, address, isConnected]);

  const handleDeleteTrade = async () => {
    if (!deletingTradeId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trades/${deletingTradeId}`, {
        method: 'DELETE',
        headers: {
          'x-wallet-address': address || '',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete trade');
      }

      // Remove trade from list
      setTrades(trades.filter(t => t.id !== deletingTradeId));
      toast({ 
        title: 'Success',
        description: 'Trade deleted successfully',
      });
      setDeletingTradeId(null);
    } catch (err) {
      toast({ 
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete trade',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    toast({ 
      title: 'Success',
      description: 'Trade updated successfully',
    });
    // Refresh trades list
    if (traderInfo) {
      fetch(`/api/trades?traderId=${traderInfo.id}`)
        .then(res => res.json())
        .then(data => setTrades(data.trades || []))
        .catch(err => console.error('Error refreshing trades:', err));
    }
  };

  // Extract all available tags from trades
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    
    trades.forEach(trade => {
      if (trade.notes) {
        const lowerNotes = trade.notes.toLowerCase();
        
        if (lowerNotes.includes('long') || lowerNotes.includes('buy')) {
          tagSet.add('📈 Long');
        }
        if (lowerNotes.includes('short') || lowerNotes.includes('sell')) {
          tagSet.add('📉 Short');
        }
        if (lowerNotes.includes('entry') || lowerNotes.includes('entering') || lowerNotes.includes('opened')) {
          tagSet.add('🎯 Entry');
        }
        if (lowerNotes.includes('exit') || lowerNotes.includes('closing') || lowerNotes.includes('closed')) {
          tagSet.add('🚪 Exit');
        }
        if (lowerNotes.includes('breakout')) {
          tagSet.add('Breakout');
        }
        if (lowerNotes.includes('swing')) {
          tagSet.add('Swing Trade');
        }
        if (lowerNotes.includes('scalp')) {
          tagSet.add('Scalp');
        }
        if (lowerNotes.includes('reversal')) {
          tagSet.add('Reversal');
        }
      }
    });
    
    return Array.from(tagSet);
  }, [trades]);

  // Filter and sort trades based on search query, selected tags, date range, and sort order
  const filteredTrades = useMemo(() => {
    let filtered = trades;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.tokenIn.toLowerCase().includes(query) ||
        trade.tokenOut.toLowerCase().includes(query) ||
        trade.txHash.toLowerCase().includes(query) ||
        (trade.notes && trade.notes.toLowerCase().includes(query))
      );
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(trade => {
        if (!trade.notes) return false;
        const lowerNotes = trade.notes.toLowerCase();
        
        return selectedTags.every(tag => {
          switch (tag) {
            case '📈 Long':
              return lowerNotes.match(/\b(long|buy|bought|accumulate|bullish)\b/);
            case '📉 Short':
              return lowerNotes.match(/\b(short|sell|sold|bearish)\b/);
            case '🎯 Entry':
              return lowerNotes.match(/\b(entry|entering|entered|opened|opening)\b/);
            case '🚪 Exit':
              return lowerNotes.match(/\b(exit|exiting|exited|closing|closed)\b/);
            case 'Breakout':
              return lowerNotes.includes('breakout');
            case 'Swing Trade':
              return lowerNotes.includes('swing');
            case 'Scalp':
              return lowerNotes.includes('scalp');
            case 'Reversal':
              return lowerNotes.includes('reversal');
            default:
              return true;
          }
        });
      });
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(trade => {
        const tradeDate = new Date(trade.timestamp);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        if (startDate && tradeDate < startDate) return false;
        if (endDate) {
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          if (tradeDate > endDate) return false;
        }
        return true;
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'value':
          return (b.usdValue || 0) - (a.usdValue || 0);
        case 'token':
          return a.tokenIn.localeCompare(b.tokenIn);
        default:
          return 0;
      }
    });

    return sorted;
  }, [trades, searchQuery, selectedTags, dateRange, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Show loading state before mounted to prevent hydration mismatch
  if (!mounted) {
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
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-gray-400">
              Please wait while we load your trades.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!isConnected) {
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
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to view your trades.
            </p>
            <ConnectButton />
          </div>
        </div>
      </main>
    );
  }

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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Trades</h1>
            <p className="text-gray-400">
              {isLoading ? 'Loading...' : `${filteredTrades.length} trade${filteredTrades.length !== 1 ? 's' : ''} ${searchQuery || selectedTags.length > 0 ? 'found' : 'recorded'}`}
            </p>
          </div>
          <Button asChild>
            <Link href="/submit-trade">
              + Submit Trade
            </Link>
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
            {error.includes('trader') && (
              <div className="mt-2">
                <Link href="/become-trader" className="text-red-100 underline">
                  Register as a trader
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        {!error && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Trades</CardDescription>
                <CardTitle className="text-3xl text-blue-500">{trades.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Volume (USD)</CardDescription>
                <CardTitle className="text-3xl text-green-500">
                  ${trades.reduce((sum, t) => sum + (t.usdValue || 0), 0).toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Unique Tokens</CardDescription>
                <CardTitle className="text-3xl text-purple-500">
                  {new Set([...trades.map(t => t.tokenIn), ...trades.map(t => t.tokenOut)]).size}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Trades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TradeHistoryTableSkeleton />
            ) : (
              <div className="space-y-4">
                {trades.length > 0 && (
                  <TradeFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedTags={selectedTags}
                    onTagToggle={handleTagToggle}
                    availableTags={availableTags}
                    totalTrades={trades.length}
                    filteredCount={filteredTrades.length}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                )}
                
                {filteredTrades.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTrades.map((trade) => (
                      <Card key={trade.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4 mb-3">
                            {/* Trade Info */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                              {/* Token Pair */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Pair</div>
                                <div className="font-mono text-sm">
                                  <span className="text-blue-400">{trade.tokenIn}</span>
                                  <span className="text-muted-foreground mx-1">→</span>
                                  <span className="text-green-400">{trade.tokenOut}</span>
                                </div>
                              </div>

                              {/* Amount In */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Amount In</div>
                                <div className="font-medium text-sm">
                                  {trade.amountIn} <span className="text-muted-foreground">{trade.tokenIn}</span>
                                </div>
                              </div>

                              {/* Amount Out */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Amount Out</div>
                                <div className="font-medium text-sm">
                                  {trade.amountOut} <span className="text-muted-foreground">{trade.tokenOut}</span>
                                </div>
                              </div>

                              {/* USD Value */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">USD Value</div>
                                <div className="font-medium text-sm">
                                  {trade.usdValue ? (
                                    <span className="text-green-400">${trade.usdValue.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </div>

                              {/* Date */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Date</div>
                                <div className="text-sm">
                                  {new Date(trade.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                onClick={() => setEditingTrade(trade)}
                                size="sm"
                                variant="default"
                                title="Edit trade"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => setDeletingTradeId(trade.id)}
                                size="sm"
                                variant="destructive"
                                title="Delete trade"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          {/* Enhanced Trade Notes */}
                          {trade.notes && (
                            <EnhancedTradeNotes
                              notes={trade.notes}
                              tokenIn={trade.tokenIn}
                              tokenOut={trade.tokenOut}
                              defaultExpanded={false}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : trades.length > 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-lg mb-2">No trades match your filters</div>
                    <p className="text-sm">Try adjusting your search or clearing filters.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTags([]);
                      }}
                      className="mt-4"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-lg mb-2">No trades yet</div>
                    <p className="text-sm">Trades will appear here once you submit them.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State Action */}
        {!isLoading && trades.length === 0 && !error && (
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/submit-trade">
                Submit Your First Trade →
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTrade && (
        <TradeEditModal
          trade={editingTrade}
          isOpen={!!editingTrade}
          onClose={() => setEditingTrade(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTradeId}
        title="Delete Trade"
        message="Are you sure you want to delete this trade? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteTrade}
        onCancel={() => setDeletingTradeId(null)}
        isLoading={isDeleting}
        variant="danger"
      />
    </main>
  );
}

