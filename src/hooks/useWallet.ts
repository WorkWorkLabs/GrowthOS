import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage, useBalance } from 'wagmi'
import { useAuth } from '@/providers/AuthProvider'
import { SUPPORTED_NETWORKS, NetworkKey } from '@/lib/web3-config'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  isBinding: boolean
  chainId: number | null
  balance: string | null
  networkKey: NetworkKey | null
}

interface SignatureResult {
  signature: string
  message: string
  address: string
}

export function useWallet() {
  const { connectWallet: bindWalletToAccount, user } = useAuth()
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    isBinding: false,
    chainId: null,
    balance: null,
    networkKey: null
  })

  // 获取余额
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  })

  // 监听账户变化
  useEffect(() => {
    const networkKey = findNetworkByChainId(chainId)
    setWallet(prev => ({
      ...prev,
      address: address || null,
      isConnected,
      isConnecting: isPending,
      chainId: chainId || null,
      balance: balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : null,
      networkKey
    }))
  }, [address, isConnected, isPending, chainId, balanceData])

  // 根据chainId查找网络配置
  const findNetworkByChainId = (chainId?: number): NetworkKey | null => {
    if (!chainId) return null
    const networkEntry = Object.entries(SUPPORTED_NETWORKS).find(
      ([, config]) => config.id === chainId
    )
    return networkEntry ? (networkEntry[0] as NetworkKey) : null
  }

  // 连接钱包
  const connectWallet = async () => {
    if (!connectors.length) {
      throw new Error('No wallet connectors available')
    }

    setWallet(prev => ({ ...prev, isConnecting: true }))

    try {
      // 优先使用MetaMask，如果没有则使用第一个可用的连接器
      const preferredConnector = connectors.find(c => c.name.includes('MetaMask')) || connectors[0]
      
      const result = await connect({ connector: preferredConnector })
      
      // 等待钱包状态更新
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 返回连接结果中的地址，而不是当前的address状态
      return result.accounts[0]
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWallet(prev => ({ ...prev, isConnecting: false }))
      throw error
    }
  }

  // 断开连接
  const disconnectWallet = () => {
    disconnect()
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      isBinding: false,
      chainId: null,
      balance: null,
      networkKey: null
    })
  }

  // 签名消息
  const signMessage = async (message: string): Promise<string> => {
    try {
      const signature = await signMessageAsync({ message })
      return signature
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw new Error('User cancelled signature or signing failed')
    }
  }

  // 连接并绑定钱包到账户
  const connectAndBind = async (): Promise<SignatureResult> => {
    if (!user) {
      throw new Error('Please login first')
    }

    // 防止重复调用
    if (wallet.isBinding || wallet.isConnecting) {
      throw new Error('Connection already in progress')
    }

    setWallet(prev => ({ ...prev, isBinding: true }))

    try {
      // Step 1: Connect wallet if not connected
      let walletAddress = address
      if (!isConnected) {
        walletAddress = await connectWallet()
      }

      if (!walletAddress) {
        throw new Error('Wallet connection failed')
      }

      // Step 2: Create verification message
      const timestamp = Date.now()
      const message = `GrowthOS Wallet Verification

Address: ${walletAddress}
User ID: ${user.id}
Network: ${wallet.networkKey || 'Unknown'}
Time: ${new Date(timestamp).toISOString()}

Please sign to verify wallet ownership`

      // Step 3: Sign message
      const signature = await signMessage(message)

      // Step 4: Verify and bind to account (with retry for new users)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒让数据库触发器完成
      await bindWalletToAccount(walletAddress)

      console.log('Wallet binding successful:', { address: walletAddress, signature })
      return { address: walletAddress, signature, message }

    } catch (error) {
      console.error('Wallet binding failed:', error)
      throw error
    } finally {
      setWallet(prev => ({ ...prev, isBinding: false }))
    }
  }

  // 切换网络
  const switchNetwork = async (networkKey: NetworkKey) => {
    const network = SUPPORTED_NETWORKS[networkKey]
    if (!network) {
      throw new Error(`Unsupported network: ${networkKey}`)
    }

    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${network.id.toString(16)}` }],
        })
      }
    } catch (error: unknown) {
      // 如果网络不存在，尝试添加
      if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
        await addNetwork(networkKey)
      } else {
        throw error
      }
    }
  }

  // 添加网络
  const addNetwork = async (networkKey: NetworkKey) => {
    const network = SUPPORTED_NETWORKS[networkKey]
    if (!network || !window.ethereum) {
      throw new Error('Cannot add network')
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${network.id.toString(16)}`,
        chainName: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.blockExplorer]
      }]
    })
  }

  return {
    ...wallet,
    connect: connectWallet,
    disconnect: disconnectWallet,
    connectAndBind,
    signMessage,
    switchNetwork,
    addNetwork,
    getCurrentNetwork: () => wallet.networkKey ? SUPPORTED_NETWORKS[wallet.networkKey] : null
  }
}

// 扩展window对象类型
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}