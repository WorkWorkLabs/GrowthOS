'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { ControlBar } from '@/components/ControlBar'
import { ProjectGrid } from '@/components/ProjectGrid'
import { ProductsService } from '@/lib/products'
import { Project } from '@/types'

// Force dynamic rendering due to auth usage in Header
export const dynamic = 'force-dynamic'

export default function Home() {
  const [products, setProducts] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'likes' | 'views'>('time')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

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
      setLoading(true)
      try {
        const sortField = sortBy === 'time' ? 'created_at' : 
                         sortBy === 'price' ? 'price' :
                         sortBy === 'likes' ? 'likes' : 'views'
        
        let data: Project[]
        if (debouncedSearchQuery.trim()) {
          // 如果有搜索查询，使用搜索功能
          data = await ProductsService.searchProducts(debouncedSearchQuery, {
            sortBy: sortField,
            sortOrder: 'desc',
            limit: 50
          })
        } else {
          // 否则获取所有产品
          data = await ProductsService.getProducts({
            sortBy: sortField,
            sortOrder: 'desc',
            limit: 50
          })
        }
        
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    }

    loadProducts()
  }, [sortBy, debouncedSearchQuery])

  const handleFilterChange = (filter: 'time' | 'price' | 'likes' | 'views') => {
    setSortBy(filter)
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
        />
        <ProjectGrid projects={products} />
      </div>
    </div>
  )
}
