# Copy Trading Feature Guide 🔄

## Overview

The Copy Trading feature allows users to automatically replicate trades from successful traders. This guide covers subscription management, copy settings, risk controls, and the notification system.

## Features

### 1. Subscription Management 📝

#### Subscribe to a Trader
- Visit any trader's profile page
- Click the "Subscribe" button in the profile card
- Review the subscription details and pricing
- Confirm subscription (in production: payment processing)
- Default copy settings are automatically created

#### Subscription Statuses
- **ACTIVE**: Copy trading is enabled and working
- **PAUSED**: Subscription maintained but copying temporarily stopped
- **CANCELLED**: Subscription ended, can resubscribe

#### Managing Subscriptions
- View all subscriptions at `/my-subscriptions`
- Pause/Resume active subscriptions
- Cancel subscriptions at any time
- Configure individual copy settings per trader

### 2. Copy Settings ⚙️

Access copy settings from:
- Trader profile page (if subscribed)
- My Subscriptions page
- Click "Copy Settings" or ⚙️ icon

#### Copy Amount Types

**Percentage** (Default: 100%)
- Copy a percentage of the trader's position size
- Example: Trader buys $1000 worth, 50% = you buy $500 worth

**Fixed Amount**
- Copy a fixed USD amount per trade regardless of trader's size
- Example: Always copy $100 per trade

**Proportional**
- Multiplier relative to your account size vs trader's
- Example: If trader uses 10% of their portfolio, you use 10% of yours

#### Trade Size Limits

**Min Trade Size**
- Minimum USD value required to copy a trade
- Trades below this threshold are skipped
- Default: $10

**Max Trade Size**
- Maximum USD value per copied trade
- Prevents over-exposure on large trades
- Default: $10,000

### 3. Risk Management Controls 🛡️

#### Max Daily Loss
- Stop copying if daily losses exceed this USD amount
- Automatically pauses copying until next day
- Helps protect capital during volatile periods

#### Stop Loss Percentage
- Automatically sell position if it drops by this percentage
- Independent of trader's actions
- Example: 5% stop loss exits position if down 5%

#### Token Filters

**Allowed Tokens** (Whitelist)
- Only copy trades involving these specific tokens
- Leave empty to allow all tokens
- Example: WETH, USDC, BTC

**Excluded Tokens** (Blacklist)
- Never copy trades involving these tokens
- Overrides allowed tokens list
- Example: DOGE, SHIB

### 4. Notification System 🔔

#### Notification Types

- **📈 NEW_TRADE**: Trader executed a new trade
- **✅ SUBSCRIPTION_STARTED**: Successfully subscribed to a trader
- **⏹️ SUBSCRIPTION_ENDED**: Subscription cancelled/ended
- **📋 TRADE_COPIED**: Your system copied a trade
- **⚠️ RISK_ALERT**: Risk limit reached (daily loss, etc.)

#### Accessing Notifications
- Click the bell icon 🔔 in navigation bar
- Badge shows unread count
- Mark individual notifications as read
- "Mark all as read" for bulk action

## API Endpoints

### Subscriptions

#### GET /api/subscriptions
Get user's subscriptions
```
Query params: walletAddress
Returns: { subscriptions: Subscription[] }
```

#### POST /api/subscriptions
Create new subscription
```json
{
  "walletAddress": "0x...",
  "traderId": "trader_id"
}
```

#### PATCH /api/subscriptions/[id]
Update subscription status
```json
{
  "walletAddress": "0x...",
  "status": "ACTIVE" | "PAUSED" | "CANCELLED"
}
```

#### DELETE /api/subscriptions/[id]
Delete subscription
```
Query params: walletAddress
```

### Copy Settings

#### GET /api/copy-settings/[id]
Get copy settings for subscription
```
Query params: walletAddress
Returns: { copySettings: CopySettings }
```

#### PATCH /api/copy-settings/[id]
Update copy settings
```json
{
  "walletAddress": "0x...",
  "copyEnabled": true,
  "copyAmountType": "PERCENTAGE",
  "copyAmount": 100,
  "maxTradeSize": 10000,
  "minTradeSize": 10,
  "maxDailyLoss": 5000,
  "stopLossPercent": 5,
  "allowedTokens": ["WETH", "USDC"],
  "excludedTokens": ["DOGE"]
}
```

### Notifications

#### GET /api/notifications
Get user's notifications
```
Query params: walletAddress, unreadOnly (optional)
Returns: { notifications: Notification[] }
```

#### PATCH /api/notifications
Mark notifications as read
```json
{
  "walletAddress": "0x...",
  "notificationIds": ["id1", "id2"] // optional, empty = mark all
}
```

## Database Schema

### CopySettings Model
```prisma
model CopySettings {
  id                String   @id @default(cuid())
  subscriptionId    String   @unique
  copyEnabled       Boolean  @default(true)
  copyAmountType    String   @default("PERCENTAGE")
  copyAmount        Float    @default(100)
  maxTradeSize      Float?
  minTradeSize      Float?
  maxDailyLoss      Float?
  stopLossPercent   Float?
  allowedTokens     String?  // JSON array
  excludedTokens    String?  // JSON array
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  subscription      Subscription @relation(fields: [subscriptionId], references: [id])
}
```

