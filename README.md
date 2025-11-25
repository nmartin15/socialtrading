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

## Getting Started

### Prerequisites

- Node.js 20.11.1 or higher
- PostgreSQL database
- WalletConnect Project ID (get from https://cloud.walletconnect.com)

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
```

3. Set up the database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create the database schema (if database exists)
npm run prisma:push

# Or run migrations
npm run prisma:migrate
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client singleton
│   ├── wagmi.ts          # Wagmi Web3 configuration
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

## 🔄 Copy Trading Feature

A complete copy trading system is now available! Users can:

- Subscribe to traders with custom copy settings
- Configure risk management (max trade size, daily loss limits, stop loss)
- Choose copy strategies (percentage, fixed amount, proportional)
- Filter tokens (whitelist/blacklist)
- Manage subscriptions (pause/resume/cancel)
- Receive real-time notifications

### Quick Start

```bash
# Apply the new database schema
npx prisma db push

# Start the development server
npm run dev
```

### Documentation

- **Quick Start**: [COPY_TRADING_QUICKSTART.md](./COPY_TRADING_QUICKSTART.md)
- **User Guide**: [COPY_TRADING_GUIDE.md](./COPY_TRADING_GUIDE.md)
- **Implementation**: [COPY_TRADING_IMPLEMENTATION.md](./COPY_TRADING_IMPLEMENTATION.md)
- **Overview**: [COPY_TRADING_README.md](./COPY_TRADING_README.md)

## Contributing

This is a development environment setup. Implement features as needed for your social trading platform.

## License

ISC

