export type TagType = 'ai' | 'crypto' | 'education'

export interface Tag {
  label: string
  type: TagType
}

export interface Project {
  id: string
  name: string
  author: string
  description: string
  price: number
  currency: string
  image?: string
  tags: Tag[]
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