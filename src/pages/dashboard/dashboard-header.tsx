import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { translate } from "@/lib/translate"

type DashboardHeaderProps = {
  onAddKid: () => void
}

export function DashboardHeader({ onAddKid }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">
          {translate.kidsDashboardTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate.kidsDashboardDescription}
        </p>
      </div>
      <Button onClick={onAddKid}>
        <Plus className="size-4" />
        {translate.addKid}
      </Button>
    </div>
  )
}
