import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: traderId } = await context.params;

    // Verify trader exists
    const trader = await prisma.trader.findUnique({
      where: { id: traderId },
    });

    if (!trader) {
      return NextResponse.json(
        { error: 'Trader not found' },
        { status: 404 }
      );
    }

    // Get client IP for deduplication (optional)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Record the profile view
    await prisma.profileView.create({
      data: {
        traderId,
        viewerIp: ip,
      },
    });

    // Increment the profile views counter
    await prisma.trader.update({
      where: { id: traderId },
      data: {
        profileViews: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording profile view:', error);
    return NextResponse.json(
      { error: 'Failed to record profile view' },
      { status: 500 }
    );
  }
}

