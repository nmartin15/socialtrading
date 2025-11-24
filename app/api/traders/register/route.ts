import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { traderRegistrationSchema } from '@/lib/validations/trader';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = traderRegistrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress, username, bio, subscriptionPrice, performanceFee, tradingStyles, avatarUrl } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { trader: true },
    });

    // If user already has a trader profile
    if (user?.trader) {
      return NextResponse.json(
        { error: 'You already have a trader profile' },
        { status: 400 }
      );
    }

    // Check if username is taken
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername && existingUsername.id !== user?.id) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Create user if doesn't exist, then create trader profile
    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          username,
          role: 'TRADER',
          bio,
          avatarUrl: avatarUrl || null,
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username,
          role: 'TRADER',
          bio,
          avatarUrl: avatarUrl || null,
        },
      });
    }

    // Create trader profile
    const trader = await prisma.trader.create({
      data: {
        userId: user.id,
        subscriptionPrice, // Already in cents from frontend
        performanceFee,
        tradingStyles: JSON.stringify(tradingStyles), // Store as JSON for SQLite
        verified: false,
        totalFollowers: 0,
        activeCopiers: 0,
      },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Trader registered successfully',
        trader,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register trader' },
      { status: 500 }
    );
  }
}

