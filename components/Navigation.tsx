'use client';

import Link from 'next/link';
import { ConnectButton } from './ConnectButton';
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

  useEffect(() => {
    async function fetchUserData() {
      if (!isConnected || !address) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users');
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
  }, [address, isConnected]);

  const isTrader = userData?.trader !== null;

  return (
    <header className="border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            Social Trading
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/traders"
              className={`text-sm font-medium transition-colors ${
                pathname === '/traders'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Browse Traders
            </Link>
            {isTrader && (
              <>
                <Link
                  href="/my-trades"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/my-trades'
                      ? 'text-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  My Trades
                </Link>
                <Link
                  href="/submit-trade"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/submit-trade'
                      ? 'text-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Submit Trade
                </Link>
              </>
            )}
            {!isTrader && isConnected && !isLoading && (
              <Link
                href="/become-trader"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Become a Trader
              </Link>
            )}
          </nav>

          {/* Connect Button */}
          <ConnectButton />
        </div>

        {/* Mobile Navigation */}
        {isConnected && isTrader && (
          <nav className="md:hidden flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
            <Link
              href="/my-trades"
              className={`text-sm font-medium transition-colors ${
                pathname === '/my-trades'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Trades
            </Link>
            <Link
              href="/submit-trade"
              className={`text-sm font-medium transition-colors ${
                pathname === '/submit-trade'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Submit
            </Link>
            <Link
              href="/traders"
              className={`text-sm font-medium transition-colors ${
                pathname === '/traders'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Browse
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

