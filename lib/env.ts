/**
 * Environment variable validation
 * This ensures all required configuration is present at startup
 */
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .optional(),
  
  // Web3
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z
    .string()
    .min(1, 'WalletConnect Project ID is required'),
  NEXT_PUBLIC_CODEX_RPC_URL: z
    .string()
    .url('CODEX_RPC_URL must be a valid URL')
    .default('http://node-mainnet.thecodex.net/'),
  NEXT_PUBLIC_CODEX_CHAIN_ID: z.string().default('1776'),
  NEXT_PUBLIC_CODEX_NATIVE_TOKEN: z.string().default('DEX'),
  
  // App Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('DexMirror'),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),
  
  // Optional: Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  
  // Optional: Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Parse and validate environment variables
 * Throws an error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      throw new Error('Environment validation failed. Check your .env file.');
    }
    throw error;
  }
}

// Validate on import (server-side only)
export const env = validateEnv();

// Type-safe environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

// Export for testing
export { envSchema };

