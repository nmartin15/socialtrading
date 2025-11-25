import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/copy-settings/[id] - Update copy settings
const updateSettingsSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  copyEnabled: z.boolean().optional(),
  copyAmountType: z.enum(['PERCENTAGE', 'FIXED', 'PROPORTIONAL']).optional(),
  copyAmount: z.number().min(0).optional(),
  maxTradeSize: z.number().min(0).nullable().optional(),
  minTradeSize: z.number().min(0).nullable().optional(),
  maxDailyLoss: z.number().min(0).nullable().optional(),
  stopLossPercent: z.number().min(0).max(100).nullable().optional(),
  allowedTokens: z.array(z.string()).nullable().optional(),
  excludedTokens: z.array(z.string()).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params; // This is the subscription ID
    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, ...settingsData } = validation.data;

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
      include: { copySettings: true },
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

    // Prepare update data
    const updateData: any = {};
    
    if (settingsData.copyEnabled !== undefined) {
      updateData.copyEnabled = settingsData.copyEnabled;
    }
    if (settingsData.copyAmountType !== undefined) {
      updateData.copyAmountType = settingsData.copyAmountType;
    }
    if (settingsData.copyAmount !== undefined) {
      updateData.copyAmount = settingsData.copyAmount;
    }
    if (settingsData.maxTradeSize !== undefined) {
      updateData.maxTradeSize = settingsData.maxTradeSize;
    }
    if (settingsData.minTradeSize !== undefined) {
      updateData.minTradeSize = settingsData.minTradeSize;
    }
    if (settingsData.maxDailyLoss !== undefined) {
      updateData.maxDailyLoss = settingsData.maxDailyLoss;
    }
    if (settingsData.stopLossPercent !== undefined) {
      updateData.stopLossPercent = settingsData.stopLossPercent;
    }
    if (settingsData.allowedTokens !== undefined) {
      updateData.allowedTokens = settingsData.allowedTokens 
        ? JSON.stringify(settingsData.allowedTokens) 
        : null;
    }
    if (settingsData.excludedTokens !== undefined) {
      updateData.excludedTokens = settingsData.excludedTokens 
        ? JSON.stringify(settingsData.excludedTokens) 
        : null;
    }

    // Update or create copy settings
    let copySettings;
    if (subscription.copySettings) {
      copySettings = await prisma.copySettings.update({
        where: { subscriptionId: id },
        data: updateData,
      });
    } else {
      copySettings = await prisma.copySettings.create({
        data: {
          subscriptionId: id,
          ...updateData,
        },
      });
    }

    return NextResponse.json({ copySettings });
  } catch (error) {
    console.error('Error updating copy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update copy settings' },
      { status: 500 }
    );
  }
}

// GET /api/copy-settings/[id] - Get copy settings
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params; // This is the subscription ID
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
      include: { copySettings: true },
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

    return NextResponse.json({ copySettings: subscription.copySettings });
  } catch (error) {
    console.error('Error fetching copy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch copy settings' },
      { status: 500 }
    );
  }
}

