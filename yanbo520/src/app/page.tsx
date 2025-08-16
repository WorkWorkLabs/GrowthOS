'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { ControlBar } from '@/components/ControlBar'
import { ProjectGrid } from '@/components/ProjectGrid'
import { apiService } from '@/services/api'
import { Web3Product } from '@/types/web3'

// 转换Web3Product到Project格式的辅助函数
const convertWeb3ProductToProject = (product: Web3Product) => ({
  id: product.id,
  name: product.title,
  author: product.seller.username,
  description: product.description,
  price: product.price,
  currency: product.currency,
  image: product.coverImage,
  tags: [{ label: product.category, type: product.category as any }]
})

export default function Home() {
  const [products, setProducts] = useState<Web3Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiService.getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleFilterChange = (filter: string) => {
    console.log('Filter changed:', filter)
  }

  const handleCreateProject = () => {
    console.log('Create project clicked')
  }

  const projectsForGrid = products.map(convertWeb3ProductToProject)

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
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
        />
        <ProjectGrid projects={projectsForGrid} />
      </div>
    </div>
  )
}
