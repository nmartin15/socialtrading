import { z } from 'zod';

export const traderRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters'),
  subscriptionPrice: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price cannot exceed $100'),
  performanceFee: z
    .number()
    .min(0, 'Fee cannot be negative')
    .max(20, 'Fee cannot exceed 20%'),
  tradingStyles: z
    .array(z.string())
    .min(1, 'Select at least one trading style')
    .max(5, 'Select at most 5 trading styles'),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type TraderRegistrationInput = z.infer<typeof traderRegistrationSchema>;

export const TRADING_STYLES = [
  'Swing Trading',
  'Position Trading',
  'Momentum Trading',
  'Value Trading',
  'Growth Trading',
  'DeFi Farming',
  'Trend Following',
  'Dollar Cost Averaging',
] as const;

