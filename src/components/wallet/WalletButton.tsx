'use client'

import { useWallet } from '@/hooks/useWallet'
import { useAuth } from '@/providers/AuthProvider'
import { useState } from 'react'

export function WalletButton() {
  const { address, isConnected, isConnecting, isBinding, balance, connectAndBind, disconnect } = useWallet()
  const { user } = useAuth()
  const [error, setError] = useState('')

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    if (!user) {
      setError('Please login first to connect wallet')
      return
    }

    setError('')
    try {
      await connectAndBind()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed'
      setError(errorMsg)
      console.error('Wallet connection failed:', err)
    }
  }

  if (isConnecting || isBinding) {
    return (
      <button 
        disabled
        className="bg-gray-400 text-white px-4 py-2 rounded-lg"
      >
        {isBinding ? 'Binding...' : 'Connecting...'}
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-white rounded-lg px-3 py-2 text-sm">
          <div className="font-medium text-text-primary">{formatAddress(address)}</div>
          {balance && (
            <div className="text-text-secondary text-xs">
              {balance} SOL
            </div>
          )}
        </div>
        <button 
          onClick={disconnect}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-red-600 text-sm">
          {error}
        </div>
      )}
      <button 
        onClick={handleConnect}
        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Connect Phantom
      </button>
    </div>
  )
}