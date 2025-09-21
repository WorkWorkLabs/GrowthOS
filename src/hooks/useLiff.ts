import { useState, useEffect } from 'react'

declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>
      isLoggedIn: () => boolean
      getProfile: () => Promise<LiffProfile>
      isInClient: () => boolean
      login: () => void
      logout: () => void
      openWindow: (config: { url: string; external: boolean }) => void
      closeWindow: () => void
      shareTargetPicker: (messages: unknown[]) => Promise<unknown>
    }
  }
}

interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export function useLiff() {
  const [isLiffReady, setIsLiffReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [isInClient, setIsInClient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initLiff = async () => {
      try {
        // 检查是否在客户端
        if (typeof window === 'undefined') return

        // 动态加载LIFF SDK
        if (!window.liff) {
          const script = document.createElement('script')
          script.src = 'https://static.line-scdn.net/liff/edge/2.1/liff.js'
          script.async = true
          document.head.appendChild(script)
          
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
        }

        // 初始化LIFF
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || 'demo-liff-id'
        await window.liff.init({ liffId })
        
        setIsLiffReady(true)
        setIsInClient(window.liff.isInClient())

        // 检查登录状态
        if (window.liff.isLoggedIn()) {
          setIsLoggedIn(true)
          const userProfile = await window.liff.getProfile()
          setProfile(userProfile)
        } else {
          setIsLoggedIn(false)
        }
      } catch (err) {
        console.warn('LIFF初始化失败，使用普通Web模式:', err)
        setError(err instanceof Error ? err.message : 'LIFF初始化失败')
        setIsLiffReady(true) // 即使失败也设为true，让应用继续运行
      }
    }

    initLiff()
  }, [])

  const login = () => {
    if (window.liff && isLiffReady) {
      window.liff.login()
    }
  }

  const logout = () => {
    if (window.liff && isLiffReady) {
      window.liff.logout()
      setIsLoggedIn(false)
      setProfile(null)
    }
  }

  const openExternalUrl = (url: string) => {
    if (window.liff && isInClient) {
      window.liff.openWindow({
        url,
        external: true
      })
    } else {
      window.open(url, '_blank')
    }
  }

  const closeWindow = () => {
    if (window.liff && isInClient) {
      window.liff.closeWindow()
    }
  }

  const shareTargetPicker = (messages: unknown[]) => {
    if (window.liff && isLiffReady) {
      return window.liff.shareTargetPicker(messages)
    }
  }

  return {
    isLiffReady,
    isLoggedIn,
    profile,
    isInClient,
    error,
    login,
    logout,
    openExternalUrl,
    closeWindow,
    shareTargetPicker
  }
}