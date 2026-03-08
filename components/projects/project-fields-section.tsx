"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi2";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProjectField,
  updateProjectField,
  deleteProjectFieldForm,
  type ProjectFieldActionResult,
} from "@/actions/project-fields";
import type { ProjectFieldWithOptions } from "@/lib/types";
import { HiX } from "react-icons/hi";

type OptionRow = { value: string; color: string | null };

type ProjectFieldsSectionProps = {
  projectId: string;
  fields: ProjectFieldWithOptions[];
};

export function ProjectFieldsSection({
  projectId,
  fields,
}: ProjectFieldsSectionProps) {
  const router = useRouter();
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldModalMode, setFieldModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingField, setEditingField] =
    useState<ProjectFieldWithOptions | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [fieldOptions, setFieldOptions] = useState<OptionRow[]>([]);
  const [deleteFieldOpen, setDeleteFieldOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] =
    useState<ProjectFieldWithOptions | null>(null);

  const fieldFormSubmittedRef = useRef(false);
  const [fieldState, fieldFormAction, fieldFormPending] = useActionState(
    (prev: ProjectFieldActionResult, formData: FormData) =>
      fieldModalMode === "create"
        ? createProjectField(projectId, prev, formData)
        : updateProjectField(editingField!.id, projectId, prev, formData),
    { error: undefined },
  );
  const [deleteFieldState, deleteFieldAction] = useActionState(
    deleteProjectFieldForm,
    { error: undefined },
  );
  const deleteFieldSubmittedRef = useRef(false);

  useEffect(() => {
    if (
      fieldFormSubmittedRef.current &&
      !fieldFormPending &&
      !fieldState?.error
    ) {
      setFieldModalOpen(false);
      router.refresh();
      fieldFormSubmittedRef.current = false;
    }
  }, [fieldFormPending, fieldState?.error, router]);

  useEffect(() => {
    if (deleteFieldSubmittedRef.current && !deleteFieldState?.error) {
      setDeleteFieldOpen(false);
      setFieldToDelete(null);
      router.refresh();
      deleteFieldSubmittedRef.current = false;
    }
  }, [deleteFieldState?.error, router]);

  const openCreateFieldModal = () => {
    setFieldModalMode("create");
    setEditingField(null);
    setFieldName("");
    setFieldOptions([]);
    setFieldModalOpen(true);
  };
  const openEditFieldModal = (field: ProjectFieldWithOptions) => {
    setFieldModalMode("edit");
    setEditingField(field);
    setFieldName(field.name);
    setFieldOptions(
      field.options.map((o) => ({ value: o.value, color: o.color || null })),
    );
    setFieldModalOpen(true);
  };
  const openDeleteFieldConfirm = (field: ProjectFieldWithOptions) => {
    setFieldToDelete(field);
    setDeleteFieldOpen(true);
  };

  const addOption = () =>
    setFieldOptions((o) => [...o, { value: "", color: null }]);
  const removeOption = (index: number) =>
    setFieldOptions((o) =>
      o.length <= 1 ? o : o.filter((_, i) => i !== index),
    );
  const updateOption = (index: number, value: string, color?: string | null) =>
    setFieldOptions((o) =>
      o.map((opt, i) =>
        i === index ? { ...opt, value, color: color ?? opt.color } : opt,
      ),
    );

  return (
    <>
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Fields</h3>

          <Button
            type="button"
            variant="icon"
            size="sm"
            className="size-8 bg-foreground text-primary-foreground hover:text-muted-foreground rounded-full"
            aria-label="Add option"
            onClick={openCreateFieldModal}
          >
            <HiPlus className="size-4" />
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fields yet</p>
        ) : (
          <ul className="space-y-2">
            {fields.map((field) => (
              <li
                key={field.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card p-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{field.name}</p>
                  {field.options.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {field.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: opt.color ?? "#6b7280" }}
                            aria-hidden
                          />
                          {opt.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    type="button"
                    variant="icon"
                    size="sm"
                    className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                    aria-label={`Edit ${field.name}`}
                    onClick={() => openEditFieldModal(field)}
                  >
                    <HiPencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    size="sm"
                    className="size-6 text-muted-foreground hover:text-destructive hover:bg-red-100 rounded-full"
                    aria-label={`Delete ${field.name}`}
                    onClick={() => openDeleteFieldConfirm(field)}
                  >
                    <HiTrash className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={fieldModalOpen}
        onOpenChange={(open) => !fieldFormPending && setFieldModalOpen(open)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {fieldModalMode === "create" ? "Add field" : "Edit field"}
            </DialogTitle>
          </DialogHeader>
          <form
            action={(fd) => {
              const options = fieldOptions.filter((o) => o.value.trim());
              fd.set(
                "options",
                JSON.stringify(
                  options.map((o) => ({
                    value: o.value.trim(),
                    color: o.color || null,
                  })),
                ),
              );
              fieldFormSubmittedRef.current = true;
              fieldFormAction(fd);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="field-name">Field name</Label>
                <Input
                  id="field-name"
                  name="name"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Field name"
                  required
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="icon"
                    size="sm"
                    className="size-8 bg-foreground text-primary-foreground hover:text-muted-foreground rounded-full"
                    aria-label="Add option"
                    onClick={addOption}
                  >
                    <HiPlus className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {fieldOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="relative size-5 shrink-0">
                        <input
                          type="color"
                          value={opt.color ?? "#9ca3af"}
                          onChange={(e) =>
                            updateOption(i, opt.value, e.target.value)
                          }
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label="Option color"
                        />
                        <div
                          className="size-full rounded-full border border-border"
                          style={{ backgroundColor: opt.color ?? "#9ca3af" }}
                        />
                      </div>
                      <Input
                        value={opt.value}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder="Option value"
                        className="flex-1 w-full"
                      />
                      <Button
                        type="button"
                        variant="icon"
                        size="sm"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive rounded-full"
                        aria-label="Remove option"
                        onClick={() => removeOption(i)}
                      >
                        <HiX className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {fieldState?.error && (
                <p className="text-sm text-destructive" role="alert">
                  {fieldState.error}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFieldModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={fieldFormPending}>
                {fieldFormPending ? "Saving…" : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteFieldOpen} onOpenChange={setDeleteFieldOpen}>
        <AlertDialogContent>
          <form
            action={(fd) => {
              deleteFieldSubmittedRef.current = true;
              deleteFieldAction(fd);
            }}
          >
            <input
              type="hidden"
              name="fieldId"
              value={fieldToDelete?.id ?? ""}
            />
            <input type="hidden" name="projectId" value={projectId} />
            <AlertDialogHeader>
              <AlertDialogTitle>Delete field</AlertDialogTitle>
              <AlertDialogDescription>
                Delete the field &quot;{fieldToDelete?.name}&quot;? This cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                type="button"
                onClick={() => setFieldToDelete(null)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit" variant="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
