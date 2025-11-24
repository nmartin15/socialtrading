import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tradeSubmissionSchema } from '@/lib/validations/trade';
import { z } from 'zod';

// GET /api/trades/[id] - Get a specific trade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        trader: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trade });
  } catch (error) {
    console.error('Error fetching trade:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade' },
      { status: 500 }
    );
  }
}

// PUT /api/trades/[id] - Update a trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get wallet address from header
    // For testing without wallet connection, use dummy address
    const walletAddress = request.headers.get('x-wallet-address') || '0x1234567890123456789012345678901234567890';
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Unauthorized. Please connect your wallet.' },
        { status: 401 }
      );
    }

    // Validate input
    const validatedData = tradeSubmissionSchema.parse(body);

    // Get the existing trade
    const existingTrade = await prisma.trade.findUnique({
      where: { id },
      include: {
        trader: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this trade
    if (existingTrade.trader.user.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: 'You can only edit your own trades' },
        { status: 403 }
      );
    }

    // If txHash is being changed, check it's unique
    if (validatedData.txHash !== existingTrade.txHash) {
      const txHashExists = await prisma.trade.findUnique({
        where: { txHash: validatedData.txHash },
      });

      if (txHashExists) {
        return NextResponse.json(
          { error: 'This transaction hash is already in use' },
          { status: 409 }
        );
      }
    }

    // Update the trade
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        tokenIn: validatedData.tokenIn,
        tokenOut: validatedData.tokenOut,
        amountIn: validatedData.amountIn,
        amountOut: validatedData.amountOut,
        txHash: validatedData.txHash,
        usdValue: validatedData.usdValue || null,
        notes: validatedData.notes,
      },
      include: {
        trader: {
          include: {
            user: {
              select: {
                username: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Trade updated successfully',
      trade: updatedTrade,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating trade:', error);
    return NextResponse.json(
      { error: 'Failed to update trade. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/trades/[id] - Delete a trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get wallet address from header
    // For testing without wallet connection, use dummy address
    const walletAddress = request.headers.get('x-wallet-address') || '0x1234567890123456789012345678901234567890';
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Unauthorized. Please connect your wallet.' },
        { status: 401 }
      );
    }

    // Get the trade
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        trader: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this trade
    if (trade.trader.user.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: 'You can only delete your own trades' },
        { status: 403 }
      );
    }

    // Delete the trade
    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Trade deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { error: 'Failed to delete trade. Please try again.' },
      { status: 500 }
    );
  }
}

