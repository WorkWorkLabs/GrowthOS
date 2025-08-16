'use client'

import { useEffect, useState, useCallback } from 'react'
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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const sortField = sortBy === 'time' ? 'created_at' : 
                         sortBy === 'price' ? 'price' :
                         sortBy === 'likes' ? 'likes' : 'views'
        
        let data: Project[]
        if (searchQuery.trim()) {
          // 如果有搜索查询，使用搜索功能
          data = await ProductsService.searchProducts(searchQuery, {
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
      }
    }

    loadProducts()
  }, [sortBy, searchQuery])

  const handleFilterChange = (filter: 'time' | 'price' | 'likes' | 'views') => {
    setSortBy(filter)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setLoading(true)
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
        />
        <ProjectGrid projects={products} />
      </div>
    </div>
  )
}
