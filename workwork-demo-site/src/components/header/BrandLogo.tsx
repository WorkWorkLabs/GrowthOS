import Image from 'next/image'
import { BRAND_LOGO_URL } from '@/lib/constants'

export function BrandLogo() {
  return (
    <button 
      onClick={() => window.location.href = '/'}
      className="rounded-full px-2 py-1 h-10 flex items-center hover:opacity-80 transition-opacity cursor-pointer" 
      style={{backgroundColor: '#38b6ff'}}
    >
      <Image 
        src={BRAND_LOGO_URL}
        alt="Work Work Logo" 
        width={128}
        height={32}
        className="h-8 w-auto object-contain rounded-lg"
        quality={100}
        priority
        unoptimized
      />
    </button>
  )
}