'use client'

import { useState } from 'react'
import { ProductData } from './ProductUploadFlow'
import { useRouter } from 'next/navigation'

interface PublishStepProps {
  data: ProductData
  onPrev: () => void
}

export function PublishStep({ data, onPrev }: PublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const router = useRouter()

  if (!data.aiContent) {
    return <div>No content to publish</div>
  }

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Actually save to API/blockchain
      // const result = await apiService.createProduct(productData)
      
      setPublishSuccess(true)
      setIsPublishing(false)
    } catch (error) {
      console.error('Publishing failed:', error)
      setIsPublishing(false)
    }
  }

  if (publishSuccess) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Product Published Successfully!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your product is now live on the platform. Users can discover and purchase your content.
        </p>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>• Share your product on social media</li>
              <li>• Monitor sales and analytics</li>
              <li>• Engage with your customers</li>
              <li>• Update content as needed</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              View on Platform
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create Another Product
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Publish</h2>
        <p className="text-gray-600">Review your product summary and publish to the platform</p>
      </div>

      {/* Product Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Product Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Title</h4>
              <p className="text-gray-900">{data.aiContent.title}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Category</h4>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm capitalize">
                {data.aiContent.category}
              </span>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Price</h4>
              <p className="text-2xl font-bold text-primary">
                {data.aiContent.currency} {data.aiContent.price}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Source</h4>
              <p className="text-gray-900 capitalize">
                {data.uploadType} 
                {data.uploadType === 'readme' || data.uploadType === 'zip' 
                  ? ` (${data.files.length} file${data.files.length > 1 ? 's' : ''})`
                  : ''
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {data.aiContent.keywords.slice(0, 3).map((keyword, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {keyword}
                  </span>
                ))}
                {data.aiContent.keywords.length > 3 && (
                  <span className="text-gray-500 text-xs">
                    +{data.aiContent.keywords.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Description Preview</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {data.aiContent.description.length > 100 
                  ? data.aiContent.description.substring(0, 100) + '...'
                  : data.aiContent.description
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Options */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Publishing Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Content Policy</a>
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="marketing"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="marketing" className="ml-2 text-sm text-gray-700">
              Allow WorkWork to promote my product in marketing materials
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="analytics"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="analytics" className="ml-2 text-sm text-gray-700">
              Enable analytics and performance tracking
            </label>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-yellow-600 mr-3">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Once published, your product will be visible to all users</li>
              <li>• You can edit product details anytime from your dashboard</li>
              <li>• Payments will be processed through smart contracts</li>
              <li>• Platform fees apply to all sales (currently 5%)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Publish Button */}
      {!isPublishing ? (
        <div className="text-center">
          <button
            onClick={handlePublish}
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
          >
            🚀 Publish Product
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your product will be live immediately after publishing
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Publishing Your Product...</h3>
          <p className="text-gray-600">Please wait while we prepare your product for the platform</p>
        </div>
      )}

      {/* Navigation */}
      {!isPublishing && (
        <div className="flex justify-start">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Preview
          </button>
        </div>
      )}
    </div>
  )
}