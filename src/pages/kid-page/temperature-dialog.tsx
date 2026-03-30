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
import { translate } from "@/lib/translate"

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
            {editingId
              ? translate.editTemperatureRecord
              : translate.addTemperatureRecord}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? translate.temperatureDialogEditDesc
              : translate.temperatureDialogAddDesc}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="temp-time">{translate.dateTime}</Label>
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
              <Label htmlFor="temp-value">{translate.value}</Label>
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
              <Label htmlFor="temp-unit">{translate.unit}</Label>
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
                  <SelectValue placeholder={translate.selectTemperatureUnit} />
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
            <Label htmlFor="temp-method">{translate.method}</Label>
            <Input
              id="temp-method"
              placeholder={translate.methodPlaceholder}
              {...form.register("method")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="temp-notes">{translate.notes}</Label>
            <Textarea id="temp-notes" rows={3} {...form.register("notes")} />
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
