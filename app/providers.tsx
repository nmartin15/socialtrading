'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { useEffect } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web3Modal only on client side if project ID exists
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (projectId && typeof window !== 'undefined') {
      import('@/lib/wagmi').then(({ codex }) => {
        import('@web3modal/wagmi/react').then(({ createWeb3Modal }) => {
          createWeb3Modal({
            wagmiConfig: config,
            projectId,
            themeMode: 'dark',
          });
        });
      });
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

