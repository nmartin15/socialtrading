'use client';

import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { formatAddress } from '@/lib/utils';
import { injected } from 'wagmi/connectors';
import { useState, useEffect } from 'react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <button
        disabled
        className="px-6 py-2 bg-gray-700 text-gray-400 rounded-lg font-medium cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
          {formatAddress(address)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
}

