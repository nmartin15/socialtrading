'use client';

import Link from 'next/link';
import { ConnectButton } from './ConnectButton';
import { NotificationBell } from './NotificationBell';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface UserData {
  id: string;
  role: string;
  trader: {
    id: string;
  } | null;
}

export function Navigation() {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!mounted || !isConnected || !address) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users?walletAddress=${address}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [mounted, address, isConnected]);

  const isTrader = userData?.trader != null; // != null checks for both null and undefined

  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            🔮 DexMirror
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/traders"
              className={`text-sm font-medium transition-colors ${
                pathname === '/traders'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Browse Traders
            </Link>
            {mounted && isConnected && !isLoading && (
              <Link
                href="/my-subscriptions"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/my-subscriptions'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Subscriptions
              </Link>
            )}
            {mounted && isTrader && (
              <>
                <Link
                  href="/my-trades"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/my-trades'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Trades
                </Link>
                <Link
                  href="/submit-trade"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/submit-trade'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Submit Trade
                </Link>
                <Link
                  href={`/analytics/${userData?.trader?.id}`}
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith('/analytics')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}
            {!isTrader && mounted && isConnected && !isLoading && (
              <Link
                href="/become-trader"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Become a Trader
              </Link>
            )}
          </nav>

          {/* Connect Button & Notifications */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        {mounted && isConnected && (
          <nav className="md:hidden flex items-center gap-4 mt-4 pt-4 border-t border-border overflow-x-auto">
            <Link
              href="/traders"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === '/traders'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Browse
            </Link>
            <Link
              href="/my-subscriptions"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === '/my-subscriptions'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Subscriptions
            </Link>
            {isTrader && (
              <>
                <Link
                  href="/my-trades"
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === '/my-trades'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Trades
                </Link>
                <Link
                  href="/submit-trade"
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === '/submit-trade'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Submit
                </Link>
                <Link
                  href={`/analytics/${userData?.trader?.id}`}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname?.startsWith('/analytics')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

