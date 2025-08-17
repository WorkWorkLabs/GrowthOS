'use client'

import { useState, useEffect } from 'react'
import { ProductData } from './ProductUploadFlow'
import { useRouter } from 'next/navigation'
import { PartyPopper, AlertTriangle, Rocket, Loader2 } from 'lucide-react'
import { runDifyWorkflow } from '@/lib/dify'

interface PublishStepProps {
  data: ProductData
  onPrev: () => void
  onNext: () => void
  onWorkflowComplete: (result: Record<string, unknown>) => void
}


export function PublishStep({ data, onPrev, onNext, onWorkflowComplete }: PublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [workflowResult, setWorkflowResult] = useState<Record<string, unknown> | null>(null)
  const router = useRouter()

  // Reset state when data changes
  useEffect(() => {
    setIsPublishing(false)
    setPublishSuccess(false)
    setProgress(0)
    setElapsedTime(0)
    setWorkflowResult(null)
  }, [data])

  const handlePublish = async () => {
    setIsPublishing(true)
    setProgress(0)
    setElapsedTime(0)

    try {
      // Prepare inputs for the workflow
      const inputs: Record<string, unknown> = {}
      
      // Add GitHub URL if provided
      if (data.githubUrl) {
        inputs.github = data.githubUrl
      }
      
      // Add landing page URL if provided
      if (data.zipUrl) {
        inputs.landingpage = data.zipUrl
      }
      
      // Add README file if uploaded
      if (data.difyFileId) {
        inputs.readme = {
          transfer_method: "local_file",
          upload_file_id: data.difyFileId,
          type: "document"
        }
      }

      // For demo purposes, we'll use a fixed user ID
      // In a real application, this should be the actual user ID
      const userId = 'abc-123'

      // Start the workflow
      const workflowResponse = await runDifyWorkflow(inputs, userId)
      console.log('Workflow response:', workflowResponse)
      
      // Store the workflow result
      setWorkflowResult(workflowResponse)
      onWorkflowComplete(workflowResponse)

      // Simulate progress until we get a response
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1
          setElapsedTime(Math.floor(newProgress * 0.6)) // Estimate elapsed time
          // If we've reached 100% or have a response, stop the interval
          if (newProgress >= 100 || workflowResponse) {
            clearInterval(progressInterval)
            return 100
          }
          return newProgress
        })
      }, 600) // Update every 600ms

      // Wait for the workflow to complete (with a timeout)
      // In a real implementation, you would use the actual workflow response
      await new Promise(resolve => setTimeout(resolve, 60000)) // 60s timeout
      
      // After 60s, set to 99% if not already finished
      if (progress < 100) {
        clearInterval(progressInterval)
        setProgress(99)
      }

      setPublishSuccess(true)
      setIsPublishing(false)
      clearInterval(progressInterval)
      
      // Move to results page after a short delay
      setTimeout(() => {
        onNext() // Call onNext to move to the next step
      }, 2000)
    } catch (error) {
      console.error('Publishing failed:', error)
      setIsPublishing(false)
    }
  }

  if (publishSuccess && workflowResult) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <PartyPopper className="w-16 h-16 mx-auto text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Product Published Successfully!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your product is now live on the platform. Users can discover and purchase your content.
        </p>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-green-800 mb-2">What&apos;s Next?</h3>
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
              <h4 className="font-semibold text-gray-700 mb-1">Source</h4>
              <p className="text-gray-900 capitalize">
                {data.uploadType} 
                {data.uploadType === 'readme' || data.uploadType === 'zip' 
                  ? ` (${data.files.length} file${data.files.length > 1 ? 's' : ''})`
                  : ''
                }
              </p>
            </div>
            
            {data.difyFileId && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Dify File ID</h4>
                <p className="text-gray-900 font-mono text-sm">{data.difyFileId}</p>
              </div>
            )}
            
            {data.githubUrl && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">GitHub URL</h4>
                <p className="text-gray-900 text-sm break-all">{data.githubUrl}</p>
              </div>
            )}

            {data.zipUrl && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Landing Page URL</h4>
                <p className="text-gray-900 text-sm break-all">{data.zipUrl}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Files</h4>
              <div className="space-y-2">
                {data.files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{file.name}</span> 
                    <span className="text-gray-500"> ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="text-yellow-600 mr-3 w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Once published, your product will be visible to all users</li>
              <li>• The AI generation process may take up to 60 seconds</li>
              <li>• You can edit product details anytime from your dashboard</li>
              <li>• Payments will be processed through smart contracts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isPublishing && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500">
            Elapsed time: {elapsedTime} seconds
          </p>
        </div>
      )}

      {/* Publish Button */}
      {!isPublishing ? (
        <div className="text-center">
          <button
            onClick={handlePublish}
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Publish Product
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your product will be live immediately after publishing
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Publishing Your Product...</h3>
          <p className="text-gray-600">Please wait while we process your request</p>
        </div>
      )}

      {/* Navigation */}
      {!isPublishing && (
        <div className="flex justify-start">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Upload
          </button>
        </div>
      )}
    </div>
  )
}