import { NextRequest, NextResponse } from 'next/server';
import { scanWalletTrades } from '@/lib/tradeScanner';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');
  const fromBlock = request.nextUrl.searchParams.get('fromBlock');
  const toBlock = request.nextUrl.searchParams.get('toBlock');
  
  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  try {
    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Get user's trader info to find last imported block
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: {
        trader: {
          include: {
            trades: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Determine starting block
    let startBlock: bigint | undefined;
    
    if (fromBlock) {
      startBlock = BigInt(fromBlock);
    } else if (user?.trader?.trades[0]?.blockNumber) {
      // Start from last imported trade's block + 1
      startBlock = BigInt(user.trader.trades[0].blockNumber) + BigInt(1);
    }
    // If no startBlock, scanWalletTrades will use default (last 1000 blocks)

    const endBlock = toBlock ? BigInt(toBlock) : 'latest';

    // Scan for new trades
    const detectedTrades = await scanWalletTrades(
      walletAddress,
      startBlock,
      endBlock as any
    );

    // Filter out trades that already exist in database
    const existingTxHashes = user?.trader?.trades.map(t => t.txHash) || [];
    const newTrades = detectedTrades.filter(
      trade => !existingTxHashes.includes(trade.txHash)
    );

    return NextResponse.json({
      success: true,
      trades: newTrades,
      count: newTrades.length,
      totalScanned: detectedTrades.length,
      message: newTrades.length > 0 
        ? `Found ${newTrades.length} new trade(s)` 
        : 'No new trades found',
    });
  } catch (error) {
    console.error('Wallet scan error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scan wallet', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

