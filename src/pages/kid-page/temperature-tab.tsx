import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ThermometerIcon } from "@hugeicons/core-free-icons"

import { RecordActionsMenu } from "@/components/record-actions-menu"
import { Badge } from "@/components/ui/badge"
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
import type { MiniChartPoint } from "@/pages/kid-page/utils"
import {
  normalizeTemperatureToCelsius,
  renderDateTime,
} from "@/pages/kid-page/utils"
import type { TemperatureRecord } from "@/features/health/types"

type TemperatureTabProps = {
  temperatures: TemperatureRecord[]
  latestTemperature: TemperatureRecord | null
  feverCount: number
  temperatureTrend: MiniChartPoint[]
  deletingRecordId: string | null
  onCreate: () => void
  onEdit: (record: TemperatureRecord) => void
  onDelete: (record: TemperatureRecord) => void
}

function formatTemperatureDegrees(value: number) {
  return `${Number(value.toFixed(1)).toString()}°`
}

function getTemperatureBadgeClassName(record: TemperatureRecord) {
  const valueInCelsius = normalizeTemperatureToCelsius(
    record.value,
    record.unit
  )

  if (valueInCelsius > 41) {
    return "bg-red-600 text-white animate-pulse"
  }

  if (valueInCelsius >= 38) {
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200"
  }

  if (valueInCelsius >= 37) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200"
  }

  if (valueInCelsius >= 36) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
  }

  return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200"
}

export function TemperatureTab({
  temperatures,
  latestTemperature,
  feverCount,
  temperatureTrend,
  deletingRecordId,
  onCreate,
  onEdit,
  onDelete,
}: TemperatureTabProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Latest measurement</CardDescription>
            <CardTitle className="text-2xl">
              {latestTemperature
                ? formatTemperatureDegrees(latestTemperature.value)
                : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {latestTemperature
                ? renderDateTime(latestTemperature.measuredAt)
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Fever episodes</CardDescription>
            <CardTitle className="text-2xl">{feverCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={feverCount > 0 ? "destructive" : "secondary"}>
              {feverCount > 0 ? "At least 38°" : "No fever recorded"}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Total logs</CardDescription>
            <CardTitle className="text-2xl">{temperatures.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Across all recorded days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader>
          <CardTitle>Temperature trend</CardTitle>
          <CardDescription>
            Last 12 measurements, normalized to C for consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineMiniChart
            data={temperatureTrend}
            emptyLabel="Add temperature records to see a trend line"
          />
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Temperature logs</CardTitle>
          <Button onClick={onCreate}>
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="size-4"
            />
            <HugeiconsIcon
              icon={ThermometerIcon}
              strokeWidth={2}
              className="size-4"
            />
            Add temperature
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temperatures.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{renderDateTime(row.measuredAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getTemperatureBadgeClassName(row)}
                    >
                      {formatTemperatureDegrees(row.value)}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.method || "-"}</TableCell>
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
