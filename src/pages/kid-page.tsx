import { Link, Navigate, useParams } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Note04Icon,
  PillIcon,
  ThermometerIcon,
  WeightScale01Icon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/features/auth/auth-context"
import { GrowthDialog } from "@/pages/kid-page/growth-dialog"
import { GrowthTab } from "@/pages/kid-page/growth-tab"
import { MedicationDialog } from "@/pages/kid-page/medication-dialog"
import { MedicationTab } from "@/pages/kid-page/medication-tab"
import { NoteDialog } from "@/pages/kid-page/note-dialog"
import { NotesTab } from "@/pages/kid-page/notes-tab"
import { TemperatureDialog } from "@/pages/kid-page/temperature-dialog"
import { TemperatureTab } from "@/pages/kid-page/temperature-tab"
import { useActionLocks } from "@/pages/kid-page/use-action-locks"
import { useGrowthRecords } from "@/pages/kid-page/use-growth-records"
import { useKidPageData } from "@/pages/kid-page/use-kid-page-data"
import { useMedicationRecords } from "@/pages/kid-page/use-medication-records"
import { useNoteRecords } from "@/pages/kid-page/use-note-records"
import { useTemperatureRecords } from "@/pages/kid-page/use-temperature-records"
import { cn } from "@/lib/utils"

export function KidPage() {
  const { auth } = useAuth()
  const { kidId } = useParams()
  const data = useKidPageData(auth, kidId)
  const locks = useActionLocks()

  const temperature = useTemperatureRecords({
    auth,
    kid: data.kid,
    temperatures: data.temperatures,
    setTemperatures: data.setTemperatures,
    setDeletingRecordId: data.setDeletingRecordId,
    locks,
  })

  const medication = useMedicationRecords({
    auth,
    kid: data.kid,
    medications: data.medications,
    setMedications: data.setMedications,
    setDeletingRecordId: data.setDeletingRecordId,
    locks,
  })

  const growth = useGrowthRecords({
    auth,
    kid: data.kid,
    growthRecords: data.growthRecords,
    setGrowthRecords: data.setGrowthRecords,
    setKid: data.setKid,
    setDeletingRecordId: data.setDeletingRecordId,
    locks,
  })

  const note = useNoteRecords({
    auth,
    kid: data.kid,
    notes: data.notes,
    setNotes: data.setNotes,
    setDeletingRecordId: data.setDeletingRecordId,
    locks,
  })

  if (!auth) {
    return null
  }

  if (!kidId) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: "link" }),
              "mb-2 inline-flex items-center gap-2 px-0 text-muted-foreground"
            )}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="size-4"
            />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold">
            {data.kid?.name ?? "Kid details"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Birthday {data.kid?.birthDate ?? "-"} • Latest{" "}
            {data.kid?.currentHeightCm ?? data.latestGrowth?.heightCm ?? "-"} cm
            / {data.kid?.currentWeightKg ?? data.latestGrowth?.weightKg ?? "-"}{" "}
            kg
          </p>
        </div>
      </div>

      {data.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading records...</p>
      ) : null}

      {data.error ? (
        <Alert variant="destructive">
          <AlertTitle>Error loading kid data</AlertTitle>
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      ) : null}

      {!data.isLoading && !data.kid ? (
        <Alert>
          <AlertTitle>Kid not found</AlertTitle>
          <AlertDescription>
            The selected kid profile no longer exists.
          </AlertDescription>
        </Alert>
      ) : null}

      {data.kid ? (
        <Tabs defaultValue="temperature" className="gap-4">
          <TabsList variant="line">
            <TabsTrigger value="temperature">
              <HugeiconsIcon
                icon={ThermometerIcon}
                strokeWidth={2}
                className="size-4"
              />
              Temperature
            </TabsTrigger>
            <TabsTrigger value="medication">
              <HugeiconsIcon
                icon={PillIcon}
                strokeWidth={2}
                className="size-4"
              />
              Medication
            </TabsTrigger>
            <TabsTrigger value="growth">
              <HugeiconsIcon
                icon={WeightScale01Icon}
                strokeWidth={2}
                className="size-4"
              />
              Growth
            </TabsTrigger>
            <TabsTrigger value="notes">
              <HugeiconsIcon
                icon={Note04Icon}
                strokeWidth={2}
                className="size-4"
              />
              Notes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="temperature">
            <TemperatureTab
              temperatures={data.temperatures}
              latestTemperature={data.latestTemperature}
              feverCount={data.feverCount}
              temperatureTrend={data.temperatureTrend}
              deletingRecordId={data.deletingRecordId}
              onCreate={temperature.startCreate}
              onEdit={temperature.startEdit}
              onDelete={temperature.remove}
            />
          </TabsContent>
          <TabsContent value="medication">
            <MedicationTab
              medications={data.medications}
              medicationPerDay={data.medicationPerDay}
              mostUsedMedication={data.mostUsedMedication}
              deletingRecordId={data.deletingRecordId}
              onCreate={medication.startCreate}
              onEdit={medication.startEdit}
              onDelete={medication.remove}
            />
          </TabsContent>
          <TabsContent value="growth">
            <GrowthTab
              kid={data.kid}
              latestGrowth={data.latestGrowth}
              growthRecords={data.growthRecords}
              growthHeightTrend={data.growthHeightTrend}
              growthWeightTrend={data.growthWeightTrend}
              deletingRecordId={data.deletingRecordId}
              onCreate={growth.startCreate}
              onEdit={growth.startEdit}
              onDelete={growth.remove}
            />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab
              notes={data.notes}
              deletingRecordId={data.deletingRecordId}
              onCreate={note.startCreate}
              onEdit={note.startEdit}
              onDelete={note.remove}
            />
          </TabsContent>
        </Tabs>
      ) : null}

      <TemperatureDialog
        open={temperature.isTempOpen}
        editingId={temperature.editingTemperatureId}
        form={temperature.form}
        onOpenChange={(open) => {
          temperature.setIsTempOpen(open)
          if (!open) {
            temperature.resetForm()
          }
        }}
        onSubmit={temperature.submit}
      />

      <MedicationDialog
        open={medication.isMedOpen}
        editingId={medication.editingMedicationId}
        form={medication.form}
        onOpenChange={(open) => {
          medication.setIsMedOpen(open)
          if (!open) {
            medication.resetForm()
          }
        }}
        onSubmit={medication.submit}
      />

      <GrowthDialog
        open={growth.isGrowthOpen}
        editingId={growth.editingGrowthId}
        form={growth.form}
        onOpenChange={(open) => {
          growth.setIsGrowthOpen(open)
          if (!open) {
            growth.resetForm()
          }
        }}
        onSubmit={growth.submit}
      />

      <NoteDialog
        open={note.isNoteOpen}
        editingId={note.editingNoteId}
        form={note.form}
        onOpenChange={(open) => {
          note.setIsNoteOpen(open)
          if (!open) {
            note.resetForm()
          }
        }}
        onSubmit={note.submit}
      />
    </div>
  )
}
