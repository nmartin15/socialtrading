/**
 * Input sanitization utilities
 * Prevents XSS attacks and ensures data integrity
 */
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize general text input (bio, notes, etc.)
 * Removes all HTML tags and limits length
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 5000): string {
  if (!input) return '';
  
  // Remove HTML tags and dangerous content
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  
  // Trim whitespace and limit length
  return clean.trim().slice(0, maxLength);
}

/**
 * Sanitize username
 * Only allows alphanumeric, underscore, and hyphen
 */
export function sanitizeUsername(input: string | null | undefined): string {
  if (!input) return '';
  
  // Only alphanumeric, underscore, hyphen
  const cleaned = input
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 30)
    .toLowerCase()
    .trim();
  
  // Ensure it starts with a letter or number
  if (cleaned && !/^[a-z0-9]/.test(cleaned)) {
    return '';
  }
  
  return cleaned;
}

/**
 * Sanitize and validate wallet address
 * Must be valid Ethereum address format
 */
export function sanitizeWalletAddress(input: string | null | undefined): string {
  if (!input) {
    throw new Error('Wallet address is required');
  }
  
  const cleaned = input.trim().toLowerCase();
  
  // Must be valid Ethereum address format (0x + 40 hex characters)
  if (!/^0x[a-f0-9]{40}$/.test(cleaned)) {
    throw new Error('Invalid wallet address format');
  }
  
  return cleaned;
}

/**
 * Sanitize transaction hash
 * Must be valid Ethereum transaction hash format
 */
export function sanitizeTxHash(input: string | null | undefined): string {
  if (!input) {
    throw new Error('Transaction hash is required');
  }
  
  const cleaned = input.trim().toLowerCase();
  
  // Must be valid tx hash format (0x + 64 hex characters)
  if (!/^0x[a-f0-9]{64}$/.test(cleaned)) {
    throw new Error('Invalid transaction hash format');
  }
  
  return cleaned;
}

/**
 * Sanitize token symbol
 * Only allows uppercase letters and numbers
 */
export function sanitizeTokenSymbol(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/[^A-Z0-9]/gi, '')
    .slice(0, 10)
    .toUpperCase();
}

/**
 * Sanitize numeric string (for token amounts)
 * Ensures valid decimal format
 */
export function sanitizeNumericString(input: string | null | undefined): string {
  if (!input) {
    throw new Error('Numeric value is required');
  }
  
  const cleaned = input.trim();
  
  // Must be valid decimal number
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error('Invalid numeric format');
  }
  
  // Check for reasonable bounds
  const num = parseFloat(cleaned);
  if (num < 0) {
    throw new Error('Value cannot be negative');
  }
  if (!isFinite(num)) {
    throw new Error('Value must be finite');
  }
  
  return cleaned;
}

/**
 * Sanitize URL
 * Validates URL format and removes dangerous protocols
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return '';
  
  const cleaned = input.trim();
  
  try {
    const url = new URL(cleaned);
    
    // Only allow safe protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return url.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize trading style
 * Ensures valid trading style values
 */
export function sanitizeTradingStyle(input: string | null | undefined): string {
  if (!input) return '';
  
  const validStyles = [
    'Swing Trading',
    'Day Trading',
    'Scalping',
    'Position Trading',
    'Arbitrage',
    'Trend Following',
    'Mean Reversion',
    'Momentum',
    'Value Investing',
    'Growth Investing',
    'DeFi Farming',
    'NFT Trading',
  ];
  
  const cleaned = input.trim();
  
  // Check if it's a valid style
  if (!validStyles.includes(cleaned)) {
    throw new Error(`Invalid trading style: ${cleaned}`);
  }
  
  return cleaned;
}

/**
 * Sanitize array of strings (e.g., trading styles)
 */
export function sanitizeStringArray(
  input: string[] | null | undefined,
  sanitizer: (str: string) => string,
  maxLength: number = 10
): string[] {
  if (!input || !Array.isArray(input)) return [];
  
  return input
    .slice(0, maxLength)
    .map(sanitizer)
    .filter(Boolean);
}

