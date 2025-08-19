import { ProjectCard } from './ProjectCard'
import { Project } from '@/types'

interface ProjectGridProps {
  projects: Project[]
  initialOpenProductId?: string
}

export function ProjectGrid({ projects, initialOpenProductId }: ProjectGridProps) {
  return (
    <div className="px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            {...project} 
            initialOpen={initialOpenProductId === project.id}
          />
        ))}
      </div>
    </div>
  )
}