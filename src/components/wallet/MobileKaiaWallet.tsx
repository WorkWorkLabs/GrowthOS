'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useLiff } from '@/hooks/useLiff'

interface MobileKaiaWalletProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

export function MobileKaiaWallet({ onConnect, onError }: MobileKaiaWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  
  const { user } = useAuth()
  const { isInClient, isLiffReady } = useLiff()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
  }, [])

  // 检测移动端钱包
  const detectMobileWallet = () => {
    if (typeof window === 'undefined') return null
    
    // Kaia Wallet
    if (window.ethereum?.isKaikas) return 'kaikas'
    
    // MetaMask on mobile
    if (window.ethereum?.isMetaMask && isMobile) return 'metamask-mobile'
    
    // 通用 Ethereum provider
    if (window.ethereum) return 'ethereum'
    
    return null
  }

  const connectKaiaWallet = async () => {
    if (!user) {
      const errorMsg = '请先登录'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const walletType = detectMobileWallet()
      
      if (!walletType) {
        // 移动端没有钱包，引导安装
        if (isMobile) {
          const kaiaWalletUrl = 'https://wallet.kaia.io/download'
          window.open(kaiaWalletUrl, '_blank')
          throw new Error('请安装Kaia钱包应用')
        } else {
          throw new Error('未检测到钱包，请安装MetaMask或Kaia钱包')
        }
      }

      // 切换到Kaia网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2019' }], // Kaia Mainnet
        })
      } catch (switchError: any) {
        // 如果网络不存在，添加Kaia网络
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2019',
              chainName: 'Kaia Mainnet',
              nativeCurrency: {
                name: 'KAIA',
                symbol: 'KAIA',
                decimals: 18
              },
              rpcUrls: ['https://public-en.node.kaia.io'],
              blockExplorerUrls: ['https://kaiascan.io']
            }]
          })
        } else {
          throw switchError
        }
      }

      // 连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('钱包连接被拒绝')
      }

      const connectedAddress = accounts[0]
      setAddress(connectedAddress)

      // 获取余额
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [connectedAddress, 'latest']
      })
      
      const balanceKaia = (parseInt(balanceWei, 16) / 1e18).toFixed(4)
      setBalance(`${balanceKaia} KAIA`)

      onConnect?.(connectedAddress)

    } catch (err: any) {
      const errorMsg = err.message || '钱包连接失败'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Kaia wallet connection failed:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance(null)
    setError('')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 移动端优化的界面
  return (
    <div className="w-full">
      {/* 错误提示 */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* LINE环境提示 */}
      {isInClient && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            在LINE中运行，支持Kaia网络
          </p>
        </div>
      )}

      {address ? (
        // 已连接状态
        <div className="space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">钱包地址</span>
                <span className="font-mono text-sm">{formatAddress(address)}</span>
              </div>
              {balance && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">余额</span>
                  <span className="font-mono text-sm text-green-600">{balance}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">网络</span>
                <span className="text-sm text-blue-600">Kaia Mainnet</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={disconnect}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            断开连接
          </button>
        </div>
      ) : (
        // 未连接状态
        <div className="space-y-3">
          <button
            onClick={connectKaiaWallet}
            disabled={isConnecting || !user}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isConnecting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : !user
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-primary hover:bg-blue-600 text-white'
            }`}
          >
            {isConnecting ? '连接中...' : !user ? '请先登录' : '连接Kaia钱包'}
          </button>

          {!user && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600 text-sm">
                💡 请先登录账号，然后连接Kaia钱包
              </p>
            </div>
          )}

          {isMobile && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                📱 移动端建议使用Kaia官方钱包应用
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}