'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface SubscriptionPrices {
  daily?: number
  weekly?: number
  monthly?: number
  yearly?: number
}

interface SubscriptionPricingProps {
  currency: string
  pricingModel: 'one_time' | 'subscription'
  oneTimePrice: number
  subscriptionPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  subscriptionPrices?: SubscriptionPrices
  onChange: (data: {
    pricing_model: 'one_time' | 'subscription'
    price: number
    subscription_period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    subscription_prices?: SubscriptionPrices
  }) => void
}

export function SubscriptionPricing({
  currency,
  pricingModel,
  oneTimePrice,
  subscriptionPeriod,
  subscriptionPrices = {},
  onChange
}: SubscriptionPricingProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempPricingModel, setTempPricingModel] = useState<'one_time' | 'subscription'>(pricingModel)
  const [tempOneTimePrice, setTempOneTimePrice] = useState(oneTimePrice)
  const [tempSubscriptionPeriod, setTempSubscriptionPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(subscriptionPeriod || 'monthly')
  const [tempSubscriptionPrices, setTempSubscriptionPrices] = useState<SubscriptionPrices>({
    daily: subscriptionPrices.daily || 0.99,
    weekly: subscriptionPrices.weekly || 4.99,
    monthly: subscriptionPrices.monthly || 19.99,
    yearly: subscriptionPrices.yearly || 199.99,
    ...subscriptionPrices
  })

  const periodLabels = {
    daily: '每日',
    weekly: '每周', 
    monthly: '每月',
    yearly: '每年'
  }

  const handleSave = () => {
    if (tempPricingModel === 'one_time') {
      onChange({
        pricing_model: 'one_time',
        price: tempOneTimePrice
      })
    } else {
      onChange({
        pricing_model: 'subscription',
        price: tempSubscriptionPrices[tempSubscriptionPeriod] || 0,
        subscription_period: tempSubscriptionPeriod,
        subscription_prices: tempSubscriptionPrices
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempPricingModel(pricingModel)
    setTempOneTimePrice(oneTimePrice)
    setTempSubscriptionPeriod(subscriptionPeriod || 'monthly')
    setTempSubscriptionPrices({
      daily: subscriptionPrices.daily || 0.99,
      weekly: subscriptionPrices.weekly || 4.99,
      monthly: subscriptionPrices.monthly || 19.99,
      yearly: subscriptionPrices.yearly || 199.99,
      ...subscriptionPrices
    })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">定价模式</h4>
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary hover:text-blue-600 text-sm font-medium"
          >
            编辑
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">模式:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              pricingModel === 'one_time' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {pricingModel === 'one_time' ? '一次性购买' : '订阅制'}
            </span>
          </div>
          
          {pricingModel === 'one_time' ? (
            <p className="text-gray-800 font-bold">{currency} {oneTimePrice}</p>
          ) : (
            <div className="space-y-1">
              <p className="text-gray-800 font-bold">
                {currency} {subscriptionPrices?.[subscriptionPeriod || 'monthly'] || 0} / {periodLabels[subscriptionPeriod || 'monthly']}
              </p>
              <div className="text-xs text-gray-500">
                <div>日: {currency} {subscriptionPrices?.daily || 0.99}</div>
                <div>周: {currency} {subscriptionPrices?.weekly || 4.99}</div>
                <div>月: {currency} {subscriptionPrices?.monthly || 19.99}</div>
                <div>年: {currency} {subscriptionPrices?.yearly || 199.99}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">定价模式</h4>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
          >
            <Check className="w-3 h-3" />
            <span>保存</span>
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>取消</span>
          </button>
        </div>
      </div>

      {/* 定价模式选择 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">定价模式</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTempPricingModel('one_time')}
              className={`p-3 border rounded-lg text-sm ${
                tempPricingModel === 'one_time' 
                  ? 'border-primary bg-blue-50 text-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">一次性购买</div>
              <div className="text-xs text-gray-500">用户支付一次即可永久使用</div>
            </button>
            
            <button
              type="button"
              onClick={() => setTempPricingModel('subscription')}
              className={`p-3 border rounded-lg text-sm ${
                tempPricingModel === 'subscription' 
                  ? 'border-primary bg-blue-50 text-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">订阅制</div>
              <div className="text-xs text-gray-500">用户按周期付费订阅</div>
            </button>
          </div>
        </div>

        {tempPricingModel === 'one_time' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">价格</label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">{currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tempOneTimePrice}
                onChange={(e) => setTempOneTimePrice(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">主要订阅周期</label>
              <select
                value={tempSubscriptionPeriod}
                onChange={(e) => setTempSubscriptionPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="daily">每日订阅</option>
                <option value="weekly">每周订阅</option>
                <option value="monthly">每月订阅</option>
                <option value="yearly">每年订阅</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">各周期价格</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(periodLabels).map(([period, label]) => (
                  <div key={period}>
                    <label className="block text-xs text-gray-600 mb-1">{label}</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempSubscriptionPrices[period as keyof SubscriptionPrices] || 0}
                        onChange={(e) => setTempSubscriptionPrices({
                          ...tempSubscriptionPrices,
                          [period]: Number(e.target.value)
                        })}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}