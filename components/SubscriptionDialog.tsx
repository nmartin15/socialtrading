'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

type PaymentMethod = 'crypto' | 'card' | 'free-demo';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('free-demo');

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
      // Payment processing based on selected method
      if (paymentMethod === 'crypto') {
        // In production: Call smart contract or payment processor
        toast({
          title: 'Processing crypto payment...',
          description: 'Please confirm the transaction in your wallet',
        });
        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else if (paymentMethod === 'card') {
        // In production: Integrate with Stripe/payment processor
        toast({
          title: 'Processing card payment...',
          description: 'Redirecting to payment processor...',
        });
        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        // Free demo mode - instant activation
        toast({
          title: 'Activating free demo...',
          description: 'Setting up your subscription',
        });
      }

      // Create subscription in backend
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          traderId,
          paymentMethod,
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscribe to {traderName}</DialogTitle>
          <DialogDescription>
            Get automatic copy trading and access to exclusive trade insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Display */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Monthly Subscription</div>
            <div className="text-4xl font-bold text-blue-500">
              {formatCurrency(subscriptionPrice / 100)}
            </div>
            <div className="text-xs text-gray-400 mt-2">per month</div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Payment Method</Label>
            <div className="grid gap-2">
              {/* Free Demo Option */}
              <button
                onClick={() => setPaymentMethod('free-demo')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'free-demo'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <div className="font-semibold">Free Demo</div>
                      <div className="text-xs text-gray-400">No payment required</div>
                    </div>
                  </div>
                  {paymentMethod === 'free-demo' && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
              </button>

              {/* Crypto Payment */}
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <div className="font-semibold">Crypto Payment</div>
                      <div className="text-xs text-gray-400">Pay with DEX or other tokens</div>
                    </div>
                  </div>
                  {paymentMethod === 'crypto' && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                {paymentMethod === 'crypto' && (
                  <div className="mt-2 text-xs text-gray-400 pl-11">
                    Coming soon in production. Smart contract integration required.
                  </div>
                )}
              </button>

              {/* Card Payment */}
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <div className="font-semibold">Credit/Debit Card</div>
                      <div className="text-xs text-gray-400">Via Stripe or similar</div>
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <span className="text-purple-500">✓</span>
                  )}
                </div>
                {paymentMethod === 'card' && (
                  <div className="mt-2 text-xs text-gray-400 pl-11">
                    Coming soon in production. Payment gateway integration required.
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 pt-2">
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

          {/* Demo Mode Notice */}
          {paymentMethod === 'free-demo' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-xs text-green-200">
                <strong>Demo Mode:</strong> You can test all features for free. In production, 
                payment processing would be required for paid subscriptions.
              </p>
            </div>
          )}
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
            className={
              paymentMethod === 'free-demo'
                ? 'bg-green-600 hover:bg-green-700'
                : paymentMethod === 'crypto'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }
          >
            {isLoading 
              ? 'Processing...' 
              : paymentMethod === 'free-demo' 
              ? 'Start Free Demo' 
              : 'Subscribe Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

