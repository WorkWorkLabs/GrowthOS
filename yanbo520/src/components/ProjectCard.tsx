'use client'

import type { Project } from '@/types'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'
import { useModal } from '@/hooks/useModal'
import { ProjectModal } from './ProjectModal'

export function ProjectCard(project: Project) {
  const modal = useModal()

  return (
    <>
      <div 
        className="w-[300px] h-[380px] bg-bg-primary rounded-lg shadow-card overflow-hidden flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
        onClick={modal.open}
      >
        <div 
          className="h-[200px] w-full rounded-t-lg"
          style={{
            backgroundImage: `url(${project.image || DEFAULT_PROJECT_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="h-[180px] px-4 py-3 bg-white flex flex-col">
          {/* 顶部区域：固定高度 */}
          <div className="flex items-start justify-between mb-2 h-[50px] shrink-0">
            <div className="flex-1 mr-3">
              <h3 className="text-text-primary text-base font-bold line-clamp-1 leading-tight mb-1">
                {project.name}
              </h3>
              <p className="text-text-tertiary text-[10px] line-clamp-1 leading-tight">
                {project.author}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <div className="leading-tight">
                <span className="text-primary text-base font-bold font-brand mr-1">
                  {project.currency}
                </span>
                <span className="text-primary text-2xl font-bold font-brand">
                  {project.price}
                </span>
              </div>
            </div>
          </div>

          {/* 描述区域：固定高度，严格控制溢出 */}
          <div className="h-[70px] mb-2 overflow-hidden shrink-0 relative">
            <p className="text-text-primary text-xs leading-[1.4] line-clamp-3 overflow-hidden mb-1">
              {project.description.length > 80 ? project.description.substring(0, 80) + '...' : project.description}
            </p>
            <div className="text-center absolute bottom-0 left-0 right-0">
              <span className="text-primary text-xs cursor-pointer hover:underline bg-white px-2">
                点击查看详情
              </span>
            </div>
          </div>

          {/* 标签区域：固定在底部 */}
          <div className="flex flex-wrap gap-1 mt-auto shrink-0">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium shadow-tag ${TAG_COLORS[tag.type]}`}
              >
                {tag.label}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-text-secondary text-xs self-center">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <ProjectModal
        project={project}
        isOpen={modal.isOpen}
        onClose={modal.close}
        mounted={modal.mounted}
      />
    </>
  )
}