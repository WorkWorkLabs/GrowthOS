'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback } from 'react'
import { Project } from '@/types'
import { useAuth } from '@/providers/AuthProvider'
import { OrdersService } from '@/lib/orders'
import { StreamFlowUtils } from '@/lib/streamflow'
import { 
  ShoppingCart, 
  MessageCircle, 
  CreditCard, 
  Building, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Calendar,
  Repeat
} from 'lucide-react'

interface PurchaseConfirmModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  mounted: boolean
}

type PaymentMethod = 'solana' | 'wechat' | 'alipay' | 'card'
type PurchaseStep = 'select-method' | 'confirm-details' | 'processing' | 'success' | 'error'

export function PurchaseConfirmModal({ project, isOpen, onClose, mounted }: PurchaseConfirmModalProps) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState<PurchaseStep>('select-method')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentConditions, setPaymentConditions] = useState<{
    canPay: boolean
    hasWallet: boolean
    hasPaymentMethod: boolean
    missingRequirements: string[]
  } | null>(null)

  // 检查支付条件
  useEffect(() => {
    if (isOpen && user) {
      checkPaymentConditions()
    }
  }, [isOpen, user, checkPaymentConditions])

  const checkPaymentConditions = useCallback(async () => {
    if (!user) return
    
    try {
      const conditions = await StreamFlowUtils.validatePaymentConditions(user.id)
      setPaymentConditions(conditions)
      
      if (!conditions.canPay) {
        setError(`Payment requirements not met. Please bind: ${conditions.missingRequirements.join(' or ')}`)
      }
    } catch (error) {
      console.error('Failed to check payment conditions:', error)
      setError('Failed to check payment conditions')
    }
  }, [user])

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setError(null)
    
    // 验证选择的支付方式是否可用
    if (method === 'solana' && !paymentConditions?.hasWallet) {
      setError('Please bind a Solana wallet to use crypto payment')
      return
    }
    
    if (['wechat', 'alipay', 'card'].includes(method) && !paymentConditions?.hasPaymentMethod) {
      setError('Please bind WeChat, Alipay or credit card to use traditional payment')
      return
    }
    
    setStep('confirm-details')
  }

  const handleConfirmPurchase = async () => {
    if (!user || !selectedMethod) return
    
    setLoading(true)
    setError(null)
    setStep('processing')
    
    try {
      // 创建订单
      const order = await OrdersService.createOrder({
        productId: project.id,
        buyerId: user.id,
        buyerWalletAddress: selectedMethod === 'solana' ? profile?.walletAddress : undefined
      })
      
      setOrderId(order.id)
      
      // 处理支付
      const processedOrder = await OrdersService.processPayment(order.id)
      
      if (processedOrder.status === 'active') {
        setStep('success')
      } else {
        throw new Error('Payment processing failed')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      setError(error instanceof Error ? error.message : 'Purchase failed')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    if (!orderId || !user) return
    
    setLoading(true)
    setError(null)
    setStep('processing')
    
    try {
      const processedOrder = await OrdersService.retryOrder(orderId, user.id)
      
      if (processedOrder.status === 'active') {
        setStep('success')
      } else {
        throw new Error('Payment retry failed')
      }
    } catch (error) {
      console.error('Retry error:', error)
      setError(error instanceof Error ? error.message : 'Retry failed')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep('select-method')
    setSelectedMethod(null)
    setError(null)
    setOrderId(null)
    setLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen || !mounted) return null

  const isSubscription = project.product_type === 'subscription'
  const totalAmount = isSubscription 
    ? (project.subscription_price_per_period || project.price) * (project.subscription_duration || 1)
    : project.price

  const modalContent = (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto m-4 animate-slideUpAndScale" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            {step === 'select-method' && 'Choose Payment Method'}
            {step === 'confirm-details' && 'Confirm Purchase'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Purchase Successful'}
            {step === 'error' && 'Payment Failed'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Product Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4">
              <div 
                className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage: `url(${project.image || project.image_url || '/default-project.jpg'})`
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-2">by {project.author}</p>
                
                {/* Product Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                  {isSubscription ? (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      <Repeat className="w-3 h-3 mr-1" />
                      Subscription
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      One-time Purchase
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="text-lg font-bold text-primary">
                  {isSubscription ? (
                    <div>
                      <div>${project.subscription_price_per_period || project.price}/{project.subscription_period}</div>
                      <div className="text-sm font-normal text-gray-600">
                        Total: ${totalAmount} for {project.subscription_duration} months
                      </div>
                    </div>
                  ) : (
                    <div>${project.price}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Requirements Check */}
          {paymentConditions && !paymentConditions.canPay && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Payment Requirements Not Met</p>
                  <p className="text-red-700 text-sm mt-1">
                    Please bind at least one payment method: {paymentConditions.missingRequirements.join(' or ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          {step === 'select-method' && paymentConditions?.canPay && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h4>
              <div className="grid grid-cols-1 gap-3">
                {/* Solana Payment */}
                {paymentConditions?.hasWallet && (
                  <button 
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center gap-3 text-left"
                    onClick={() => handleMethodSelect('solana')}
                  >
                    <DollarSign className="w-6 h-6 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Solana (SOL)</div>
                      <div className="text-sm text-gray-500">
                        Instant payment • StreamFlow escrow
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">Recommended</div>
                    </div>
                  </button>
                )}

                {/* Traditional Payment Methods */}
                {paymentConditions?.hasPaymentMethod && (
                  <>
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handleMethodSelect('wechat')}
                    >
                      <MessageCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-800">WeChat Pay</div>
                        <div className="text-sm text-gray-500">Scan QR code to pay</div>
                      </div>
                    </button>
                    
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handleMethodSelect('alipay')}
                    >
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-800">Alipay</div>
                        <div className="text-sm text-gray-500">Mobile payment</div>
                      </div>
                    </button>
                    
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handleMethodSelect('card')}
                    >
                      <Building className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-800">Credit/Debit Card</div>
                        <div className="text-sm text-gray-500">International cards accepted</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 'confirm-details' && selectedMethod && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Confirm Purchase Details</h4>
              
              {/* Selected Payment Method */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedMethod === 'solana' && <DollarSign className="w-5 h-5 text-orange-600" />}
                  {selectedMethod === 'wechat' && <MessageCircle className="w-5 h-5 text-green-600" />}
                  {selectedMethod === 'alipay' && <CreditCard className="w-5 h-5 text-blue-600" />}
                  {selectedMethod === 'card' && <Building className="w-5 h-5 text-purple-600" />}
                  <span className="font-medium">
                    {selectedMethod === 'solana' && 'Solana (SOL)'}
                    {selectedMethod === 'wechat' && 'WeChat Pay'}
                    {selectedMethod === 'alipay' && 'Alipay'}
                    {selectedMethod === 'card' && 'Credit/Debit Card'}
                  </span>
                </div>
              </div>

              {/* Subscription Details */}
              {isSubscription && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Subscription Details</p>
                      <p className="text-blue-700 text-sm mt-1">
                        ${project.subscription_price_per_period || project.price} charged every {project.subscription_period}
                      </p>
                      <p className="text-blue-700 text-sm">
                        Total duration: {project.subscription_duration} months
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* StreamFlow Info for Solana */}
              {selectedMethod === 'solana' && (
                <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">StreamFlow Escrow</p>
                      <p className="text-orange-700 text-sm mt-1">
                        {isSubscription 
                          ? 'Funds will be released to the seller according to the subscription schedule'
                          : 'Funds will be released immediately upon confirmation'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select-method')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Confirm Purchase
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Processing Payment</h4>
              <p className="text-gray-600">
                {selectedMethod === 'solana' 
                  ? 'Creating StreamFlow escrow and processing payment...'
                  : 'Processing your payment...'
                }
              </p>
              <div className="mt-4 text-sm text-gray-500">
                This may take a few moments. Please don&apos;t close this window.
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Purchase Successful!</h4>
              <p className="text-gray-600 mb-4">
                Your order has been processed successfully.
              </p>
              {orderId && (
                <p className="text-sm text-gray-500 mb-4">
                  Order ID: {orderId}
                </p>
              )}
              <button
                onClick={handleClose}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h4>
              {error && (
                <p className="text-red-600 mb-4 text-sm">{error}</p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {orderId && (
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      'Retry Payment'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}