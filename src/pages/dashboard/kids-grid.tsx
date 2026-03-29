import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordActionsMenu } from "@/components/record-actions-menu"
import type { KidProfile } from "@/features/health/types"
import { cn, calculateAge } from "@/lib/utils"
import { translate, withParams } from "@/lib/translate"

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
      <AlertTitle>{translate.noKidsTitle}</AlertTitle>
      <AlertDescription>{translate.noKidsDescription}</AlertDescription>
      <div className="mt-3">
        <Button onClick={onCreate}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          {translate.addFirstKid}
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
              <div className="min-w-0 space-y-1">
                <div className="text-muted-foreground">
                  {withParams(translate.birthdayValue, { date: kid.birthDate })}
                  {calculateAge(kid.birthDate) !== null && (
                    <span> ({calculateAge(kid.birthDate)})</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {withParams(translate.latestMeasurements, {
                    height: String(kid.currentHeightCm ?? "-"),
                    weight: String(kid.currentWeightKg ?? "-"),
                  })}
                </div>
              </div>
              <div className="w-40 shrink-0 text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  {translate.notes}
                </p>
                <p className="text-xs leading-relaxed wrap-break-word text-foreground/80">
                  {kid.notes?.trim() || translate.noNotes}
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
                {translate.openDetails}
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
