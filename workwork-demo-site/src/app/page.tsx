import { Suspense } from 'react'
import { HomeContent } from '@/components/HomeContent'

// Force dynamic rendering due to auth usage in Header
export const dynamic = 'force-dynamic'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-blue flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}
