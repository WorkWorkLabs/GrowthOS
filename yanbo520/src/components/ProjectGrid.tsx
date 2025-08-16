import { ProjectCard } from './ProjectCard'
import { Project } from '@/types'

interface ProjectGridProps {
  projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="px-11 py-12">
      <div className="grid grid-cols-4 gap-8 justify-items-center">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  )
}