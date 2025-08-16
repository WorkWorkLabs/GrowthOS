'use client'

import { useState } from 'react'
import { ProductData, AIGeneratedContent } from './ProductUploadFlow'
import { apiService } from '@/services/api'

interface AIGenerationStepProps {
  data: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onNext: () => void
  onPrev: () => void
}

export function AIGenerationStep({ data, onUpdate, onNext, onPrev }: AIGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')

  const generateContent = async () => {
    setIsGenerating(true)
    onUpdate({ isGenerating: true })

    try {
      // Simulate AI content generation based on upload type
      const steps = [
        'Analyzing your project...',
        'Extracting key features...',
        'Generating product title...',
        'Creating description...',
        'Writing marketing copy...',
        'Generating social media posts...',
        'Finalizing content...'
      ]

      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(steps[i])
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Mock AI generated content based on file type
      let baseContent = ''
      if (data.uploadType === 'readme' && data.files.length > 0) {
        baseContent = 'README-based project'
      } else if (data.uploadType === 'zip' && data.files.length > 0) {
        baseContent = 'Full project archive'
      } else if (data.uploadType === 'github') {
        baseContent = 'GitHub repository'
      } else if (data.uploadType === 'video') {
        baseContent = 'Video demonstration'
      }

      const aiContent: AIGeneratedContent = {
        title: await apiService.generateAIContent(`Generate a catchy title for a ${baseContent}`, 'title'),
        description: await apiService.generateAIContent(`Generate a detailed description for a ${baseContent}`, 'description'),
        marketingCopy: await apiService.generateAIContent(`Generate marketing copy for a ${baseContent}`, 'social'),
        keywords: ['web3', 'blockchain', 'crypto', 'course', 'digital nomad'],
        socialPosts: {
          twitter: await apiService.generateAIContent(`Generate Twitter post for a ${baseContent}`, 'social'),
          linkedin: 'Professional post about your innovative project solution. Perfect for developers and entrepreneurs looking to expand their skillset.'
        },
        price: 199,
        currency: 'USDC',
        category: 'course'
      }

      onUpdate({ aiContent, isGenerating: false })
      setIsGenerating(false)
      setGenerationStep('')
    } catch (error) {
      console.error('AI generation failed:', error)
      setIsGenerating(false)
      onUpdate({ isGenerating: false })
      setGenerationStep('Generation failed. Please try again.')
    }
  }

  const hasContent = data.aiContent !== null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Content Generation</h2>
        <p className="text-gray-600">Let AI analyze your project and generate professional content</p>
      </div>

      {/* Source Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Source Information</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-gray-600 w-20">Type:</span>
            <span className="font-medium capitalize">{data.uploadType}</span>
          </div>
          {data.uploadType === 'readme' || data.uploadType === 'zip' ? (
            <div className="flex items-center">
              <span className="text-gray-600 w-20">Files:</span>
              <span className="font-medium">{data.files.map(f => f.name).join(', ')}</span>
            </div>
          ) : data.uploadType === 'github' ? (
            <div className="flex items-center">
              <span className="text-gray-600 w-20">GitHub:</span>
              <span className="font-medium">{data.githubUrl}</span>
            </div>
          ) : data.uploadType === 'video' ? (
            <div className="flex items-center">
              <span className="text-gray-600 w-20">Video:</span>
              <span className="font-medium">{data.videoUrl}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Generation Status */}
      {!hasContent && !isGenerating && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">Ready to Generate Content</h3>
          <p className="text-gray-600 mb-6">
            Our AI will analyze your project and create professional product content including title, description, and marketing copy.
          </p>
          <button
            onClick={generateContent}
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            🚀 Generate AI Content
          </button>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Generating Content...</h3>
          <p className="text-gray-600">{generationStep}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Generated Content Preview */}
      {hasContent && data.aiContent && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-green-600">✓ Content Generated Successfully</h3>
            <button
              onClick={generateContent}
              className="text-primary hover:text-blue-600 font-medium"
            >
              🔄 Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Product Title</h4>
                <p className="text-gray-800">{data.aiContent.title}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Category & Pricing</h4>
                <div className="space-y-1">
                  <p><span className="text-gray-600">Category:</span> {data.aiContent.category}</p>
                  <p><span className="text-gray-600">Price:</span> {data.aiContent.currency} {data.aiContent.price}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {data.aiContent.keywords.map((keyword, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-800 text-sm leading-relaxed">{data.aiContent.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Marketing Copy</h4>
                <p className="text-gray-800 text-sm leading-relaxed">{data.aiContent.marketingCopy}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Social Media</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-sm">Twitter:</span>
                    <p className="text-gray-800 text-sm">{data.aiContent.socialPosts.twitter}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        
        {hasContent && (
          <button
            onClick={onNext}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Preview & Edit →
          </button>
        )}
      </div>
    </div>
  )
}