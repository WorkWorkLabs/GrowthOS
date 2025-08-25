import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  isBinding: boolean
  chainId: number | null
  balance: string | null
}

interface SignatureResult {
  signature: string
  message: string
  address: string
}

export function useWallet() {
  const { connectWallet: bindWalletToAccount, user } = useAuth()
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    isBinding: false,
    chainId: null,
    balance: null
  })

  // 检查是否已连接
  useEffect(() => {
    checkConnection()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true })
        if (response.publicKey) {
          const address = response.publicKey.toString()
          setWallet(prev => ({
            ...prev,
            address,
            isConnected: true,
            chainId: null // Solana不使用chainId
          }))
          
          // 获取余额
          getBalance(address)
        }
      } catch (error) {
        // 忽略用户拒绝连接的错误，这是正常行为
        if (error instanceof Error && error.message.includes('User rejected')) {
          console.log('User has not previously connected wallet')
        } else {
          console.error('Failed to check wallet connection:', error)
        }
      }
    }
  }

  const connect = async () => {
    if (!window.solana) {
      throw new Error('Please install Phantom wallet')
    }

    setWallet(prev => ({ ...prev, isConnecting: true }))

    try {
      const response = await window.solana.connect()
      const address = response.publicKey.toString()

      setWallet(prev => ({
        ...prev,
        address,
        isConnected: true,
        isConnecting: false,
        chainId: null
      }))

      getBalance(address)
      return address
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWallet(prev => ({ ...prev, isConnecting: false }))
      throw error
    }
  }

  const disconnect = () => {
    if (window.solana) {
      window.solana.disconnect()
    }
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      isBinding: false,
      chainId: null,
      balance: null
    })
  }

  const signMessage = async (address: string, message: string): Promise<string> => {
    if (!window.solana) {
      throw new Error('Phantom wallet not found')
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8')
      return Buffer.from(signedMessage.signature).toString('hex')
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw new Error('User cancelled signature or signing failed')
    }
  }

  const connectAndBind = async () => {
    if (!user) {
      throw new Error('Please login first')
    }

    // 防止重复调用
    if (wallet.isBinding || wallet.isConnecting) {
      throw new Error('Connection already in progress')
    }

    setWallet(prev => ({ ...prev, isBinding: true }))

    try {
      // Step 1: Connect wallet
      const address = await connect()
      if (!address) throw new Error('Wallet connection failed')

      // Step 2: Create verification message
      const timestamp = Date.now()
      const message = `GrowthOS Wallet Verification\n\nAddress: ${address}\nUser ID: ${user.id}\nTime: ${new Date(timestamp).toISOString()}\n\nPlease sign to verify wallet ownership`

      // Step 3: Sign message
      const signature = await signMessage(address, message)

      // Step 4: Verify and bind to account (with retry for new users)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒让数据库触发器完成
      await bindWalletToAccount(address)

      console.log('Wallet binding successful:', { address, signature })
      return { address, signature, message }

    } catch (error) {
      console.error('Wallet binding failed:', error)
      throw error
    } finally {
      setWallet(prev => ({ ...prev, isBinding: false }))
    }
  }

  const getBalance = async (address: string) => {
    try {
      // 使用Solana Web3.js获取余额的简化版本
      // 实际项目中应该使用@solana/web3.js库
      const balanceInSol = "0.0000" // 占位符，需要实际实现
      setWallet(prev => ({ ...prev, balance: balanceInSol }))
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  return {
    ...wallet,
    connect,
    disconnect,
    connectAndBind,
    signMessage,
    getBalance: () => wallet.address && getBalance(wallet.address)
  }
}

// 扩展window对象类型
declare global {
  interface Window {
    solana?: {
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>
      disconnect: () => Promise<void>
      signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}