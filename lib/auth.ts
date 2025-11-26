/**
 * Web3 Authentication System
 * Handles wallet signature verification and JWT session management
 */
import { verifyMessage } from 'viem';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-must-be-at-least-32-characters-long-change-this'
);

/**
 * Generate a message for the user to sign
 * This should be unique and include timestamp to prevent replay attacks
 */
export function generateAuthMessage(walletAddress: string): string {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(7);
  
  return `Sign this message to authenticate with DexMirror.

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

/**
 * Verify a wallet signature
 * @param address - The wallet address that supposedly signed the message
 * @param message - The original message that was signed
 * @param signature - The signature from the wallet
 * @returns true if signature is valid
 */
export async function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return valid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Create a JWT authentication token
 * @param walletAddress - The authenticated wallet address
 * @returns JWT token string
 */
export async function createAuthToken(walletAddress: string): Promise<string> {
  try {
    const token = await new SignJWT({ 
      walletAddress: walletAddress.toLowerCase(),
      type: 'auth',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .setSubject(walletAddress.toLowerCase())
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Failed to create auth token:', error);
    throw new Error('Authentication failed');
  }
}

/**
 * Verify a JWT authentication token
 * @param token - JWT token to verify
 * @returns wallet address if valid, null if invalid
 */
export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.walletAddress && typeof payload.walletAddress === 'string') {
      return payload.walletAddress;
    }
    
    return null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Extract wallet address from request
 * Checks Authorization header for Bearer token
 * @param request - Next.js request object
 * @returns wallet address if authenticated, null otherwise
 */
export async function getAuthenticatedWallet(
  request: Request
): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware helper to require authentication
 * Throws error if not authenticated
 */
export async function requireAuth(request: Request): Promise<string> {
  const walletAddress = await getAuthenticatedWallet(request);
  
  if (!walletAddress) {
    throw new Error('Authentication required. Please connect your wallet and sign the message.');
  }
  
  return walletAddress;
}

/**
 * Check if a message is recent (within last 5 minutes)
 * Prevents replay attacks with old signatures
 */
export function isMessageRecent(message: string): boolean {
  try {
    // Extract timestamp from message
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) return false;
    
    const timestamp = parseInt(timestampMatch[1]);
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    return timestamp > fiveMinutesAgo;
  } catch {
    return false;
  }
}

/**
 * Complete authentication flow helper
 * @returns auth token if successful, throws error otherwise
 */
export async function authenticateWallet(
  walletAddress: string,
  message: string,
  signature: string
): Promise<string> {
  // Verify message is recent (prevent replay attacks)
  if (!isMessageRecent(message)) {
    throw new Error('Authentication message expired. Please request a new message.');
  }
  
  // Verify the signature
  const isValid = await verifyWalletSignature(walletAddress, message, signature);
  
  if (!isValid) {
    throw new Error('Invalid signature. Please try signing the message again.');
  }
  
  // Create and return JWT token
  return await createAuthToken(walletAddress);
}

