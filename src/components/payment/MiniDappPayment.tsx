'use client'

import { useState } from 'react'
import { useThirdWeb } from '@/providers/ThirdWebProvider'
import { useLiff } from '@/hooks/useLiff'
import { Check, X, Loader2, AlertTriangle, ExternalLink, Wallet } from 'lucide-react'

interface MiniDappPaymentProps {
  amount: number
  recipientAddress: string
  productName: string
  productId: string
  onSuccess: (txHash: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function MiniDappPayment({ 
  amount, 
  recipientAddress, 
  productName,
  productId,
  onSuccess, 
  onError, 
  onCancel 
}: MiniDappPaymentProps) {
  const { address, isConnected, sendTransaction, connectWallet } = useThirdWeb()
  const { isInClient, shareTargetPicker } = useLiff()
  const [status, setStatus] = useState<'ready' | 'connecting' | 'paying' | 'success' | 'error'>('ready')
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const processMiniDappPayment = async () => {
    setErrorMessage('')

    // 如果钱包未连接，先连接
    if (!isConnected || !address) {
      setStatus('connecting')
      try {
        await connectWallet()
      } catch (error: any) {
        setStatus('error')
        const message = error.message || '钱包连接失败'
        setErrorMessage(message)
        onError(message)
        return
      }
    }

    setStatus('paying')

    try {
      // 使用ThirdWeb发送交易
      const hash = await sendTransaction(recipientAddress, amount.toString())
      
      setTxHash(hash)
      setStatus('success')
      
      // 在LINE中分享购买成功消息
      if (isInClient && shareTargetPicker) {
        try {
          await shareTargetPicker([{
            type: 'text',
            text: `🎉 我刚在GrowthOS购买了"${productName}"！\n💰 支付了 ${amount} KAIA\n🔗 来看看: https://workwork.works/products/${productId}`
          }])
        } catch (shareError) {
          console.log('分享失败:', shareError)
        }
      }
      
      // 延迟调用成功回调
      setTimeout(() => {
        onSuccess(hash)
      }, 2000)

    } catch (error: any) {
      console.error('MiniDapp支付失败:', error)
      const message = error.message || '支付失败'
      setErrorMessage(message)
      setStatus('error')
      onError(message)
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'ready':
        return {
          icon: <Wallet className="w-8 h-8 text-blue-600" />,
          title: 'Ready to Pay',
          description: 'Secure payment with Kaia MiniDapp',
          bgColor: 'bg-blue-100'
        }
      case 'connecting':
        return {
          icon: <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />,
          title: 'Connecting Wallet',
          description: 'Connecting to Kaia wallet...',
          bgColor: 'bg-yellow-100'
        }
      case 'paying':
        return {
          icon: <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
          title: 'Processing Payment',
          description: 'Please confirm transaction in your wallet...',
          bgColor: 'bg-blue-100'
        }
      case 'success':
        return {
          icon: <Check className="w-8 h-8 text-green-600" />,
          title: 'Payment Successful!',
          description: 'Transaction completed, thank you for your purchase',
          bgColor: 'bg-green-100'
        }
      case 'error':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          title: 'Payment Failed',
          description: errorMessage,
          bgColor: 'bg-red-100'
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* LINE MiniDapp标识 */}
      {isInClient && (
        <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-green-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 text-sm font-medium">LINE MiniDapp支付</span>
        </div>
      )}

      {/* 产品信息 */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Confirmation</h3>
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-600 mb-1">Product</p>
          <p className="font-medium text-gray-900">{productName}</p>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {amount} KAIA
        </div>
      </div>

      {/* 状态显示 */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 ${statusConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
          {statusConfig.icon}
        </div>
        <h4 className="font-medium text-gray-900 mb-1">{statusConfig.title}</h4>
        <p className="text-sm text-gray-600">{statusConfig.description}</p>
      </div>

      {/* 交易信息 */}
      {(status === 'ready' || status === 'connecting') && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Recipient:</span>
            <span className="font-mono text-xs">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Network:</span>
            <span className="text-blue-600">Kaia Mainnet</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Est. Gas Fee:</span>
            <span className="text-gray-900">~0.001 KAIA</span>
          </div>
        </div>
      )}

      {/* 成功时显示交易详情 */}
      {status === 'success' && txHash && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs">{txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
                <button
                  onClick={() => window.open(`https://kaiascan.io/tx/${txHash}`, '_blank')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-medium">Confirmed</span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={status === 'connecting' || status === 'paying'}
          className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'success' ? 'Close' : 'Cancel'}
        </button>
        
        {(status === 'ready' || status === 'error') && (
          <button
            onClick={processMiniDappPayment}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {status === 'error' ? 'Retry Payment' : 'Confirm Payment'}
          </button>
        )}

        {status === 'success' && (
          <button
            onClick={() => onSuccess(txHash)}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Complete Purchase
          </button>
        )}
      </div>

      {/* 安全提示 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-700 flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          Please verify the recipient address and amount. Kaia network transactions are irreversible once confirmed.
        </p>
      </div>
    </div>
  )
}