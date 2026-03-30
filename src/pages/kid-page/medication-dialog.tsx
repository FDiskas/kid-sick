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
import type { MedicationFormInput } from "@/features/health/schemas"
import { translate } from "@/lib/translate"

type MedicationDialogProps = {
  open: boolean
  editingId: string | null
  form: UseFormReturn<MedicationFormInput>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: MedicationFormInput) => Promise<void>
}

export function MedicationDialog({
  open,
  editingId,
  form,
  onOpenChange,
  onSubmit,
}: MedicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId
              ? translate.editMedicationRecord
              : translate.addMedicationRecord}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? translate.medicationDialogEditDesc
              : translate.medicationDialogAddDesc}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="med-time">{translate.dateTime}</Label>
            <Input
              id="med-time"
              type="datetime-local"
              {...form.register("takenAt")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.takenAt?.message}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med-name">{translate.medication}</Label>
            <Input id="med-name" {...form.register("medicationName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.medicationName?.message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="med-dose">{translate.dose}</Label>
              <Input
                id="med-dose"
                type="number"
                step="0.1"
                {...form.register("dose")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.dose?.message}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-unit">{translate.unit}</Label>
              <Input id="med-unit" {...form.register("unit")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.unit?.message}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med-notes">{translate.notes}</Label>
            <Textarea id="med-notes" rows={3} {...form.register("notes")} />
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
