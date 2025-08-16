'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { ControlBar } from '@/components/ControlBar'
import { ProjectGrid } from '@/components/ProjectGrid'
import { apiService } from '@/services/api'
import { Web3Product } from '@/types/web3'

// Convert Web3Product to Project format helper function
const convertWeb3ProductToProject = (product: Web3Product) => {
  const converted = {
    id: product.id,
    name: product.title,
    author: product.seller.username,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.coverImage,
    tags: [{ label: product.category, type: product.category as 'ai' | 'crypto' | 'education' }],
    views: product.stats?.views || 0,
    likes: product.stats?.reviews || 0, // Use reviews as likes
    rating: product.stats?.rating || 0,
    verified: product.seller?.verified || false
  }
  return converted
}

export default function Home() {
  const [products, setProducts] = useState<Web3Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'likes' | 'views'>('time')

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

  const handleFilterChange = (filter: 'time' | 'price' | 'likes' | 'views') => {
    setSortBy(filter)
  }

  const handleCreateProject = () => {
    window.location.href = '/create'
  }

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price // Price: high to low
      case 'likes':
        return (b.stats?.reviews || 0) - (a.stats?.reviews || 0) // Sort by reviews (likes)
      case 'views':
        return (b.stats?.views || 0) - (a.stats?.views || 0) // Sort by views
      case 'time':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() // Sort by time (newest first)
    }
  })

  const projectsForGrid = sortedProducts.map(convertWeb3ProductToProject)

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
        <ProjectGrid projects={projectsForGrid} />
      </div>
    </div>
  )
}
