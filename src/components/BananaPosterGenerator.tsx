'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/providers/AuthProvider'

type FormData = {
  logoFile: File | null
  logoPreview: string | null
  name: string
  description: string
  category: string
  price: string
}

const categories = ['SaaS', 'Mobile App', 'E-commerce', 'Tool', 'Game', 'Other']

interface BananaPosterGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

export function BananaPosterGenerator({ isOpen, onClose }: BananaPosterGeneratorProps) {
  const { user } = useAuth()
  const [form, setForm] = useState<FormData>({
    logoFile: null,
    logoPreview: null,
    name: '',
    description: '',
    category: '',
    price: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const isValid = form.name.trim() && form.description.trim() && form.category.trim() && form.price.trim()

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (form.logoPreview) URL.revokeObjectURL(form.logoPreview)
    setForm(prev => ({
      ...prev,
      logoFile: file,
      logoPreview: URL.createObjectURL(file)
    }))
  }

  const triggerFileInput = () => {
    const input = document.getElementById('logo') as HTMLInputElement
    input.click()
  }

  const removeLogo = () => {
    if (form.logoPreview) URL.revokeObjectURL(form.logoPreview)
    setForm(prev => ({
      ...prev,
      logoFile: null,
      logoPreview: null
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      alert('Please fill in all required fields: Product Name, Description, Category, and Price')
      return
    }
    setLoading(true)
    setError(null)
    setImageUrl(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          form: {
            name: form.name,
            description: form.description,
            category: form.category,
            price: form.price,
          },
          userId: user?.id
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '生成失败')

      if (data.imageBase64) {
        setImageUrl(`data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">🍌 Banana Poster Generator</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm mb-2 font-medium">Product Logo (Optional)</label>
              <div className="file-input-wrapper">
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={onLogoChange}
                  className="hidden"
                />
                <div className="flex items-center">
                  <button 
                    type="button" 
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg mr-3 hover:bg-yellow-500"
                    onClick={triggerFileInput}
                  >
                    Choose File
                  </button>
                  <span className="text-gray-600 text-sm">
                    {form.logoFile ? form.logoFile.name : 'No file selected'}
                  </span>
                </div>
              </div>
              {form.logoPreview && (
                <div className="flex items-center gap-3 mt-3">
                  <Image 
                    src={form.logoPreview} 
                    alt="Product Logo Preview" 
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 bg-white" 
                  />
                  <button type="button" className="text-yellow-600 hover:underline" onClick={removeLogo}>Remove Logo</button>
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm mb-2 font-medium">Product Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="desc" className="block text-sm mb-2 font-medium">Product Description</label>
              <textarea
                id="desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe your product"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="category" className="block text-sm mb-2 font-medium">Product Category</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm mb-2 font-medium">Product Pricing</label>
                <input
                  id="price"
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price, e.g., $9.90 / Free / Contact us"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-h-[24px] text-sm text-gray-600 order-2 sm:order-1">
                {loading && <span>Generating poster, please wait...</span>}
                {error && <span className="text-red-600">{error}</span>}
              </div>
              <button
                type="submit"
                disabled={!isValid || loading}
                className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 md:px-6 py-3 text-black bg-yellow-400 hover:bg-yellow-500 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed font-medium w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? 'Generating...' : '🍌 Generate Poster'}
              </button>
            </div>
          </form>

          {/* Generated Image */}
          {imageUrl && (
            <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-semibold mb-4">Generated Poster</h3>
              <Image 
                src={imageUrl} 
                alt="AI Generated Poster" 
                width={800}
                height={600}
                className="w-full h-auto rounded-lg border border-gray-200" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}