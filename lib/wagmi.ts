import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

// Define Codex blockchain
export const codex = defineChain({
  id: 1776,
  name: 'Codex',
  nativeCurrency: {
    decimals: 18,
    name: 'DEX',
    symbol: 'DEX',
  },
  rpcUrls: {
    default: {
      http: ['http://node-mainnet.thecodex.net/'],
    },
    public: {
      http: ['http://node-mainnet.thecodex.net/'],
    },
  },
  blockExplorers: {
    default: { name: 'Codex Explorer', url: 'https://explorer.thecodex.net' },
  },
})

// Create wagmi config
export const config = createConfig({
  chains: [codex],
  transports: {
    [codex.id]: http(),
  },
})

