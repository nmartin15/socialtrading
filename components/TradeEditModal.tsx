'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { tradeSubmissionSchema, type TradeSubmissionInput } from '@/lib/validations/trade';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  txHash: string;
  usdValue: number | null;
  notes: string;
}

interface TradeEditModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TradeEditModal({ trade, isOpen, onClose, onSuccess }: TradeEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TradeSubmissionInput>({
    resolver: zodResolver(tradeSubmissionSchema),
    defaultValues: {
      tokenIn: trade.tokenIn,
      tokenOut: trade.tokenOut,
      amountIn: trade.amountIn,
      amountOut: trade.amountOut,
      txHash: trade.txHash,
      usdValue: trade.usdValue || undefined,
      notes: trade.notes,
    },
  });

  // Reset form when trade changes
  useEffect(() => {
    reset({
      tokenIn: trade.tokenIn,
      tokenOut: trade.tokenOut,
      amountIn: trade.amountIn,
      amountOut: trade.amountOut,
      txHash: trade.txHash,
      usdValue: trade.usdValue || undefined,
      notes: trade.notes,
    });
  }, [trade, reset]);

  const onSubmit = async (data: TradeSubmissionInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: 'PUT',
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
        throw new Error(result.error || 'Failed to update trade');
      }

      toast({
        title: 'Success!',
        description: 'Trade updated successfully.',
      });
      onSuccess();
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>
            Update the details of your trade below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Token In */}
          <div className="space-y-2">
            <Label htmlFor="edit-tokenIn">
              Token In <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register('tokenIn')}
              id="edit-tokenIn"
              type="text"
              disabled={isSubmitting}
            />
            {errors.tokenIn && (
              <p className="text-sm text-destructive">{errors.tokenIn.message}</p>
            )}
          </div>

          {/* Token Out */}
          <div className="space-y-2">
            <Label htmlFor="edit-tokenOut">
              Token Out <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register('tokenOut')}
              id="edit-tokenOut"
              type="text"
              disabled={isSubmitting}
            />
            {errors.tokenOut && (
              <p className="text-sm text-destructive">{errors.tokenOut.message}</p>
            )}
          </div>

          {/* Amount In */}
          <div className="space-y-2">
            <Label htmlFor="edit-amountIn">
              Amount In <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register('amountIn')}
              id="edit-amountIn"
              type="text"
              disabled={isSubmitting}
            />
            {errors.amountIn && (
              <p className="text-sm text-destructive">{errors.amountIn.message}</p>
            )}
          </div>

          {/* Amount Out */}
          <div className="space-y-2">
            <Label htmlFor="edit-amountOut">
              Amount Out <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register('amountOut')}
              id="edit-amountOut"
              type="text"
              disabled={isSubmitting}
            />
            {errors.amountOut && (
              <p className="text-sm text-destructive">{errors.amountOut.message}</p>
            )}
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <Label htmlFor="edit-txHash">
              Transaction Hash <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register('txHash')}
              id="edit-txHash"
              type="text"
              className="font-mono"
              disabled={isSubmitting}
            />
            {errors.txHash && (
              <p className="text-sm text-destructive">{errors.txHash.message}</p>
            )}
          </div>

          {/* USD Value */}
          <div className="space-y-2">
            <Label htmlFor="edit-usdValue">
              USD Value <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              {...register('usdValue', { 
                setValueAs: (v) => v === '' ? null : parseFloat(v)
              })}
              id="edit-usdValue"
              type="number"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.usdValue && (
              <p className="text-sm text-destructive">{errors.usdValue.message}</p>
            )}
          </div>

          {/* Trade Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">
              Trade Notes <span className="text-destructive">*</span>
              <span className="text-muted-foreground text-xs ml-2">(Min 500 characters)</span>
            </Label>
            <Textarea
              {...register('notes')}
              id="edit-notes"
              rows={6}
              placeholder="Explain your reasoning, strategy, and analysis..."
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
