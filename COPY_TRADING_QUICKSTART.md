# Copy Trading Quick Start Guide 🚀

Get started with copy trading in 5 minutes!

## Setup (First Time Only)

### 1. Apply Database Changes

```bash
# Push the new schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Using Copy Trading

### Step 1: Connect Your Wallet 🔐

1. Click "Connect Wallet" in the top right
2. Select your wallet provider
3. Approve the connection

### Step 2: Browse Traders 🔍

1. Click "Browse Traders" in the navigation
2. Review trader profiles:
   - Performance metrics (7d, 30d, all-time)
   - Trading styles
   - Subscription price
   - Follower/copier counts

### Step 3: Subscribe to a Trader 💳

1. Click on a trader to view their full profile
2. Review their trade history and performance
3. Click the "Subscribe" button in the profile card
4. Review the subscription details:
   - Monthly price
   - Features included
   - Terms
5. Click "Subscribe Now"
6. ✅ Success! You're now subscribed

### Step 4: Configure Copy Settings ⚙️

After subscribing, configure how you want to copy trades:

1. Click "Copy Settings" from:
   - Trader profile page, OR
   - My Subscriptions page
2. Choose your copy strategy:
   - **Percentage**: Copy X% of trader's position size
   - **Fixed Amount**: Always copy $X worth
   - **Proportional**: Scale relative to your account
3. Set trade limits:
   - Min trade size (default: $10)
   - Max trade size (default: $10,000)
4. Configure risk controls (optional but recommended):
   - Max daily loss
   - Stop loss percentage
5. Add token filters (optional):
   - Allowed tokens (whitelist)
   - Excluded tokens (blacklist)
6. Click "Save Settings"

### Step 5: Monitor Your Subscriptions 📊

Visit `/my-subscriptions` to:
- View all your subscriptions
- Check copy settings at a glance
- Pause/resume copying
- Cancel subscriptions
- Access quick settings

### Step 6: Stay Informed 🔔

Click the bell icon (🔔) in the navigation to:
- See new trade notifications
- Review subscription updates
- Check risk alerts
- Mark notifications as read

## Example Configurations

### Conservative Setup (Low Risk)
```
Copy Amount Type: Percentage
Copy Amount: 25%
Max Trade Size: $500
Min Trade Size: $50
Max Daily Loss: $200
Stop Loss: 5%
```

### Moderate Setup (Balanced)
```
Copy Amount Type: Percentage
Copy Amount: 50%
Max Trade Size: $2,000
Min Trade Size: $20
Max Daily Loss: $1,000
Stop Loss: 8%
```

### Aggressive Setup (High Risk)
```
Copy Amount Type: Percentage
Copy Amount: 100%
Max Trade Size: $5,000
Min Trade Size: $10
Max Daily Loss: $3,000
Stop Loss: 15%
```

## Common Actions

### Pause Copy Trading
1. Go to My Subscriptions or trader profile
2. Click "Pause Copying"
3. Status changes to PAUSED
4. No new trades copied until resumed

### Resume Copy Trading
1. Go to My Subscriptions or trader profile
2. Click "Resume Copying"
3. Status changes to ACTIVE
4. New trades copied according to settings

### Cancel Subscription
1. Go to My Subscriptions or trader profile
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Status changes to CANCELLED
5. Can resubscribe anytime

### Update Settings
1. Click "Copy Settings" from any subscription
2. Modify any parameters
3. Click "Save Settings"
4. Changes apply immediately to future trades

## Navigation Guide

### Main Menu
- **Browse Traders**: Discover traders to copy
- **My Subscriptions**: Manage your subscriptions
- **🔔 Notifications**: View activity updates

### For Traders Only
- **My Trades**: View your trade history
- **Submit Trade**: Record a new trade
- **Analytics**: Deep dive into performance

## Tips & Best Practices 💡

### Getting Started
1. ✅ Start with 1-2 traders
2. ✅ Use low copy amounts initially
3. ✅ Set conservative risk limits
4. ✅ Monitor performance weekly
5. ✅ Adjust settings based on results

### Risk Management
1. ✅ Never allocate 100% to one trader
2. ✅ Always set max trade size
3. ✅ Use stop losses
4. ✅ Set daily loss limits
5. ✅ Exclude unfamiliar tokens

### What NOT to Do
1. ❌ Don't copy without risk limits
2. ❌ Don't ignore notifications
3. ❌ Don't over-leverage
4. ❌ Don't copy too many traders
5. ❌ Don't set and forget

## Testing the Feature

### Test Scenario 1: Basic Subscription
1. Connect wallet
2. Browse traders
3. Subscribe to a trader
4. Verify subscription in My Subscriptions
5. Check notification received

### Test Scenario 2: Settings Management
1. Open copy settings
2. Change copy amount type to "Fixed"
3. Set amount to $100
4. Set max trade size to $500
5. Save and verify changes persist

### Test Scenario 3: Status Changes
1. Pause an active subscription
2. Verify status shows as "Paused"
3. Resume the subscription
4. Verify status shows as "Active"
5. Cancel the subscription
6. Verify status shows as "Cancelled"

## Troubleshooting 🔧

### Can't Subscribe
- ✓ Check wallet is connected
- ✓ Verify you're not subscribing to yourself
- ✓ Check you don't already have an active subscription

### Settings Not Saving
- ✓ Check all required fields are filled
- ✓ Verify values are within valid ranges
- ✓ Check browser console for errors
- ✓ Try refreshing the page

### Notifications Not Showing
- ✓ Check notification bell icon
- ✓ Verify wallet is connected
- ✓ Refresh the page
- ✓ Check browser permissions

### Subscription Not Showing
- ✓ Refresh the My Subscriptions page
- ✓ Check wallet address is correct
- ✓ Verify transaction completed
- ✓ Check browser console for errors

## API Testing (Developers)

### Test Subscription Creation
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x123...",
    "traderId": "trader_id_here"
  }'
```

### Test Copy Settings Update
```bash
curl -X PATCH http://localhost:3000/api/copy-settings/{subscriptionId} \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x123...",
    "copyAmount": 50,
    "maxTradeSize": 1000
  }'
```

### Test Notifications
```bash
curl "http://localhost:3000/api/notifications?walletAddress=0x123...&unreadOnly=true"
```

## Demo Data (Optional)

If you want to test with demo data:

```bash
# Run the seed script
npm run prisma:seed
```

This creates:
- Sample traders with different styles
- Performance data
- Sample trades

## What's Next?

After mastering the basics:
1. 📈 Experiment with different copy strategies
2. 🎯 Fine-tune your risk management
3. 📊 Track your performance over time
4. 🌟 Discover new successful traders
5. 💬 Provide feedback for improvements

## Support & Resources

- **Full Guide**: See `COPY_TRADING_GUIDE.md`
- **Implementation Details**: See `COPY_TRADING_IMPLEMENTATION.md`
- **API Docs**: Check route files in `app/api/`

## Quick Reference Card

| Action | Location | Button |
|--------|----------|--------|
| Subscribe | Trader Profile | "Subscribe" |
| Settings | My Subscriptions / Profile | "⚙️ Copy Settings" |
| Pause | My Subscriptions / Profile | "⏸ Pause" |
| Resume | My Subscriptions / Profile | "▶️ Resume" |
| Cancel | My Subscriptions / Profile | "✕ Cancel" |
| Notifications | Navigation Bar | "🔔" |

---

**Ready to start?** Connect your wallet and browse traders! 🚀

