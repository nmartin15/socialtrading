/**
 * Migration script for Copy Trading feature
 * 
 * This script adds the CopySettings table and updates relationships
 * Run with: npx tsx prisma/migrate-copy-trading.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Copy Trading migration...');

  try {
    // Check if CopySettings table exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT 1 FROM CopySettings LIMIT 1`;
      console.log('✓ CopySettings table already exists');
    } catch (error) {
      console.log('ℹ️  CopySettings table does not exist yet');
      console.log('⚠️  Please run: npx prisma db push');
      console.log('    This will create the CopySettings table from your schema');
      process.exit(1);
    }

    // Create default copy settings for existing subscriptions without settings
    console.log('\n📝 Creating default copy settings for existing subscriptions...');
    
    const subscriptionsWithoutSettings = await prisma.subscription.findMany({
      where: {
        copySettings: null,
      },
      include: {
        copySettings: true,
      },
    });

    if (subscriptionsWithoutSettings.length === 0) {
      console.log('✓ All subscriptions already have copy settings');
    } else {
      console.log(`Found ${subscriptionsWithoutSettings.length} subscriptions without settings`);
      
      for (const subscription of subscriptionsWithoutSettings) {
        await prisma.copySettings.create({
          data: {
            subscriptionId: subscription.id,
            copyEnabled: subscription.status === 'ACTIVE',
            copyAmountType: 'PERCENTAGE',
            copyAmount: 100,
            maxTradeSize: 10000,
            minTradeSize: 10,
          },
        });
        console.log(`  ✓ Created settings for subscription ${subscription.id}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Current statistics:');
    
    const stats = await prisma.subscription.aggregate({
      _count: true,
    });
    
    const settingsCount = await prisma.copySettings.count();
    
    console.log(`  - Total subscriptions: ${stats._count}`);
    console.log(`  - Total copy settings: ${settingsCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

