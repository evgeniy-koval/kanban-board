'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CreateProjectForm } from '@/components/projects/create-project-form'

export default function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="max-w-sm space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Open a project
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a project from the sidebar or create a new one to get started.
        </p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button">Create new project</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <CreateProjectForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}
