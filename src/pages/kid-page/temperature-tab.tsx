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
import { translate, withParams } from "@/lib/translate"

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

function formatTemperatureDegrees(value: number, unit?: "C" | "F") {
  const baseValue = `${Number(value.toFixed(1)).toString()}°`
  return unit === "F" ? `${baseValue}F` : baseValue
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
      <Card className="hidden border-primary/25 bg-linear-to-br from-primary/10 to-card md:block">
        <CardHeader>
          <CardTitle>{translate.latestMeasurementData}</CardTitle>
          <CardDescription>
            {withParams(translate.latestMeasurementDataDescFull, {
              feverCount,
              totalCount: temperatures.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 pb-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.latestMeasurement}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {latestTemperature
                  ? formatTemperatureDegrees(latestTemperature.value)
                  : "-"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {latestTemperature
                  ? renderDateTime(latestTemperature.measuredAt)
                  : translate.noData}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.feverEpisodes}
              </p>
              <p className="mt-2 text-2xl font-semibold">{feverCount}</p>
              <div className="mt-2">
                <Badge variant={feverCount > 0 ? "destructive" : "secondary"}>
                  {feverCount > 0
                    ? translate.atLeast38
                    : translate.noFeverRecorded}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.totalLogs}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {temperatures.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.totalLogsDesc}
              </p>
            </div>
          </div>
          <LineMiniChart
            data={temperatureTrend}
            emptyLabel={translate.temperatureTrendEmpty}
          />
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{translate.temperatureLogs}</CardTitle>
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
            {translate.addTemperatureRecord}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translate.when}</TableHead>
                <TableHead>{translate.value}</TableHead>
                <TableHead>{translate.method}</TableHead>
                <TableHead>{translate.notes}</TableHead>
                <TableHead className="w-32">{translate.actions}</TableHead>
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
                      {formatTemperatureDegrees(row.value, row.unit)}
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
