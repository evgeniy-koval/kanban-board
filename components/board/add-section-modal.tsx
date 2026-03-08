'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSection } from '@/actions/sections'

type AddSectionModalProps = {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSectionModal({ projectId, open, onOpenChange }: AddSectionModalProps) {
  const router = useRouter()
  const submittedRef = useRef(false)
  const [state, formAction, isPending] = useActionState(
    (prev: { error?: string }, fd: FormData) => createSection(projectId, prev, fd),
    { error: undefined },
  )

  useEffect(() => {
    if (submittedRef.current && !isPending && !state?.error) {
      onOpenChange(false)
      router.refresh()
      submittedRef.current = false
    }
  }, [isPending, state?.error, onOpenChange, router])

  const handleOpenChange = (next: boolean) => {
    if (!next && !isPending) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          action={(fd) => {
            submittedRef.current = true
            formAction(fd)
          }}
        >
          <DialogHeader>
            <DialogTitle>Add section</DialogTitle>
            <DialogDescription>Create a new column on the board.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="section-name">Name</Label>
              <Input id="section-name" name="name" placeholder="Section name" required autoFocus />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
