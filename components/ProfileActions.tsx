'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ProfileActionsProps {
  traderWalletAddress: string;
  subscriptionPrice: number;
}

export function ProfileActions({ traderWalletAddress, subscriptionPrice }: ProfileActionsProps) {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if viewing own profile
  const isOwnProfile = mounted && address?.toLowerCase() === traderWalletAddress.toLowerCase();

  if (isOwnProfile) {
    // Show trader actions (Submit Trade)
    return (
      <div className="bg-gray-900 rounded-lg p-6 w-64 flex-shrink-0">
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm mb-2">Your Profile</div>
          <div className="text-lg font-semibold text-white">Manage Your Trades</div>
        </div>
        
        <Link href="/submit-trade">
          <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors mb-2">
            📝 Submit Trade
          </button>
        </Link>
        
        <Link href="/my-trades">
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            📊 View My Trades
          </button>
        </Link>
      </div>
    );
  }

  // Show subscribe actions (for other traders)
  return (
    <div className="bg-gray-900 rounded-lg p-6 w-64 flex-shrink-0">
      <div className="text-center mb-4">
        <div className="text-gray-400 text-sm mb-1">Monthly Price</div>
        <div className="text-3xl font-bold text-blue-500">
          {formatCurrency(subscriptionPrice / 100)}
        </div>
      </div>
      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mb-2">
        Subscribe
      </button>
      <p className="text-xs text-gray-400 text-center">
        Connect wallet to subscribe
      </p>
    </div>
  );
}

