'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLiff } from '@/hooks/useLiff'

// 简化的ThirdWeb配置，基于原有代码
interface ThirdWebContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  balance: string | null
  connectWallet: () => Promise<void>
  disconnect: () => void
  sendTransaction: (to: string, value: string) => Promise<string>
}

const ThirdWebContext = createContext<ThirdWebContextType | null>(null)

interface ThirdWebProviderProps {
  children: ReactNode
  clientId?: string
}

export function ThirdWebProvider({ children, clientId }: ThirdWebProviderProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  
  const { isInClient } = useLiff()

  // 检查Kaia网络配置
  const kaiaChainConfig = {
    chainId: '0x2019', // 8217
    chainName: 'Kaia Mainnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    },
    rpcUrls: ['https://public-en.node.kaia.io'],
    blockExplorerUrls: ['https://kaiascan.io']
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    
    try {
      if (!window.ethereum) {
        if (isInClient) {
          // 在LINE中，引导用户安装Kaia钱包
          window.open('https://wallet.kaia.io/', '_blank')
          throw new Error('请安装Kaia钱包')
        } else {
          throw new Error('请安装MetaMask或Kaia钱包')
        }
      }

      // 切换到Kaia网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: kaiaChainConfig.chainId }],
        })
      } catch (switchError: unknown) {
        if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [kaiaChainConfig],
          })
        }
      }

      // 连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts && accounts.length > 0) {
        const connectedAddress = accounts[0]
        setAddress(connectedAddress)
        setIsConnected(true)
        
        // 获取余额
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [connectedAddress, 'latest']
        }) as string
        
        const balanceKaia = (parseInt(balanceWei, 16) / 1e18).toFixed(4)
        setBalance(`${balanceKaia} KAIA`)
      }

    } catch (error) {
      console.error('钱包连接失败:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setBalance(null)
  }

  const sendTransaction = async (to: string, value: string): Promise<string> => {
    if (!window.ethereum || !address) {
      throw new Error('钱包未连接')
    }

    const transactionParams = {
      from: address,
      to,
      value: '0x' + (parseFloat(value) * 1e18).toString(16),
      gas: '0x5208', // 21000
    }

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParams]
    }) as string

    return txHash
  }

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[]
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
  }, [address])

  const value: ThirdWebContextType = {
    address,
    isConnected,
    isConnecting,
    balance,
    connectWallet,
    disconnect,
    sendTransaction
  }

  return (
    <ThirdWebContext.Provider value={value}>
      {children}
    </ThirdWebContext.Provider>
  )
}

export function useThirdWeb() {
  const context = useContext(ThirdWebContext)
  if (!context) {
    throw new Error('useThirdWeb must be used within ThirdWebProvider')
  }
  return context
}