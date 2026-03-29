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
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Total doses logged</CardDescription>
            <CardTitle className="text-2xl">{medications.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All medication records for this child
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Most used medication</CardDescription>
            <CardTitle className="truncate text-2xl">
              {mostUsedMedication?.name ?? "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {mostUsedMedication
                ? `${mostUsedMedication.count} doses`
                : "No medication records yet"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardDescription>Days with medication</CardDescription>
            <CardTitle className="text-2xl">
              {medicationPerDay.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Unique treatment days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader>
          <CardTitle>Medication activity</CardTitle>
          <CardDescription>Doses recorded per day</CardDescription>
        </CardHeader>
        <CardContent>
          <BarMiniChart
            data={medicationPerDay}
            emptyLabel="Add medication logs to see daily activity"
          />
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Medication logs</CardTitle>
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
            Add medication
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-32">Actions</TableHead>
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
