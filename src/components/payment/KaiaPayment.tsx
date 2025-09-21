'use client'

import { useState } from 'react'
import { Check, Loader2, AlertTriangle } from 'lucide-react'

interface KaiaPaymentProps {
  amount: number
  recipientAddress: string
  productName: string
  onSuccess: (txHash: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function KaiaPayment({ 
  amount, 
  recipientAddress, 
  productName, 
  onSuccess, 
  onError, 
  onCancel 
}: KaiaPaymentProps) {
  const [status, setStatus] = useState<'ready' | 'connecting' | 'confirming' | 'success' | 'error'>('ready')
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const processKaiaPayment = async () => {
    setStatus('connecting')
    setErrorMessage('')

    try {
      // 检查钱包连接
      if (!window.ethereum) {
        throw new Error('请安装Kaia钱包或MetaMask')
      }

      // 切换到Kaia网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2019' }], // Kaia Mainnet
        })
      } catch (switchError: unknown) {
        if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2019',
              chainName: 'Kaia Mainnet',
              nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
              rpcUrls: ['https://public-en.node.kaia.io'],
              blockExplorerUrls: ['https://kaiascan.io']
            }]
          })
        }
      }

      // 获取账户
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('请连接钱包')
      }

      const fromAddress = accounts[0]
      setStatus('confirming')

      // 构建交易参数
      const transactionParams = {
        from: fromAddress,
        to: recipientAddress,
        value: '0x' + (amount * 1e18).toString(16), // 转换为wei
        gas: '0x5208', // 21000 gas for simple transfer
        gasPrice: await window.ethereum.request({
          method: 'eth_gasPrice'
        })
      }

      // 发送交易
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParams]
      })

      setTxHash(hash)
      setStatus('success')
      
      // 等待交易确认（可选）
      setTimeout(() => {
        onSuccess(hash)
      }, 2000)

    } catch (error: unknown) {
      console.error('Kaia payment failed:', error)
      const message = error instanceof Error ? error.message : '支付失败'
      setErrorMessage(message)
      setStatus('error')
      onError(message)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kaia支付</h3>
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {amount} KAIA
        </div>
        <p className="text-sm text-gray-600">购买: {productName}</p>
      </div>

      {/* 状态显示 */}
      <div className="mb-6">
        {status === 'ready' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-600">准备发起Kaia网络支付</p>
          </div>
        )}

        {status === 'connecting' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
            </div>
            <p className="text-gray-600">连接Kaia钱包...</p>
          </div>
        )}

        {status === 'confirming' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600">等待交易确认...</p>
            <p className="text-xs text-gray-500 mt-1">请在钱包中确认支付</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">支付成功!</p>
            {txHash && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">交易哈希:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {txHash}
                </p>
                <a 
                  href={`https://kaiascan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  在Kaiascan查看 →
                </a>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-medium">支付失败</p>
            <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* 交易信息 */}
      {status === 'ready' && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">收款地址:</span>
            <span className="font-mono text-xs">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">网络:</span>
            <span className="text-blue-600">Kaia Mainnet</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">预估手续费:</span>
            <span className="text-gray-900">~0.001 KAIA</span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={status === 'connecting' || status === 'confirming'}
          className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          取消
        </button>
        
        {status === 'ready' && (
          <button
            onClick={processKaiaPayment}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即支付
          </button>
        )}

        {status === 'error' && (
          <button
            onClick={processKaiaPayment}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试支付
          </button>
        )}

        {status === 'success' && (
          <button
            onClick={() => onSuccess(txHash)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            完成
          </button>
        )}
      </div>

      {/* 安全提示 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-700">
          🔒 请确认收款地址正确，Kaia网络交易不可撤销
        </p>
      </div>
    </div>
  )
}