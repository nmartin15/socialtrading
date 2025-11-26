# Questions for Codex Blockchain & MetaMask Support

This document contains critical questions to ask blockchain and wallet providers to optimize the DexMirror copy trading platform.

---

## 🔗 CODEX BLOCKCHAIN SUPPORT QUESTIONS

### **1. Block Explorer API Access**

**Priority:** 🔴 CRITICAL

**Questions:**
- Does Codex Explorer (`https://explorer.thecodex.net`) provide a public API?
- If yes, what is the API endpoint URL and documentation link?
- Is it similar to Etherscan API? (e.g., `?module=account&action=txlist`)
- What are the rate limits for the API? (requests per second/day)
- Do you offer API keys for higher rate limits?
- Cost structure for API usage?

**Why we need this:**
- To efficiently scan trader wallets for transactions
- To avoid overloading your RPC nodes with excessive queries
- To get pre-indexed and formatted transaction data
- To enable real-time trade detection

**Current workaround:** Direct RPC queries (slower, more resource-intensive)

---

### **2. RPC Node Performance & Limits**

**Priority:** 🔴 CRITICAL

**Questions:**
- What are the rate limits for the public RPC endpoint (`http://node-mainnet.thecodex.net/`)?
- Requests per second/minute allowed?
- Are there IP-based throttling limits?
- Do you offer dedicated/premium RPC endpoints for production apps?
- What methods are supported? (eth_getLogs, eth_getBlock, eth_getTransaction, etc.)
- Are WebSocket connections supported for real-time event listening?
- What's the average block time on Codex? (for calculating scan windows)

**Why we need this:**
- To scan multiple trader wallets simultaneously
- To provide real-time trade detection
- To avoid hitting rate limits and getting blocked
- To plan infrastructure for production scale

**Current workaround:** Limited scanning with delays between requests

---

### **3. DEX Ecosystem on Codex**

**Priority:** 🟡 HIGH

**Questions:**
- What are the most popular DEXes deployed on Codex?
- Contract addresses for major DEXes? (Uniswap clones, etc.)
- Are they Uniswap V2/V3 compatible? (standard event signatures?)
- List of verified token contracts and their addresses?
- Is there a token registry or list API?
- Are there wrapped DEX (WDEX) contracts? Address?
- Any Codex-specific trading protocols we should integrate?

**Why we need this:**
- To accurately detect and categorize trades
- To filter out non-trading transactions
- To decode swap events properly
- To display correct token information
- To calculate trade values in USD

**Current workaround:** Generic transaction detection without DEX-specific parsing

---

### **4. Event Log Indexing**

**Priority:** 🟡 HIGH

**Questions:**
- How far back can we query historical logs with `eth_getLogs`?
- Is there a block range limit per query?
- Are there optimized endpoints for querying logs by address?
- Can we query logs by topic (event signature) efficiently?
- Any caching recommendations for repeated queries?

**Why we need this:**
- To import traders' historical transactions
- To build complete track records from past trades
- To enable "bulk import" feature

**Current workaround:** Limited to recent blocks (last 100-1000 blocks)

---

### **5. Transaction Data & Gas Prices**

**Priority:** 🟢 MEDIUM

**Questions:**
- What's the native gas token? (confirmed: DEX)
- Average gas price on the network?
- Is there a gas price oracle or recommendation API?
- How are failed transactions handled? (still recorded in blocks?)
- Do failed transactions have receipt data accessible?

**Why we need this:**
- To display accurate transaction costs to users
- To filter out failed trades
- To provide gas optimization recommendations

---

### **6. Codex-Specific Features**

**Priority:** 🟢 MEDIUM

**Questions:**
- Any Codex-specific opcodes or features we should know?
- Are there cross-chain bridge contracts we should track?
- Native staking or liquidity protocols on Codex?
- Any unique transaction types beyond standard EVM?
- Developer grants or partnership programs available?

**Why we need this:**
- To leverage unique Codex features
- To provide comprehensive trading coverage
- To explore partnership opportunities

---

### **7. Developer Resources**

**Priority:** 🟢 MEDIUM

**Questions:**
- Link to full developer documentation?
- Discord/Telegram for developer support?
- Any SDKs or libraries specifically for Codex?
- Are there testnets available? Testnet RPC URLs?
- Faucet for testnet tokens?
- GitHub with example projects or integrations?

**Why we need this:**
- To test features before mainnet deployment
- To get quick support during development
- To follow best practices for Codex development

---

### **8. Production Infrastructure Recommendations**

**Priority:** 🟡 HIGH

**Questions:**
- Recommended infrastructure for production apps?
- Should we run our own Codex node?
- Recommended node specifications (CPU, RAM, disk)?
- Sync time for a new node from genesis?
- Archive node vs full node - which do we need for historical queries?
- Any managed node services available? (like Infura/Alchemy)

**Why we need this:**
- To plan production infrastructure
- To ensure reliability and uptime
- To handle scale as platform grows

---

## 🦊 METAMASK SUPPORT QUESTIONS

### **9. Codex Network in MetaMask**

**Priority:** 🔴 CRITICAL

**Questions:**
- Is Codex network natively supported in MetaMask?
- If not, what's the correct chain config for users to add manually?
- Can we use `wallet_addEthereumChain` to add Codex automatically?
- What icon/logo URL should be used for Codex in MetaMask?
- Any known issues with Codex + MetaMask integration?

