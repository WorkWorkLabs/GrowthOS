'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Tag {
  label: string
  type: 'ai' | 'crypto' | 'education'
}

interface ProjectCardProps {
  name: string
  author: string
  description: string
  price: number
  currency: string
  image?: string
  tags: Tag[]
}

const tagColors = {
  ai: 'bg-[#FFDCF9] text-tag-ai',
  crypto: 'bg-[#C7FFCC] text-tag-crypto', 
  education: 'bg-[#ABD5FF] text-tag-education',
}

export function ProjectCard({ 
  name, 
  author, 
  description, 
  price, 
  currency,
  image,
  tags 
}: ProjectCardProps) {
  const backgroundImage = '/project-image.png'
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  const handleCardClick = () => {
    setShowModal(true)
  }
  
  const handleCloseModal = () => {
    setShowModal(false)
  }
  
  const modalContent = showModal ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
      <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* 模态框头部 */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary mb-1">{name}</h2>
            <p className="text-text-tertiary text-sm">{author}</p>
            <div className="mt-2">
              <span className="text-primary text-lg font-bold font-brand mr-1">{currency}</span>
              <span className="text-primary text-2xl font-bold font-brand">{price}</span>
            </div>
          </div>
          <button 
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light ml-4"
          >
            ×
          </button>
        </div>
        
        {/* 模态框内容 */}
        <div className="p-4">
          {/* 背景图片 */}
          <div 
            className="w-full h-64 rounded-lg mb-4"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* 完整描述 */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">项目描述</h3>
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
          
          {/* 标签 */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium shadow-tag
                    ${tagColors[tag.type]}
                  `}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null
  
  return (
    <div 
      className="w-[300px] h-[380px] bg-bg-primary rounded-lg shadow-card overflow-hidden flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 背景图片区域 - 顶部更高 */}
      <div 
        className="h-[200px] w-full rounded-t-lg"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* 项目信息区域 - 底部更扁 */}
      <div className="h-[180px] px-4 py-3 bg-white flex flex-col">
        {/* 顶部区域：项目名+作者 vs 价格 */}
        <div className="flex items-start justify-between mb-2">
          {/* 左侧：项目名称和作者 */}
          <div className="flex-1 mr-3">
            <h3 className="text-text-primary text-base font-bold truncate leading-tight mb-0.5">{name}</h3>
            <p className="text-text-tertiary text-[10px] truncate leading-tight">{author}</p>
          </div>
          
          {/* 右侧：价格 */}
          <div className="text-right shrink-0">
            <div className="leading-tight">
              <span className="text-primary text-base font-bold font-brand mr-1">{currency}</span>
              <span className="text-primary text-2xl font-bold font-brand">{price}</span>
            </div>
          </div>
        </div>

        {/* 描述区域 - 使用省略号 */}
        <div className="flex-1 mb-2 overflow-hidden">
          <p className="text-text-primary text-xs leading-relaxed text-left whitespace-pre-line line-clamp-4">
            {description}
          </p>
          <div className="text-center mt-1">
            <span className="text-primary text-xs cursor-pointer hover:underline">
              点击查看详情
            </span>
          </div>
        </div>

        {/* 标签 - 固定在底部 */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`
                px-2 py-0.5 rounded-lg text-xs font-medium shadow-tag
                ${tagColors[tag.type]}
              `}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* 使用Portal将模态框渲染到body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </div>
  )
}