import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    // If user doesn't exist yet, return empty notifications array
    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, notificationIds } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    // If user doesn't exist yet, just return success
    // (no notifications to mark as read anyway)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Mark as read
    if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: { read: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

