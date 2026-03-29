import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  FloppyDiskIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { NoteFormInput } from "@/features/health/schemas"

type NoteDialogProps = {
  open: boolean
  editingId: string | null
  form: UseFormReturn<NoteFormInput>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: NoteFormInput) => Promise<void>
}

export function NoteDialog({
  open,
  editingId,
  form,
  onOpenChange,
  onSubmit,
}: NoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit note" : "Add note"}</DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update an existing note for this child."
              : "Record a new note for this child."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-1.5">
            <Label htmlFor="note-time">Date and time</Label>
            <Input
              id="note-time"
              type="datetime-local"
              {...form.register("recordedAt")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.recordedAt?.message}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              rows={4}
              {...form.register("content")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.content?.message}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="size-4 animate-spin"
                />
              ) : (
                <HugeiconsIcon
                  icon={editingId ? FloppyDiskIcon : Add01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              )}
              {form.formState.isSubmitting
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                  ? "Update"
                  : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
