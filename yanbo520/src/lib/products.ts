import { supabase } from './supabase'
import { Project, Tag } from '@/types'

export interface ProductsFilter {
  category?: string
  sortBy?: 'created_at' | 'price' | 'views' | 'likes' | 'rating'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class ProductsService {
  // 获取所有产品
  static async getProducts(filter: ProductsFilter = {}): Promise<Project[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')

      // 应用过滤器
      if (filter.category) {
        query = query.eq('category', filter.category)
      }

      // 应用排序
      if (filter.sortBy) {
        query = query.order(filter.sortBy, { 
          ascending: filter.sortOrder === 'asc' 
        })
      } else {
        // 默认按创建时间倒序
        query = query.order('created_at', { ascending: false })
      }

      // 应用分页
      if (filter.limit) {
        query = query.limit(filter.limit)
      }
      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return []
      }

      return data?.map(item => ProductsService.transformProduct(item)) || []
    } catch (error) {
      console.error('Error in getProducts:', error)
      return []
    }
  }

  // 根据ID获取单个产品
  static async getProductById(id: string): Promise<Project | null> {
    if (!supabase) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return data ? ProductsService.transformProduct(data) : null
    } catch (error) {
      console.error('Error in getProductById:', error)
      return null
    }
  }

  // 增加产品浏览次数
  static async incrementViews(productId: string): Promise<void> {
    if (!supabase) return

    try {
      await supabase.rpc('increment_product_views', {
        product_id: productId
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // 切换产品点赞状态
  static async toggleLike(productId: string, isLiked: boolean): Promise<void> {
    if (!supabase) return

    try {
      await supabase.rpc('toggle_product_like', {
        product_id: productId,
        increment: !isLiked // 如果当前已点赞，则取消（减少）；否则增加
      })
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // 获取产品类别列表
  static async getCategories(): Promise<string[]> {
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      // 去重并排序
      const categories = [...new Set(data.map(item => item.category))]
      return categories.filter(Boolean).sort()
    } catch (error) {
      console.error('Error in getCategories:', error)
      return []
    }
  }

  // 搜索产品
  static async searchProducts(query: string, filter: ProductsFilter = {}): Promise<Project[]> {
    if (!supabase || !query.trim()) {
      return this.getProducts(filter)
    }

    try {
      let dbQuery = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,author_name.ilike.%${query}%`)

      // 应用过滤器
      if (filter.category) {
        dbQuery = dbQuery.eq('category', filter.category)
      }

      // 应用排序
      if (filter.sortBy) {
        dbQuery = dbQuery.order(filter.sortBy, { 
          ascending: filter.sortOrder === 'asc' 
        })
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false })
      }

      // 应用分页
      if (filter.limit) {
        dbQuery = dbQuery.limit(filter.limit)
      }

      const { data, error } = await dbQuery

      if (error) {
        console.error('Error searching products:', error)
        return []
      }

      return data?.map(item => ProductsService.transformProduct(item)) || []
    } catch (error) {
      console.error('Error in searchProducts:', error)
      return []
    }
  }

  // 转换数据库数据为前端使用的格式
  static transformProduct(dbProduct: any): Project {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      author: dbProduct.author_name,
      author_id: dbProduct.author_id,
      author_name: dbProduct.author_name,
      description: dbProduct.description,
      price: parseFloat(dbProduct.price),
      currency: dbProduct.currency,
      category: dbProduct.category,
      image: dbProduct.image_url,
      image_url: dbProduct.image_url,
      tags: ProductsService.parseTags(dbProduct.tags),
      views: dbProduct.views || 0,
      likes: dbProduct.likes || 0,
      rating: parseFloat(dbProduct.rating) || 0,
      verified: true, // 可以基于作者验证状态设置
      status: dbProduct.status,
      created_at: dbProduct.created_at,
      updated_at: dbProduct.updated_at
    }
  }

  // 解析标签JSON数据
  static parseTags(tagsJson: any): Tag[] {
    if (!tagsJson) return []
    
    try {
      if (typeof tagsJson === 'string') {
        return JSON.parse(tagsJson)
      }
      return Array.isArray(tagsJson) ? tagsJson : []
    } catch (error) {
      console.error('Error parsing tags:', error)
      return []
    }
  }
}