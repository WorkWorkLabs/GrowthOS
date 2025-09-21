export const SUPPORTED_NETWORKS = {
  kaia: {
    id: 8217,
    name: 'Kaia',
    rpcUrl: 'https://public-en.node.kaia.io',
    blockExplorer: 'https://kaiascan.io',
    nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 }
  },
  kairos: {
    id: 1001,
    name: 'Kaia Testnet', 
    rpcUrl: 'https://public-en-kairos.node.kaia.io',
    blockExplorer: 'https://kairos.kaiascan.io',
    nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 }
  },
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  }
} as const

export const SUPPORTED_TOKENS = {
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    addresses: {
      kaia: '0xd077a400968890eacc75cdc901f0356c943e4fdb', // 官方确认的Kaia USDT地址
      kairos: '0x...', // 测试网USDT地址 - 需要查询或部署
      base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    addresses: {
      kaia: '', // USDC可能还未在Kaia部署，留空
      kairos: '', // 测试网USDC地址 - 需要查询或部署
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    }
  },
  KAIA: {
    symbol: 'KAIA',
    decimals: 18,
    addresses: {
      kaia: 'native',
      kairos: 'native',
      base: '0x...', // 如果Kaia在其他链上有包装代币
      polygon: '0x...'
    }
  },
  ETH: {
    symbol: 'ETH',
    decimals: 18,
    addresses: {
      kaia: '0x...', // 包装ETH地址（如果有）
      kairos: '0x...',
      base: 'native',
      polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    }
  }
} as const

export const CONTRACT_ADDRESSES = {
  ESCROW: {
    kaia: '0x...', // 你的Kaia托管合约地址
    kairos: '0x...', // 测试网托管合约地址
    base: '0x...',
    polygon: '0x...'
  },
  MARKETPLACE: {
    kaia: '0x...', // 你的Kaia市场合约地址
    kairos: '0x...', // 测试网市场合约地址
    base: '0x...',
    polygon: '0x...'
  }
} as const

// 网络类型定义
export type NetworkKey = keyof typeof SUPPORTED_NETWORKS
export type TokenKey = keyof typeof SUPPORTED_TOKENS

// 默认网络（开发时用测试网，生产用主网）
export const DEFAULT_NETWORK: NetworkKey = process.env.NODE_ENV === 'development' ? 'kairos' : 'kaia'

export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'
export const PINATA_API_URL = 'https://api.pinata.cloud'