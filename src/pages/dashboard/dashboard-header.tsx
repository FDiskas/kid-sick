import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

type DashboardHeaderProps = {
  onAddKid: () => void
}

export function DashboardHeader({ onAddKid }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Kids Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage child profiles and jump into detailed tracking records.
        </p>
      </div>
      <Button onClick={onAddKid}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
        Add Kid
      </Button>
    </div>
  )
}
