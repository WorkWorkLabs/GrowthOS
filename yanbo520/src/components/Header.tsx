'use client'

import { useState } from 'react'
import { DEFAULT_USER } from '@/lib/constants'
import { DropdownMenuItem } from '@/types'
import { BrandLogo } from './header/BrandLogo'
import { UserProfile } from './header/UserProfile'
import { useWallet } from '@/hooks/useWallet'

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false)
  const { isConnected, address } = useWallet()

  const menuItems: DropdownMenuItem[] = [
    { id: 'profile', label: 'Profile', action: () => console.log('Profile clicked') },
    { id: 'orders', label: 'My Orders', action: () => console.log('Orders clicked') },
    { id: 'projects', label: 'My Projects', action: () => console.log('Projects clicked') },
    { id: 'settings', label: 'Settings', action: () => console.log('Settings clicked') },
  ]

  return (
    <div className="mx-6 mt-4 h-14 bg-primary flex items-center justify-between px-2 shadow-button rounded-full">
      <BrandLogo />
      
      <UserProfile
        user={{
          ...DEFAULT_USER,
          username: isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : DEFAULT_USER.username,
          walletAddress: address || DEFAULT_USER.walletAddress
        }}
        isDropdownOpen={showDropdown}
        onToggleDropdown={() => setShowDropdown(!showDropdown)}
        onCloseDropdown={() => setShowDropdown(false)}
        menuItems={menuItems}
        isWalletConnected={isConnected}
      />
    </div>
  )
}