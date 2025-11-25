# Trade System End-to-End Testing Guide 🧪

## Testing Checklist

This guide will walk you through testing the complete trade submission, editing, and deletion flow with your real wallet.

---

## Prerequisites

✅ Development server running (`npm run dev`)  
✅ Database schema applied (`npx prisma db push`)  
✅ Wallet with test funds on Codex network  
✅ Browser with Web3 wallet extension installed  

---

## Test Flow Overview

```
1. Connect Wallet
   ↓
2. Register as Trader
   ↓
3. Submit a Trade (500+ chars)
   ↓
4. View Trade on Profile
   ↓
5. Edit the Trade
   ↓
6. Delete the Trade (with confirmation)
   ↓
7. Verify Deletion
```

---

## Step-by-Step Testing Instructions

### Step 1: Connect Your Wallet 🔐

1. Visit `http://localhost:3000`
2. Click **"Connect Wallet"** in the top right
3. Select your wallet provider (MetaMask, WalletConnect, etc.)
4. Approve the connection
5. **Verify**: Your wallet address should appear in the UI

**Expected Result**: ✅ Wallet connected, address visible

---

### Step 2: Register as a Trader 📝

1. After connecting, you should see a **"Become a Trader"** link in navigation
2. Click **"Become a Trader"** or visit `/become-trader`
3. Fill out the registration form:

   **Required Fields:**
   - Username (optional but recommended)
   - Bio (optional)
   - Subscription Price (e.g., `$10.00`)
   - Performance Fee (0-20%, e.g., `10`)
   - Trading Styles (select at least one):
     - Day Trading
     - Swing Trading
     - Scalping
     - Position Trading
     - Arbitrage
     - DeFi Farming

4. Click **"Register as Trader"**
5. Wait for transaction confirmation

**Expected Result**: ✅ Registration successful, redirected to profile or traders page

**Troubleshooting:**
- If "Become a Trader" link doesn't appear, refresh the page
- If registration fails, check browser console for errors
- Verify subscription price is >= 0

---

### Step 3: Submit a Trade with 500+ Character Notes 📊

1. Navigate to **"Submit Trade"** (in navigation or `/submit-trade`)
2. Fill out the trade form:

   **Trade Details:**
   ```
   Token In: WETH
   Token Out: USDC
   Amount In: 1.5
   Amount Out: 2800
   Transaction Hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   USD Value: 2800
   ```

   **Trade Notes (500+ characters):**
   ```
   This trade represents a strategic position based on several key technical and fundamental indicators. 
   
   Technical Analysis:
   - WETH broke above the 50-day moving average with strong volume
   - RSI at 65 indicating bullish momentum without being overbought
   - MACD showing a bullish crossover on the 4H chart
   - Support established at $1,800 level
   
   Fundamental Reasoning:
   - Ethereum network upgrades expected to increase utility
   - DeFi TVL showing consistent growth
   - Institutional interest in ETH continues to rise
   
   Risk Management:
   - Position size: 30% of portfolio
   - Stop loss set at $1,750 (-6.7%)
   - Take profit target: $2,100 (+12%)
   - Risk/reward ratio: 1:1.8
   
   Market Conditions:
   - Overall crypto market showing bullish sentiment
   - Bitcoin holding key support levels
   - Correlation between BTC and ETH remains strong
   
   This trade aligns with my medium-term bullish outlook on Ethereum.
   ```

3. Click **"Submit Trade"**
4. Sign the transaction in your wallet if prompted

**Expected Result**: ✅ Trade submitted successfully, success toast notification appears

**Verification Points:**
- Character count shows 500+
- All required fields are filled
- Transaction hash is valid format (0x...)
- Success message displays

---

### Step 4: View Trade on Your Profile 👀

1. Navigate to **"My Trades"** or `/my-trades`
2. Locate your newly submitted trade in the table

