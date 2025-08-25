import { useEffect, useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { Project, ProductZone } from '@/types'
import { ProductsService } from '@/lib/products'

export interface ProjectGridProps {
  products: Project[]
  activeZone?: ProductZone
  sortBy?: 'time' | 'price' | 'likes' | 'views'
  initialOpenProductId?: string
  loading?: boolean
}

export function ProjectGrid({ products, activeZone = 'all', sortBy = 'time', initialOpenProductId, loading: externalLoading = false }: ProjectGridProps) {
  const [fallbackProducts, setFallbackProducts] = useState<Project[]>([])
  const [internalLoading, setInternalLoading] = useState(false)

  // 如果没有收到数据，直接在这里获取（使用同样的筛选条件）
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setInternalLoading(true)
      
      const sortField = sortBy === 'time' ? 'created_at' : 
                       sortBy === 'price' ? 'price' :
                       sortBy === 'likes' ? 'likes' : 'views'
      
      ProductsService.getProducts({
        zone: activeZone,
        sortBy: sortField,
        sortOrder: 'desc',
        limit: 50
      }).then(data => {
        setFallbackProducts(data)
        setInternalLoading(false)
      }).catch(error => {
        console.error('ProjectGrid failed to fetch products:', error)
        setInternalLoading(false)
      })
    }
  }, [products, activeZone, sortBy])

  // 使用传入的数据或者自己获取的数据
  const finalProducts = Array.isArray(products) && products.length > 0 ? products : fallbackProducts
  
  // 如果正在加载
  if (externalLoading || internalLoading) {
    return (
      <div className="px-6 py-8">
        {/* 骨架屏加载动画 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-full max-w-sm">
              <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                {/* 图片占位 */}
                <div className="w-full h-48 bg-gray-700/70 rounded-lg mb-4 animate-pulse"></div>
                
                {/* 标题占位 */}
                <div className="space-y-3">
                  <div className="h-6 bg-gray-700/70 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
                </div>
                
                {/* 标签占位 */}
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-700/50 rounded-full w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-700/50 rounded-full w-12 animate-pulse"></div>
                </div>
                
                {/* 底部信息占位 */}
                <div className="flex justify-between items-center mt-6">
                  <div className="h-4 bg-gray-700/50 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 中心加载指示器 */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-sm font-medium">Loading products...</span>
          </div>
        </div>
      </div>
    )
  }

  // 如果没有产品
  if (!Array.isArray(finalProducts) || finalProducts.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="text-center text-white">
          <p>No products found in this category.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
        {finalProducts.map((project, index) => (
          <div 
            key={project.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProjectCard 
              {...project} 
              initialOpen={initialOpenProductId === project.id}
            />
          </div>
        ))}
      </div>
    </div>
  )
}