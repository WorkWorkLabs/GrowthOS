'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  GraduationCap, 
  Package, 
  Headphones, 
  Calendar, 
  Building2,
  Grid3X3,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import { ProductZone } from '@/types'

interface CategoryZonesProps {
  activeZone?: ProductZone
  onZoneChange?: (zone: ProductZone) => void
}

const ZONE_CONFIG = [
  {
    key: 'all' as const,
    label: 'All',
    icon: Grid3X3,
    description: 'Browse everything',
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  },
  {
    key: 'courses' as const,
    label: 'Courses',
    icon: GraduationCap,
    description: 'Learn & develop skills',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  {
    key: 'products' as const,
    label: 'Products',
    icon: Package,
    description: 'Tools & templates',
    color: 'bg-green-100 text-green-700 hover:bg-green-200'
  },
  {
    key: 'services' as const,
    label: 'Services',
    icon: Headphones,
    description: 'Professional help',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    key: 'events' as const,
    label: 'Events',
    icon: Calendar,
    description: 'Conferences & meetups',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    key: 'accommodation' as const,
    label: 'Accommodation',
    icon: Building2,
    description: 'Spaces & stays',
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
  }
]

export function CategoryZones({ activeZone = 'all', onZoneChange }: CategoryZonesProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ZONE_CONFIG.length)
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldCollapse, setShouldCollapse] = useState(false)
  
  const handleZoneClick = (zone: ProductZone) => {
    onZoneChange?.(zone)
    setIsDropdownOpen(false)
  }

  // 动态计算可见按钮数量
  useEffect(() => {
    const calculateVisibleButtons = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const containerWidth = container.offsetWidth
      const buttonWidth = 120 // 估计每个按钮的宽度
      const moreButtonWidth = 50 // "More" 按钮宽度
      const padding = 8 // 容器内边距
      
      const availableWidth = containerWidth - padding * 2
      const maxButtonsWithMore = Math.floor((availableWidth - moreButtonWidth) / buttonWidth)
      const maxButtonsWithoutMore = Math.floor(availableWidth / buttonWidth)
      
      if (maxButtonsWithoutMore >= ZONE_CONFIG.length) {
        // 能显示所有按钮
        setVisibleCount(ZONE_CONFIG.length)
        setShouldCollapse(false)
      } else if (maxButtonsWithMore >= 2) {
        // 显示部分按钮 + More
        setVisibleCount(maxButtonsWithMore)
        setShouldCollapse(true)
      } else {
        // 空间太小，全部折叠
        setVisibleCount(0)
        setShouldCollapse(true)
      }
    }

    calculateVisibleButtons()
    
    const resizeObserver = new ResizeObserver(calculateVisibleButtons)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => resizeObserver.disconnect()
  }, [])

  const activeZoneConfig = ZONE_CONFIG.find(zone => zone.key === activeZone)
  const visibleZones = ZONE_CONFIG.slice(0, visibleCount)
  const hiddenZones = ZONE_CONFIG.slice(visibleCount)

  return (
    <>
      {/* 桌面端：动态响应显示 */}
      <div ref={containerRef} className="bg-white rounded-md p-1 shadow-button hidden md:flex items-center relative">
        {/* 可见按钮 */}
        {visibleZones.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleZoneClick(key)}
            className={`
              px-3 py-1 text-sm font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap
              ${activeZone === key 
                ? 'bg-gray-200 text-text-primary' 
                : 'text-text-primary hover:bg-gray-100'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
        
        {/* More 按钮 - 有隐藏项时显示 */}
        {shouldCollapse && hiddenZones.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-2 py-1 text-sm font-medium rounded transition-colors flex items-center gap-1 text-text-primary hover:bg-gray-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {/* 下拉菜单 */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border z-[100] min-w-[200px] max-w-[250px]">
                {hiddenZones.map(({ key, label, icon: Icon, description }) => (
                  <button
                    key={key}
                    onClick={() => handleZoneClick(key)}
                    className={`
                      w-full px-3 py-3 text-left flex items-start gap-2 hover:bg-gray-50 transition-colors text-sm
                      ${activeZone === key ? 'bg-gray-100' : ''}
                      ${key === hiddenZones[0].key ? 'rounded-t-md' : ''}
                      ${key === hiddenZones[hiddenZones.length - 1].key ? 'rounded-b-md' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block truncate">{label}</span>
                      <span className="text-xs text-gray-500 block truncate">{description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 点击外部关闭桌面端下拉菜单 */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* 移动端：下拉菜单 */}
      <div className="bg-white rounded-md shadow-button md:hidden relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-4 py-2 text-sm font-medium text-text-primary flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            {activeZoneConfig?.icon && <activeZoneConfig.icon className="w-4 h-4" />}
            <span>{activeZoneConfig?.label || 'Select Category'}</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 下拉选项 */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border z-[100] w-[280px]">
            {ZONE_CONFIG.map(({ key, label, icon: Icon, description }) => (
              <button
                key={key}
                onClick={() => handleZoneClick(key)}
                className={`
                  w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-gray-50 transition-colors
                  ${activeZone === key ? 'bg-gray-100' : ''}
                  ${key === ZONE_CONFIG[0].key ? 'rounded-t-md' : ''}
                  ${key === ZONE_CONFIG[ZONE_CONFIG.length - 1].key ? 'rounded-b-md' : ''}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{label}</div>
                  <div className="text-xs text-text-secondary">{description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 点击外部关闭下拉菜单 */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </>
  )
}