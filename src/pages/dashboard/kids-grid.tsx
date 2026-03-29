import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  Edit01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
              <Button
                variant="outline"
                size="sm"
                disabled={deletingKidId === kid.id}
                onClick={() => onEdit(kid)}
              >
                <HugeiconsIcon
                  icon={Edit01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingKidId === kid.id}
                onClick={() => void onDelete(kid)}
              >
                {deletingKidId === kid.id ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      strokeWidth={2}
                      className="size-4 animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
