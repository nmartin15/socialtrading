import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tradeSubmissionSchema } from '@/lib/validations/trade';
import { copyTradeToSubscribers, notifyCopiers } from '@/lib/copyTradeService';
import { requireAuth } from '@/lib/auth';
import { sanitizeText, sanitizeTxHash, sanitizeNumericString, sanitizeTokenSymbol } from '@/lib/sanitize';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// POST /api/trades - Submit a new trade
export async function POST(request: NextRequest) {
  try {
    // 🔒 Require authentication
    const walletAddress = await requireAuth(request);
    
    const body = await request.json();

    // 🛡️ Sanitize inputs before validation
    const sanitizedBody = {
      ...body,
      tokenIn: sanitizeTokenSymbol(body.tokenIn),
      tokenOut: sanitizeTokenSymbol(body.tokenOut),
      amountIn: sanitizeNumericString(body.amountIn),
      amountOut: sanitizeNumericString(body.amountOut),
      txHash: sanitizeTxHash(body.txHash),
      notes: sanitizeText(body.notes, 5000),
    };

    // Validate input
    const validatedData = tradeSubmissionSchema.parse(sanitizedBody);

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
      logger.info('Trade copy results', { tradeId: trade.id, ...result });
      if (result.copiedCount > 0) {
        logger.info('Successfully copied trade', { tradeId: trade.id, copiedCount: result.copiedCount });
      }
      if (result.errors.length > 0) {
        logger.error('Errors during copy', { tradeId: trade.id, errors: result.errors });
      }
    });

    // 🔔 Notify all copiers about the new trade
    notifyCopiers(user.trader.id, tradeMessage).catch((error) => {
      logger.error('Error notifying copiers', { traderId: user.trader.id, error });
    });

    return NextResponse.json(
      { 
        message: 'Trade submitted successfully',
        trade 
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Error submitting trade', { error });
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
    logger.error('Error fetching trades', { error });
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

