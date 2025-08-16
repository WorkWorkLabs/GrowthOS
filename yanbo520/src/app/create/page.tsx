'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { ProductUploadFlow } from '@/components/create/ProductUploadFlow'

// Force dynamic rendering due to auth usage in Header
export const dynamic = 'force-dynamic'

export default function CreateProductPage() {
  return (
    <div className="min-h-screen bg-bg-blue">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Product</h1>
          <p className="text-white/80">Upload your project and let AI generate professional content</p>
        </div>
        
        <ProductUploadFlow />
      </div>
    </div>
  )
}