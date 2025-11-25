'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traderId: string;
  traderName: string;
  subscriptionPrice: number;
  onSubscribed?: () => void;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  traderId,
  traderName,
  subscriptionPrice,
  onSubscribed,
}: SubscriptionDialogProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to subscribe',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would involve:
      // 1. Payment processing (e.g., Stripe, crypto payment)
      // 2. Smart contract interaction if needed
      // 3. Backend subscription creation

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          traderId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to subscribe');
      }

      const data = await response.json();

      toast({
        title: 'Subscription successful! 🎉',
        description: `You are now subscribed to ${traderName}`,
      });

      onOpenChange(false);
      onSubscribed?.();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Failed to create subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {traderName}</DialogTitle>
          <DialogDescription>
            Get automatic copy trading and access to exclusive trade insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Display */}
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Monthly Subscription</div>
            <div className="text-4xl font-bold text-blue-500">
              {formatCurrency(subscriptionPrice / 100)}
            </div>
            <div className="text-xs text-gray-400 mt-2">per month</div>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">What you get:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Automatic copy trading
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Real-time trade notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Customizable copy settings
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Risk management controls
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Access to trade analysis & insights
              </li>
            </ul>
          </div>

          {/* Payment Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-xs text-yellow-200">
              <strong>Note:</strong> This is a demo platform. In production, this would integrate with
              a payment processor (Stripe, crypto payments, etc.).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={isLoading || !address}
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

