'use client'

import Link from 'next/link'
import { HiPlus } from 'react-icons/hi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CreateProjectForm } from '@/components/projects/create-project-form'
import type { Project } from '@/lib/types'
import { cn } from '@/lib/utils'

type ProjectsSidebarProps = {
  projects: Project[]
}

export function ProjectsSidebar({ projects }: ProjectsSidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-12 items-center justify-between gap-2 border-b border-border px-3">
        <h2 className="truncate text-sm font-semibold text-foreground">
          Projects
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="icon"
              className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Create project"
            >
              <HiPlus className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <CreateProjectForm />
          </DialogContent>
        </Dialog>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {projects.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No projects yet
          </p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={cn(
                'rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted',
                'line-clamp-1'
              )}
            >
              {project.name}
            </Link>
          ))
        )}
      </nav>
    </aside>
  )
}
