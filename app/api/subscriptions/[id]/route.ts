import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/subscriptions/[id] - Update subscription status
const updateSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, status } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { trader: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (subscription.copierId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status,
        endDate: status === 'CANCELLED' ? new Date() : null,
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

    // Update trader's active copier count
    const previousStatus = subscription.status;
    if (previousStatus === 'ACTIVE' && status !== 'ACTIVE') {
      await prisma.trader.update({
        where: { id: subscription.traderId },
        data: { activeCopiers: { decrement: 1 } },
      });
    } else if (previousStatus !== 'ACTIVE' && status === 'ACTIVE') {
      await prisma.trader.update({
        where: { id: subscription.traderId },
        data: { activeCopiers: { increment: 1 } },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: status === 'CANCELLED' ? 'SUBSCRIPTION_ENDED' : 'SUBSCRIPTION_STARTED',
        message: `Subscription ${status.toLowerCase()}`,
      },
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id] - Delete subscription
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (subscription.copierId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete subscription
    await prisma.subscription.delete({
      where: { id },
    });

    // Update trader's counts if subscription was active
    if (subscription.status === 'ACTIVE') {
      await prisma.trader.update({
        where: { id: subscription.traderId },
        data: {
          activeCopiers: { decrement: 1 },
          totalFollowers: { decrement: 1 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}

