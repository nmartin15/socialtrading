# 🧪 Testing Guide - Social Trading Platform

## Quick Start Testing

Follow these steps to test your social trading platform:

---

## ✅ Prerequisites Checklist

Before testing, make sure you have:

- [ ] PostgreSQL installed and running
- [ ] Environment variables configured in `.env`
- [ ] Database schema pushed to database
- [ ] Development server running

---

## 🚀 Step-by-Step Testing

### Step 1: Configure Environment Variables

Edit your `.env` file with your actual values:

```env
# Your PostgreSQL connection
DATABASE_URL="postgresql://user:password@localhost:5432/social_trading?schema=public"

# Get this FREE from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id_here"

# Already configured (don't change)
NEXT_PUBLIC_CODEX_CHAIN_ID="1776"
NEXT_PUBLIC_CODEX_RPC_URL="http://node-mainnet.thecodex.net/"
NEXT_PUBLIC_CODEX_NATIVE_TOKEN="DEX"
```

### Step 2: Setup Database

```bash
npm run prisma:push
```

Expected output:
```
✔ Generated Prisma Client
🚀  Your database is now in sync with your Prisma schema.
```

### Step 3: Start Development Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 16.0.3
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

## 🎯 What to Test

### Test 1: Homepage ✅
**URL:** http://localhost:3000

**What to check:**
- [ ] Page loads without errors
- [ ] "Connect Wallet" button visible
- [ ] Hero section displays
- [ ] "Browse Traders" button works
- [ ] "Become a Trader" button works
- [ ] Stats section shows Chain ID 1776

### Test 2: Connect Wallet 🔗
**Location:** Any page (top right)

**What to test:**
1. Click "Connect Wallet"
2. Select MetaMask or WalletConnect
3. Approve connection
4. See your wallet address displayed
5. Try disconnecting

**Expected:** Wallet connects and shows shortened address

### Test 3: Trader Registration 📝
**URL:** http://localhost:3000/become-trader

**What to test:**
1. Click "Become a Trader" from homepage
2. Connect your wallet if not connected
3. Fill out the form:
   - Username: `test_trader_1`
   - Bio: `This is my test trader profile for testing the platform`
   - Subscription Price: `25`
   - Performance Fee: `15`
   - Select 2-3 trading styles
4. Submit the form

**Expected:**
- Form validates inputs
- Shows loading state
- Redirects to trader profile
- Profile page displays your info

### Test 4: Browse Traders 🔍
**URL:** http://localhost:3000/traders

**What to test:**
1. Navigate to traders page
2. See your trader card displayed
3. Click "All Traders" filter
4. Click "Verified Only" filter
5. Click on your trader card

**Expected:**
- Your trader appears in the list
- Trader card shows all info correctly
- Filters work (verified filter shows nothing yet)
- Clicking card navigates to profile

### Test 5: Trader Profile 👤
**URL:** http://localhost:3000/traders/[your-trader-id]

**What to test:**
1. View your full trader profile
2. Check all information displays:
   - Username & avatar
   - Bio
   - Trading styles
   - Stats (followers, copiers, trades)
   - Performance metrics
   - Subscribe button
3. Click "Back to Traders"

**Expected:**
- All info displays correctly
- Performance shows "No data" (normal for new trader)
- Recent trades shows "No trades yet"
- Navigation works

### Test 6: API Endpoints 🔌

**Test Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-11-24T..."
}
```

**Test Get Traders:**
```bash
curl http://localhost:3000/api/traders
```

**Expected:** Array of trader objects

**Test Get Verified Traders:**
```bash
curl http://localhost:3000/api/traders?verified=true
```

**Expected:** Empty array (no verified traders yet)

---

## 🎨 Visual Testing Checklist

### Design & Layout
- [ ] Dark theme looks good
- [ ] Text is readable
- [ ] Buttons have hover effects
- [ ] Forms are well-styled
- [ ] Cards have proper spacing
- [ ] Mobile responsive (test by resizing browser)

### Interactive Elements
- [ ] Buttons respond to clicks
- [ ] Links navigate correctly
- [ ] Forms validate on submit
- [ ] Loading states appear
- [ ] Error messages display clearly

### Data Display
- [ ] Trader cards show correct info
- [ ] Performance metrics formatted properly
- [ ] Currency displays with $ symbol
- [ ] Percentages show with % symbol
- [ ] Dates formatted correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** 
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Try: `npm run prisma:studio` to test connection

### Issue: "Module not found"
**Solution:**
```bash
npm install
npm run prisma:generate
```

### Issue: "Wallet won't connect"
**Solution:**
- Make sure you have MetaMask installed
- Try refreshing the page
- Check browser console for errors
- Verify WALLETCONNECT_PROJECT_ID is set

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Kill the process or use different port
PORT=3001 npm run dev
```

### Issue: "Form validation errors"
**Solution:**
- Username: 3-20 characters, alphanumeric + underscore only
- Bio: At least 10 characters
- Select at least 1 trading style
- Performance fee: 0-20

---

## 📊 Test Multiple Traders

To fully test the platform, create 2-3 different traders:

1. **Disconnect your wallet** (or use different wallet/browser)
2. **Repeat trader registration** with different info:
   - Trader 2: `swing_trader`, different styles
   - Trader 3: `scalper_pro`, different pricing
3. **Browse traders page** to see multiple cards
4. **Compare profiles**

---

## ✨ Advanced Testing (Optional)

### Test with Prisma Studio
```bash
npm run prisma:studio
```

Opens GUI at http://localhost:5555
- View all database tables
- See your traders
- Manually add performance data
- Add test trades

### Test API with curl/Postman

**Create User:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234...","username":"test_user"}'
```

**Get All Users:**
```bash
curl http://localhost:3000/api/users
```

---

## 🎯 Success Criteria

Your platform is working if:
- ✅ Homepage loads and looks good
- ✅ Wallet connects successfully
- ✅ Trader registration completes
- ✅ Trader appears in traders list
- ✅ Trader profile displays correctly
- ✅ API endpoints return data
- ✅ Database stores records
- ✅ No console errors (major ones)

---

## 📸 What to Look For

### Good Signs ✅
- Smooth page transitions
- Fast data loading
- Beautiful UI
- No error messages
- Data persists after refresh

### Issues to Report 🐛
- Any error messages
- Blank pages
- Failed API calls
- Form submission issues
- Database connection problems

---

## 🎉 You're Ready!

Now test everything systematically. If you encounter any issues, let me know:
- What you were doing
- What error you got
- What you expected to happen

Happy testing! 🚀

