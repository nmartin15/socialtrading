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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function TraderRegistrationForm() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/traders/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          walletAddress: walletAddress,
          subscriptionPrice: Math.round(data.subscriptionPrice * 100), // Convert to cents
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      const result = await response.json();
      toast({
        title: 'Success!',
        description: 'Trader registration successful. Redirecting...',
      });
      router.push(`/traders/${result.trader.id}`);
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

  // Allow testing without wallet connection - use a dummy address
  const walletAddress = address || '0x1234567890123456789012345678901234567890';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('username')}
          id="username"
          type="text"
          placeholder="Your trading name"
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">
          Bio <span className="text-destructive">*</span>
        </Label>
        <Textarea
          {...register('bio')}
          id="bio"
          rows={4}
          placeholder="Tell others about your trading strategy and experience..."
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Avatar URL */}
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">
          Avatar URL (Optional)
        </Label>
        <Input
          {...register('avatarUrl')}
          id="avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.avatarUrl && (
          <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
        )}
      </div>

      {/* Subscription Price */}
      <div className="space-y-2">
        <Label htmlFor="subscriptionPrice">
          Monthly Subscription Price (USD) <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('subscriptionPrice', { valueAsNumber: true })}
          id="subscriptionPrice"
          type="number"
          step="0.01"
          min="0"
          max="10000"
        />
        {errors.subscriptionPrice && (
          <p className="text-sm text-destructive">{errors.subscriptionPrice.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          How much copiers pay per month to follow your trades
        </p>
      </div>

      {/* Performance Fee */}
      <div className="space-y-2">
        <Label htmlFor="performanceFee">
          Performance Fee (%) <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('performanceFee', { valueAsNumber: true })}
          id="performanceFee"
          type="number"
          step="1"
          min="0"
          max="20"
        />
        {errors.performanceFee && (
          <p className="text-sm text-destructive">{errors.performanceFee.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Percentage of profits you earn from copiers (0-20%)
        </p>
      </div>

      {/* Trading Styles */}
      <div className="space-y-2">
        <Label>
          Trading Styles <span className="text-destructive">*</span>
          <span className="text-muted-foreground text-xs ml-2">
            (Select 1-5 styles)
          </span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TRADING_STYLES.map((style) => (
            <Button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              variant={selectedStyles.includes(style) ? 'default' : 'outline'}
              size="sm"
              className="w-full"
            >
              {style}
            </Button>
          ))}
        </div>
        {errors.tradingStyles && (
          <p className="text-sm text-destructive">{errors.tradingStyles.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Registering...' : 'Register as Trader'}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        By registering, you agree to share your trading activity with your subscribers
      </p>
    </form>
  );
}

