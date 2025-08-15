'use client'

import { useState } from 'react'

type FilterType = 'time' | 'price' | 'likes' | 'views'

interface ControlBarProps {
  onFilterChange?: (filter: FilterType) => void
  onCreateProject?: () => void
}

export function ControlBar({ onFilterChange, onCreateProject }: ControlBarProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('time')

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  return (
    <div className="pl-20 pr-6 py-3 flex items-center gap-4">
      {/* Create My Project Button */}
      <button 
        onClick={onCreateProject}
        className="bg-primary text-text-inverse px-4 py-2 rounded-md text-md font-medium shadow-button hover:bg-blue-500 transition-colors"
      >
        Create My Project
      </button>

      {/* Filter Buttons */}
      <div className="bg-white rounded-md p-1 shadow-button flex">
        {[
          { key: 'time' as FilterType, label: 'Time' },
          { key: 'price' as FilterType, label: 'Price' },
          { key: 'likes' as FilterType, label: 'Likes' },
          { key: 'views' as FilterType, label: 'Views' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterClick(key)}
            className={`
              px-3 py-1 text-sm font-medium rounded transition-colors
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
    </div>
  )
}