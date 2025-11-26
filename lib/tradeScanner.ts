import { createPublicClient, http, parseAbiItem, formatUnits } from 'viem';
import { codex } from './wagmi';

export const publicClient = createPublicClient({
  chain: codex,
  transport: http(),
});

// Common ERC20 ABI items
const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const SWAP_EVENT_V2 = parseAbiItem('event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)');

export interface DetectedTrade {
  txHash: string;
  timestamp: Date;
  blockNumber: string;
  from: string;
  to: string;
  status: 'success' | 'failed';
  type: 'swap' | 'transfer' | 'unknown';
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  amountOut?: string;
  gasUsed?: string;
  verified: boolean;
}

/**
 * Scan a wallet address for trading activity
 * @param walletAddress - The wallet address to scan
 * @param fromBlock - Starting block number (optional)
 * @param toBlock - Ending block number (optional, defaults to latest)
 * @returns Array of detected trades
 */
export async function scanWalletTrades(
  walletAddress: string,
  fromBlock?: bigint,
  toBlock?: bigint | 'latest'
): Promise<DetectedTrade[]> {
  try {
    const address = walletAddress.toLowerCase();
    
    // Get recent blocks if not specified
    if (!fromBlock) {
      const latestBlock = await publicClient.getBlockNumber();
      // Scan last 1000 blocks (~3-4 hours on most chains)
      fromBlock = latestBlock - BigInt(1000) > BigInt(0) ? latestBlock - BigInt(1000) : BigInt(0);
    }

    // Get transaction receipts for this address
    // Note: This queries the last N blocks for transactions involving this address
    const blockNum = toBlock === 'latest' ? await publicClient.getBlockNumber() : toBlock;
    
    const trades: DetectedTrade[] = [];
    
    // Strategy: Get blocks and filter transactions
    // This is a basic implementation - production would use indexed APIs
    const startBlock = Number(fromBlock);
    const endBlock = Number(blockNum);
    
    // Limit to prevent timeout - scan in chunks
    const maxBlocksPerScan = 100;
    const actualEndBlock = Math.min(startBlock + maxBlocksPerScan, endBlock);
    
    for (let i = startBlock; i <= actualEndBlock; i++) {
      try {
        const block = await publicClient.getBlock({
          blockNumber: BigInt(i),
          includeTransactions: true,
        });

        if (!block.transactions || block.transactions.length === 0) continue;

        // @ts-ignore - transactions can be full transaction objects
        for (const tx of block.transactions) {
          // Check if transaction involves our wallet
          if (
            typeof tx === 'object' &&
            (tx.from?.toLowerCase() === address || tx.to?.toLowerCase() === address)
          ) {
            const receipt = await publicClient.getTransactionReceipt({
              hash: tx.hash,
            });

            trades.push({
              txHash: tx.hash,
              timestamp: new Date(Number(block.timestamp) * 1000),
              blockNumber: i.toString(),
              from: tx.from || '',
              to: tx.to || '',
              status: receipt.status === 'success' ? 'success' : 'failed',
              type: 'unknown', // Will be determined by analyzing logs
              gasUsed: receipt.gasUsed.toString(),
              verified: true, // On-chain data is verified
            });
          }
        }
      } catch (error) {
        console.error(`Error scanning block ${i}:`, error);
        // Continue with next block
      }
    }

    return trades;
  } catch (error) {
    console.error('Error scanning wallet trades:', error);
    throw new Error('Failed to scan wallet. Please try again.');
  }
}

/**
 * Get transaction details from transaction hash
 * Useful for verifying manually entered trades
 */
export async function verifyTransactionHash(txHash: string): Promise<{
  exists: boolean;
  transaction?: any;
  receipt?: any;
  block?: any;
}> {
  try {
    const transaction = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    if (!transaction) {
      return { exists: false };
    }

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    const block = await publicClient.getBlock({
      blockHash: receipt.blockHash,
    });

    return {
      exists: true,
      transaction,
      receipt,
      block,
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Verify that a transaction was made by a specific wallet
 */
export async function verifyTxFromWallet(
  txHash: string,
  expectedWallet: string
): Promise<boolean> {
  try {
    const result = await verifyTransactionHash(txHash);
    
    if (!result.exists || !result.transaction) {
      return false;
    }

    return (
      result.transaction.from.toLowerCase() === expectedWallet.toLowerCase()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get readable token information from address
 * Attempts to read ERC20 token data
 */
export async function getTokenInfo(tokenAddress: string): Promise<{
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}> {
  try {
    const symbolAbi = parseAbiItem('function symbol() view returns (string)');
    const decimalsAbi = parseAbiItem('function decimals() view returns (uint8)');
    const nameAbi = parseAbiItem('function name() view returns (string)');

    const [symbol, decimals, name] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [symbolAbi],
        functionName: 'symbol',
      }).catch(() => 'UNKNOWN'),
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [decimalsAbi],
        functionName: 'decimals',
      }).catch(() => 18),
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [nameAbi],
        functionName: 'name',
      }).catch(() => undefined),
    ]);

    return {
      address: tokenAddress,
      symbol: symbol as string,
      decimals: Number(decimals),
      name: name as string | undefined,
    };
  } catch (error) {
    return {
      address: tokenAddress,
      symbol: 'UNKNOWN',
      decimals: 18,
    };
  }
}

/**
 * Format the detected trades for display
 */
export function formatDetectedTrade(trade: DetectedTrade): string {
  const time = trade.timestamp.toLocaleString();
  const type = trade.type.toUpperCase();
  const status = trade.status === 'success' ? '✅' : '❌';
  
  return `${status} ${type} - ${time} - ${trade.txHash.slice(0, 10)}...`;
}

