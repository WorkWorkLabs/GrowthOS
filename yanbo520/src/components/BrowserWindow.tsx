'use client'

import { ReactNode } from 'react'

interface BrowserWindowProps {
  children: ReactNode
  title?: string
  url?: string
}

export function BrowserWindow({ children, title = 'Yanbo', url = 'https://yanbo520.com' }: BrowserWindowProps) {
  return (
    <div className="w-full max-w-[1280px] mx-auto bg-bg-glass rounded-[30px_30px_6px_6px] border border-white/60 backdrop-blur-[43px] overflow-hidden">
      {/* macOS 窗口标题栏 */}
      <div className="h-[57px] bg-white/40 backdrop-blur-[27px] border-b border-white/20 flex items-center px-6">
        {/* 交通灯按钮 */}
        <div className="flex items-center gap-[22px] mr-8">
          <div className="w-[14px] h-[14px] rounded-full bg-macos-close" />
          <div className="w-[14px] h-[14px] rounded-full bg-macos-minimize" />
          <div className="w-[14px] h-[14px] rounded-full bg-macos-maximize" />
        </div>
        
        {/* 标签 */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-1 bg-white rounded-lg min-w-[200px]">
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-blue-500">
                <path d="M6 0L8.5 4H12L8.5 8L6 12L3.5 8L0 4H3.5L6 0Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-text-secondary text-[14px] font-medium">{title}</span>
          </div>
        </div>
        
        {/* 右侧按钮 */}
        <div className="flex items-center gap-4">
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
            ⭐
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-300" />
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
            ⋯
          </button>
        </div>
      </div>

      {/* 地址栏 */}
      <div className="h-12 bg-white flex items-center px-6">
        {/* 导航按钮 */}
        <div className="flex items-center gap-2 mr-6">
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary disabled:opacity-50" disabled>
            ←
          </button>
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
            →
          </button>
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
            ↻
          </button>
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
            🏠
          </button>
        </div>
        
        {/* 地址栏输入框 */}
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-bg-secondary rounded-full">
            <div className="w-3 h-3 text-text-secondary">
              🔒
            </div>
            <span className="text-text-secondary text-base">{url}</span>
          </div>
        </div>
        
        {/* 右侧工具 */}
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
            ⭐
          </button>
          <div className="w-6 h-6 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* 页面内容 */}
      <div className="bg-bg-blue">
        {children}
      </div>
    </div>
  )
}