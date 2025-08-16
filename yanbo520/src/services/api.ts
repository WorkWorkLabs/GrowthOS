import { Web3Product, PaymentTransaction, UserProfile } from '@/types/web3'

// 模拟API服务 - 黑客松阶段可以用本地数据，后期替换为真实API
class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

  async getProducts(filters?: {
    category?: string
    search?: string
    sort?: 'price' | 'rating' | 'newest'
    limit?: number
    offset?: number
  }): Promise<Web3Product[]> {
    // 黑客松阶段返回模拟数据
    return this.getMockProducts()
  }

  async getProduct(id: string): Promise<Web3Product | null> {
    const products = await this.getMockProducts()
    return products.find(p => p.id === id) || null
  }

  async createProduct(product: Partial<Web3Product>): Promise<Web3Product> {
    // 黑客松阶段存储到localStorage
    const newProduct: Web3Product = {
      id: Date.now().toString(),
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    } as Web3Product

    const products = await this.getMockProducts()
    products.push(newProduct)
    localStorage.setItem('workwork_products', JSON.stringify(products))
    
    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Web3Product>): Promise<Web3Product> {
    const products = await this.getMockProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Product not found')

    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem('workwork_products', JSON.stringify(products))
    
    return products[index]
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    // 黑客松阶段返回模拟用户数据
    return {
      walletAddress,
      username: 'Digital Nomad',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + walletAddress,
      bio: 'Building the future of work',
      stats: {
        totalSales: 1250,
        totalProducts: 8,
        rating: 4.8,
        joinedAt: '2024-01-15'
      },
      verification: {
        isVerified: true,
        kycCompleted: false,
        badgeLevel: 'silver'
      },
      social: {
        twitter: '@digitalnomad',
        website: 'https://example.com'
      }
    }
  }

  async generateAIContent(prompt: string, type: 'title' | 'description' | 'keywords' | 'social'): Promise<string> {
    // 黑客松阶段使用模拟AI响应
    const mockResponses = {
      title: '🚀 Ultimate Crypto Trading Course - From Zero to Pro',
      description: 'Master cryptocurrency trading with this comprehensive course. Learn technical analysis, risk management, and advanced trading strategies from industry experts.',
      keywords: 'crypto, trading, blockchain, investment, DeFi, NFT, web3',
      social: '🔥 Just launched my new crypto trading course! Learn how to navigate the markets like a pro. Use code LAUNCH50 for 50% off! #crypto #trading #education'
    }
    
    return mockResponses[type] || 'AI generated content'
  }

  private async getMockProducts(): Promise<Web3Product[]> {
    // 先尝试从localStorage获取
    const stored = localStorage.getItem('workwork_products')
    if (stored) {
      return JSON.parse(stored)
    }

    // 返回默认模拟数据
    const mockProducts: Web3Product[] = [
      {
        id: '1',
        title: 'Complete Web3 Development Course',
        description: 'Learn to build decentralized applications from scratch. This comprehensive course covers Solidity, React, and smart contract development.',
        price: 299,
        currency: 'USDC',
        category: 'course',
        files: [
          { name: 'course-videos.zip', url: '/files/course.zip', type: 'application/zip' },
          { name: 'source-code.zip', url: '/files/code.zip', type: 'application/zip' }
        ],
        coverImage: '/project-image.png',
        seller: {
          walletAddress: '0x742d35Cc6634C0532925a3b8D41B2C02D32A8efb',
          username: 'Web3 Master',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=web3master',
          verified: true
        },
        aiGenerated: {
          keywords: ['web3', 'blockchain', 'solidity', 'dapp', 'smart contracts'],
          socialPosts: {
            twitter: '🚀 Just launched my complete Web3 dev course! Perfect for developers wanting to enter the blockchain space. #Web3 #Blockchain #Development',
            linkedin: 'Excited to announce my comprehensive Web3 development course, covering everything from smart contracts to full-stack dApps.'
          },
          seoMeta: {
            title: 'Complete Web3 Development Course - Learn Blockchain Programming',
            description: 'Master Web3 development with our comprehensive course covering Solidity, smart contracts, and dApp development.',
            keywords: ['web3', 'blockchain', 'solidity', 'smart contracts', 'dapp development']
          }
        },
        stats: {
          views: 1250,
          purchases: 89,
          rating: 4.8,
          reviews: 45
        },
        blockchain: {
          network: 'base'
        },
        status: 'published',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T15:45:00Z'
      },
      {
        id: '2',
        title: 'Crypto Trading Masterclass',
        description: 'Professional trading strategies and risk management techniques used by institutional traders.',
        price: 199,
        currency: 'USDT',
        category: 'crypto',
        files: [
          { name: 'trading-guide.pdf', url: '/files/guide.pdf', type: 'application/pdf' }
        ],
        coverImage: '/project-image.png',
        seller: {
          walletAddress: '0x123...abc',
          username: 'Crypto Trader Pro',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trader',
          verified: true
        },
        aiGenerated: {
          keywords: ['crypto', 'trading', 'investment', 'DeFi', 'technical analysis'],
          socialPosts: {
            twitter: '📈 New trading masterclass is live! Learn the strategies that helped me achieve 300% returns. #CryptoTrading #Investment'
          },
          seoMeta: {
            title: 'Crypto Trading Masterclass - Professional Trading Strategies',
            description: 'Learn professional cryptocurrency trading strategies and risk management from experienced traders.',
            keywords: ['crypto trading', 'cryptocurrency', 'investment', 'trading strategies']
          }
        },
        stats: {
          views: 890,
          purchases: 156,
          rating: 4.9,
          reviews: 78
        },
        blockchain: {
          network: 'polygon'
        },
        status: 'published',
        createdAt: '2024-01-10T08:20:00Z',
        updatedAt: '2024-01-18T12:30:00Z'
      }
    ]

    localStorage.setItem('workwork_products', JSON.stringify(mockProducts))
    return mockProducts
  }
}

export const apiService = new ApiService()