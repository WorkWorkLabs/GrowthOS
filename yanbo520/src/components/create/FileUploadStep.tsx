'use client'

import { useRef, useState } from 'react'
import { ProductData } from './ProductUploadFlow'

interface FileUploadStepProps {
  data: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onNext: () => void
}

export function FileUploadStep({ data, onUpdate, onNext }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFiles = (fileList: File[]) => {
    onUpdate({
      files: fileList,
      uploadType: fileList[0]?.name.endsWith('.zip') ? 'zip' : 'readme'
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const canProceed = data.uploadType && (
    (data.uploadType === 'readme' || data.uploadType === 'zip') && data.files.length > 0 ||
    data.uploadType === 'github' && data.githubUrl ||
    data.uploadType === 'video' && data.videoUrl
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Project</h2>
        <p className="text-gray-600">Choose how you want to share your project content</p>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* README Upload */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'readme' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${dragActive ? 'border-primary bg-blue-50' : ''}
          `}
          onClick={() => {
            onUpdate({ uploadType: 'readme' })
            fileInputRef.current?.click()
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="font-semibold mb-2">README File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your project&apos;s README.md file
            </p>
            {data.uploadType === 'readme' && data.files.length > 0 && (
              <div className="text-sm text-primary font-medium">
                ✓ {data.files[0].name}
              </div>
            )}
          </div>
        </div>

        {/* ZIP Upload */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'zip' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => {
            onUpdate({ uploadType: 'zip' })
            fileInputRef.current?.click()
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="font-semibold mb-2">Project Archive</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a ZIP file of your entire project
            </p>
            {data.uploadType === 'zip' && data.files.length > 0 && (
              <div className="text-sm text-primary font-medium">
                ✓ {data.files[0].name}
              </div>
            )}
          </div>
        </div>

        {/* GitHub Link */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'github' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => onUpdate({ uploadType: 'github' })}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🐙</div>
            <h3 className="font-semibold mb-2">GitHub Repository</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link to your GitHub repository
            </p>
            <span className="text-xs text-gray-500">(Coming Soon)</span>
          </div>
        </div>

        {/* Video Link */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'video' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => onUpdate({ uploadType: 'video' })}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="font-semibold mb-2">Demo Video</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link to your project demo video
            </p>
            <span className="text-xs text-gray-500">(Coming Soon)</span>
          </div>
        </div>
      </div>

      {/* URL Inputs for GitHub/Video */}
      {data.uploadType === 'github' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={data.githubUrl}
            onChange={(e) => onUpdate({ githubUrl: e.target.value })}
            placeholder="https://github.com/username/repository"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {data.uploadType === 'video' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="url"
            value={data.videoUrl}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".md,.zip"
        onChange={handleFileInput}
        multiple
      />

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all
            ${canProceed
              ? 'bg-primary text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Generate AI Content →
        </button>
      </div>
    </div>
  )
}