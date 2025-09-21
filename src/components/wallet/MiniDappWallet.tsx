'use client'

import { useState } from 'react'
import { useThirdWeb } from '@/providers/ThirdWebProvider'
import { useLiff } from '@/hooks/useLiff'
import { useAuth } from '@/providers/AuthProvider'
import { Wallet, ExternalLink, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

interface MiniDappWalletProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
  showBalance?: boolean
  className?: string
}

export function MiniDappWallet({ 
  onConnect, 
  onError, 
  showBalance = true,
  className = '' 
}: MiniDappWalletProps) {
  const { address, isConnected, isConnecting, balance, connectWallet, disconnect } = useThirdWeb()
  const { isInClient, isLiffReady } = useLiff()
  const { user } = useAuth()
  const [error, setError] = useState<string>('')

  const handleConnect = async () => {
    if (!user) {
      const errorMsg = '请先登录账号'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    setError('')
    
    try {
      await connectWallet()
      if (address) {
        onConnect?.(address)
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '钱包连接失败'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* LINE环境提示 */}
      {isInClient && isLiffReady && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 text-sm font-medium">LINE MiniDapp环境</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {isConnected && address ? (
        // 已连接状态
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">Kaia钱包已连接</span>
              </div>
              <button
                onClick={disconnect}
                className="text-sm text-red-600 hover:text-red-700"
              >
                断开
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">钱包地址</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(address)}</span>
                  <button
                    onClick={() => window.open(`https://kaiascan.io/account/${address}`, '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {showBalance && balance && (
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

          {/* MiniDapp功能提示 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              🎉 现在可以使用KAIA进行支付和Web3功能！
            </p>
          </div>
        </div>
      ) : (
        // 未连接状态
        <div className="space-y-3">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">连接Kaia钱包</h3>
            <p className="text-sm text-gray-600 mb-4">
              使用Kaia网络进行Web3交易和支付
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting || !user}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isConnecting 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : !user
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                连接中...
              </>
            ) : !user ? (
              '请先登录'
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                连接Kaia钱包
              </>
            )}
          </button>

          {/* 提示信息 */}
          {!user && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                💡 请先登录账号，然后连接Kaia钱包进行身份验证
              </p>
            </div>
          )}

          {user && !isInClient && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                📱 在LINE中使用可获得更好的MiniDapp体验
              </p>
            </div>
          )}

          {user && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600 text-sm">
                🔐 连接后系统会要求签名验证钱包所有权，无需gas费用
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}