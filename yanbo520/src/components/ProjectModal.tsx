'use client'

import { createPortal } from 'react-dom'
import { Project } from '@/types'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'

interface ProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  mounted: boolean
}

export function ProjectModal({ project, isOpen, onClose, mounted }: ProjectModalProps) {
  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary mb-1">{project.name}</h2>
            <p className="text-text-tertiary text-sm">{project.author}</p>
            <div className="mt-2">
              <span className="text-primary text-lg font-bold font-brand mr-1">{project.currency}</span>
              <span className="text-primary text-2xl font-bold font-brand">{project.price}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light ml-4"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div 
            className="w-full h-64 rounded-lg mb-4"
            style={{
              backgroundImage: `url(${project.image || DEFAULT_PROJECT_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">项目描述</h3>
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-lg text-sm font-medium shadow-tag ${TAG_COLORS[tag.type]}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}