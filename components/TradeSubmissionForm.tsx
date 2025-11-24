'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tradeSubmissionSchema, type TradeSubmissionInput } from '@/lib/validations/trade';
import { useRouter } from 'next/navigation';

export function TradeSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
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
        throw new Error(result.error || 'Failed to submit trade');
      }

      setSuccess(true);
      reset();
      
      // Redirect to my trades page after 2 seconds
      setTimeout(() => {
        router.push('/my-trades');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          ✓ Trade submitted successfully! Redirecting...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Token In */}
      <div>
        <label htmlFor="tokenIn" className="block text-sm font-medium text-gray-300 mb-2">
          Token In <span className="text-red-500">*</span>
        </label>
        <input
          {...register('tokenIn')}
          id="tokenIn"
          type="text"
          placeholder="e.g., ETH, USDC, DEX"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.tokenIn && (
          <p className="mt-1 text-sm text-red-400">{errors.tokenIn.message}</p>
        )}
      </div>

      {/* Token Out */}
      <div>
        <label htmlFor="tokenOut" className="block text-sm font-medium text-gray-300 mb-2">
          Token Out <span className="text-red-500">*</span>
        </label>
        <input
          {...register('tokenOut')}
          id="tokenOut"
          type="text"
          placeholder="e.g., DAI, USDT, BTC"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.tokenOut && (
          <p className="mt-1 text-sm text-red-400">{errors.tokenOut.message}</p>
        )}
      </div>

      {/* Amount In */}
      <div>
        <label htmlFor="amountIn" className="block text-sm font-medium text-gray-300 mb-2">
          Amount In <span className="text-red-500">*</span>
        </label>
        <input
          {...register('amountIn')}
          id="amountIn"
          type="text"
          placeholder="e.g., 1.5"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.amountIn && (
          <p className="mt-1 text-sm text-red-400">{errors.amountIn.message}</p>
        )}
      </div>

      {/* Amount Out */}
      <div>
        <label htmlFor="amountOut" className="block text-sm font-medium text-gray-300 mb-2">
          Amount Out <span className="text-red-500">*</span>
        </label>
        <input
          {...register('amountOut')}
          id="amountOut"
          type="text"
          placeholder="e.g., 2500.75"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.amountOut && (
          <p className="mt-1 text-sm text-red-400">{errors.amountOut.message}</p>
        )}
      </div>

      {/* Transaction Hash */}
      <div>
        <label htmlFor="txHash" className="block text-sm font-medium text-gray-300 mb-2">
          Transaction Hash <span className="text-red-500">*</span>
        </label>
        <input
          {...register('txHash')}
          id="txHash"
          type="text"
          placeholder="0x..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          disabled={isSubmitting}
        />
        {errors.txHash && (
          <p className="mt-1 text-sm text-red-400">{errors.txHash.message}</p>
        )}
      </div>

      {/* USD Value (Optional) */}
      <div>
        <label htmlFor="usdValue" className="block text-sm font-medium text-gray-300 mb-2">
          USD Value <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <input
          {...register('usdValue', { 
            setValueAs: (v) => v === '' ? null : parseFloat(v)
          })}
          id="usdValue"
          type="number"
          step="0.01"
          placeholder="e.g., 1500.00"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.usdValue && (
          <p className="mt-1 text-sm text-red-400">{errors.usdValue.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Trade'}
      </button>

      <p className="text-sm text-gray-400 text-center">
        Make sure all information is accurate before submitting.
      </p>
    </form>
  );
}

