import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/subscriptions - Get user's subscriptions
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

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    // If user doesn't exist yet, return empty subscriptions array
    // (new users won't have subscriptions anyway)
    if (!user) {
      return NextResponse.json({ subscriptions: [] });
    }

    // Get all subscriptions for this user
    // Try with copySettings first, fall back without if table doesn't exist
    let subscriptions;
    try {
      subscriptions = await prisma.subscription.findMany({
        where: { copierId: user.id },
        include: {
          trader: {
            include: {
              user: {
                select: {
                  username: true,
                  walletAddress: true,
                  avatarUrl: true,
                },
              },
            },
          },
          copySettings: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      // If copySettings table doesn't exist yet, query without it
      console.log('CopySettings table not found, querying without it');
      subscriptions = await prisma.subscription.findMany({
        where: { copierId: user.id },
        include: {
          trader: {
            include: {
              user: {
                select: {
                  username: true,
                  walletAddress: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create new subscription
const subscribeSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  traderId: z.string().min(1, 'Trader ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, traderId } = validation.data;

    // Find or create user
    const user = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      create: {
        walletAddress: walletAddress.toLowerCase(),
        role: 'COPIER',
      },
      update: {},
    });

    // Check if trader exists
    const trader = await prisma.trader.findUnique({
      where: { id: traderId },
    });

    if (!trader) {
      return NextResponse.json(
        { error: 'Trader not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to subscribe to themselves
    if (trader.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    // Check for existing active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        copierId: user.id,
        traderId: traderId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Already subscribed to this trader' },
        { status: 400 }
      );
    }

    // Create subscription with default copy settings
    const subscription = await prisma.subscription.create({
      data: {
        copierId: user.id,
        traderId: traderId,
        status: 'ACTIVE',
        monthlyPrice: trader.subscriptionPrice,
        copySettings: {
          create: {
            copyEnabled: true,
            copyAmountType: 'PERCENTAGE',
            copyAmount: 100, // 100% by default
            maxTradeSize: 10000, // $10,000 default max
            minTradeSize: 10, // $10 default min
          },
        },
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
        copySettings: true,
      },
    });

    // Update trader's follower count
    await prisma.trader.update({
      where: { id: traderId },
      data: {
        totalFollowers: { increment: 1 },
        activeCopiers: { increment: 1 },
      },
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_STARTED',
        message: `You are now subscribed to ${trader.userId}`,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

