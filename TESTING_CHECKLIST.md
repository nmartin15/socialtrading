# 🧪 Testing Checklist - Trade Submission System

## 🚀 Getting Started

### Step 1: Start the Development Server

```bash
# Make sure you're in the project root
cd "c:\Users\nated\Projects\Social Trading"

# If dependencies aren't installed yet:
npm install

# Start the dev server
npm run dev
```

The server should start at: **http://localhost:3000**

---

## ✅ Test Plan

### **Test 1: View Home Page**
- [ ] Open http://localhost:3000
- [ ] Verify home page loads
- [ ] See "Browse Traders" and "Become a Trader" buttons

---

### **Test 2: Connect Wallet**
- [ ] Click "Connect Wallet" button in header
- [ ] Connect your MetaMask/wallet
- [ ] Verify wallet address shows in header
- [ ] Check if "My Trades" and "Submit Trade" links appear (if you're a trader)

---

### **Test 3: Register as Trader** (if not already)
- [ ] Navigate to `/become-trader`
- [ ] Fill out trader registration form:
  - Username
  - Bio
  - Subscription price
  - Performance fee
  - Trading styles
  - Avatar URL (optional)
- [ ] Submit the form
- [ ] Verify success message
- [ ] Check that you're redirected

---

### **Test 4: Submit a Trade** ⭐

#### Navigate to Submit Trade Page:
- [ ] Go to `/submit-trade` or click "Submit Trade" in nav
- [ ] Verify form displays correctly

#### Fill out the form with test data:
```
Token In: ETH
Token Out: USDC
Amount In: 1.5
Amount Out: 2500
Transaction Hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
USD Value: 3000 (optional)
```

- [ ] Click "Submit Trade"
- [ ] Verify success message appears
- [ ] Verify redirect to `/my-trades` after 2 seconds

---

### **Test 5: View My Trades** ⭐

- [ ] Navigate to `/my-trades`
- [ ] Verify trade appears in the list
- [ ] Check stats cards at top (Total Trades, Volume, Unique Tokens)
- [ ] Verify all trade details display correctly:
  - Token pair (ETH → USDC)
  - Amount In (1.5 ETH)
  - Amount Out (2500 USDC)
  - USD Value ($3,000)
  - Date
- [ ] Check Edit and Delete buttons appear on each trade

---

### **Test 6: Edit a Trade** ⭐⭐⭐

- [ ] Click "Edit" button on a trade
- [ ] Verify modal opens with pre-filled data
- [ ] Modify some fields:
  - Change Amount In to: `2.0`
  - Change USD Value to: `4000`
- [ ] Click "Save Changes"
- [ ] Verify success toast notification appears
- [ ] Verify modal closes
- [ ] Verify trade updates in the list
- [ ] Check stats updated (if USD value changed)

---

### **Test 7: Delete a Trade** ⭐⭐⭐

- [ ] Click "Delete" button on a trade
- [ ] Verify confirmation dialog appears
- [ ] Read the warning message
- [ ] Click "Cancel" first (should do nothing)
- [ ] Click "Delete" again
- [ ] Click "Delete" in confirmation
- [ ] Verify success toast appears
- [ ] Verify trade disappears from list
- [ ] Check stats updated (trade count decreased)

---

### **Test 8: Form Validation**

#### Test Invalid Token Symbols:
- [ ] Try submitting with lowercase token (e.g., "eth")
  - Should show error: "Token symbols must be uppercase"

#### Test Invalid Amounts:
- [ ] Try submitting negative amount
  - Should show error: "Amount must be greater than 0"
- [ ] Try submitting non-numeric amount (e.g., "abc")
  - Should show error: "Must be a valid number"

#### Test Invalid Transaction Hash:
- [ ] Try submitting short hash (missing characters)
  - Should show error: "Invalid transaction hash format"
- [ ] Try submitting without 0x prefix
  - Should show error: "Invalid transaction hash format"

#### Test Duplicate Transaction Hash:
- [ ] Submit a trade with a transaction hash
- [ ] Try submitting another trade with the SAME tx hash
  - Should show error: "This transaction has already been recorded"

---

### **Test 9: Trader Profile View**

- [ ] Navigate to `/traders` (browse traders)
- [ ] Find your trader profile in the list
- [ ] Click on your profile
- [ ] Verify your profile page loads
- [ ] Scroll to "Recent Trades" section
- [ ] Verify your submitted trades appear
- [ ] Verify transaction hash is clickable
- [ ] Click transaction hash link
  - Should open Codex explorer in new tab
  - URL should be: `https://explorer-mainnet.codexnetwork.org/tx/{txHash}`

---

### **Test 10: Mobile Responsive**

- [ ] Resize browser to mobile size (or use DevTools device mode)
- [ ] Test `/my-trades` on mobile
  - Verify card layout appears (instead of table)
  - Check Edit/Delete buttons are accessible
- [ ] Test Submit Trade form on mobile
  - Verify fields stack vertically
  - Check form is usable
- [ ] Test Edit modal on mobile
  - Verify modal is scrollable
  - Check all fields are accessible

---

## 🎯 Edge Cases to Test

### Authentication:
- [ ] Try accessing `/submit-trade` without wallet connected
  - Should show "Connect Wallet" message
- [ ] Try accessing `/my-trades` without being a trader
  - Should show error message

### Edit Conflicts:
- [ ] Edit a trade and change its tx hash to match another trade's tx hash
  - Should show error: "This transaction hash is already in use"

### Multiple Trades:
- [ ] Submit 5+ trades
- [ ] Verify they all appear in list
- [ ] Verify they're sorted by date (newest first)
- [ ] Check stats calculate correctly

### Empty States:
- [ ] Delete all trades
- [ ] Verify empty state appears
- [ ] Check "Submit Your First Trade" button shows

---

## 🐛 Known Issues to Watch For

### Things That Should Work:
- ✅ Edit/delete your own trades
- ✅ Toast notifications auto-dismiss after 5 seconds
- ✅ Modal closes when clicking X or outside
- ✅ Forms validate in real-time
- ✅ Loading states during operations

### Things That Won't Work (Expected):
- ❌ Can't edit someone else's trades
- ❌ Can't use duplicate transaction hashes
- ❌ Can't submit trades without being a trader
- ❌ Transaction verification (we don't verify tx exists on blockchain yet)

---

## 📊 Expected Results

After successful testing, you should have:

1. **My Trades Page:**
   - List of all your trades
   - Stats showing total trades, volume, unique tokens
   - Edit and Delete buttons on each trade

2. **Trader Profile:**
   - Recent trades visible on your public profile
   - Clickable transaction hashes
   - Trade count updates automatically

3. **Database:**
   - Trades stored in SQLite database
   - Linked to your trader profile
   - Transaction hashes are unique

---

## 🔧 Troubleshooting

### Server won't start:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID> /F

# Try starting again
npm run dev
```

### Wallet connection issues:
- Make sure MetaMask is installed
- Switch to the correct network (Codex - Chain ID 1776)
- Check wallet is unlocked

### Database issues:
```bash
# Reset the database
npm run prisma:push

# Generate Prisma client
npm run prisma:generate
```

### Form not submitting:
- Check browser console for errors (F12)
- Verify all required fields are filled
- Check validation errors below each field

---

## 📸 Screenshots to Take

Document your testing:
1. Home page with wallet connected
2. Submit Trade form filled out
3. My Trades page with multiple trades
4. Edit modal open
5. Delete confirmation dialog
6. Success toast notification
7. Your trader profile with trades

---

## ✅ Success Criteria

All tests passing means:
- ✅ Can submit trades
- ✅ Can view trades
- ✅ Can edit trades
- ✅ Can delete trades
- ✅ Form validation works
- ✅ Toasts appear
- ✅ Navigation works
- ✅ Mobile responsive
- ✅ Trader profile shows trades
- ✅ Transaction links work

---

## 🎉 Once Testing is Complete

If everything works:
1. ✅ Mark all tests as passed
2. 📝 Note any bugs found
3. 🚀 System is ready for production!

If issues found:
1. 🐛 Document the issue
2. 📋 Steps to reproduce
3. 🔧 Expected vs actual behavior
4. 📸 Screenshots if possible

---

## 🚀 Ready? Let's Test!

Start with Test 1 and work your way down. Take your time and check each item!

**Good luck! 🎯**