**What to Check:**
- ✅ Trade appears in the list
- ✅ All details match what you entered
- ✅ Timestamp is correct
- ✅ Token pair displays correctly (WETH → USDC)
- ✅ USD value shows correctly
- ✅ Transaction hash is a clickable link
- ✅ Notes are visible (may be truncated in table)
- ✅ Edit and Delete buttons are present

**Expected Result**: ✅ Trade visible with all correct details

---

### Step 5: Test Edit Functionality ✏️

1. In the **"My Trades"** page, click the **"✏️ Edit"** button on your trade
2. The Edit Trade Modal should open
3. Modify some fields:

   **Example Modifications:**
   - Change Amount Out to: `2850`
   - Change USD Value to: `2850`
   - Update Notes to add: 
     ```
     
     UPDATE: Trade executed successfully. Price improved by $50 due to favorable market conditions at execution time.
     ```

4. Click **"Save Changes"**
5. Sign any wallet transactions if prompted

**Expected Result**: ✅ Trade updated successfully, changes reflected in the table

**Verification Points:**
- ✅ Modal opens with pre-filled data
- ✅ All fields are editable
- ✅ Character count updates for notes
- ✅ Validation works (try invalid data)
- ✅ Success toast appears after saving
- ✅ Modal closes automatically
- ✅ Table refreshes with new data

**Common Issues:**
- If edit button doesn't appear, verify you're viewing YOUR trades
- If save fails, check that all required fields are still valid
- If changes don't appear, try refreshing the page

---

### Step 6: Test Delete with Confirmation 🗑️

1. In the **"My Trades"** page, click the **"🗑️ Delete"** button on your trade
2. A confirmation dialog should appear

**Confirmation Dialog Should Show:**
- ⚠️ Warning message
- Trade details (token pair, amounts)
- Two buttons: "Cancel" and "Delete Trade"

3. **First, test cancel:**
   - Click **"Cancel"**
   - Verify dialog closes and trade remains

4. **Now test actual deletion:**
   - Click **"🗑️ Delete"** again
   - Click **"Delete Trade"** in the confirmation dialog
   - Sign any wallet transactions if prompted

**Expected Result**: ✅ Trade deleted successfully, removed from table

