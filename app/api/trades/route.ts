import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tradeSubmissionSchema } from '@/lib/validations/trade';
import { copyTradeToSubscribers, notifyCopiers } from '@/lib/copyTradeService';
import { z } from 'zod';

// POST /api/trades - Submit a new trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get wallet address from header (set by middleware)
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

    // Check if user exists and is a trader (always use lowercase for consistency)
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: { trader: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    if (!user.trader) {
      return NextResponse.json(
        { error: 'Only traders can submit trades. Please register as a trader first.' },
        { status: 403 }
      );
    }

    // Check if transaction hash already exists
    const existingTrade = await prisma.trade.findUnique({
      where: { txHash: validatedData.txHash },
    });

    if (existingTrade) {
      return NextResponse.json(
        { error: 'This transaction has already been recorded.' },
        { status: 409 }
      );
    }

    // Create the trade
    const trade = await prisma.trade.create({
      data: {
        traderId: user.trader.id,
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

    // 🔄 Copy Trading: Copy this trade to all active subscribers
    const traderName = user.username || user.walletAddress;
    const tradeMessage = `${traderName} made a new trade: ${validatedData.tokenIn} → ${validatedData.tokenOut}`;
    
    // Run copy trading in the background (don't await to avoid slowing down response)
    copyTradeToSubscribers(trade).then((result) => {
      console.log(`Trade ${trade.id} copy results:`, result);
      if (result.copiedCount > 0) {
        console.log(`✅ Successfully copied trade to ${result.copiedCount} copiers`);
      }
      if (result.skippedCount > 0) {
        console.log(`⏭️  Skipped ${result.skippedCount} copiers`);
      }
      if (result.errors.length > 0) {
        console.error(`❌ Errors during copy:`, result.errors);
      }
    });

    // 🔔 Notify all copiers about the new trade
    notifyCopiers(user.trader.id, tradeMessage).catch((error) => {
      console.error('Error notifying copiers:', error);
    });

    return NextResponse.json(
      { 
        message: 'Trade submitted successfully',
        trade 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error submitting trade:', error);
    return NextResponse.json(
      { error: 'Failed to submit trade. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/trades - Get trades (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const traderId = searchParams.get('traderId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const where = traderId ? { traderId } : {};

    // Get trades with pagination
    const [trades, totalCount] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          trader: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  walletAddress: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    return NextResponse.json({
      trades,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

