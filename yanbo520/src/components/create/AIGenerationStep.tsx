'use client'

import { useState } from 'react'
import { ProductData, AIGeneratedContent } from './ProductUploadFlow'
import { generateProductInfoFromReadme } from '@/lib/gemini'
import { Bot, Loader2, CheckCircle, RotateCcw } from 'lucide-react'

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
      // 检查是否是README文件上传
      const isReadmeUpload = data.uploadType === 'readme' && data.readmeContent

      if (isReadmeUpload && data.readmeContent) {
        // 使用真正的AI生成 (README文件)
        const steps = [
          'Analyzing README content...',
          'Generating product title with AI...',
          'Creating compelling description...',
          'Writing marketing copy...',
          'Extracting relevant keywords...',
          'Finalizing AI-generated content...'
        ]

        for (let i = 0; i < steps.length; i++) {
          setGenerationStep(steps[i])
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // 调用Gemini AI生成内容
        const aiResult = await generateProductInfoFromReadme(data.readmeContent)
        
        const aiContent: AIGeneratedContent = {
          title: aiResult.title,
          description: aiResult.description,
          marketingCopy: aiResult.marketing,
          keywords: aiResult.keywords,
          socialPosts: {
            twitter: `🚀 Just published "${aiResult.title}" on WorkWork! Check out this amazing project. #Development #OpenSource #Tech`,
            linkedin: `Excited to share my latest project: ${aiResult.title}. This comprehensive resource demonstrates practical solutions and provides valuable insights for developers and professionals.`
          },
          price: aiResult.price,
          currency: aiResult.currency,
          category: aiResult.category
        }

        setGenerationStep('AI content generation complete!')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        onUpdate({ aiContent, isGenerating: false })
        setIsGenerating(false)
        setGenerationStep('')

      } else {
        // 其他类型仍使用测试内容
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

        // 生成测试内容
        const getSourceName = () => {
          if (data.uploadType === 'github' && data.githubUrl) {
            return data.githubUrl.split('/').pop() || 'GitHub Repository'
          }
          if (data.uploadType === 'video' && data.videoUrl) {
            return 'Video Tutorial'
          }
          if (data.uploadType === 'zip') {
            return 'Project Package'
          }
          return 'Test Project'
        }

        const sourceName = getSourceName()
        
        const aiContent: AIGeneratedContent = {
          title: `[TEST] ${sourceName} - Professional Guide`,
          description: `[TEST] This is a comprehensive guide for ${sourceName}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. This content is generated for testing purposes and demonstrates the AI content generation workflow.`,
          marketingCopy: `[TEST] Discover the power of ${sourceName}! This comprehensive guide will transform your understanding and boost your skills. Perfect for developers, entrepreneurs, and learners who want to stay ahead of the curve.`,
          keywords: ['test', 'demo', 'development', 'tutorial', data.uploadType],
          socialPosts: {
            twitter: `[TEST] 🚀 Just published my guide on ${sourceName}! Perfect for anyone looking to level up their skills. #Development #Learning #Test`,
            linkedin: `[TEST] Excited to share my comprehensive guide on ${sourceName}. This resource provides practical insights and hands-on experience for professionals in the field.`
          },
          price: 29.99,
          currency: 'SOL',
          category: data.uploadType === 'github' ? 'development' : data.uploadType === 'video' ? 'education' : 'course'
        }
        
        setGenerationStep('Content generation complete!')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        onUpdate({ aiContent, isGenerating: false })
        setIsGenerating(false)
        setGenerationStep('')
      }
      
    } catch (error) {
      console.error('AI generation failed:', error)
      setIsGenerating(false)
      onUpdate({ isGenerating: false })
      setGenerationStep(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          <div className="mb-4">
            <Bot className="w-16 h-16 mx-auto text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Generate Content</h3>
          <p className="text-gray-600 mb-6">
            Our AI will analyze your project and create professional product content including title, description, and marketing copy.
          </p>
          <button
            onClick={generateContent}
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <Bot className="w-5 h-5 mr-2" />
            Generate AI Content
          </button>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
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
            <h3 className="text-xl font-semibold text-green-600 flex items-center space-x-2">
              <CheckCircle className="w-6 h-6" />
              <span>Content Generated Successfully</span>
            </h3>
            <button
              onClick={generateContent}
              className="text-primary hover:text-blue-600 font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Regenerate
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