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
import type { GrowthFormInput } from "@/features/health/schemas"
import { translate } from "@/lib/translate"

type GrowthDialogProps = {
  open: boolean
  editingId: string | null
  form: UseFormReturn<GrowthFormInput>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GrowthFormInput) => Promise<void>
}

export function GrowthDialog({
  open,
  editingId,
  form,
  onOpenChange,
  onSubmit,
}: GrowthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId
              ? translate.editGrowthMeasurement
              : translate.addGrowthMeasurement}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? translate.growthDialogEditDesc
              : translate.growthDialogAddDesc}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="growth-time">{translate.dateTime}</Label>
            <Input
              id="growth-time"
              type="datetime-local"
              {...form.register("measuredAt")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.measuredAt?.message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="growth-height">{translate.heightCm}</Label>
              <Input
                id="growth-height"
                type="number"
                step="0.1"
                {...form.register("heightCm")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.heightCm?.message}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="growth-weight">{translate.weightKg}</Label>
              <Input
                id="growth-weight"
                type="number"
                step="0.1"
                {...form.register("weightKg")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.weightKg?.message}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="growth-notes">{translate.notes}</Label>
            <Textarea id="growth-notes" rows={3} {...form.register("notes")} />
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
