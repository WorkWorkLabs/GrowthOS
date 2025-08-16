'use client'

import { FilterType } from '@/types'
import { FILTER_OPTIONS } from '@/lib/constants'

interface ControlBarProps {
  onFilterChange?: (filter: FilterType) => void
  onCreateProject?: () => void
  activeFilter?: FilterType
}

export function ControlBar({ onFilterChange, onCreateProject, activeFilter = 'time' }: ControlBarProps) {

  const handleFilterClick = (filter: FilterType) => {
    onFilterChange?.(filter)
  }

  return (
    <div className="pl-20 pr-6 py-3 flex items-center gap-4">
      <button 
        onClick={onCreateProject}
        className="bg-primary text-text-inverse px-4 py-2 rounded-md text-md font-medium shadow-button hover:bg-blue-500 transition-colors"
      >
Create Project
      </button>

      <div className="bg-white rounded-md p-1 shadow-button flex">
        {FILTER_OPTIONS.map(({ key, label }) => (
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