import { z } from 'zod';

// Trade submission validation schema
export const tradeSubmissionSchema = z.object({
  tokenIn: z
    .string()
    .min(1, 'Token In is required')
    .max(10, 'Token symbol too long')
    .regex(/^[A-Z0-9]+$/, 'Token symbols must be uppercase letters and numbers'),
  tokenOut: z
    .string()
    .min(1, 'Token Out is required')
    .max(10, 'Token symbol too long')
    .regex(/^[A-Z0-9]+$/, 'Token symbols must be uppercase letters and numbers'),
  amountIn: z
    .string()
    .min(1, 'Amount In is required')
    .regex(/^\d+(\.\d+)?$/, 'Must be a valid number')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  amountOut: z
    .string()
    .min(1, 'Amount Out is required')
    .regex(/^\d+(\.\d+)?$/, 'Must be a valid number')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  txHash: z
    .string()
    .min(1, 'Transaction hash is required')
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format (must be 0x followed by 64 hex characters)'),
  usdValue: z
    .number()
    .positive('USD value must be positive')
    .optional()
    .or(z.literal(0))
    .nullable(),
  notes: z
    .string()
    .min(500, 'Trade notes must be at least 500 characters - explain your reasoning, strategy, and analysis')
    .max(2000, 'Trade notes must be less than 2000 characters'),
});

export type TradeSubmissionInput = z.infer<typeof tradeSubmissionSchema>;

