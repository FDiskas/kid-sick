import { HugeiconsIcon } from "@hugeicons/react"
import { FloppyDiskIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import type { UseFormReturn } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { KidFormInput } from "@/features/health/schemas"

type KidFormDialogProps = {
  form: UseFormReturn<KidFormInput>
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: KidFormInput) => Promise<void>
}

export function KidFormDialog({
  form,
  title,
  open,
  onOpenChange,
  onSubmit,
}: KidFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add core profile details and update height or weight anytime.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <div className="space-y-1.5">
            <Label htmlFor="kid-name">Name</Label>
            <Input id="kid-name" {...form.register("name")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kid-birthday">Birthday</Label>
            <Input
              id="kid-birthday"
              type="date"
              {...form.register("birthDate")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.birthDate?.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="kid-height">Height (cm)</Label>
              <Input
                id="kid-height"
                type="number"
                step="0.1"
                {...form.register("currentHeightCm")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.currentHeightCm?.message}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-weight">Weight (kg)</Label>
              <Input
                id="kid-weight"
                type="number"
                step="0.1"
                {...form.register("currentWeightKg")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.currentWeightKg?.message}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kid-notes">Notes</Label>
            <Textarea id="kid-notes" rows={3} {...form.register("notes")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.notes?.message}
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
                  icon={FloppyDiskIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              )}
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
