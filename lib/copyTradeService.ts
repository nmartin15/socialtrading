import { prisma } from '@/lib/prisma';

interface CopySettings {
  id: string;
  subscriptionId: string;
  copyEnabled: boolean;
  copyAmountType: 'PERCENTAGE' | 'FIXED' | 'PROPORTIONAL';
  copyAmount: number;
  maxTradeSize: number | null;
  minTradeSize: number | null;
  maxDailyLoss: number | null;
  stopLossPercent: number | null;
  allowedTokens: string | null;
  excludedTokens: string | null;
}

interface Trade {
  id: string;
  traderId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  usdValue: number | null;
}

interface Subscription {
  id: string;
  copierId: string;
  status: string;
  copySettings: CopySettings | null;
  copier: {
    id: string;
    walletAddress: string;
    username: string | null;
  };
}

/**
 * Calculate the copy amount based on settings
 */
function calculateCopyAmount(
  tradeUsdValue: number,
  settings: CopySettings
): number {
  switch (settings.copyAmountType) {
    case 'PERCENTAGE':
      return (tradeUsdValue * settings.copyAmount) / 100;
    case 'FIXED':
      return settings.copyAmount;
    case 'PROPORTIONAL':
      // For proportional, we use the copyAmount as a multiplier
      return tradeUsdValue * settings.copyAmount;
    default:
      return tradeUsdValue;
  }
}

/**
 * Check if a token is allowed based on copy settings
 */
function isTokenAllowed(
  tokenIn: string,
  tokenOut: string,
  settings: CopySettings
): boolean {
  // Parse allowed/excluded tokens
  let allowedTokens: string[] | null = null;
  let excludedTokens: string[] | null = null;

  try {
    if (settings.allowedTokens) {
      allowedTokens = JSON.parse(settings.allowedTokens);
    }
    if (settings.excludedTokens) {
      excludedTokens = JSON.parse(settings.excludedTokens);
    }
  } catch (error) {
    console.error('Error parsing token filters:', error);
  }

  // Check if tokens are in the excluded list
  if (excludedTokens && excludedTokens.length > 0) {
    const normalizedExcluded = excludedTokens.map(t => t.toUpperCase());
    if (
      normalizedExcluded.includes(tokenIn.toUpperCase()) ||
      normalizedExcluded.includes(tokenOut.toUpperCase())
    ) {
      return false;
    }
  }

  // Check if tokens are in the allowed list (if specified)
  if (allowedTokens && allowedTokens.length > 0) {
    const normalizedAllowed = allowedTokens.map(t => t.toUpperCase());
    const hasAllowedToken =
      normalizedAllowed.includes(tokenIn.toUpperCase()) ||
      normalizedAllowed.includes(tokenOut.toUpperCase());
    if (!hasAllowedToken) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the trade size is within limits
 */
function isWithinSizeLimits(
  copyAmount: number,
  settings: CopySettings
): boolean {
  if (settings.minTradeSize && copyAmount < settings.minTradeSize) {
    return false;
  }
  if (settings.maxTradeSize && copyAmount > settings.maxTradeSize) {
    return false;
  }
  return true;
}

/**
 * Check daily loss limit for a copier
 */
async function checkDailyLossLimit(
  copierId: string,
  settings: CopySettings
): Promise<boolean> {
  if (!settings.maxDailyLoss) {
    return true; // No limit set
  }

  // Get today's trades for this copier
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTrades = await prisma.copyTrade.findMany({
    where: {
      copierId,
      timestamp: {
        gte: today,
      },
    },
  });

  // Calculate total loss today
  const totalLoss = todaysTrades.reduce((sum, trade) => {
    if (trade.profitLoss && trade.profitLoss < 0) {
      return sum + Math.abs(trade.profitLoss);
    }
    return sum;
  }, 0);

  return totalLoss < settings.maxDailyLoss;
}

/**
 * Copy a trade to all eligible subscribers
 */
export async function copyTradeToSubscribers(trade: Trade): Promise<{
  copiedCount: number;
  skippedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let copiedCount = 0;
  let skippedCount = 0;

  try {
    // Get all active subscriptions for this trader
    const subscriptions = await prisma.subscription.findMany({
      where: {
        traderId: trade.traderId,
        status: 'ACTIVE',
      },
      include: {
        copySettings: true,
        copier: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    }) as Subscription[];

    console.log(`Found ${subscriptions.length} active subscriptions for trade ${trade.id}`);

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        const settings = subscription.copySettings;

        // Skip if no copy settings or copying is disabled
        if (!settings || !settings.copyEnabled) {
          skippedCount++;
          console.log(`Skipping copier ${subscription.copierId}: copying disabled`);
          continue;
        }

        // Check token filters
        if (!isTokenAllowed(trade.tokenIn, trade.tokenOut, settings)) {
          skippedCount++;
          console.log(`Skipping copier ${subscription.copierId}: token not allowed`);
          continue;
        }

        // Calculate copy amount
        const tradeUsdValue = trade.usdValue || 0;
        if (tradeUsdValue === 0) {
          skippedCount++;
          console.log(`Skipping copier ${subscription.copierId}: no USD value`);
          continue;
        }

        const copyAmount = calculateCopyAmount(tradeUsdValue, settings);

        // Check size limits
        if (!isWithinSizeLimits(copyAmount, settings)) {
          skippedCount++;
          console.log(`Skipping copier ${subscription.copierId}: outside size limits`);
          continue;
        }

        // Check daily loss limit
        const withinDailyLimit = await checkDailyLossLimit(
          subscription.copierId,
          settings
        );
        if (!withinDailyLimit) {
          skippedCount++;
          console.log(`Skipping copier ${subscription.copierId}: daily loss limit reached`);
          
          // Send risk alert notification
          await prisma.notification.create({
            data: {
              userId: subscription.copierId,
              type: 'RISK_ALERT',
              message: `Daily loss limit reached. Copy trading paused for today.`,
            },
          });
          continue;
        }

        // Create the copy trade
        await prisma.copyTrade.create({
          data: {
            originalTradeId: trade.id,
            copierId: subscription.copierId,
            amountCopied: copyAmount.toString(),
            profitLoss: null, // Will be calculated later
          },
        });

        // Create notification for the copier
        await prisma.notification.create({
          data: {
            userId: subscription.copierId,
            type: 'TRADE_COPIED',
            message: `Trade copied: ${trade.tokenIn} → ${trade.tokenOut} ($${copyAmount.toFixed(2)})`,
          },
        });

        copiedCount++;
        console.log(`Successfully copied trade to ${subscription.copierId}`);
      } catch (error) {
        const errorMsg = `Error copying trade for copier ${subscription.copierId}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        skippedCount++;
      }
    }

    return { copiedCount, skippedCount, errors };
  } catch (error) {
    console.error('Error in copyTradeToSubscribers:', error);
    errors.push(`General error: ${error}`);
    return { copiedCount, skippedCount, errors };
  }
}

/**
 * Send notification to all active copiers about a new trade
 */
export async function notifyCopiers(
  traderId: string,
  tradeMessage: string
): Promise<void> {
  try {
    // Get all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        traderId,
        status: 'ACTIVE',
      },
      select: {
        copierId: true,
      },
    });

    // Create notifications for all copiers
    await prisma.notification.createMany({
      data: subscriptions.map((sub) => ({
        userId: sub.copierId,
        type: 'NEW_TRADE',
        message: tradeMessage,
      })),
    });

    console.log(`Sent notifications to ${subscriptions.length} copiers`);
  } catch (error) {
    console.error('Error notifying copiers:', error);
  }
}

