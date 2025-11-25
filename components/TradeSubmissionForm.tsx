'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tradeSubmissionSchema, type TradeSubmissionInput } from '@/lib/validations/trade';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function TradeSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { address } = useAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TradeSubmissionInput>({
    resolver: zodResolver(tradeSubmissionSchema),
  });

  const onSubmit = async (data: TradeSubmissionInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address || '',
        },
        body: JSON.stringify({
          ...data,
          usdValue: data.usdValue ? Number(data.usdValue) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit trade');
      }

      toast({
        title: 'Success!',
        description: 'Trade submitted successfully. Redirecting...',
      });
      reset();
      
      // Redirect to my trades page after 2 seconds
      setTimeout(() => {
        router.push('/my-trades');
      }, 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Token In */}
      <div className="space-y-2">
        <Label htmlFor="tokenIn">
          Token In <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('tokenIn')}
          id="tokenIn"
          type="text"
          placeholder="e.g., ETH, USDC, DEX"
          disabled={isSubmitting}
        />
        {errors.tokenIn && (
          <p className="text-sm text-destructive">{errors.tokenIn.message}</p>
        )}
      </div>

      {/* Token Out */}
      <div className="space-y-2">
        <Label htmlFor="tokenOut">
          Token Out <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('tokenOut')}
          id="tokenOut"
          type="text"
          placeholder="e.g., DAI, USDT, BTC"
          disabled={isSubmitting}
        />
        {errors.tokenOut && (
          <p className="text-sm text-destructive">{errors.tokenOut.message}</p>
        )}
      </div>

      {/* Amount In */}
      <div className="space-y-2">
        <Label htmlFor="amountIn">
          Amount In <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('amountIn')}
          id="amountIn"
          type="text"
          placeholder="e.g., 1.5"
          disabled={isSubmitting}
        />
        {errors.amountIn && (
          <p className="text-sm text-destructive">{errors.amountIn.message}</p>
        )}
      </div>

      {/* Amount Out */}
      <div className="space-y-2">
        <Label htmlFor="amountOut">
          Amount Out <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('amountOut')}
          id="amountOut"
          type="text"
          placeholder="e.g., 2500.75"
          disabled={isSubmitting}
        />
        {errors.amountOut && (
          <p className="text-sm text-destructive">{errors.amountOut.message}</p>
        )}
      </div>

      {/* Transaction Hash */}
      <div className="space-y-2">
        <Label htmlFor="txHash">
          Transaction Hash <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('txHash')}
          id="txHash"
          type="text"
          placeholder="0x..."
          className="font-mono"
          disabled={isSubmitting}
        />
        {errors.txHash && (
          <p className="text-sm text-destructive">{errors.txHash.message}</p>
        )}
      </div>

      {/* USD Value (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="usdValue">
          USD Value <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          {...register('usdValue', { 
            setValueAs: (v) => v === '' ? null : parseFloat(v)
          })}
          id="usdValue"
          type="number"
          step="0.01"
          placeholder="e.g., 1500.00"
          disabled={isSubmitting}
        />
        {errors.usdValue && (
          <p className="text-sm text-destructive">{errors.usdValue.message}</p>
        )}
      </div>

      {/* Trade Notes (Required) */}
      <div className="space-y-2">
        <Label htmlFor="notes">
          Trade Notes <span className="text-destructive">*</span>
          <span className="text-muted-foreground text-xs ml-2">(Min 100 characters)</span>
        </Label>
        <Textarea
          {...register('notes')}
          id="notes"
          rows={6}
          placeholder="Explain your reasoning, strategy, and analysis for this trade. Include:&#10;• Why you entered this trade (market conditions, signals, setup)&#10;• Your price targets and risk management&#10;• Key indicators or patterns you're following&#10;• Expected outcome and timeframe&#10;&#10;This helps your followers understand your strategy and learn from your trades."
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {typeof window !== 'undefined' && document.getElementById('notes') 
            ? `${(document.getElementById('notes') as HTMLTextAreaElement).value.length} / 500+ characters`
            : '0 / 500+ characters'}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Trade'}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Make sure all information is accurate before submitting.
      </p>
    </form>
  );
}

