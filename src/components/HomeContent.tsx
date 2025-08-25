'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { ControlBar } from '@/components/ControlBar'
import { ProjectGrid } from '@/components/ProjectGrid'
import { ProductsService } from '@/lib/products'
import { Project, ProductZone } from '@/types'

export function HomeContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'likes' | 'views'>('time')
  const [activeZone, setActiveZone] = useState<ProductZone>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // 数据缓存
  const [dataCache, setDataCache] = useState<Map<string, Project[]>>(new Map())
  
  // 获取URL参数中的产品ID
  const initialOpenProductId = searchParams.get('product')

  // 防抖处理搜索查询
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true)
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms 延迟

    return () => clearTimeout(timer)
  }, [searchQuery, debouncedSearchQuery])

  useEffect(() => {
    const loadProducts = async () => {
      const sortField = sortBy === 'time' ? 'created_at' : 
                       sortBy === 'price' ? 'price' :
                       sortBy === 'likes' ? 'likes' : 'views'
      
      // 生成缓存键
      const cacheKey = `${activeZone}-${sortField}-${debouncedSearchQuery}`
      
      // 检查缓存
      if (dataCache.has(cacheKey)) {
        const cachedData = dataCache.get(cacheKey)!
        setProducts(cachedData)
        setLoading(false)
        setIsSearching(false)
        return
      }
      
      // 如果不是初始加载，使用过渡动画
      if (!loading) {
        setIsTransitioning(true)
      }
      
      try {
        let data: Project[]
        if (debouncedSearchQuery.trim()) {
          // 如果有搜索查询，使用搜索功能
          data = await ProductsService.searchProducts(debouncedSearchQuery, {
            zone: activeZone,
            sortBy: sortField,
            sortOrder: 'desc',
            limit: 50
          })
        } else {
          // 否则获取所有产品
          data = await ProductsService.getProducts({
            zone: activeZone,
            sortBy: sortField,
            sortOrder: 'desc',
            limit: 50
          })
        }
        
        // 确保data是数组，如果不是则使用空数组
        const finalData = Array.isArray(data) ? data : []
        
        // 缓存数据
        setDataCache(prev => new Map(prev.set(cacheKey, finalData)))
        
        // 如果是过渡状态，添加小延迟让动画更平滑
        if (isTransitioning) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        setProducts(finalData)
      } catch (error) {
        console.error('Failed to load products:', error)
        // 发生错误时设置为空数组
        setProducts([])
      } finally {
        setLoading(false)
        setIsSearching(false)
        setIsTransitioning(false)
      }
    }

    loadProducts()
  }, [sortBy, activeZone, debouncedSearchQuery]) // 只依赖真正的触发条件

  const handleFilterChange = (filter: 'time' | 'price' | 'likes' | 'views') => {
    setSortBy(filter)
  }

  const handleZoneChange = (zone: ProductZone) => {
    setActiveZone(zone)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // 不再在这里设置loading，让防抖机制处理
  }

  const handleCreateProject = () => {
    window.location.href = '/create'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-blue">
      <div className="space-y-2">
        <Header />
        <ControlBar 
          onFilterChange={handleFilterChange}
          onCreateProject={handleCreateProject}
          onSearch={handleSearch}
          activeFilter={sortBy}
          isSearching={isSearching}
          activeZone={activeZone}
          onZoneChange={handleZoneChange}
        />
        <ProjectGrid 
          products={products || []} 
          activeZone={activeZone}
          sortBy={sortBy}
          loading={isTransitioning}
        />
      </div>
    </div>
  )
}