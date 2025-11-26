import { NextRequest, NextResponse } from 'next/server';
import { verifyTransactionHash, verifyTxFromWallet } from '@/lib/tradeScanner';

export async function POST(request: NextRequest) {
  try {
    const { txHash, walletAddress } = await request.json();
    
    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash required' },
        { status: 400 }
      );
    }

    // Validate tx hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json(
        { 
          verified: false, 
          error: 'Invalid transaction hash format',
          details: 'Transaction hash must be 66 characters (0x + 64 hex chars)'
        },
        { status: 400 }
      );
    }

    // Verify transaction exists on blockchain
    const txData = await verifyTransactionHash(txHash);

    if (!txData.exists) {
      return NextResponse.json({
        verified: false,
        exists: false,
        message: 'Transaction not found on blockchain',
      });
    }

    // If wallet address provided, verify it matches
    let walletMatch = true;
    if (walletAddress) {
      walletMatch = await verifyTxFromWallet(txHash, walletAddress);
    }

    const response: any = {
      verified: txData.exists && walletMatch,
      exists: true,
      walletMatch,
      transaction: {
        hash: txData.transaction.hash,
        from: txData.transaction.from,
        to: txData.transaction.to,
        blockNumber: txData.transaction.blockNumber?.toString(),
        timestamp: txData.block ? new Date(Number(txData.block.timestamp) * 1000).toISOString() : null,
        status: txData.receipt.status,
        gasUsed: txData.receipt.gasUsed?.toString(),
      },
    };

    if (!walletMatch && walletAddress) {
      response.message = 'Transaction found but was not sent from your wallet';
      response.expectedWallet = walletAddress;
      response.actualWallet = txData.transaction.from;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transaction verification error:', error);
    return NextResponse.json(
      { 
        verified: false,
        error: 'Failed to verify transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

