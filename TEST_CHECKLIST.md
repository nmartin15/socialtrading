# 🧪 Quick Trade System Test Checklist

## ⚡ 10-Minute Test Plan

Follow these steps to verify the trade system works end-to-end.

---

## Pre-Test Setup ✓

```bash
# Ensure server is running
npm run dev

# Ensure database is ready (if not already done)
npx prisma db push
```

Open: `http://localhost:3000`

---

## Test Flow (10 minutes)

### 1️⃣ Connect Wallet (1 min)
- [ ] Click "Connect Wallet"
- [ ] Approve connection
- [ ] See wallet address in UI

### 2️⃣ Register as Trader (2 min)
- [ ] Click "Become a Trader" in navigation
- [ ] Fill form:
  - Username: `[Your choice]`
  - Subscription Price: `$10`
  - Performance Fee: `10`
  - Select: "Day Trading" + "Swing Trading"
- [ ] Click "Register as Trader"
- [ ] ✅ Success message appears

### 3️⃣ Submit Trade (3 min)
- [ ] Click "Submit Trade" in navigation
- [ ] Fill form:
  - Token In: `WETH`
  - Token Out: `USDC`
  - Amount In: `1.5`
  - Amount Out: `2800`
  - Transaction Hash: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
  - USD Value: `2800`
  - Notes: Copy from below ⬇️

**Copy this for Notes (508 characters):**
```
This trade represents a strategic position based on technical and fundamental indicators. WETH broke above the 50-day moving average with strong volume. RSI at 65 indicating bullish momentum. MACD showing bullish crossover on 4H chart. Support at $1,800. Network upgrades expected to increase utility. DeFi TVL showing growth. Position size 30% of portfolio. Stop loss at $1,750. Take profit at $2,100. Risk/reward ratio 1:1.8. Overall market showing bullish sentiment. This aligns with medium-term bullish outlook on Ethereum.
```

- [ ] Click "Submit Trade"
- [ ] ✅ Success toast appears
- [ ] Navigate to "My Trades"
- [ ] ✅ Trade appears in table

### 4️⃣ Edit Trade (2 min)
- [ ] In "My Trades", click "✏️ Edit" button
- [ ] ✅ Modal opens with trade data
- [ ] Change Amount Out to: `2850`
- [ ] Change USD Value to: `2850`
- [ ] Click "Save Changes"
- [ ] ✅ Success toast appears
- [ ] ✅ Table shows updated values

### 5️⃣ Delete Trade (2 min)
- [ ] Click "🗑️ Delete" button
- [ ] ✅ Confirmation dialog appears
- [ ] Click "Cancel" first
- [ ] ✅ Dialog closes, trade remains
- [ ] Click "🗑️ Delete" again
- [ ] Click "Delete Trade"
- [ ] ✅ Success toast appears
- [ ] ✅ Trade removed from table
- [ ] Refresh page
- [ ] ✅ Trade still gone

---

## ✅ Success Criteria

All checkboxes above should be checked. If any fail, note the error below:

**Issues Found:**
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

---

## 📸 Screenshots (Optional)

Take screenshots at each major step:
1. Trader registration success
2. Trade submission success
3. Trade in My Trades table
4. Edit modal open
5. Delete confirmation dialog

---

## Quick Commands

```bash
# If you need to reset the database
npx prisma db push --force-reset

# If you need to check the database
npx prisma studio

# If you need to restart the server
# Press Ctrl+C, then:
npm run dev
```

---

## ⚠️ Troubleshooting

**Issue: "Become a Trader" doesn't appear**
- Refresh the page
- Ensure wallet is connected

**Issue: Trade submission fails**
- Check notes are 500+ characters
- Verify transaction hash format (starts with 0x)
- Check browser console (F12)

**Issue: Edit/Delete buttons don't show**
- Ensure you're on "My Trades" page
- Verify you're connected with the same wallet
- Refresh the page

---

## After Testing ✨

Once all tests pass:
1. ✅ You've verified the trade system works!
2. ✅ Try the copy trading feature next
3. ✅ Test viewing your profile as another user
4. ✅ Submit a few more trades with different tokens

---

**Time**: ~10 minutes  
**Difficulty**: Easy  
**Status**: Ready to test! 🚀

Start with Step 1️⃣ now!

