/**
 * Authentication API Route
 * Handles Web3 wallet authentication
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  generateAuthMessage, 
  authenticateWallet,
  verifyAuthToken 
} from '@/lib/auth';
import { sanitizeWalletAddress } from '@/lib/sanitize';
import { z } from 'zod';

/**
 * GET /api/auth - Get authentication message for wallet
 * Query params: walletAddress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate and sanitize wallet address
    const cleanAddress = sanitizeWalletAddress(walletAddress);

    // Generate message for user to sign
    const message = generateAuthMessage(cleanAddress);

    return NextResponse.json({ 
      message,
      walletAddress: cleanAddress,
    });
  } catch (error) {
    console.error('Error generating auth message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate auth message' },
      { status: 400 }
    );
  }
}

const authSchema = z.object({
  walletAddress: z.string().min(1),
  message: z.string().min(1),
  signature: z.string().min(1),
});

/**
 * POST /api/auth - Authenticate with signed message
 * Body: { walletAddress, message, signature }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { walletAddress, message, signature } = authSchema.parse(body);

    // Sanitize wallet address
    const cleanAddress = sanitizeWalletAddress(walletAddress);

    // Authenticate and get JWT token
    const token = await authenticateWallet(cleanAddress, message, signature);

    return NextResponse.json({
      success: true,
      token,
      walletAddress: cleanAddress,
    });
  } catch (error) {
    console.error('Authentication failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * PUT /api/auth - Verify existing token
 * Headers: Authorization: Bearer <token>
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const walletAddress = await verifyAuthToken(token);

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      walletAddress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    );
  }
}

