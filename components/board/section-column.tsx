"use client";

import { useRef, useState } from "react";
import { HiEllipsisVertical, HiPencil, HiPlus, HiTrash } from "react-icons/hi2";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/types";
import { updateSectionName } from "@/actions/sections";

type SectionColumnProps = {
  section: Section;
  index: number;
  taskCount: number;
  onRename: (sectionId: string, name: string) => void;
  onDelete: (sectionId: string) => void;
};

export function SectionColumn({
  section,
  index,
  taskCount,
  onRename,
  onDelete,
}: SectionColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const { sortable, isDragging, handleRef, ref } = useSortable({
    id: section.id,
    index,
    group: "sections",
    handle: undefined,
  });

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== section.name) {
      onRename(section.id, trimmed);
    } else {
      setEditValue(section.name);
    }
  };

  const handleRenameClick = () => {
    setEditValue(section.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/50 transition-shadow",
        isDragging && "opacity-90 shadow-lg ring-2 ring-ring",
      )}
    >
      <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-border bg-muted px-3 py-2">
        <div
          ref={handleRef}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-2 active:cursor-grabbing"
        >
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.blur()}
              className="h-7 border-border bg-background text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate text-sm font-semibold text-foreground">
              {section.name}
            </span>
          )}
          <span className="shrink-0 text-sm font-semibold text-muted-foreground">
            {taskCount}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 shrink-0 p-0"
              aria-label="Section menu"
            >
              <HiEllipsisVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="gap-2">
              <HiPlus className="size-4 shrink-0" />
              Add task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRenameClick} className="gap-2">
              <HiPencil className="size-4 shrink-0" />
              Rename section
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => onDelete(section.id)}
            >
              <HiTrash className="size-4 shrink-0" />
              Delete section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm"
          >
            Lorem Ipsum
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1 justify-start gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <HiPlus className="size-4" />
          Add task
        </Button>
      </div>
    </div>
  );
}
