'use client'

import { Header } from '@/components/Header'
import { ControlBar } from '@/components/ControlBar'
import { ProjectGrid } from '@/components/ProjectGrid'

// 模拟项目数据
const mockProjects = [
  {
    id: '1',
    name: 'Project Name',
    author: '@Username or Wallet Address',
    description: '来自中原一群伙伴　结卢东南山\n尘缘难尽默对寒窗　龙珠合十在胸膛\n秉承千年卓绝意志　潜修东南山\n宁静致远风雨声响　不绝如缕持香案\n香火在雨中烧几十个暑和寒　血脉相连一方苦行山\n龙珠九转十二金光　返指五岳和三江\n香火在雨中烧几十个暑和寒　血脉相连一方苦行山\n龙珠九转十二金光　返指五岳和三江',
    price: 89.64,
    currency: 'BTC',
    tags: [
      { label: 'AI', type: 'ai' as const },
      { label: 'Crypto', type: 'crypto' as const },
      { label: 'Education', type: 'education' as const },
    ]
  },
  // 复制7个项目形成4x2网格
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `${i + 2}`,
    name: 'Project Name',
    author: '@Username or Wallet Address',
    description: '来自中原一群伙伴　结卢东南山\n尘缘难尽默对寒窗　龙珠合十在胸膛\n秉承千年卓绝意志　潜修东南山\n宁静致远风雨声响　不绝如缕持香案\n香火在雨中烧几十个暑和寒　血脉相连一方苦行山\n龙珠九转十二金光　返指五岳和三江\n香火在雨中烧几十个暑和寒　血脉相连一方苦行山\n龙珠九转十二金光　返指五岳和三江',
    price: 89.64,
    currency: 'BTC',
    tags: [
      { label: 'AI', type: 'ai' as const },
      { label: 'Crypto', type: 'crypto' as const },
      { label: 'Education', type: 'education' as const },
    ]
  }))
]

export default function Home() {
  const handleFilterChange = (filter: string) => {
    console.log('Filter changed:', filter)
  }

  const handleCreateProject = () => {
    console.log('Create project clicked')
  }

  return (
    <div className="min-h-screen bg-bg-blue">
      <div className="space-y-2">
        <Header />
        <ControlBar 
          onFilterChange={handleFilterChange}
          onCreateProject={handleCreateProject}
        />
        <ProjectGrid projects={mockProjects} />
      </div>
    </div>
  )
}
