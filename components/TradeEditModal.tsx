'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tradeSubmissionSchema, type TradeSubmissionInput } from '@/lib/validations/trade';

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Trade</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Token In */}
          <div>
            <label htmlFor="edit-tokenIn" className="block text-sm font-medium text-gray-300 mb-2">
              Token In <span className="text-red-500">*</span>
            </label>
            <input
              {...register('tokenIn')}
              id="edit-tokenIn"
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.tokenIn && (
              <p className="mt-1 text-sm text-red-400">{errors.tokenIn.message}</p>
            )}
          </div>

          {/* Token Out */}
          <div>
            <label htmlFor="edit-tokenOut" className="block text-sm font-medium text-gray-300 mb-2">
              Token Out <span className="text-red-500">*</span>
            </label>
            <input
              {...register('tokenOut')}
              id="edit-tokenOut"
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.tokenOut && (
              <p className="mt-1 text-sm text-red-400">{errors.tokenOut.message}</p>
            )}
          </div>

          {/* Amount In */}
          <div>
            <label htmlFor="edit-amountIn" className="block text-sm font-medium text-gray-300 mb-2">
              Amount In <span className="text-red-500">*</span>
            </label>
            <input
              {...register('amountIn')}
              id="edit-amountIn"
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.amountIn && (
              <p className="mt-1 text-sm text-red-400">{errors.amountIn.message}</p>
            )}
          </div>

          {/* Amount Out */}
          <div>
            <label htmlFor="edit-amountOut" className="block text-sm font-medium text-gray-300 mb-2">
              Amount Out <span className="text-red-500">*</span>
            </label>
            <input
              {...register('amountOut')}
              id="edit-amountOut"
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.amountOut && (
              <p className="mt-1 text-sm text-red-400">{errors.amountOut.message}</p>
            )}
          </div>

          {/* Transaction Hash */}
          <div>
            <label htmlFor="edit-txHash" className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Hash <span className="text-red-500">*</span>
            </label>
            <input
              {...register('txHash')}
              id="edit-txHash"
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={isSubmitting}
            />
            {errors.txHash && (
              <p className="mt-1 text-sm text-red-400">{errors.txHash.message}</p>
            )}
          </div>

          {/* USD Value */}
          <div>
            <label htmlFor="edit-usdValue" className="block text-sm font-medium text-gray-300 mb-2">
              USD Value <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              {...register('usdValue', { 
                setValueAs: (v) => v === '' ? null : parseFloat(v)
              })}
              id="edit-usdValue"
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.usdValue && (
              <p className="mt-1 text-sm text-red-400">{errors.usdValue.message}</p>
            )}
          </div>

          {/* Trade Notes */}
          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-300 mb-2">
              Trade Notes <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">(Min 500 characters)</span>
            </label>
            <textarea
              {...register('notes')}
              id="edit-notes"
              rows={6}
              placeholder="Explain your reasoning, strategy, and analysis..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-400">{errors.notes.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

