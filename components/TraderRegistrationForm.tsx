'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import {
  traderRegistrationSchema,
  type TraderRegistrationInput,
  TRADING_STYLES,
} from '@/lib/validations/trader';

export function TraderRegistrationForm() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TraderRegistrationInput>({
    resolver: zodResolver(traderRegistrationSchema),
    defaultValues: {
      subscriptionPrice: 10,
      performanceFee: 10,
      tradingStyles: [],
    },
  });

  const selectedStyles = watch('tradingStyles') || [];

  const toggleStyle = (style: string) => {
    const current = selectedStyles;
    if (current.includes(style)) {
      setValue('tradingStyles', current.filter((s) => s !== style));
    } else if (current.length < 5) {
      setValue('tradingStyles', [...current, style]);
    }
  };

  const onSubmit = async (data: TraderRegistrationInput) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/traders/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          walletAddress: address,
          subscriptionPrice: Math.round(data.subscriptionPrice * 100), // Convert to cents
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      const result = await response.json();
      router.push(`/traders/${result.trader.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">
          Connect your wallet to become a trader
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Username */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          {...register('username')}
          type="text"
          placeholder="Your trading name"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          placeholder="Tell others about your trading strategy and experience..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Avatar URL (Optional)
        </label>
        <input
          {...register('avatarUrl')}
          type="url"
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
        {errors.avatarUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.avatarUrl.message}</p>
        )}
      </div>

      {/* Subscription Price */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Monthly Subscription Price (USD) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('subscriptionPrice', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          max="10000"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
        {errors.subscriptionPrice && (
          <p className="text-red-500 text-sm mt-1">{errors.subscriptionPrice.message}</p>
        )}
        <p className="text-gray-400 text-sm mt-1">
          How much copiers pay per month to follow your trades
        </p>
      </div>

      {/* Performance Fee */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Performance Fee (%) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('performanceFee', { valueAsNumber: true })}
          type="number"
          step="1"
          min="0"
          max="20"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
        {errors.performanceFee && (
          <p className="text-red-500 text-sm mt-1">{errors.performanceFee.message}</p>
        )}
        <p className="text-gray-400 text-sm mt-1">
          Percentage of profits you earn from copiers (0-20%)
        </p>
      </div>

      {/* Trading Styles */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Trading Styles <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs ml-2">
            (Select 1-5 styles)
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TRADING_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStyles.includes(style)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
        {errors.tradingStyles && (
          <p className="text-red-500 text-sm mt-1">{errors.tradingStyles.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
      >
        {isSubmitting ? 'Registering...' : 'Register as Trader'}
      </button>

      <p className="text-sm text-gray-400 text-center">
        By registering, you agree to share your trading activity with your subscribers
      </p>
    </form>
  );
}

