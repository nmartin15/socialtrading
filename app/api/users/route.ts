import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET user by wallet address (for current user) or all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    // If wallet address is provided, get specific user with trader info
    if (walletAddress) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
        select: {
          id: true,
          walletAddress: true,
          username: true,
          role: true,
          trader: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(user);
    }

    // Otherwise return all users (for admin purposes)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        username: true,
        role: true,
        createdAt: true,
      },
      take: 10, // Limit to 10 users
    });
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user (example endpoint)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, username, role } = body;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.create({
      data: {
        walletAddress,
        username,
        role: role || 'COPIER',
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

