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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const sortField = sortBy === 'time' ? 'created_at' : 
                         sortBy === 'price' ? 'price' :
                         sortBy === 'likes' ? 'likes' : 'views'
        
        const data = await ProductsService.getProducts({
          sortBy: sortField,
          sortOrder: sortBy === 'price' ? 'desc' : 'desc', // 价格和其他都是降序
          limit: 50
        })
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [sortBy])

  const handleFilterChange = (filter: 'time' | 'price' | 'likes' | 'views') => {
    setSortBy(filter)
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
          activeFilter={sortBy}
        />
        <ProjectGrid projects={products} />
      </div>
    </div>
  )
}
