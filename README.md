# DexMirror - Copy Trading on Codex Blockchain

A social trading platform built on the Codex blockchain (EVM-compatible) that allows users to follow and copy trades from successful traders.

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Blockchain**: Codex (Chain ID: 1776, Native Token: DEX)
- **Web3**: ethers.js v6, wagmi v2, Web3Modal
- **Database**: PostgreSQL with Prisma ORM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## 🔐 Security Notice

**IMPORTANT:** Critical security features have been implemented. Before running the app, you must:

1. Set up a PostgreSQL database (SQLite is no longer supported)
2. Generate a secure JWT_SECRET (min 32 characters)
3. Configure all required environment variables

See **[SECURITY_FIXES_COMPLETE.md](./SECURITY_FIXES_COMPLETE.md)** for setup instructions.

## Getting Started

### Prerequisites

- Node.js 20.11.1 or higher
- **PostgreSQL database** (required - SQLite no longer supported)
- WalletConnect Project ID (get from https://cloud.walletconnect.com)
- JWT Secret (generate with: `openssl rand -hex 32`)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Copy the example env file
cp env.example .env

# Edit .env with your actual values
# REQUIRED:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (generate: openssl rand -hex 32)
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

⚠️ **Security Alert:** The app will not start without proper environment configuration.

3. Set up the PostgreSQL database:

```bash
# First, create a PostgreSQL database
# Option 1: Use cloud provider (Neon, Supabase, Railway - all have free tiers)
# Option 2: Local PostgreSQL: createdb dexmirror

# Generate Prisma Client
npm run prisma:generate

# Run migrations (RECOMMENDED for production)
npm run prisma:migrate dev --name init

# Seed demo data (optional)
npm run prisma:seed
```

**Note:** `prisma db push` is no longer recommended. Use migrations for data safety.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

### 📊 Advanced Analytics Dashboard
- **Performance Metrics**: Win rate, profit factor, max drawdown
- **Streak Tracking**: Longest win/loss streaks  
- **Time Analysis**: 7-day, 30-day, and all-time performance
- **Visual Charts**: P&L trends, trading frequency, token pairs
- **Monthly Breakdown**: Performance and win rate by month
- **Trade Highlights**: Best and worst trades

See [ANALYTICS_IMPLEMENTATION_COMPLETE.md](./ANALYTICS_IMPLEMENTATION_COMPLETE.md) for details.

### 🎯 Trading Features
- Submit trades with detailed analysis
- Automated blockchain trade import
- Trade verification badges
- Edit/delete trade functionality
- Rich text trade notes

### 👥 Social Features
- Follow and copy top traders
- Real-time notifications
- Trader discovery with filters
- Performance-based rankings
- Profile views tracking

### 🔒 Risk Management
- Customizable copy settings
- Trade size limits
- Stop-loss configuration
- Token allowlists/blocklists
- Maximum daily loss limits

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── analytics/         # Analytics dashboard pages
│   ├── api/               # API routes
│   ├── traders/           # Trader profile pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AnalyticsCharts.tsx   # Chart visualizations
│   ├── TraderCard.tsx        # Trader list cards
│   └── ui/                   # UI components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client singleton
│   ├── wagmi.ts          # Wagmi Web3 configuration
│   ├── tradeScanner.ts   # Blockchain trade scanner
│   └── types.ts          # TypeScript type definitions
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── env.example           # Environment variables template
└── package.json          # Dependencies and scripts
```

## Database Schema

### Models

- **User**: Base user model with wallet address, username, role (trader/copier)
- **Trader**: Trader profile with subscription pricing, performance fees, trading styles
- **Trade**: Individual trade records with token pairs, amounts, and transaction hashes
- **Subscription**: Subscription relationships between copiers and traders
- **CopySettings**: 🆕 Copy trading configuration (amount type, limits, risk controls, token filters)
- **CopyTrade**: Records of copied trades with P&L tracking
- **Performance**: Performance metrics by time period (7d/30d/all-time)
- **Notification**: User notifications for trades, subscriptions, and alerts

## Codex Blockchain Configuration

- **Chain ID**: 1776
- **RPC URL**: http://node-mainnet.thecodex.net/
- **Native Token**: DEX
- **Network Type**: EVM-compatible

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:push` - Push schema to database

## Features

### ✅ Implemented

- [x] Wallet connection with Web3Modal
- [x] Trader profile pages with performance metrics
- [x] Trade feed and history with filtering
- [x] **Copy trading subscription system** 🔄 NEW!
- [x] Real-time trade notifications
- [x] Performance analytics dashboard
- [x] User profile management
- [x] Trader registration system
- [x] Trade submission with notes (500+ chars)
- [x] Edit/Delete trade functionality
- [x] Risk management controls
- [x] Subscription management dashboard

### 🚧 Ready for Phase 2

- [ ] Payment processing integration (Stripe/crypto)
- [ ] Automated trade execution (smart contracts)
- [ ] Real-time WebSocket updates
- [ ] Mobile application
- [ ] Advanced analytics and reporting

## 🔄 Copy Trading Feature ✨ NEW!

A complete copy trading system with automatic trade execution! Users can:

- **Subscribe to traders** with flexible payment options (Free Demo, Crypto, Card)
- **Automatic trade copying** - Trades are copied instantly to all active subscribers
- **Risk management** - Max trade size, daily loss limits, stop loss, token filters
- **Copy strategies** - Percentage, fixed amount, or proportional copying
- **Token filters** - Whitelist/blacklist specific tokens
- **Subscription management** - Pause/resume/cancel anytime
- **Real-time notifications** - Get notified of new trades and copy confirmations

### 🚀 What's New (Nov 26, 2025)

- ✅ **Automatic Trade Copying** - When traders submit trades, they're automatically copied to subscribers
- ✅ **Enhanced Payment Flow** - Choose from Free Demo, Crypto, or Card payment methods
- ✅ **Risk Validation** - Comprehensive checks before copying each trade
- ✅ **Notification System** - Real-time alerts for trades, copies, and risk limits
- ✅ **Copy Trade Service** - Dedicated service layer for trade copying logic

### Quick Start

```bash
# Apply the new database schema (if not already done)
npx prisma db push

# Start the development server
npm run dev

# Test the complete flow
# See COPY_TRADING_TESTING_GUIDE.md for detailed test scenarios
```

### Documentation

- **Testing Guide**: [COPY_TRADING_TESTING_GUIDE.md](./COPY_TRADING_TESTING_GUIDE.md) 🆕
- **Feature Complete**: [COPY_TRADING_FEATURE_COMPLETE.md](./COPY_TRADING_FEATURE_COMPLETE.md) 🆕
- **Quick Start**: [COPY_TRADING_QUICKSTART.md](./COPY_TRADING_QUICKSTART.md)
- **User Guide**: [COPY_TRADING_GUIDE.md](./COPY_TRADING_GUIDE.md)
- **Implementation**: [COPY_TRADING_IMPLEMENTATION.md](./COPY_TRADING_IMPLEMENTATION.md)
- **Overview**: [COPY_TRADING_README.md](./COPY_TRADING_README.md)

## Contributing

This is a development environment setup. Implement features as needed for your social trading platform.

## License

ISC

