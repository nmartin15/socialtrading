'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/ConnectButton';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopySettingsDialog } from '@/components/CopySettingsDialog';
import { formatCurrency, formatAddress } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  monthlyPrice: number;
  startDate: string;
  endDate: string | null;
  trader: {
    id: string;
    user: {
      username: string | null;
      walletAddress: string;
      avatarUrl: string | null;
    };
    verified: boolean;
  };
  copySettings: {
    copyEnabled: boolean;
    copyAmountType: 'PERCENTAGE' | 'FIXED' | 'PROPORTIONAL';
    copyAmount: number;
    maxTradeSize: number | null;
    minTradeSize: number | null;
    maxDailyLoss: number | null;
    stopLossPercent: number | null;
    allowedTokens: string | null;
    excludedTokens: string | null;
  } | null;
}

export default function MySubscriptionsPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchSubscriptions();
    } else if (mounted) {
      setIsLoading(false);
    }
  }, [mounted, isConnected, address]);

  const fetchSubscriptions = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscriptions?walletAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (subscriptionId: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    if (!address) return;

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      toast({
        title: 'Success',
        description: `Subscription ${status.toLowerCase()}`,
      });

      fetchSubscriptions();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const openSettings = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowSettingsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE');
  const pausedSubscriptions = subscriptions.filter(s => s.status === 'PAUSED');
  const cancelledSubscriptions = subscriptions.filter(s => s.status === 'CANCELLED');

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

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-gray-400">
            Manage your copy trading subscriptions and settings
          </p>
        </div>

        {!mounted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">Loading...</p>
            </CardContent>
          </Card>
        ) : !isConnected ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">Connect your wallet to view your subscriptions</p>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">Loading subscriptions...</p>
            </CardContent>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">You don't have any subscriptions yet</p>
              <Button asChild>
                <Link href="/traders">Browse Traders</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Active Subscriptions
                  <span className="text-sm font-normal text-gray-400">
                    ({activeSubscriptions.length})
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeSubscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                              {subscription.trader.user.avatarUrl ? (
                                <img
                                  src={subscription.trader.user.avatarUrl}
                                  alt={subscription.trader.user.username || 'Trader'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(subscription.trader.user.username || subscription.trader.user.walletAddress)[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {subscription.trader.user.username || 
                                 formatAddress(subscription.trader.user.walletAddress)}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Since {new Date(subscription.startDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(subscription.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Monthly Price</span>
                          <span className="font-semibold">
                            {formatCurrency(subscription.monthlyPrice / 100)}
                          </span>
                        </div>
                        
                        {subscription.copySettings && (
                          <div className="text-xs text-gray-400 space-y-1 p-2 bg-gray-800 rounded">
                            <div>Copy: {subscription.copySettings.copyEnabled ? '✓ Enabled' : '✗ Disabled'}</div>
                            <div>Type: {subscription.copySettings.copyAmountType}</div>
                            <div>Amount: {subscription.copySettings.copyAmount}</div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => openSettings(subscription)}
                          >
                            ⚙️ Settings
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleUpdateStatus(subscription.id, 'PAUSED')}
                          >
                            ⏸ Pause
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/traders/${subscription.trader.id}`}>
                            View Trader Profile →
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Paused Subscriptions */}
            {pausedSubscriptions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Paused Subscriptions
                  <span className="text-sm font-normal text-gray-400">
                    ({pausedSubscriptions.length})
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pausedSubscriptions.map((subscription) => (
                    <Card key={subscription.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                              {subscription.trader.user.avatarUrl ? (
                                <img
                                  src={subscription.trader.user.avatarUrl}
                                  alt={subscription.trader.user.username || 'Trader'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(subscription.trader.user.username || subscription.trader.user.walletAddress)[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {subscription.trader.user.username || 
                                 formatAddress(subscription.trader.user.walletAddress)}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Since {new Date(subscription.startDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(subscription.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Monthly Price</span>
                          <span className="font-semibold">
                            {formatCurrency(subscription.monthlyPrice / 100)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                            onClick={() => handleUpdateStatus(subscription.id, 'ACTIVE')}
                          >
                            ▶️ Resume
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleUpdateStatus(subscription.id, 'CANCELLED')}
                          >
                            ✕ Cancel
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/traders/${subscription.trader.id}`}>
                            View Trader Profile →
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Cancelled Subscriptions
                  <span className="text-sm font-normal text-gray-400">
                    ({cancelledSubscriptions.length})
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cancelledSubscriptions.map((subscription) => (
                    <Card key={subscription.id} className="opacity-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                              {subscription.trader.user.avatarUrl ? (
                                <img
                                  src={subscription.trader.user.avatarUrl}
                                  alt={subscription.trader.user.username || 'Trader'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(subscription.trader.user.username || subscription.trader.user.walletAddress)[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {subscription.trader.user.username || 
                                 formatAddress(subscription.trader.user.walletAddress)}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Cancelled {subscription.endDate && new Date(subscription.endDate).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(subscription.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/traders/${subscription.trader.id}`}>
                            View Trader Profile →
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      {selectedSubscription && (
        <CopySettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          subscriptionId={selectedSubscription.id}
          traderName={
            selectedSubscription.trader.user.username ||
            formatAddress(selectedSubscription.trader.user.walletAddress)
          }
          currentSettings={selectedSubscription.copySettings as any}
          onSettingsUpdated={fetchSubscriptions}
        />
      )}
    </main>
  );
}

