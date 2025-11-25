'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionDialog } from '@/components/SubscriptionDialog';
import { CopySettingsDialog } from '@/components/CopySettingsDialog';
import { useToast } from '@/hooks/use-toast';

interface ProfileActionsProps {
  traderWalletAddress: string;
  subscriptionPrice: number;
  traderId: string;
  traderName?: string;
}

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  copySettings?: any;
}

export function ProfileActions({ 
  traderWalletAddress, 
  subscriptionPrice,
  traderId,
  traderName = 'this trader',
}: ProfileActionsProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch subscription status
  useEffect(() => {
    const shouldFetch = mounted && address && address.toLowerCase() !== traderWalletAddress.toLowerCase();
    if (shouldFetch) {
      fetchSubscription();
    }
  }, [mounted, address, traderId, traderWalletAddress]);

  const isOwnProfile = mounted && address?.toLowerCase() === traderWalletAddress.toLowerCase();

  const fetchSubscription = async () => {
    if (!address) return;

    setIsLoadingSubscription(true);
    try {
      const response = await fetch(`/api/subscriptions?walletAddress=${address}`);
      if (response.ok) {
        const data = await response.json();
        const sub = data.subscriptions?.find((s: any) => s.traderId === traderId);
        setSubscription(sub || null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleUpdateStatus = async (status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    if (!subscription || !address) return;

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
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
        title: 'Subscription updated',
        description: `Subscription ${status.toLowerCase()}`,
      });

      fetchSubscription();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  if (isOwnProfile) {
    // Show trader actions (Submit Trade)
    return (
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="text-center">
          <CardDescription>Your Profile</CardDescription>
          <CardTitle>Manage Your Trades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full" variant="default">
            <Link href="/submit-trade">
              📝 Submit Trade
            </Link>
          </Button>
          
          <Button asChild className="w-full" variant="secondary">
            <Link href="/my-trades">
              📊 View My Trades
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show subscribe actions (for other traders)
  if (!subscription || subscription.status === 'CANCELLED') {
    return (
      <>
        <Card className="w-64 flex-shrink-0">
          <CardHeader className="text-center">
            <CardDescription>Monthly Price</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {formatCurrency(subscriptionPrice / 100)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full"
              onClick={() => setShowSubscribeDialog(true)}
              disabled={!address || isLoadingSubscription}
            >
              {isLoadingSubscription ? 'Loading...' : 'Subscribe'}
            </Button>
            {!address && (
              <p className="text-xs text-muted-foreground text-center">
                Connect wallet to subscribe
              </p>
            )}
          </CardContent>
        </Card>

        <SubscriptionDialog
          open={showSubscribeDialog}
          onOpenChange={setShowSubscribeDialog}
          traderId={traderId}
          traderName={traderName}
          subscriptionPrice={subscriptionPrice}
          onSubscribed={fetchSubscription}
        />
      </>
    );
  }

  // Show subscription management (already subscribed)
  return (
    <>
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="text-center">
          <CardDescription>Your Subscription</CardDescription>
          <CardTitle className="text-2xl">
            {subscription.status === 'ACTIVE' ? (
              <span className="text-green-500">✓ Active</span>
            ) : (
              <span className="text-yellow-500">⏸ Paused</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            className="w-full"
            onClick={() => setShowSettingsDialog(true)}
          >
            ⚙️ Copy Settings
          </Button>
          
          {subscription.status === 'ACTIVE' ? (
            <Button 
              className="w-full"
              variant="outline"
              onClick={() => handleUpdateStatus('PAUSED')}
            >
              ⏸ Pause Copying
            </Button>
          ) : (
            <Button 
              className="w-full"
              variant="default"
              onClick={() => handleUpdateStatus('ACTIVE')}
            >
              ▶️ Resume Copying
            </Button>
          )}

          <Button 
            className="w-full"
            variant="destructive"
            onClick={() => handleUpdateStatus('CANCELLED')}
          >
            ✕ Cancel Subscription
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            {formatCurrency(subscriptionPrice / 100)}/month
          </p>
        </CardContent>
      </Card>

      <CopySettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        subscriptionId={subscription.id}
        traderName={traderName}
        currentSettings={subscription.copySettings}
        onSettingsUpdated={fetchSubscription}
      />
    </>
  );
}

