// Common types for the application
export type Address = `0x${string}`;

export interface TraderProfile {
  id: string;
  walletAddress: Address;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  subscriptionPrice: number;
  performanceFee: number;
  tradingStyles: string[];
  verified: boolean;
  totalFollowers: number;
  activeCopiers: number;
}

export interface TradeData {
  id: string;
  traderId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  txHash: string;
  timestamp: Date;
  usdValue?: number;
}

export interface PerformanceMetrics {
  period: '7d' | '30d' | 'all';
  returnPct: number;
  totalPnl: number;
  updatedAt: Date;
}

