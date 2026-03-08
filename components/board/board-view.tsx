'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiPlus } from 'react-icons/hi2'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { defaultPreset } from '@dnd-kit/dom'
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
import { AddSectionModal } from './add-section-modal'
import { SectionColumn } from './section-column'
import { updateSectionName, updateSectionsOrder, deleteSection } from '@/actions/sections'
import type { Section } from '@/lib/types'

type BoardViewProps = {
  projectId: string
  sections: Section[]
  taskCountBySectionId: Record<string, number>
}

function BoardContent({ projectId, sections, taskCountBySectionId }: BoardViewProps) {
  const router = useRouter()
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)

  const handleRename = useCallback(
    async (sectionId: string, name: string) => {
      await updateSectionName(sectionId, name)
      router.refresh()
    },
    [router],
  )

  const handleDeleteClick = useCallback((sectionId: string) => {
    setDeleteSectionId(sectionId)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteSectionId) return
    await deleteSection(deleteSectionId)
    setDeleteSectionId(null)
    router.refresh()
  }, [deleteSectionId, router])

  return (
    <>
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {sections.map((section, i) => (
          <SectionColumn
            key={section.id}
            section={section}
            index={i}
            taskCount={taskCountBySectionId[section.id] ?? 0}
            onRename={handleRename}
            onDelete={handleDeleteClick}
          />
        ))}
        <Button
          type="button"
          variant="primary"
          className="h-fit shrink-0 gap-2 rounded-lg border-dashed border-muted-foreground/30 bg-transparent px-4 py-3 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted hover:text-foreground"
          onClick={() => setAddSectionOpen(true)}
        >
          <HiPlus className="size-5" />
          Add section
        </Button>
      </div>

      <AddSectionModal
        projectId={projectId}
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
      />

      <AlertDialog open={!!deleteSectionId} onOpenChange={(open) => !open && setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this section and its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function BoardWithDnd(props: BoardViewProps) {
  const router = useRouter()
  const { projectId, sections } = props

  const handleDragEnd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const sectionIds = sections.map((s) => s.id)
      const reordered = move(sectionIds, event)
      if (JSON.stringify(reordered) !== JSON.stringify(sectionIds)) {
        updateSectionsOrder(projectId, reordered as string[]).then(() => router.refresh())
      }
    },
    [projectId, sections, router],
  )

  return (
    <DragDropProvider
      sensors={defaultPreset.sensors}
      modifiers={defaultPreset.modifiers}
      plugins={defaultPreset.plugins}
      onDragEnd={handleDragEnd}
    >
      <BoardContent {...props} />
    </DragDropProvider>
  )
}

export function BoardView(props: BoardViewProps) {
  return <BoardWithDnd {...props} />
}
