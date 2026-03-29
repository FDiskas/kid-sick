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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TEMPERATURE_UNIT_OPTIONS } from "@/features/health/temperature-unit-preference"
import type { TemperatureFormInput } from "@/features/health/schemas"

type TemperatureDialogProps = {
  open: boolean
  editingId: string | null
  form: UseFormReturn<TemperatureFormInput>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TemperatureFormInput) => Promise<void>
}

export function TemperatureDialog({
  open,
  editingId,
  form,
  onOpenChange,
  onSubmit,
}: TemperatureDialogProps) {
  const unitValue = form.watch("unit")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit temperature" : "Add temperature"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update the body temperature measurement."
              : "Record a new body temperature measurement."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-1.5">
            <Label htmlFor="temp-time">Date and time</Label>
            <Input
              id="temp-time"
              type="datetime-local"
              {...form.register("measuredAt")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.measuredAt?.message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="temp-value">Value</Label>
              <Input
                id="temp-value"
                type="number"
                step="0.1"
                {...form.register("value")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.value?.message}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp-unit">Unit</Label>
              <Select
                value={unitValue}
                onValueChange={(nextValue) => {
                  if (!nextValue) {
                    return
                  }

                  form.setValue("unit", nextValue, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }}
              >
                <SelectTrigger id="temp-unit" className="w-full">
                  <SelectValue placeholder="Select temperature unit" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-destructive">
                {form.formState.errors.unit?.message}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="temp-method">Method</Label>
            <Input
              id="temp-method"
              placeholder="Oral / ear / forehead"
              {...form.register("method")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="temp-notes">Notes</Label>
            <Textarea id="temp-notes" rows={3} {...form.register("notes")} />
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
