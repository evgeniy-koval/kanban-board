'use client'

import { useState } from 'react'
import { HiCog6Tooth } from 'react-icons/hi2'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { ProjectSettings } from './project-settings'
import type { Project } from '@/lib/types'

type ProjectHeaderProps = {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
        <h1 className="truncate text-lg font-semibold text-foreground">{project.name}</h1>
        <Button
          type="button"
          variant="icon"
          size="sm"
          className="size-9 shrink-0 rounded-md"
          aria-label="Project settings"
          onClick={() => setSettingsOpen(true)}
        >
          <HiCog6Tooth className="size-5" />
        </Button>
      </header>
      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen} title="Project settings">
        <ProjectSettings project={project} />
      </Drawer>
    </>
  )
}
