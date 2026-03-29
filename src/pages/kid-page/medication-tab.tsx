import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, MedicineBottleIcon } from "@hugeicons/core-free-icons"

import { RecordActionsMenu } from "@/components/record-actions-menu"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarMiniChart } from "@/components/ui/simple-charts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MedicationRecord } from "@/features/health/types"
import type { MiniChartPoint } from "@/pages/kid-page/utils"
import { renderDateTime } from "@/pages/kid-page/utils"
import { translate, withParams } from "@/lib/translate"

type MedicationTabProps = {
  medications: MedicationRecord[]
  medicationPerDay: MiniChartPoint[]
  mostUsedMedication: { name: string; count: number } | null
  deletingRecordId: string | null
  onCreate: () => void
  onEdit: (record: MedicationRecord) => void
  onDelete: (record: MedicationRecord) => void
}

export function MedicationTab({
  medications,
  medicationPerDay,
  mostUsedMedication,
  deletingRecordId,
  onCreate,
  onEdit,
  onDelete,
}: MedicationTabProps) {
  return (
    <div className="space-y-3">
      <Card className="hidden border-primary/25 bg-linear-to-br from-primary/10 to-card md:block">
        <CardHeader>
          <CardTitle>{translate.medicationDataTitle}</CardTitle>
          <CardDescription>
            {withParams(translate.medicationDataDescFull, {
              total: medications.length,
              days: medicationPerDay.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 pb-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.totalDosesLogged}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {medications.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.totalDosesLoggedDesc}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.mostUsedMedicationTitle}
              </p>
              <p className="mt-2 truncate text-2xl font-semibold">
                {mostUsedMedication?.name ?? "-"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {mostUsedMedication
                  ? withParams(translate.dosesCountValue, {
                      count: mostUsedMedication.count,
                    })
                  : translate.noMedicationRecords}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.daysWithMedication}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {medicationPerDay.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.daysWithMedicationDesc}
              </p>
            </div>
          </div>
          <BarMiniChart
            data={medicationPerDay}
            emptyLabel={translate.medicationActivityEmpty}
          />
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{translate.medicationLogs}</CardTitle>
          <Button onClick={onCreate}>
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="size-4"
            />
            <HugeiconsIcon
              icon={MedicineBottleIcon}
              strokeWidth={2}
              className="size-4"
            />
            {translate.addMedication}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translate.when}</TableHead>
                <TableHead>{translate.medication}</TableHead>
                <TableHead>{translate.dose}</TableHead>
                <TableHead>{translate.notes}</TableHead>
                <TableHead className="w-32">{translate.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{renderDateTime(row.takenAt)}</TableCell>
                  <TableCell>{row.medicationName}</TableCell>
                  <TableCell>
                    {row.dose} {row.unit}
                  </TableCell>
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
