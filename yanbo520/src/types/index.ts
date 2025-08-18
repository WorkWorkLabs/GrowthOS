export type TagType = 'ai' | 'crypto' | 'education'

export interface Tag {
  label: string
  type: TagType
}

export interface ProductImage {
  url: string
  alt: string
}

export interface Project {
  id: string
  name: string
  author: string
  author_id?: string
  author_name?: string
  description: string
  price: number
  currency: string
  category?: string
  image?: string // 保留用于向后兼容
  image_url?: string // 保留用于向后兼容
  images?: ProductImage[] // 新的多图字段
  tags: Tag[]
  views?: number
  likes?: number
  rating?: number
  verified?: boolean
  status?: 'active' | 'inactive' | 'deleted'
  created_at?: string
  updated_at?: string
  product_type?: 'product' | 'subscription'
  subscription_period?: 'monthly' | 'quarterly' | 'yearly'
  subscription_duration?: number
  subscription_price_per_period?: number
}

export type FilterType = 'time' | 'price' | 'likes' | 'views'

export interface User {
  username: string
  walletAddress: string
  avatar: string
}

export interface DropdownMenuItem {
  id: string
  label: string
  action: () => void
}