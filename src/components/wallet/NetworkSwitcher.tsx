'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { SUPPORTED_NETWORKS, NetworkKey } from '@/lib/web3-config'

interface NetworkSwitcherProps {
  className?: string
}

export function NetworkSwitcher({ className = '' }: NetworkSwitcherProps) {
  const { networkKey, switchNetwork, addNetwork } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleNetworkSwitch = async (targetNetwork: NetworkKey) => {
    if (targetNetwork === networkKey) return

    setIsLoading(true)
    try {
      await switchNetwork(targetNetwork)
    } catch (error) {
      console.error('Failed to switch network:', error)
      // 如果切换失败，尝试添加网络
      try {
        await addNetwork(targetNetwork)
      } catch (addError) {
        console.error('Failed to add network:', addError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const currentNetwork = networkKey ? SUPPORTED_NETWORKS[networkKey] : null

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium text-gray-900">Current Network</h3>
          {currentNetwork ? (
            <div className="mt-1 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{currentNetwork.name}</span>
              <span className="text-xs text-gray-400">({currentNetwork.id})</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Not connected</span>
          )}
        </div>

        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Switch Network</h4>
          <div className="space-y-2">
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => {
              const isActive = key === networkKey
              const isKaia = key === 'kaia' || key === 'kairos'
              
              return (
                <button
                  key={key}
                  onClick={() => handleNetworkSwitch(key as NetworkKey)}
                  disabled={isLoading || isActive}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 cursor-default'
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="font-medium">{network.name}</span>
                      {isKaia && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">#{network.id}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {network.nativeCurrency.symbol} • {network.blockExplorer.replace('https://', '')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Kaia特色功能提示 */}
        <div className="p-3 bg-purple-50 border-t">
          <div className="text-xs text-purple-600">
            <strong>💡 Why choose Kaia?</strong>
            <ul className="mt-1 space-y-1 ml-2">
              <li>• ~1s block time (faster transactions)</li>
              <li>• Lower gas fees</li>
              <li>• Fee delegation support</li>
              <li>• Full EVM compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}