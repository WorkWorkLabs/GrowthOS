'use client'

import { useState, useEffect, useRef } from 'react'

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <>
      {/* 蓝色背景条 - 操场跑道样式，添加边距 */}
      <div className="mx-6 mt-4 h-14 bg-primary flex items-center justify-between px-2 shadow-button rounded-full">
        {/* Left side - Logo & Brand */}
        <div className="rounded-full px-2 py-1 h-10 flex items-center" style={{backgroundColor: '#38b6ff'}}>
          <img 
            src="https://github.com/WorkWorkLabs/.github/raw/main/profile/Work-Work_font_logo.png" 
            alt="Work Work Logo" 
            className="h-8 w-auto object-contain rounded-lg"
          />
        </div>

        {/* Right side - User profile */}
      <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white rounded-full pl-2 pr-12 py-1 h-10 flex items-start gap-2 hover:bg-gray-50 transition-colors min-w-[180px]"
          >
            <img 
              src="https://pbs.twimg.com/profile_images/1912362795879809025/HbzzOBdl_400x400.jpg" 
              alt="User Avatar" 
              className="w-8 h-8 rounded-full object-cover mt-0.5"
            />
            <div className="flex flex-col items-start justify-center flex-1">
              <span className="text-text-primary text-sm font-medium leading-tight">Username</span>
              <span className="text-text-muted text-[8px] leading-tight">Wallet Address</span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-lg shadow-dropdown p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="space-y-1">
                <button 
                  className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </button>
                <hr className="border-gray-200" />
                <button 
                  className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Connect to wallet
                </button>
                <hr className="border-gray-200" />
                <button 
                  className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  My Order
                </button>
                <hr className="border-gray-200" />
                <button 
                  className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  My Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}