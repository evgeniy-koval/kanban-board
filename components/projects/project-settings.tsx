'use client'

import { useActionState, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProject, deleteProjectForm } from '@/actions/projects'
import { ProjectFieldsSection } from './project-fields-section'
import type { Project, ProjectFieldWithOptions } from '@/lib/types'

type ProjectSettingsProps = {
  project: Project
  fields?: ProjectFieldWithOptions[]
}

export function ProjectSettings({ project, fields = [] }: ProjectSettingsProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    (prev: { error?: string }, formData: FormData) => updateProject(project.id, prev, formData),
    { error: undefined },
  )
  const [, deleteAction] = useActionState(deleteProjectForm, { error: undefined })

  const dueDateValue = project.due_date ? project.due_date.slice(0, 10) : ''

  return (
    <>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Name</Label>
          <Input
            id="settings-name"
            name="name"
            defaultValue={project.name}
            placeholder="Project name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-description">Description</Label>
          <textarea
            id="settings-description"
            name="description"
            defaultValue={project.description ?? ''}
            placeholder="Description"
            rows={3}
            className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-due_date">Due date</Label>
          <Input
            id="settings-due_date"
            name="due_date"
            type="date"
            defaultValue={dueDateValue}
          />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <ProjectFieldsSection projectId={project.id} fields={fields} />

      <div className="mt-auto border-t border-border pt-4">
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          Delete project
        </Button>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <form action={deleteAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project &quot;{project.name}&quot; and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit" variant="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