### Subscription Model
```prisma
model Subscription {
  id           String        @id @default(cuid())
  copierId     String
  traderId     String
  status       String        @default("ACTIVE")
  monthlyPrice Int           // in cents
  startDate    DateTime      @default(now())
  endDate      DateTime?
  copySettings CopySettings?
  
  copier       User   @relation(fields: [copierId], references: [id])
  trader       Trader @relation(fields: [traderId], references: [id])
}
```

## UI Components

### SubscriptionDialog
Modal for subscribing to traders
- Shows pricing and features
- Handles subscription creation
- Success/error notifications

### CopySettingsDialog
Comprehensive settings management
- Copy amount configuration
- Trade size limits
- Risk management controls
- Token filtering

### NotificationBell
Real-time notification display
- Unread count badge
- Mark as read functionality
- Notification history

### ProfileActions
Context-aware action card
- Subscribe button for non-subscribers
- Settings & status for subscribers
- Pause/Resume/Cancel options

## User Flows

### Subscribing to a Trader
1. Browse traders at `/traders`
2. Click on a trader to view profile
3. Click "Subscribe" button
4. Review details in dialog
5. Confirm subscription
6. Default copy settings created
7. Notification sent
8. Can immediately configure settings

### Managing Copy Settings
1. Go to `/my-subscriptions` or trader profile
2. Click "Copy Settings" or ⚙️
3. Adjust copy amount type and value
4. Set trade size limits
5. Configure risk controls
6. Add token filters (optional)
7. Save settings
8. Settings apply to future trades

### Pausing Copy Trading
1. Visit subscription page or trader profile
2. Click "Pause Copying"
3. Status changes to PAUSED
4. No new trades copied
5. Existing positions unaffected
6. Can resume anytime

### Cancelling Subscription
1. Visit subscription page or trader profile
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Status changes to CANCELLED
5. Can resubscribe later
6. Trader's follower count updated

## Best Practices

### For Copiers

1. **Start Small**: Begin with lower copy amounts to test
2. **Set Limits**: Always configure max trade size and daily loss limits
3. **Monitor Performance**: Check subscriptions regularly
4. **Diversify**: Subscribe to multiple traders with different styles
5. **Use Filters**: Exclude high-risk tokens if needed
6. **Review Notifications**: Stay informed about copied trades

### For Risk Management

1. **Max Trade Size**: Set based on your total capital (e.g., 5-10%)
2. **Daily Loss Limit**: Protect against volatile days (e.g., 2-5% of capital)
3. **Stop Loss**: Use 5-10% for most strategies
4. **Token Filtering**: Exclude meme coins or unfamiliar tokens
5. **Regular Reviews**: Adjust settings based on performance

## Testing

### Manual Testing Checklist

- [ ] Subscribe to a trader
- [ ] View subscription in My Subscriptions page
- [ ] Configure copy settings
- [ ] Pause subscription
- [ ] Resume subscription
- [ ] Cancel subscription
- [ ] Receive notifications
- [ ] Mark notifications as read
- [ ] Update copy settings
- [ ] Test with multiple subscriptions

### Edge Cases

- Can't subscribe to yourself
- Can't have duplicate active subscriptions
- Copy settings created with subscription
- Trader counts update correctly
- Cancelled subscriptions don't copy trades
- Paused subscriptions maintain settings

## Future Enhancements

### Payment Integration
- Stripe for credit card payments
- Crypto payment support
- Subscription billing automation
- Performance fee calculation

### Advanced Features
- Copy trade execution (actual blockchain transactions)
- Portfolio synchronization
- Performance tracking per subscription
- Social features (comments, ratings)
- Advanced risk analytics

### Automation
- Automatic rebalancing
- Smart copy amount adjustment
- AI-powered risk management
- Performance-based copy ratios

## Support

For issues or questions:
1. Check notification center for alerts
2. Review copy settings configuration
3. Verify subscription status
4. Check trader's recent activity
5. Contact platform support

## Production Considerations

### Before Launch

1. **Payment Processing**
   - Integrate Stripe/payment provider
   - Handle subscription billing
   - Manage failed payments
   - Refund processing

2. **Trade Execution**
   - Smart contract integration
   - Gas optimization
   - Slippage protection
   - Transaction monitoring

3. **Security**
   - Wallet connection security
   - API authentication
   - Rate limiting
   - Input validation

4. **Performance**
   - Database optimization
   - Caching strategy
   - Real-time updates
   - Scalability testing

5. **Monitoring**
   - Error tracking
   - Performance metrics
   - User analytics
   - Transaction monitoring

---

**Note**: This is a demo implementation. Production use requires additional security, testing, payment integration, and actual trade execution logic.

