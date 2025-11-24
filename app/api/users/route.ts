import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all users (example endpoint)
export async function GET() {
  try {
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

