export type TagType = 'ai' | 'crypto' | 'education'

export interface Tag {
  label: string
  type: TagType
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
  image?: string
  image_url?: string
  tags: Tag[]
  views?: number
  likes?: number
  rating?: number
  verified?: boolean
  status?: 'active' | 'inactive' | 'deleted'
  created_at?: string
  updated_at?: string
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