import { Plus, Save, Loader2 } from "lucide-react"
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
import { translate } from "@/lib/translate"

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
          <DialogTitle>
            {editingId ? translate.editNote : translate.addNote}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? translate.noteDialogEditDesc
              : translate.noteDialogAddDesc}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="note-time">{translate.dateTime}</Label>
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
            <Label htmlFor="note-content">{translate.content}</Label>
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
                <Loader2
                  className="size-4 animate-spin"
                />
              ) : (
                editingId ? <Save className="size-4" /> : <Plus className="size-4" />
              )}
              {form.formState.isSubmitting
                ? editingId
                  ? translate.updating
                  : translate.adding
                : editingId
                  ? translate.update
                  : translate.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
