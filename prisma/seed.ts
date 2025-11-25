import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create first trader - "CryptoWhale"
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '0x1234567890123456789012345678901234567890' },
    update: {},
    create: {
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: 'CryptoWhale',
      role: 'TRADER',
      bio: 'Professional DeFi trader with 5+ years experience. Specializing in swing trading and risk management. Track record of consistent returns.',
      avatarUrl: null,
    },
  });

  const trader1 = await prisma.trader.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      subscriptionPrice: 4999, // $49.99
      performanceFee: 15,
      tradingStyles: JSON.stringify(['Swing Trading', 'DeFi', 'Risk Management']),
      verified: true,
      totalFollowers: 234,
      activeCopiers: 89,
    },
  });

  console.log('✅ Created trader: CryptoWhale');

  // Create second trader - "DeFiMaster"
  const user2 = await prisma.user.upsert({
    where: { walletAddress: '0x2345678901234567890123456789012345678901' },
    update: {},
    create: {
      walletAddress: '0x2345678901234567890123456789012345678901',
      username: 'DeFiMaster',
      role: 'TRADER',
      bio: 'Yield farming expert and DeFi protocol analyst. Known for finding high-APY opportunities early. Conservative risk profile.',
      avatarUrl: null,
    },
  });

  const trader2 = await prisma.trader.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      subscriptionPrice: 2999, // $29.99
      performanceFee: 10,
      tradingStyles: JSON.stringify(['Yield Farming', 'DeFi', 'Long-term']),
      verified: true,
      totalFollowers: 156,
      activeCopiers: 67,
    },
  });

  console.log('✅ Created trader: DeFiMaster');

  // Generate trades for CryptoWhale (more aggressive, higher variance)
  const whale_trades = [
    // Recent trades (last 7 days)
    {
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amountIn: '5000',
      amountOut: '1.5',
      usdValue: 850,
      daysAgo: 1,
      notes: 'Strong bullish momentum on ETH. Technical indicators showing breakout above resistance. Entry at $3,333 with target at $3,900. Risk-reward ratio 1:3. Stop loss at $3,200.',
    },
    {
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amountIn: '1.5',
      amountOut: '5950',
      usdValue: 950,
      daysAgo: 2,
      notes: 'Taking profits on ETH position after hitting first target. Market showing signs of exhaustion at resistance. Converted back to stablecoins to preserve gains. Will look for re-entry on pullback.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'WBTC',
      amountIn: '10000',
      amountOut: '0.25',
      usdValue: -450,
      daysAgo: 3,
      notes: 'Bitcoin showing weakness below key support. Entered short position through derivatives. Expected further downside to $38,000 level. Tight stop loss at $41,500. Managing risk carefully.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'LINK',
      amountIn: '3000',
      amountOut: '200',
      usdValue: 420,
      daysAgo: 5,
      notes: 'LINK breaking out of accumulation zone. Strong fundamentals with recent partnerships announced. Entry at $15 with target at $18. Oracle tokens showing strength in current market conditions.',
    },
    {
      tokenIn: 'LINK',
      tokenOut: 'USDC',
      amountIn: '200',
      amountOut: '3600',
      usdValue: 600,
      daysAgo: 6,
      notes: 'LINK hit target at $18, taking profits here. Excellent 20% gain in just one day. Market may need consolidation after this move. Will monitor for re-entry opportunities on dips.',
    },
    // Last 30 days
    {
      tokenIn: 'USDC',
      tokenOut: 'UNI',
      amountIn: '4000',
      amountOut: '600',
      usdValue: 720,
      daysAgo: 10,
      notes: 'UNI showing strong momentum as DeFi sector rotates. Protocol revenue increasing, governance proposals gaining traction. Entry at $6.67 targeting $8. DEX volumes picking up significantly.',
    },
    {
      tokenIn: 'UNI',
      tokenOut: 'USDC',
      amountIn: '600',
      amountOut: '4800',
      usdValue: 800,
      daysAgo: 12,
      notes: 'UNI exceeded target, hitting $8. Took full profits as momentum indicators showing overbought conditions. Total gain 20% on this trade. Looking for next DeFi opportunity.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'AAVE',
      amountIn: '6000',
      amountOut: '80',
      usdValue: -320,
      daysAgo: 15,
      notes: 'AAVE entry on false breakout. Market rejected higher prices, stopped out at planned level. Small loss accepted as part of risk management. Will reassess technical setup before next entry.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amountIn: '8000',
      amountOut: '2.5',
      usdValue: 1200,
      daysAgo: 18,
      notes: 'Major ETH accumulation at support zone. High-confidence setup with multiple confirmations. Large position size due to favorable risk-reward. Target 15% gain over 2-3 week timeframe.',
    },
    {
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amountIn: '2.5',
      amountOut: '9200',
      usdValue: 1200,
      daysAgo: 20,
      notes: 'ETH position working perfectly. Hit 15% target right on schedule. Excellent risk-reward execution. Market environment remains constructive for continued upside in major assets.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'MATIC',
      amountIn: '3500',
      amountOut: '4500',
      usdValue: 385,
      daysAgo: 22,
      notes: 'MATIC breaking out on Layer 2 narrative. Network activity increasing, partnerships expanding. Entry at $0.78 with target at $0.95. Scaling solutions gaining market attention.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'SOL',
      amountIn: '5000',
      amountOut: '50',
      usdValue: -280,
      daysAgo: 25,
      notes: 'SOL showing weakness despite broader market strength. Cut position early as setup invalidated. Quick exit to preserve capital for better opportunities. Discipline over conviction.',
    },
    // Older trades (30+ days)
    {
      tokenIn: 'USDC',
      tokenOut: 'AVAX',
      amountIn: '4500',
      amountOut: '150',
      usdValue: 675,
      daysAgo: 35,
      notes: 'AVAX accumulation phase complete. Strong developer activity and ecosystem growth. Entry at $30 with medium-term target at $38. Subnet launches creating positive momentum.',
    },
    {
      tokenIn: 'AVAX',
      tokenOut: 'USDC',
      amountIn: '150',
      amountOut: '5700',
      usdValue: 1200,
      daysAgo: 40,
      notes: 'AVAX exceeded expectations, hitting $38 target. Took profits on entire position for 26% gain. Subnet launches exceeded market expectations. Excellent trade execution and patience.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'DOT',
      amountIn: '7000',
      amountOut: '1200',
      usdValue: 560,
      daysAgo: 45,
      notes: 'DOT parachain auctions creating buying pressure. Strong fundamental case for Polkadot ecosystem expansion. Entry at $5.83 with target at $7.00. Multi-chain thesis playing out.',
    },
  ];

  for (const trade of whale_trades) {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - trade.daysAgo);

    await prisma.trade.create({
      data: {
        traderId: trader1.id,
        tokenIn: trade.tokenIn,
        tokenOut: trade.tokenOut,
        amountIn: trade.amountIn,
        amountOut: trade.amountOut,
        txHash: `0xwhale${trade.daysAgo}${Math.random().toString(36).substring(7)}`,
        timestamp,
        usdValue: trade.usdValue,
        notes: trade.notes,
      },
    });
  }

  console.log(`✅ Created ${whale_trades.length} trades for CryptoWhale`);

  // Generate trades for DeFiMaster (more conservative, consistent gains)
  const defi_trades = [
    // Recent trades (last 7 days)
    {
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amountIn: '3000',
      amountOut: '0.9',
      usdValue: 450,
      daysAgo: 1,
      notes: 'Conservative ETH position sizing based on yield farming strategy. Depositing into Aave for lending returns while maintaining exposure. Low-risk entry with stablecoin backup ready for opportunities.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'USDT',
      amountIn: '5000',
      amountOut: '5000',
      usdValue: 25,
      daysAgo: 2,
      notes: 'Arbitrage opportunity between USDC and USDT on different protocols. Small but safe profit with minimal risk exposure. These opportunities appear regularly in DeFi markets.',
    },
    {
      tokenIn: 'USDT',
      tokenOut: 'DAI',
      amountIn: '5000',
      amountOut: '5000',
      usdValue: 30,
      daysAgo: 3,
      notes: 'Continuing stablecoin optimization strategy. Moving to DAI for better yield farming rates on Curve. Risk-free gains through protocol rate differentials.',
    },
    {
      tokenIn: 'DAI',
      tokenOut: 'USDC',
      amountIn: '5000',
      amountOut: '5000',
      usdValue: 35,
      daysAgo: 4,
      notes: 'Completed stablecoin cycle with net profit. Total gain across three trades: $90. Low volatility strategy perfect for risk-averse investors. Consistent returns compound over time.',
    },
    // Last 30 days
    {
      tokenIn: 'USDC',
      tokenOut: 'CRV',
      amountIn: '4000',
      amountOut: '5500',
      usdValue: 320,
      daysAgo: 8,
      notes: 'Accumulating CRV tokens for governance and yield boost. Curve protocol showing strong TVL growth. Conservative entry with focus on long-term staking rewards.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'LINK',
      amountIn: '2500',
      amountOut: '165',
      usdValue: 280,
      daysAgo: 12,
      notes: 'LINK for oracle network exposure. Conservative position sizing aligned with portfolio allocation strategy. Strong fundamental case for continued adoption across DeFi protocols.',
    },
    {
      tokenIn: 'LINK',
      tokenOut: 'USDC',
      amountIn: '165',
      amountOut: '2900',
      usdValue: 400,
      daysAgo: 15,
      notes: 'LINK position hit profit target. 16% gain over 3 days. Conservative approach yielding steady results. Rebalancing back to stablecoins for next opportunity.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'AAVE',
      amountIn: '3500',
      amountOut: '45',
      usdValue: 385,
      daysAgo: 18,
      notes: 'AAVE accumulation for protocol exposure and governance. Lending protocol showing strong fundamentals with increasing revenue. Conservative DeFi bluechip strategy.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'MKR',
      amountIn: '6000',
      amountOut: '4',
      usdValue: 420,
      daysAgo: 22,
      notes: 'MakerDAO governance token entry. Strong protocol fundamentals with DAI adoption growing. Conservative entry timing after recent pullback. Long-term DeFi infrastructure play.',
    },
    {
      tokenIn: 'MKR',
      tokenOut: 'USDC',
      amountIn: '4',
      amountOut: '6600',
      usdValue: 600,
      daysAgo: 25,
      notes: 'MKR position yielding 10% profit. Conservative exit strategy preserving gains. Protocol governance updates driving positive sentiment. Will consider re-entry on next dip.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'UNI',
      amountIn: '3000',
      amountOut: '440',
      usdValue: 245,
      daysAgo: 28,
      notes: 'UNI accumulation for DEX exposure. Uniswap V3 showing strong volume growth. Conservative position in leading decentralized exchange protocol. Fee revenue model attractive.',
    },
    // Older trades
    {
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amountIn: '5000',
      amountOut: '1.6',
      usdValue: 520,
      daysAgo: 32,
      notes: 'ETH core holding addition. Dollar-cost averaging strategy into major asset. Conservative long-term accumulation approach. Staking rewards providing additional yield.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'COMP',
      amountIn: '2800',
      amountOut: '50',
      usdValue: 310,
      daysAgo: 38,
      notes: 'Compound protocol governance token. Conservative DeFi lending exposure. Strong protocol fundamentals with consistent usage. Governance participation strategy.',
    },
    {
      tokenIn: 'COMP',
      tokenOut: 'USDC',
      amountIn: '50',
      amountOut: '3200',
      usdValue: 400,
      daysAgo: 42,
      notes: 'COMP profits taken at 14% gain. Conservative exit after protocol governance updates. Steady gains strategy working well. Capital ready for next DeFi opportunity.',
    },
    {
      tokenIn: 'USDC',
      tokenOut: 'SNX',
      amountIn: '3500',
      amountOut: '1200',
      usdValue: 385,
      daysAgo: 50,
      notes: 'Synthetix protocol exposure. Synthetic assets gaining traction. Conservative position in derivatives protocol. Strong community and developer activity.',
    },
  ];

  for (const trade of defi_trades) {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - trade.daysAgo);

    await prisma.trade.create({
      data: {
        traderId: trader2.id,
        tokenIn: trade.tokenIn,
        tokenOut: trade.tokenOut,
        amountIn: trade.amountIn,
        amountOut: trade.amountOut,
        txHash: `0xdefi${trade.daysAgo}${Math.random().toString(36).substring(7)}`,
        timestamp,
        usdValue: trade.usdValue,
        notes: trade.notes,
      },
    });
  }

  console.log(`✅ Created ${defi_trades.length} trades for DeFiMaster`);

  // Create performance records
  const whale_7d = whale_trades.filter((t) => t.daysAgo <= 7).reduce((sum, t) => sum + t.usdValue, 0);
  const whale_30d = whale_trades.filter((t) => t.daysAgo <= 30).reduce((sum, t) => sum + t.usdValue, 0);
  const whale_all = whale_trades.reduce((sum, t) => sum + t.usdValue, 0);

  await prisma.performance.upsert({
    where: { traderId_period: { traderId: trader1.id, period: 'SEVEN_DAYS' } },
    update: { returnPct: (whale_7d / 50000) * 100, totalPnl: whale_7d },
    create: {
      traderId: trader1.id,
      period: 'SEVEN_DAYS',
      returnPct: (whale_7d / 50000) * 100,
      totalPnl: whale_7d,
    },
  });

  await prisma.performance.upsert({
    where: { traderId_period: { traderId: trader1.id, period: 'THIRTY_DAYS' } },
    update: { returnPct: (whale_30d / 50000) * 100, totalPnl: whale_30d },
    create: {
      traderId: trader1.id,
      period: 'THIRTY_DAYS',
      returnPct: (whale_30d / 50000) * 100,
      totalPnl: whale_30d,
    },
  });

  await prisma.performance.upsert({
    where: { traderId_period: { traderId: trader1.id, period: 'ALL_TIME' } },
    update: { returnPct: (whale_all / 50000) * 100, totalPnl: whale_all },
    create: {
      traderId: trader1.id,
      period: 'ALL_TIME',
      returnPct: (whale_all / 50000) * 100,
      totalPnl: whale_all,
    },
  });

  const defi_7d = defi_trades.filter((t) => t.daysAgo <= 7).reduce((sum, t) => sum + t.usdValue, 0);
  const defi_30d = defi_trades.filter((t) => t.daysAgo <= 30).reduce((sum, t) => sum + t.usdValue, 0);
  const defi_all = defi_trades.reduce((sum, t) => sum + t.usdValue, 0);

  await prisma.performance.upsert({
    where: { traderId_period: { traderId: trader2.id, period: 'SEVEN_DAYS' } },
    update: { returnPct: (defi_7d / 30000) * 100, totalPnl: defi_7d },
    create: {
      traderId: trader2.id,
      period: 'SEVEN_DAYS',
      returnPct: (defi_7d / 30000) * 100,
      totalPnl: defi_7d,
    },
  });

  await prisma.performance.upsert({
    where: { traderId_period: { traderId: trader2.id, period: 'THIRTY_DAYS' } },
    update: { returnPct: (defi_30d / 30000) * 100, totalPnl: defi_30d },
    create: {
      traderId: trader2.id,
      period: 'THIRTY_DAYS',
      returnPct: (defi_30d / 30000) * 100,
      totalPnl: defi_30d,
    },
  });

  await prisma.performance.upsert({
    where: { traderId_period: { traderId: trader2.id, period: 'ALL_TIME' } },
    update: { returnPct: (defi_all / 30000) * 100, totalPnl: defi_all },
    create: {
      traderId: trader2.id,
      period: 'ALL_TIME',
      returnPct: (defi_all / 30000) * 100,
      totalPnl: defi_all,
    },
  });

  console.log('✅ Created performance records');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- CryptoWhale: ${whale_trades.length} trades, $${whale_all.toFixed(2)} total P&L`);
  console.log(`- DeFiMaster: ${defi_trades.length} trades, $${defi_all.toFixed(2)} total P&L`);
  console.log('\n🔗 Access traders at:');
  console.log(`- http://localhost:3000/traders`);
  console.log(`- CryptoWhale Analytics: http://localhost:3000/analytics/${trader1.id}`);
  console.log(`- DeFiMaster Analytics: http://localhost:3000/analytics/${trader2.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

