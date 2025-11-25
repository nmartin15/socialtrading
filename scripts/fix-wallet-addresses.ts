import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing wallet addresses to lowercase...');

  // Get all users
  const users = await prisma.user.findMany();
  
  console.log(`Found ${users.length} users`);
  
  for (const user of users) {
    const lowercaseAddress = user.walletAddress.toLowerCase();
    
    if (user.walletAddress !== lowercaseAddress) {
      console.log(`Updating ${user.walletAddress} -> ${lowercaseAddress}`);
      
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { walletAddress: lowercaseAddress },
        });
        console.log(`✅ Updated user ${user.username || user.id}`);
      } catch (error) {
        console.error(`❌ Failed to update user ${user.id}:`, error);
      }
    } else {
      console.log(`✓ ${user.walletAddress} already lowercase`);
    }
  }
  
  console.log('✨ Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

