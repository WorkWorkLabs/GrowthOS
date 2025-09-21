'use client'

import { useState } from 'react'
import { FilterType, ProductZone } from '@/types'
import { FILTER_OPTIONS } from '@/lib/constants'
import { Search, X, Loader2 } from 'lucide-react'
import { CategoryZones } from './CategoryZones'

interface ControlBarProps {
  onFilterChange?: (filter: FilterType) => void
  onCreateProject?: () => void
  onSearch?: (query: string) => void
  activeFilter?: FilterType
  isSearching?: boolean
  // 新增专区相关props
  activeZone?: ProductZone
  onZoneChange?: (zone: ProductZone) => void
  onBananaGenerate?: () => void
}

export function ControlBar({ onFilterChange, onCreateProject, onSearch, activeFilter = 'time', isSearching = false, activeZone = 'all', onZoneChange, onBananaGenerate }: ControlBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleFilterClick = (filter: FilterType) => {
    onFilterChange?.(filter)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearch?.('')
  }

  return (
    <div className="px-4 md:px-6 lg:px-20 py-3 space-y-3">
      {/* 第一行：Create按钮和搜索 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={onCreateProject}
            className="bg-primary text-text-inverse px-4 py-2 rounded-md text-sm font-medium shadow-button hover:bg-blue-500 transition-colors"
          >
            Create
          </button>

          <button 
            onClick={onBananaGenerate}
            className="bg-yellow-400 text-black px-3 py-2 rounded-md text-sm font-medium shadow-button hover:bg-yellow-500 transition-colors"
          >
            🍌
          </button>
        </div>

        {/* Search Box */}
        <div className={`
          relative flex items-center bg-white rounded-lg shadow-button transition-all duration-200 flex-1
          ${isSearchFocused ? 'ring-2 ring-primary ring-opacity-50' : ''}
        `}>
          {isSearching && searchQuery ? (
            <Loader2 className="w-4 h-4 text-primary absolute left-3 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2 text-sm border-0 rounded-lg focus:outline-none focus:ring-0 bg-transparent text-text-primary placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 第二行：筛选和分类 */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter Options */}
        <div className="bg-white rounded-md p-1 shadow-button flex overflow-x-auto flex-shrink-0">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterClick(key)}
              className={`
                px-3 py-1 text-sm font-medium rounded transition-colors whitespace-nowrap
                ${activeFilter === key 
                  ? 'bg-gray-200 text-text-primary' 
                  : 'text-text-primary hover:bg-gray-100'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 分类选择器 */}
        <div className="flex-shrink-0">
          <CategoryZones
            activeZone={activeZone}
            onZoneChange={onZoneChange}
          />
        </div>
      </div>
    </div>
  )
}