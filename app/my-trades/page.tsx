'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { TradeHistoryTable, TradeHistoryTableSkeleton } from '@/components/TradeHistoryTable';
import { TradeEditModal } from '@/components/TradeEditModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  
  // Edit/Delete state
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    async function fetchMyTrades() {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First, get the current user and their trader info
        const userResponse = await fetch('/api/users');
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
  }, [address, isConnected]);

  const handleDeleteTrade = async () => {
    if (!deletingTradeId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trades/${deletingTradeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete trade');
      }

      // Remove trade from list
      setTrades(trades.filter(t => t.id !== deletingTradeId));
      setToast({ message: 'Trade deleted successfully', type: 'success' });
      setDeletingTradeId(null);
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to delete trade', 
        type: 'error' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setToast({ message: 'Trade updated successfully', type: 'success' });
    // Refresh trades list
    if (traderInfo) {
      fetch(`/api/trades?traderId=${traderInfo.id}`)
        .then(res => res.json())
        .then(data => setTrades(data.trades || []))
        .catch(err => console.error('Error refreshing trades:', err));
    }
  };

  if (!isConnected) {
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
            Social Trading
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
              {isLoading ? 'Loading...' : `${trades.length} trade${trades.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>
          <Link
            href="/submit-trade"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            + Submit Trade
          </Link>
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
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Total Trades</div>
              <div className="text-3xl font-bold text-blue-500">{trades.length}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Total Volume (USD)</div>
              <div className="text-3xl font-bold text-green-500">
                ${trades.reduce((sum, t) => sum + (t.usdValue || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Unique Tokens</div>
              <div className="text-3xl font-bold text-purple-500">
                {new Set([...trades.map(t => t.tokenIn), ...trades.map(t => t.tokenOut)]).size}
              </div>
            </div>
          </div>
        )}

        {/* Trades Table */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6">Trade History</h2>
          
          {isLoading ? (
            <TradeHistoryTableSkeleton />
          ) : (
            <div className="space-y-4">
              {trades.length > 0 ? (
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div key={trade.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Trade Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Token Pair */}
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Pair</div>
                            <div className="font-mono text-sm">
                              <span className="text-blue-400">{trade.tokenIn}</span>
                              <span className="text-gray-500 mx-1">→</span>
                              <span className="text-green-400">{trade.tokenOut}</span>
                            </div>
                          </div>

                          {/* Amount In */}
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Amount In</div>
                            <div className="font-medium text-sm">
                              {trade.amountIn} <span className="text-gray-500">{trade.tokenIn}</span>
                            </div>
                          </div>

                          {/* Amount Out */}
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Amount Out</div>
                            <div className="font-medium text-sm">
                              {trade.amountOut} <span className="text-gray-500">{trade.tokenOut}</span>
                            </div>
                          </div>

                          {/* USD Value */}
                          <div>
                            <div className="text-xs text-gray-400 mb-1">USD Value</div>
                            <div className="font-medium text-sm">
                              {trade.usdValue ? (
                                <span className="text-green-400">${trade.usdValue.toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                          </div>

                          {/* Date */}
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Date</div>
                            <div className="text-sm text-gray-300">
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
                          <button
                            onClick={() => setEditingTrade(trade)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                            title="Edit trade"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingTradeId(trade.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                            title="Delete trade"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg mb-2">No trades yet</div>
                  <p className="text-sm">Trades will appear here once you submit them.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State Action */}
        {!isLoading && trades.length === 0 && !error && (
          <div className="text-center mt-8">
            <Link
              href="/submit-trade"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Submit Your First Trade →
            </Link>
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

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}

