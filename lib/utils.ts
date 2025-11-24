import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format wallet address for display
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Parse big number string to readable format
export function formatBigNumber(value: string, decimals = 18): string {
  const num = BigInt(value) / BigInt(10 ** decimals);
  return num.toString();
}

// Get blockchain explorer URL for transaction hash
export function getExplorerUrl(txHash: string): string {
  return `https://explorer-mainnet.codexnetwork.org/tx/${txHash}`;
}

