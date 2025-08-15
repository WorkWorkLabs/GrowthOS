import { ProjectCard } from './ProjectCard'

interface Project {
  id: string
  name: string
  author: string
  description: string
  price: number
  currency: string
  image?: string
  tags: Array<{
    label: string
    type: 'ai' | 'crypto' | 'education'
  }>
}

interface ProjectGridProps {
  projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="px-11 py-12">
      <div className="grid grid-cols-4 gap-8 justify-items-center">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            name={project.name}
            author={project.author}
            description={project.description}
            price={project.price}
            currency={project.currency}
            image={project.image}
            tags={project.tags}
          />
        ))}
      </div>
    </div>
  )
}