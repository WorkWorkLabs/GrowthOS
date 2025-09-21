import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { base, polygon } from 'wagmi/chains'
import { SUPPORTED_NETWORKS } from './web3-config'

// 自定义Kaia链配置
export const kaia = {
  id: 8217,
  name: 'Kaia',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://public-en.node.kaia.io'] },
    public: { http: ['https://public-en.node.kaia.io'] }
  },
  blockExplorers: {
    default: { name: 'Kaiascan', url: 'https://kaiascan.io' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1
    }
  }
} as const

export const kairos = {
  id: 1001,
  name: 'Kaia Testnet',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://public-en-kairos.node.kaia.io'] },
    public: { http: ['https://public-en-kairos.node.kaia.io'] }
  },
  blockExplorers: {
    default: { name: 'Kaiascan', url: 'https://kairos.kaiascan.io' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1
    }
  },
  testnet: true
} as const

// Wagmi配置
export const wagmiConfig = getDefaultConfig({
  appName: 'GrowthOS',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [kaia, kairos, base, polygon],
  transports: {
    [kaia.id]: http(),
    [kairos.id]: http(),
    [base.id]: http(),
    [polygon.id]: http()
  },
  ssr: true
})

// 导出链配置，用于其他地方
export const supportedChains = [kaia, kairos, base, polygon]