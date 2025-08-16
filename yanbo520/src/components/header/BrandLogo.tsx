import { BRAND_LOGO_URL } from '@/lib/constants'

export function BrandLogo() {
  return (
    <div className="rounded-full px-2 py-1 h-10 flex items-center" style={{backgroundColor: '#38b6ff'}}>
      <img 
        src={BRAND_LOGO_URL}
        alt="Work Work Logo" 
        className="h-8 w-auto object-contain rounded-lg"
      />
    </div>
  )
}