import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  Edit01Icon,
  Loading03Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons"

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
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Latest height</CardDescription>
            <CardTitle className="text-2xl">
              {kid.currentHeightCm ?? latestGrowth?.heightCm ?? "-"} cm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From profile or latest growth row
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Latest weight</CardDescription>
            <CardTitle className="text-2xl">
              {kid.currentWeightKg ?? latestGrowth?.weightKg ?? "-"} kg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Most recent known measurement
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Growth checkpoints</CardDescription>
            <CardTitle className="text-2xl">{growthRecords.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Historical growth entries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader>
            <CardTitle>Height trend</CardTitle>
            <CardDescription>Most recent 10 height values</CardDescription>
          </CardHeader>
          <CardContent>
            <LineMiniChart
              data={growthHeightTrend}
              emptyLabel="Add growth records with height to see a trend"
            />
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader>
            <CardTitle>Weight trend</CardTitle>
            <CardDescription>Most recent 10 weight values</CardDescription>
          </CardHeader>
          <CardContent>
            <LineMiniChart
              data={growthWeightTrend}
              strokeClassName="text-chart-3"
              areaClassName="text-chart-3/15"
              emptyLabel="Add growth records with weight to see a trend"
            />
          </CardContent>
        </Card>
      </div>

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
                <TableHead className="w-40">Actions</TableHead>
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
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingRecordId === row.id}
                        onClick={() => onEdit(row)}
                      >
                        <HugeiconsIcon
                          icon={Edit01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingRecordId === row.id}
                        onClick={() => void onDelete(row)}
                      >
                        {deletingRecordId === row.id ? (
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
