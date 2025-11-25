'use client';

import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { formatAddress } from '@/lib/utils';
import { injected } from 'wagmi/connectors';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <Button disabled variant="secondary">
        Loading...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="px-4 py-2 text-sm">
          {formatAddress(address)}
        </Badge>
        <Button
          onClick={() => disconnect()}
          variant="destructive"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: injected() })}
    >
      Connect Wallet
    </Button>
  );
}

