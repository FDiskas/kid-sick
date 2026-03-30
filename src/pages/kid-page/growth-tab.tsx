import { Plus, Ruler } from "lucide-react"

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
import { translate, withParams } from "@/lib/translate"

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
          <CardTitle>{translate.growthDataTitle}</CardTitle>
          <CardDescription>
            {withParams(translate.growthDataDescFull, {
              total: growthRecords.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 pb-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.latestHeight}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {withParams(translate.heightValue, {
                  value: String(
                    kid.currentHeightCm ?? latestGrowth?.heightCm ?? "-"
                  ),
                })}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.latestHeightDesc}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.latestWeight}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {withParams(translate.weightValue, {
                  value: String(
                    kid.currentWeightKg ?? latestGrowth?.weightKg ?? "-"
                  ),
                })}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.latestWeightDesc}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.growthCheckpoints}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {growthRecords.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.growthCheckpointsDesc}
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <div className="pb-4">
                <p className="font-medium">{translate.heightTrend}</p>
                <p className="text-sm text-muted-foreground">
                  {translate.heightTrendDesc}
                </p>
              </div>
              <LineMiniChart
                data={growthHeightTrend}
                className="w-full h-64 mt-2"
                emptyLabel={translate.heightTrendEmpty}
              />
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <div className="pb-4">
                <p className="font-medium">{translate.weightTrend}</p>
                <p className="text-sm text-muted-foreground">
                  {translate.weightTrendDesc}
                </p>
              </div>
              <LineMiniChart
                data={growthWeightTrend}
                className="w-full h-64 mt-2"
                emptyLabel={translate.weightTrendEmpty}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{translate.growthHistory}</CardTitle>
          <Button onClick={onCreate}>
            <Plus
              className="size-4"
            />
            <Ruler
              className="size-4"
            />
            {translate.addGrowthMeasurement}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translate.when}</TableHead>
                <TableHead>{translate.heightCm}</TableHead>
                <TableHead>{translate.weightKg}</TableHead>
                <TableHead>{translate.notes}</TableHead>
                <TableHead className="w-32">{translate.actions}</TableHead>
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