**Verification Points:**
- ✅ Confirmation dialog appears before deletion
- ✅ Dialog shows correct trade details
- ✅ Cancel button works (doesn't delete)
- ✅ Delete button works (removes trade)
- ✅ Success toast appears
- ✅ Trade disappears from table
- ✅ Table updates automatically

---

### Step 7: Verify Deletion ✓

1. Refresh the **"My Trades"** page
2. Verify the trade is still gone
3. Visit your trader profile (`/traders/[your-trader-id]`)
4. Verify the trade doesn't appear there either
5. Check trade count has decreased by 1

**Expected Result**: ✅ Trade permanently deleted, not visible anywhere

---

## Additional Test Scenarios

### Test Scenario A: Submit Multiple Trades

1. Submit 3-5 trades with different token pairs
2. Verify they all appear in correct order (newest first)
3. Check pagination if you have many trades

### Test Scenario B: Edge Cases

**Test with minimum notes (exactly 500 characters):**
```
This is a test trade with exactly 500 characters of notes. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Test.
```

**Test with very long notes (2000+ characters):**
- Verify it accepts long notes
- Check display/truncation in table view

**Test with special characters in notes:**
- Emojis: 🚀 📈 💎
- Symbols: $, %, &, @
- Line breaks and formatting

### Test Scenario C: Validation

**Test invalid inputs:**
- Empty token fields
- Negative amounts
- Invalid transaction hash format
- Notes under 500 characters
- Empty notes

**Expected**: Form validation prevents submission, shows error messages

### Test Scenario D: View as Another User

1. Use a different wallet/browser
2. View your trader profile
3. Verify you can see trades but NOT edit/delete buttons

---

## Success Criteria ✅

Mark each as you complete:

- [ ] Successfully connected wallet
- [ ] Registered as a trader
- [ ] Submitted trade with 500+ char notes
- [ ] Trade appears in "My Trades"
- [ ] Trade appears on trader profile
- [ ] Successfully edited a trade
- [ ] Changes persisted after edit
- [ ] Delete confirmation dialog appeared
- [ ] Successfully deleted a trade
- [ ] Deletion persisted after refresh
- [ ] All validation works correctly
- [ ] Edit/Delete buttons only visible on own trades
- [ ] Transaction hashes link to explorer
- [ ] Timestamps display correctly
- [ ] No console errors during testing

---

## Common Issues & Solutions

### Issue: "Become a Trader" link doesn't appear
**Solution:** 
- Refresh the page
- Check that wallet is connected
- Clear browser cache
- Check browser console for errors

### Issue: Trade submission fails
**Solution:**
- Verify all required fields are filled
- Check notes are 500+ characters
- Ensure transaction hash is valid format (0x...)
- Check browser console for specific error

### Issue: Edit/Delete buttons don't appear
**Solution:**
- Verify you're viewing YOUR trades (My Trades page)
- Check that wallet is still connected
- Refresh the page
- Verify you're the owner of the trades

### Issue: Changes don't persist
**Solution:**
- Wait a moment and refresh
- Check network tab for API errors
- Verify database connection
- Check browser console

### Issue: Confirmation dialog doesn't appear
**Solution:**
- Check browser popup blocker
- Verify dialog component is installed
- Check browser console for errors
- Try a different browser

---

## Testing Checklist (Quick Reference)

```
✅ Setup
   □ Server running
   □ Database ready
   □ Wallet funded
   
✅ Registration
   □ Connect wallet
   □ Navigate to /become-trader
   □ Fill form completely
   □ Submit successfully
   
✅ Trade Submission
   □ Navigate to /submit-trade
   □ Fill all fields
   □ Notes 500+ characters
   □ Submit successfully
   □ Verify in My Trades
   
✅ Edit Function
   □ Click Edit button
   □ Modal opens with data
   □ Modify fields
   □ Save changes
   □ Verify updates
   
✅ Delete Function
   □ Click Delete button
   □ Confirmation appears
   □ Test Cancel
   □ Test Delete
   □ Verify removal
   
✅ Verification
   □ Refresh pages
   □ Check persistence
   □ View on profile
   □ No errors in console
```

---

## Sample Test Data

### Trade Example 1: WETH → USDC
```json
{
  "tokenIn": "WETH",
  "tokenOut": "USDC",
  "amountIn": "1.5",
  "amountOut": "2800",
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "usdValue": "2800"
}
```

### Trade Example 2: BTC → ETH
```json
{
  "tokenIn": "WBTC",
  "tokenOut": "WETH",
  "amountIn": "0.5",
  "amountOut": "8.5",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "usdValue": "22000"
}
```

### Trade Example 3: USDC → DEX
```json
{
  "tokenIn": "USDC",
  "tokenOut": "DEX",
  "amountIn": "5000",
  "amountOut": "25000",
  "txHash": "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
  "usdValue": "5000"
}
```

---

## Recording Test Results

### Test Session Info
- **Date**: _______________
- **Tester**: _______________
- **Wallet Address**: _______________
- **Browser**: _______________

### Test Results
- **Registration**: ☐ Pass ☐ Fail - Notes: _______________
- **Submit Trade**: ☐ Pass ☐ Fail - Notes: _______________
- **View Trade**: ☐ Pass ☐ Fail - Notes: _______________
- **Edit Trade**: ☐ Pass ☐ Fail - Notes: _______________
- **Delete Trade**: ☐ Pass ☐ Fail - Notes: _______________

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Status
☐ All Tests Passed  
☐ Minor Issues Found  
☐ Major Issues Found  

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Test the copy trading feature (subscribe to yourself from another wallet)
2. ✅ Test analytics dashboard
3. ✅ Test with multiple users
4. ✅ Load testing with many trades
5. ✅ Mobile device testing

---

**Time Required**: ~10 minutes  
**Difficulty**: Easy  
**Impact**: High (verifies core functionality)

Ready to test? Start with Step 1! 🚀