**Why we need this:**
- To provide seamless onboarding for users
- To reduce friction in wallet setup
- To avoid user confusion about network configuration

**Current setup:**
```javascript
{
  chainId: '0x6F0', // 1776 in hex
  chainName: 'Codex',
  nativeCurrency: {
    name: 'DEX',
    symbol: 'DEX',
    decimals: 18
  },
  rpcUrls: ['http://node-mainnet.thecodex.net/'],
  blockExplorerUrls: ['https://explorer.thecodex.net']
}
```

---

### **10. Transaction History Access**

**Priority:** 🟡 HIGH

**Questions:**
- Can we access full transaction history via MetaMask API?
- Is there an official method to get past transactions programmatically?
- Does MetaMask cache transaction history locally?
- Can we request transaction list via `window.ethereum` provider?
- Any privacy considerations when requesting tx history?

**Why we need this:**
- To enable "Import from MetaMask" feature
- To reduce blockchain queries
- To provide better UX for trade importing

**Current workaround:** Direct blockchain queries instead of using MetaMask cache

---

### **11. Permission & Connection Management**

**Priority:** 🟢 MEDIUM

**Questions:**
- Best practices for requesting wallet connection?
- How to request "read-only" access without signing permissions?
- Can we detect when user switches accounts?
- Can we detect when user switches networks?
- How to handle connection persistence across sessions?

**Why we need this:**
- To handle multi-account users
- To provide clear permission boundaries
- To improve security and trust

---

### **12. Signature & Verification**

**Priority:** 🟡 HIGH

**Questions:**
- Best practice for wallet signature verification?
- Should we use EIP-712 structured data signing?
- How to verify signed messages on backend?
- Can signatures be used for authentication (instead of traditional login)?
- Rate limits or user experience concerns with frequent sign requests?

**Why we need this:**
- To verify trader identity without passwords
- To enable secure API authentication
- To prove ownership of wallet address

---

### **13. Custom RPC Integration**

**Priority:** 🟢 MEDIUM

**Questions:**
- Any special considerations for custom RPC endpoints?
- How does MetaMask handle RPC failover/fallbacks?
- Can we suggest multiple RPC URLs for redundancy?
- Does MetaMask support WebSocket RPCs?

**Why we need this:**
- To ensure reliability even if primary RPC is down
- To provide users with RPC options

---

### **14. Mobile Support**

**Priority:** 🟢 MEDIUM

**Questions:**
- Does MetaMask mobile browser support Codex network?
- Any differences in API between mobile and desktop?
- WalletConnect integration recommendations?
- Testing resources for mobile MetaMask?

**Why we need this:**
- To ensure mobile compatibility
- To support traders on mobile devices

---

## 📋 SUMMARY OF CRITICAL BOTTLENECKS

### **Immediate Blockers:**

1. **Block Explorer API** - Would dramatically improve scan performance
   - Without it: Slow, resource-intensive RPC queries
   - With it: Fast, efficient, indexed data access

2. **RPC Rate Limits** - Need to know limits to avoid blocks
   - Without clarity: Risk of service interruption
   - With clarity: Can plan infrastructure and caching strategy

3. **DEX Contract Addresses** - Essential for accurate trade detection
   - Without it: Generic transaction detection (less accurate)
   - With it: Precise swap event parsing and categorization

### **Nice-to-Haves:**

4. **Historical Log Query Limits** - For bulk import feature
5. **WebSocket Support** - For real-time trade detection
6. **MetaMask Transaction History API** - For improved UX

---

## 📧 CONTACT TEMPLATES

### **For Codex Support:**

```
Subject: Production Integration Questions - DexMirror Social Trading Platform

Hi Codex Team,

We're building DexMirror, a copy trading platform on Codex blockchain, and have some 
technical questions to optimize our integration:

1. Block Explorer API: Is there a public API for explorer.thecodex.net?
2. RPC Rate Limits: What are the limits for the public RPC endpoint?
3. DEX Contracts: What are the addresses of major DEXes on Codex?

[Include more questions as needed from above]

Would love to schedule a call to discuss partnership opportunities as well.

Thanks!
[Your details]
```

### **For MetaMask Support:**

```
Subject: Custom Chain Integration - Codex Network Support

Hi MetaMask Team,

We're integrating Codex blockchain (Chain ID: 1776) with MetaMask for our trading 
platform. Questions:

1. Is Codex natively supported or should we use wallet_addEthereumChain?
2. What's the recommended way to access user transaction history?
3. Any known issues with custom chains in MetaMask?

Appreciate your guidance!

[Your details]
```

---

## 🎯 PRIORITY ACTION PLAN

### **Week 1:**
- [ ] Contact Codex support about Block Explorer API
- [ ] Request RPC rate limits documentation
- [ ] Get list of DEX contracts and token registry

### **Week 2:**
- [ ] Test with provided infrastructure recommendations
- [ ] Implement proper rate limiting based on responses
- [ ] Set up monitoring for RPC health

### **Week 3:**
- [ ] Optimize based on received information
- [ ] Implement WebSocket if available
- [ ] Set up production-grade infrastructure

---

**Last Updated:** [Date]  
**Document Owner:** DexMirror Development Team  
**Status:** Awaiting responses from Codex & MetaMask support

