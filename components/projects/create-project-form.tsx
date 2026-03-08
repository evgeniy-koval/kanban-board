'use client'

import { useActionState } from 'react'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProject } from '@/actions/projects'

export function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(createProject, { error: undefined })

  return (
    <form action={formAction}>
      <DialogHeader>
        <DialogTitle>Create project</DialogTitle>
        <DialogDescription>
          Add a new project. You can set a due date later in settings.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="create-name">Name</Label>
          <Input id="create-name" name="name" placeholder="Project name" required autoFocus />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="create-due_date">Due date (optional)</Label>
          <Input id="create-due_date" name="due_date" type="date" />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  )
}
