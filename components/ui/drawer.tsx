'use client'

import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { HiX } from 'react-icons/hi'

type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  side?: 'left' | 'right'
}

export function Drawer({ open, onOpenChange, title, children, side = 'right' }: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side}>
        <SheetHeader className="flex-row items-center justify-between gap-4">
          <SheetTitle className="flex-1 truncate">{title}</SheetTitle>
          <SheetClose asChild>
            <Button type="button" variant="icon" className="size-9 shrink-0 rounded-md" aria-label="Close">
              <HiX className="size-5" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <SheetBody className="gap-6">{children}</SheetBody>
      </SheetContent>
    </Sheet>
  )
}
