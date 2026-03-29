import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, RulerIcon } from "@hugeicons/core-free-icons"

import { RecordActionsMenu } from "@/components/record-actions-menu"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LineMiniChart } from "@/components/ui/simple-charts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GrowthRecord, KidProfile } from "@/features/health/types"
import type { MiniChartPoint } from "@/pages/kid-page/utils"
import { renderDateTime } from "@/pages/kid-page/utils"

type GrowthTabProps = {
  kid: KidProfile
  latestGrowth: GrowthRecord | undefined
  growthRecords: GrowthRecord[]
  growthHeightTrend: MiniChartPoint[]
  growthWeightTrend: MiniChartPoint[]
  deletingRecordId: string | null
  onCreate: () => void
  onEdit: (record: GrowthRecord) => void
  onDelete: (record: GrowthRecord) => void
}

export function GrowthTab({
  kid,
  latestGrowth,
  growthRecords,
  growthHeightTrend,
  growthWeightTrend,
  deletingRecordId,
  onCreate,
  onEdit,
  onDelete,
}: GrowthTabProps) {
  return (
    <div className="space-y-3">
      <Card className="hidden border-primary/25 bg-linear-to-br from-primary/10 to-card md:block">
        <CardHeader>
          <CardTitle>Growth data</CardTitle>
          <CardDescription>
            Most recent height and weight trends. Growth checkpoints: {growthRecords.length}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 pb-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Latest height</p>
              <p className="mt-2 text-2xl font-semibold">
                {kid.currentHeightCm ?? latestGrowth?.heightCm ?? "-"} cm
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                From profile or latest growth row
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Latest weight</p>
              <p className="mt-2 text-2xl font-semibold">
                {kid.currentWeightKg ?? latestGrowth?.weightKg ?? "-"} kg
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Most recent known measurement
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Growth checkpoints</p>
              <p className="mt-2 text-2xl font-semibold">{growthRecords.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Historical growth entries
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <div className="pb-4">
                <p className="font-medium">Height trend</p>
                <p className="text-sm text-muted-foreground">
                  Most recent 10 height values
                </p>
              </div>
              <LineMiniChart
                data={growthHeightTrend}
                emptyLabel="Add growth records with height to see a trend"
              />
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <div className="pb-4">
                <p className="font-medium">Weight trend</p>
                <p className="text-sm text-muted-foreground">
                  Most recent 10 weight values
                </p>
              </div>
              <LineMiniChart
                data={growthWeightTrend}
                strokeClassName="text-chart-3"
                areaClassName="text-chart-3/15"
                emptyLabel="Add growth records with weight to see a trend"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Growth history</CardTitle>
          <Button onClick={onCreate}>
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="size-4"
            />
            <HugeiconsIcon
              icon={RulerIcon}
              strokeWidth={2}
              className="size-4"
            />
            Add growth measurement
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Height (cm)</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {growthRecords.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{renderDateTime(row.measuredAt)}</TableCell>
                  <TableCell>{row.heightCm ?? "-"}</TableCell>
                  <TableCell>{row.weightKg ?? "-"}</TableCell>
                  <TableCell>{row.notes || "-"}</TableCell>
                  <TableCell>
                    <RecordActionsMenu
                      isDeleting={deletingRecordId === row.id}
                      onEdit={() => onEdit(row)}
                      onDelete={() => void onDelete(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
