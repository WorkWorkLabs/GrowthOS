'use client'

import { useState } from 'react'
import { ProductData } from './ProductUploadFlow'
import { useRouter } from 'next/navigation'
import { PartyPopper, FileText } from 'lucide-react'

interface ResultsStepProps {
  data: ProductData
  workflowResult: Record<string, unknown>
  onRestart: () => void
}

export function ResultsStep({ data, workflowResult, onRestart }: ResultsStepProps) {
  const router = useRouter()
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({})

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [key]: true })
    setTimeout(() => {
      setCopied({ ...copied, [key]: false })
    }, 2000)
  }

  // Extract results from workflow response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workflowData = workflowResult as any
  const tweetContent = workflowData?.data?.outputs?.tweet || 'No tweet content generated'
  const xhsContent = workflowData?.data?.outputs?.xhs || 'No XHS content generated'
  
  // Extract product information
  const product = workflowData?.product
  const productId = workflowData?.productId || product?.id
  const productUrl = workflowData?.productUrl || (productId ? `/product/${productId}` : null)
  
  // Extract Twitter URL from tweet content
  const extractTwitterUrl = (content: string) => {
    const urlMatch = content.match(/https:\/\/x\.com\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }
  
  const twitterUrl = extractTwitterUrl(tweetContent)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-6">
          <PartyPopper className="w-16 h-16 mx-auto text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Success! Your Product is Live</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Congratulations! Your product has been successfully published and is now live on the platform. 
          Here are the AI-generated social media posts for your product.
        </p>
      </div>

      {/* Social Media Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Twitter Post */}
        <div className="space-y-4">
          {twitterUrl ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <iframe
                src={`https://platform.twitter.com/embed/Tweet.html?id=${twitterUrl.split('/').pop()}`}
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                className="w-full"
              />
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">WorkWork Bot</h3>
                  <p className="text-gray-500 text-sm">@WorkWorkBot</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{tweetContent}</p>
              </div>
              
              <div className="flex justify-between text-gray-500 text-sm">
                <span>12:45 PM · Aug 15, 2025</span>
                <button 
                  onClick={() => copyToClipboard(tweetContent, 'tweet')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {copied.tweet ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          
          {twitterUrl && (
            <div className="text-center">
              <button 
                onClick={() => copyToClipboard(twitterUrl, 'twitterUrl')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copied.twitterUrl ? 'Copied!' : 'Copy Tweet URL'}
              </button>
            </div>
          )}
        </div>

        {/* XHS Post */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            <div className="ml-4">
              <h3 className="font-bold text-gray-900">WorkWork Bot</h3>
              <p className="text-gray-500 text-sm">小红书官方账号</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{xhsContent}</p>
          </div>
          
          <div className="flex justify-between text-gray-500 text-sm">
            <span>12:45 PM · Aug 15, 2025</span>
            <button 
              onClick={() => copyToClipboard(xhsContent, 'xhs')}
              className="text-red-500 hover:text-red-700"
            >
              {copied.xhs ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Link */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">View Your Published Product</h3>
        <p className="text-gray-600 mb-4">
          Your product is now live on WorkWork. Share this link with your audience.
        </p>
        {productId ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">✅ Product Successfully Published!</p>
              <p className="text-green-700 text-sm">Product ID: {productId}</p>
              {product?.name && <p className="text-green-700 text-sm">Name: {product.name}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-mono text-sm break-all max-w-md">
                {window.location.origin}{productUrl}
              </div>
              <button 
                onClick={() => copyToClipboard(`${window.location.origin}${productUrl}`, 'link')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copied.link ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">⚠️ Product was published but ID not available</p>
            <p className="text-yellow-700 text-sm">Check your products page to find your published item</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {
            if (productUrl) {
              router.push(productUrl)
            } else {
              router.push('/')
            }
          }}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {productUrl ? 'View Product' : 'View Platform'}
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Create Another Product
        </button>
      </div>
    </div>
  )
}