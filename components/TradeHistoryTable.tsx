'use client';

import { formatCurrency, formatAddress, getExplorerUrl } from '@/lib/utils';
import Link from 'next/link';

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
}

interface TradeHistoryTableProps {
  trades: Trade[];
  showTrader?: boolean;
  traderInfo?: {
    username?: string;
    walletAddress: string;
  };
}

export function TradeHistoryTable({ trades, showTrader, traderInfo }: TradeHistoryTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No trades yet</div>
        <p className="text-gray-400 text-sm">
          Trades will appear here once you submit them.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3 font-medium">Token Pair</th>
              <th className="pb-3 font-medium">Amount In</th>
              <th className="pb-3 font-medium">Amount Out</th>
              <th className="pb-3 font-medium">USD Value</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-gray-700 last:border-0 hover:bg-gray-800/50">
                <td className="py-4">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-blue-400">{trade.tokenIn}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-green-400">{trade.tokenOut}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="font-medium">{trade.amountIn}</span>
                  <span className="text-gray-500 text-sm ml-1">{trade.tokenIn}</span>
                </td>
                <td className="py-4">
                  <span className="font-medium">{trade.amountOut}</span>
                  <span className="text-gray-500 text-sm ml-1">{trade.tokenOut}</span>
                </td>
                <td className="py-4">
                  {trade.usdValue ? (
                    <span className="text-green-400">{formatCurrency(trade.usdValue)}</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-4 text-gray-400 text-sm">
                  {new Date(trade.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-4">
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {trades.map((trade) => (
          <div key={trade.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            {/* Token Pair */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-blue-400 font-semibold">{trade.tokenIn}</span>
                <span className="text-gray-500">→</span>
                <span className="text-green-400 font-semibold">{trade.tokenOut}</span>
              </div>
              {trade.usdValue && (
                <span className="text-green-400 font-semibold">
                  {formatCurrency(trade.usdValue)}
                </span>
              )}
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Amount In</div>
                <div className="font-medium">
                  {trade.amountIn} <span className="text-gray-500 text-sm">{trade.tokenIn}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Amount Out</div>
                <div className="font-medium">
                  {trade.amountOut} <span className="text-gray-500 text-sm">{trade.tokenOut}</span>
                </div>
              </div>
            </div>

            {/* Date and Tx Hash */}
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(trade.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <a
                  href={getExplorerUrl(trade.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 font-mono text-xs inline-flex items-center gap-1"
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function TradeHistoryTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="hidden md:block space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-800 rounded" />
        ))}
      </div>
      <div className="md:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

