import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordActionsMenu } from "@/components/record-actions-menu"
import type { KidProfile } from "@/features/health/types"
import { cn, calculateAge } from "@/lib/utils"

type KidsGridProps = {
  kids: KidProfile[]
  deletingKidId: string | null
  onEdit: (kid: KidProfile) => void
  onDelete: (kid: KidProfile) => void
  onCreate: () => void
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Alert>
      <AlertTitle>No kids added yet</AlertTitle>
      <AlertDescription>
        Start by adding your first child profile to begin tracking temperature,
        medication, and growth logs.
      </AlertDescription>
      <div className="mt-3">
        <Button onClick={onCreate}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Add First Kid
        </Button>
      </div>
    </Alert>
  )
}

export function KidsGrid({
  kids,
  deletingKidId,
  onEdit,
  onDelete,
  onCreate,
}: KidsGridProps) {
  if (kids.length === 0) {
    return <EmptyState onCreate={onCreate} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kids.map((kid) => (
        <Card key={kid.id}>
          <CardHeader>
            <CardTitle className="text-lg">{kid.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="text-muted-foreground">
                  Birthday {kid.birthDate}
                  {calculateAge(kid.birthDate) !== null && (
                    <span> ({calculateAge(kid.birthDate)})</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  Latest: {kid.currentHeightCm ?? "-"} cm /{" "}
                  {kid.currentWeightKg ?? "-"} kg
                </div>
              </div>
              <div className="w-40 shrink-0 text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  Notes
                </p>
                <p className="text-xs leading-relaxed break-words text-foreground/80">
                  {kid.notes?.trim() || "No notes"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/kids/${kid.id}`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "inline-flex items-center gap-2"
                )}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Open details
              </Link>
              <RecordActionsMenu
                isDeleting={deletingKidId === kid.id}
                onEdit={() => onEdit(kid)}
                onDelete={() => void onDelete(kid)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
