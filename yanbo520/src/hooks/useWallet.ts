import { useState, useEffect } from 'react'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  balance: string | null
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    balance: null
  })

  // 检查是否已连接
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        if (accounts.length > 0) {
          setWallet(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
            chainId: parseInt(chainId, 16)
          }))
          
          // 获取余额
          getBalance(accounts[0])
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error)
      }
    }
  }

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    setWallet(prev => ({ ...prev, isConnecting: true }))

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })

      setWallet(prev => ({
        ...prev,
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId: parseInt(chainId, 16)
      }))

      getBalance(accounts[0])
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWallet(prev => ({ ...prev, isConnecting: false }))
    }
  }

  const disconnect = () => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      balance: null
    })
  }

  const getBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4)
      setWallet(prev => ({ ...prev, balance: balanceInEth }))
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  const switchNetwork = async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error: any) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        // 这里可以添加网络配置
        console.log('Network not found, please add it manually')
      }
    }
  }

  return {
    ...wallet,
    connect,
    disconnect,
    switchNetwork,
    getBalance: () => wallet.address && getBalance(wallet.address)
  }
}

// 扩展window对象类型
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}