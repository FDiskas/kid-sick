import { format } from "date-fns"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  Delete02Icon,
  Edit01Icon,
  FloppyDiskIcon,
  Loading03Icon,
  MedicineBottleIcon,
  NoteAddIcon,
  RulerIcon,
  ThermometerIcon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { BarMiniChart, LineMiniChart } from "@/components/ui/simple-charts"
import { useAuth } from "@/features/auth/auth-context"
import {
  growthSchema,
  medicationSchema,
  noteSchema,
  temperatureSchema,
  type GrowthFormInput,
  type MedicationFormInput,
  type NoteFormInput,
  type TemperatureFormInput,
} from "@/features/health/schemas"
import type {
  GrowthRecord,
  KidProfile,
  MedicationRecord,
  NoteRecord,
  TemperatureRecord,
} from "@/features/health/types"
import {
  addNote,
  addGrowthRecord,
  addMedicationRecord,
  addTemperatureRecord,
  deleteGrowthRecord,
  deleteMedicationRecord,
  deleteNote,
  deleteTemperatureRecord,
  listGrowthRecords,
  listKids,
  listNotes,
  listMedicationRecords,
  listTemperatureRecords,
  updateGrowthRecord,
  updateKid,
  updateMedicationRecord,
  updateNote,
  updateTemperatureRecord,
} from "@/features/sheets/health-repository"
import { cn } from "@/lib/utils"

function toIso(localDateTime: string) {
  return new Date(localDateTime).toISOString()
}

function toInputDateTime(iso: string) {
  return iso.slice(0, 16)
}

function renderDateTime(value: string) {
  return format(new Date(value), "yyyy-MM-dd HH:mm")
}

function normalizeTemperatureToCelsius(value: number, unit: "C" | "F") {
  if (unit === "F") {
    return ((value - 32) * 5) / 9
  }

  return value
}

export function KidPage() {
  const { auth } = useAuth()
  const { kidId } = useParams()

  const [kid, setKid] = useState<KidProfile | null>(null)
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>([])
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isTempOpen, setIsTempOpen] = useState(false)
  const [isMedOpen, setIsMedOpen] = useState(false)
  const [isGrowthOpen, setIsGrowthOpen] = useState(false)
  const [isNoteOpen, setIsNoteOpen] = useState(false)

  const [editingTemperatureId, setEditingTemperatureId] = useState<string | null>(null)
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null)
  const [editingGrowthId, setEditingGrowthId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)
  const actionLocksRef = useRef<Set<string>>(new Set())

  function acquireActionLock(key: string) {
    if (actionLocksRef.current.has(key)) {
      return false
    }

    actionLocksRef.current.add(key)
    return true
  }

  function releaseActionLock(key: string) {
    actionLocksRef.current.delete(key)
  }

  const temperatureForm = useForm<TemperatureFormInput>({
    defaultValues: {
      measuredAt: toInputDateTime(new Date().toISOString()),
      value: undefined,
      unit: "C",
      method: "",
      notes: "",
    },
  })

  const medicationForm = useForm<MedicationFormInput>({
    defaultValues: {
      takenAt: toInputDateTime(new Date().toISOString()),
      medicationName: "",
      dose: undefined,
      unit: "ml",
      notes: "",
    },
  })

  const growthForm = useForm<GrowthFormInput>({
    defaultValues: {
      measuredAt: toInputDateTime(new Date().toISOString()),
      heightCm: undefined,
      weightKg: undefined,
      notes: "",
    },
  })

  const noteForm = useForm<NoteFormInput>({
    defaultValues: {
      recordedAt: toInputDateTime(new Date().toISOString()),
      content: "",
    },
  })

  function resetTemperatureForm() {
    temperatureForm.reset({
      measuredAt: toInputDateTime(new Date().toISOString()),
      value: undefined,
      unit: "C",
      method: "",
      notes: "",
    })
  }

  function resetMedicationForm() {
    medicationForm.reset({
      takenAt: toInputDateTime(new Date().toISOString()),
      medicationName: "",
      dose: undefined,
      unit: "ml",
      notes: "",
    })
  }

  function resetGrowthForm() {
    growthForm.reset({
      measuredAt: toInputDateTime(new Date().toISOString()),
      heightCm: undefined,
      weightKg: undefined,
      notes: "",
    })
  }

  function resetNoteForm() {
    noteForm.reset({
      recordedAt: toInputDateTime(new Date().toISOString()),
      content: "",
    })
  }

  useEffect(() => {
    if (!auth || !kidId) {
      return
    }

    const currentAuth: NonNullable<typeof auth> = auth
    const currentKidId: string = kidId

    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [kids, tempRows, medRows, growthRows, noteRows] = await Promise.all([
          listKids(currentAuth.accessToken, currentAuth.spreadsheet.spreadsheetId),
          listTemperatureRecords(
            currentAuth.accessToken,
            currentAuth.spreadsheet.spreadsheetId,
            currentKidId
          ),
          listMedicationRecords(
            currentAuth.accessToken,
            currentAuth.spreadsheet.spreadsheetId,
            currentKidId
          ),
          listGrowthRecords(
            currentAuth.accessToken,
            currentAuth.spreadsheet.spreadsheetId,
            currentKidId
          ),
          listNotes(
            currentAuth.accessToken,
            currentAuth.spreadsheet.spreadsheetId,
            currentKidId
          ),
        ])

        const currentKid = kids.find((item) => item.id === currentKidId) ?? null

        if (isMounted) {
          setKid(currentKid)
          setTemperatures(tempRows)
          setMedications(medRows)
          setGrowthRecords(growthRows)
          setNotes(noteRows)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load kid data")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [auth, kidId])

  const latestGrowth = useMemo(() => growthRecords[0], [growthRecords])

  const latestTemperature = useMemo(() => temperatures[0] ?? null, [temperatures])

  const temperatureTrend = useMemo(() => {
    return temperatures
      .slice()
      .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
      .slice(-12)
      .map((entry) => ({
        label: format(new Date(entry.measuredAt), "MM/dd"),
        value: Number(normalizeTemperatureToCelsius(entry.value, entry.unit).toFixed(2)),
      }))
  }, [temperatures])

  const feverCount = useMemo(
    () =>
      temperatures.filter(
        (entry) => normalizeTemperatureToCelsius(entry.value, entry.unit) >= 38
      ).length,
    [temperatures]
  )

  const medicationPerDay = useMemo(() => {
    const countByDay = new Map<string, number>()

    for (const entry of medications) {
      const dayKey = entry.takenAt.slice(0, 10)
      countByDay.set(dayKey, (countByDay.get(dayKey) ?? 0) + 1)
    }

    return Array.from(countByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([day, value]) => ({
        label: format(new Date(day), "MM/dd"),
        value,
      }))
  }, [medications])

  const mostUsedMedication = useMemo(() => {
    const countByMedication = new Map<string, number>()

    for (const entry of medications) {
      const key = entry.medicationName.trim() || "Unnamed"
      countByMedication.set(key, (countByMedication.get(key) ?? 0) + 1)
    }

    let winner: { name: string; count: number } | null = null
    for (const [name, count] of countByMedication) {
      if (!winner || count > winner.count) {
        winner = { name, count }
      }
    }

    return winner
  }, [medications])

  const growthHeightTrend = useMemo(() => {
    return growthRecords
      .slice()
      .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
      .filter((entry) => typeof entry.heightCm === "number")
      .slice(-10)
      .map((entry) => ({
        label: format(new Date(entry.measuredAt), "MM/dd"),
        value: entry.heightCm ?? 0,
      }))
  }, [growthRecords])

  const growthWeightTrend = useMemo(() => {
    return growthRecords
      .slice()
      .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
      .filter((entry) => typeof entry.weightKg === "number")
      .slice(-10)
      .map((entry) => ({
        label: format(new Date(entry.measuredAt), "MM/dd"),
        value: entry.weightKg ?? 0,
      }))
  }, [growthRecords])

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
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold">{kid?.name ?? "Kid details"}</h1>
          <p className="text-sm text-muted-foreground">
            Birthday {kid?.birthDate ?? "-"} • Latest {kid?.currentHeightCm ?? latestGrowth?.heightCm ?? "-"} cm / {kid?.currentWeightKg ?? latestGrowth?.weightKg ?? "-"} kg
          </p>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading records...</p> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error loading kid data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !kid ? (
        <Alert>
          <AlertTitle>Kid not found</AlertTitle>
          <AlertDescription>The selected kid profile no longer exists.</AlertDescription>
        </Alert>
      ) : null}

      {kid ? (
        <Tabs defaultValue="temperature" className="gap-4">
          <TabsList>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="medication">Medication</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
                <CardHeader className="pb-2">
                  <CardDescription>Latest measurement</CardDescription>
                  <CardTitle className="text-2xl">
                    {latestTemperature
                      ? `${latestTemperature.value.toFixed(1)} ${latestTemperature.unit}`
                      : "-"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {latestTemperature ? renderDateTime(latestTemperature.measuredAt) : "No data"}
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
                    {feverCount > 0 ? "At least 38.0 C" : "No fever recorded"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
                <CardHeader className="pb-2">
                  <CardDescription>Total logs</CardDescription>
                  <CardTitle className="text-2xl">{temperatures.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Across all recorded days</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
              <CardHeader>
                <CardTitle>Temperature trend</CardTitle>
                <CardDescription>Last 12 measurements, normalized to C for consistency</CardDescription>
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
                <Button
                  onClick={() => {
                    setEditingTemperatureId(null)
                    resetTemperatureForm()
                    setIsTempOpen(true)
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  <HugeiconsIcon icon={ThermometerIcon} strokeWidth={2} className="size-4" />
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
                      <TableHead className="w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {temperatures.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{renderDateTime(row.measuredAt)}</TableCell>
                        <TableCell>{row.value} {row.unit}</TableCell>
                        <TableCell>{row.method || "-"}</TableCell>
                        <TableCell>{row.notes || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deletingRecordId === row.id}
                              onClick={() => {
                                setEditingTemperatureId(row.id)
                                temperatureForm.reset({
                                  measuredAt: toInputDateTime(row.measuredAt),
                                  value: row.value,
                                  unit: row.unit,
                                  method: row.method ?? "",
                                  notes: row.notes ?? "",
                                })
                                setIsTempOpen(true)
                              }}
                            >
                              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                const actionKey = `delete-temperature-${row.id}`
                                if (!acquireActionLock(actionKey)) {
                                  return
                                }

                                if (!window.confirm("Delete this temperature record?")) {
                                  releaseActionLock(actionKey)
                                  return
                                }

                                setDeletingRecordId(row.id)
                                try {
                                  await deleteTemperatureRecord(
                                    auth.accessToken,
                                    auth.spreadsheet.spreadsheetId,
                                    row.id
                                  )
                                  setTemperatures((current) => current.filter((item) => item.id !== row.id))
                                  if (editingTemperatureId === row.id) {
                                    setEditingTemperatureId(null)
                                    setIsTempOpen(false)
                                    resetTemperatureForm()
                                  }
                                  toast.success("Temperature deleted")
                                } catch (deleteError) {
                                  toast.error(
                                    deleteError instanceof Error
                                      ? deleteError.message
                                      : "Failed to delete temperature"
                                  )
                                } finally {
                                  setDeletingRecordId(null)
                                  releaseActionLock(actionKey)
                                }
                              }}
                            >
                              {deletingRecordId === row.id ? (
                                <>
                                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
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
          </TabsContent>

          <TabsContent value="medication" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
                <CardHeader className="pb-2">
                  <CardDescription>Total doses logged</CardDescription>
                  <CardTitle className="text-2xl">{medications.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">All medication records for this child</p>
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
                  <CardTitle className="text-2xl">{medicationPerDay.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Unique treatment days</p>
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
                <Button
                  onClick={() => {
                    setEditingMedicationId(null)
                    resetMedicationForm()
                    setIsMedOpen(true)
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  <HugeiconsIcon icon={MedicineBottleIcon} strokeWidth={2} className="size-4" />
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
                      <TableHead className="w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{renderDateTime(row.takenAt)}</TableCell>
                        <TableCell>{row.medicationName}</TableCell>
                        <TableCell>{row.dose} {row.unit}</TableCell>
                        <TableCell>{row.notes || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deletingRecordId === row.id}
                              onClick={() => {
                                setEditingMedicationId(row.id)
                                medicationForm.reset({
                                  takenAt: toInputDateTime(row.takenAt),
                                  medicationName: row.medicationName,
                                  dose: row.dose,
                                  unit: row.unit,
                                  notes: row.notes ?? "",
                                })
                                setIsMedOpen(true)
                              }}
                            >
                              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                const actionKey = `delete-medication-${row.id}`
                                if (!acquireActionLock(actionKey)) {
                                  return
                                }

                                if (!window.confirm("Delete this medication record?")) {
                                  releaseActionLock(actionKey)
                                  return
                                }

                                setDeletingRecordId(row.id)
                                try {
                                  await deleteMedicationRecord(
                                    auth.accessToken,
                                    auth.spreadsheet.spreadsheetId,
                                    row.id
                                  )
                                  setMedications((current) => current.filter((item) => item.id !== row.id))
                                  if (editingMedicationId === row.id) {
                                    setEditingMedicationId(null)
                                    setIsMedOpen(false)
                                    resetMedicationForm()
                                  }
                                  toast.success("Medication deleted")
                                } catch (deleteError) {
                                  toast.error(
                                    deleteError instanceof Error
                                      ? deleteError.message
                                      : "Failed to delete medication"
                                  )
                                } finally {
                                  setDeletingRecordId(null)
                                  releaseActionLock(actionKey)
                                }
                              }}
                            >
                              {deletingRecordId === row.id ? (
                                <>
                                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
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
          </TabsContent>

          <TabsContent value="growth" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
                <CardHeader className="pb-2">
                  <CardDescription>Latest height</CardDescription>
                  <CardTitle className="text-2xl">
                    {kid.currentHeightCm ?? latestGrowth?.heightCm ?? "-"} cm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">From profile or latest growth row</p>
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
                  <p className="text-xs text-muted-foreground">Most recent known measurement</p>
                </CardContent>
              </Card>

              <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
                <CardHeader className="pb-2">
                  <CardDescription>Growth checkpoints</CardDescription>
                  <CardTitle className="text-2xl">{growthRecords.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Historical growth entries</p>
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
                <Button
                  onClick={() => {
                    setEditingGrowthId(null)
                    resetGrowthForm()
                    setIsGrowthOpen(true)
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  <HugeiconsIcon icon={RulerIcon} strokeWidth={2} className="size-4" />
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
                              onClick={() => {
                                setEditingGrowthId(row.id)
                                growthForm.reset({
                                  measuredAt: toInputDateTime(row.measuredAt),
                                  heightCm: row.heightCm,
                                  weightKg: row.weightKg,
                                  notes: row.notes ?? "",
                                })
                                setIsGrowthOpen(true)
                              }}
                            >
                              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                const actionKey = `delete-growth-${row.id}`
                                if (!acquireActionLock(actionKey)) {
                                  return
                                }

                                if (!window.confirm("Delete this growth record?")) {
                                  releaseActionLock(actionKey)
                                  return
                                }

                                setDeletingRecordId(row.id)
                                try {
                                  await deleteGrowthRecord(
                                    auth.accessToken,
                                    auth.spreadsheet.spreadsheetId,
                                    row.id
                                  )
                                  setGrowthRecords((current) => current.filter((item) => item.id !== row.id))
                                  if (editingGrowthId === row.id) {
                                    setEditingGrowthId(null)
                                    setIsGrowthOpen(false)
                                    resetGrowthForm()
                                  }
                                  toast.success("Growth record deleted")
                                } catch (deleteError) {
                                  toast.error(
                                    deleteError instanceof Error
                                      ? deleteError.message
                                      : "Failed to delete growth record"
                                  )
                                } finally {
                                  setDeletingRecordId(null)
                                  releaseActionLock(actionKey)
                                }
                              }}
                            >
                              {deletingRecordId === row.id ? (
                                <>
                                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
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
          </TabsContent>

          <TabsContent value="notes" className="space-y-3">
            <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Button
                  onClick={() => {
                    setEditingNoteId(null)
                    resetNoteForm()
                    setIsNoteOpen(true)
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  <HugeiconsIcon icon={NoteAddIcon} strokeWidth={2} className="size-4" />
                  Add note
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className="w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notes.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{renderDateTime(row.recordedAt)}</TableCell>
                        <TableCell>{row.content}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deletingRecordId === row.id}
                              onClick={() => {
                                setEditingNoteId(row.id)
                                noteForm.reset({
                                  recordedAt: toInputDateTime(row.recordedAt),
                                  content: row.content,
                                })
                                setIsNoteOpen(true)
                              }}
                            >
                              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                const actionKey = `delete-note-${row.id}`
                                if (!acquireActionLock(actionKey)) {
                                  return
                                }

                                if (!window.confirm("Delete this note?")) {
                                  releaseActionLock(actionKey)
                                  return
                                }

                                setDeletingRecordId(row.id)
                                try {
                                  await deleteNote(auth.accessToken, auth.spreadsheet.spreadsheetId, row.id)
                                  setNotes((current) => current.filter((item) => item.id !== row.id))
                                  if (editingNoteId === row.id) {
                                    setEditingNoteId(null)
                                    setIsNoteOpen(false)
                                    resetNoteForm()
                                  }
                                  toast.success("Note deleted")
                                } catch (deleteError) {
                                  toast.error(
                                    deleteError instanceof Error
                                      ? deleteError.message
                                      : "Failed to delete note"
                                  )
                                } finally {
                                  setDeletingRecordId(null)
                                  releaseActionLock(actionKey)
                                }
                              }}
                            >
                              {deletingRecordId === row.id ? (
                                <>
                                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
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
          </TabsContent>
        </Tabs>
      ) : null}

      <Dialog
        open={isTempOpen}
        onOpenChange={(open) => {
          setIsTempOpen(open)
          if (!open) {
            setEditingTemperatureId(null)
            resetTemperatureForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemperatureId ? "Edit temperature" : "Add temperature"}</DialogTitle>
            <DialogDescription>
              {editingTemperatureId
                ? "Update the body temperature measurement."
                : "Record a new body temperature measurement."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={temperatureForm.handleSubmit(async (values) => {
              const actionKey = editingTemperatureId
                ? `save-temperature-${editingTemperatureId}`
                : "save-temperature-new"
              if (!acquireActionLock(actionKey)) {
                return
              }

              if (!kid) {
                releaseActionLock(actionKey)
                return
              }

              const parsed = temperatureSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(
                  parsed.error.issues[0]?.message ?? "Invalid temperature input"
                )
                releaseActionLock(actionKey)
                return
              }

              try {
                if (editingTemperatureId) {
                  const existing = temperatures.find((item) => item.id === editingTemperatureId)
                  if (!existing) {
                    toast.error("Temperature record not found")
                    return
                  }

                  const updated = await updateTemperatureRecord(
                    auth.accessToken,
                    auth.spreadsheet.spreadsheetId,
                    {
                      ...existing,
                      measuredAt: toIso(parsed.data.measuredAt),
                      value: parsed.data.value,
                      unit: parsed.data.unit,
                      method: parsed.data.method,
                      notes: parsed.data.notes,
                    }
                  )

                  setTemperatures((current) =>
                    current
                      .map((item) => (item.id === updated.id ? updated : item))
                      .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
                  )
                  toast.success("Temperature updated")
                } else {
                  const saved = await addTemperatureRecord(auth.accessToken, auth.spreadsheet.spreadsheetId, {
                    kidId: kid.id,
                    measuredAt: toIso(parsed.data.measuredAt),
                    value: parsed.data.value,
                    unit: parsed.data.unit,
                    method: parsed.data.method,
                    notes: parsed.data.notes,
                  })

                  setTemperatures((current) => [saved, ...current])
                  toast.success("Temperature added")
                }

                setIsTempOpen(false)
                setEditingTemperatureId(null)
                resetTemperatureForm()
              } catch (saveError) {
                toast.error(
                  saveError instanceof Error
                    ? saveError.message
                    : editingTemperatureId
                      ? "Failed to update temperature"
                      : "Failed to add temperature"
                )
              } finally {
                releaseActionLock(actionKey)
              }
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="temp-time">Date and time</Label>
              <Input id="temp-time" type="datetime-local" {...temperatureForm.register("measuredAt")} />
              <p className="text-xs text-destructive">{temperatureForm.formState.errors.measuredAt?.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="temp-value">Value</Label>
                <Input id="temp-value" type="number" step="0.1" {...temperatureForm.register("value")} />
                <p className="text-xs text-destructive">{temperatureForm.formState.errors.value?.message}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="temp-unit">Unit</Label>
                <Input id="temp-unit" {...temperatureForm.register("unit")} />
                <p className="text-xs text-destructive">{temperatureForm.formState.errors.unit?.message}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp-method">Method</Label>
              <Input id="temp-method" placeholder="Oral / ear / forehead" {...temperatureForm.register("method")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp-notes">Notes</Label>
              <Textarea id="temp-notes" rows={3} {...temperatureForm.register("notes")} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={temperatureForm.formState.isSubmitting}>
                {temperatureForm.formState.isSubmitting ? (
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                ) : (
                  <HugeiconsIcon
                    icon={editingTemperatureId ? FloppyDiskIcon : Add01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                {temperatureForm.formState.isSubmitting
                  ? editingTemperatureId
                    ? "Updating..."
                    : "Adding..."
                  : editingTemperatureId
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMedOpen}
        onOpenChange={(open) => {
          setIsMedOpen(open)
          if (!open) {
            setEditingMedicationId(null)
            resetMedicationForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedicationId ? "Edit medication record" : "Add medication record"}</DialogTitle>
            <DialogDescription>
              {editingMedicationId
                ? "Update meds taken and dosage for this child."
                : "Track meds taken and dosage for this child."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={medicationForm.handleSubmit(async (values) => {
              const actionKey = editingMedicationId
                ? `save-medication-${editingMedicationId}`
                : "save-medication-new"
              if (!acquireActionLock(actionKey)) {
                return
              }

              if (!kid) {
                releaseActionLock(actionKey)
                return
              }

              const parsed = medicationSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(
                  parsed.error.issues[0]?.message ?? "Invalid medication input"
                )
                releaseActionLock(actionKey)
                return
              }

              try {
                if (editingMedicationId) {
                  const existing = medications.find((item) => item.id === editingMedicationId)
                  if (!existing) {
                    toast.error("Medication record not found")
                    return
                  }

                  const updated = await updateMedicationRecord(
                    auth.accessToken,
                    auth.spreadsheet.spreadsheetId,
                    {
                      ...existing,
                      takenAt: toIso(parsed.data.takenAt),
                      medicationName: parsed.data.medicationName,
                      dose: parsed.data.dose,
                      unit: parsed.data.unit,
                      notes: parsed.data.notes,
                    }
                  )

                  setMedications((current) =>
                    current
                      .map((item) => (item.id === updated.id ? updated : item))
                      .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
                  )
                  toast.success("Medication updated")
                } else {
                  const saved = await addMedicationRecord(auth.accessToken, auth.spreadsheet.spreadsheetId, {
                    kidId: kid.id,
                    takenAt: toIso(parsed.data.takenAt),
                    medicationName: parsed.data.medicationName,
                    dose: parsed.data.dose,
                    unit: parsed.data.unit,
                    notes: parsed.data.notes,
                  })

                  setMedications((current) => [saved, ...current])
                  toast.success("Medication added")
                }

                setIsMedOpen(false)
                setEditingMedicationId(null)
                resetMedicationForm()
              } catch (saveError) {
                toast.error(
                  saveError instanceof Error
                    ? saveError.message
                    : editingMedicationId
                      ? "Failed to update medication"
                      : "Failed to add medication"
                )
              } finally {
                releaseActionLock(actionKey)
              }
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="med-time">Date and time</Label>
              <Input id="med-time" type="datetime-local" {...medicationForm.register("takenAt")} />
              <p className="text-xs text-destructive">{medicationForm.formState.errors.takenAt?.message}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-name">Medication</Label>
              <Input id="med-name" {...medicationForm.register("medicationName")} />
              <p className="text-xs text-destructive">{medicationForm.formState.errors.medicationName?.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="med-dose">Dose</Label>
                <Input id="med-dose" type="number" step="0.1" {...medicationForm.register("dose")} />
                <p className="text-xs text-destructive">{medicationForm.formState.errors.dose?.message}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med-unit">Unit</Label>
                <Input id="med-unit" {...medicationForm.register("unit")} />
                <p className="text-xs text-destructive">{medicationForm.formState.errors.unit?.message}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-notes">Notes</Label>
              <Textarea id="med-notes" rows={3} {...medicationForm.register("notes")} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={medicationForm.formState.isSubmitting}>
                {medicationForm.formState.isSubmitting ? (
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                ) : (
                  <HugeiconsIcon
                    icon={editingMedicationId ? FloppyDiskIcon : Add01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                {medicationForm.formState.isSubmitting
                  ? editingMedicationId
                    ? "Updating..."
                    : "Adding..."
                  : editingMedicationId
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isGrowthOpen}
        onOpenChange={(open) => {
          setIsGrowthOpen(open)
          if (!open) {
            setEditingGrowthId(null)
            resetGrowthForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGrowthId ? "Edit growth measurement" : "Add growth measurement"}</DialogTitle>
            <DialogDescription>
              {editingGrowthId
                ? "Update historical growth values for this child."
                : "Save historical growth and refresh profile latest values."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={growthForm.handleSubmit(async (values) => {
              const actionKey = editingGrowthId
                ? `save-growth-${editingGrowthId}`
                : "save-growth-new"
              if (!acquireActionLock(actionKey)) {
                return
              }

              if (!kid) {
                releaseActionLock(actionKey)
                return
              }

              const parsed = growthSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(parsed.error.issues[0]?.message ?? "Invalid growth input")
                releaseActionLock(actionKey)
                return
              }

              try {
                if (editingGrowthId) {
                  const existing = growthRecords.find((item) => item.id === editingGrowthId)
                  if (!existing) {
                    toast.error("Growth record not found")
                    return
                  }

                  const updated = await updateGrowthRecord(
                    auth.accessToken,
                    auth.spreadsheet.spreadsheetId,
                    {
                      ...existing,
                      measuredAt: toIso(parsed.data.measuredAt),
                      heightCm: parsed.data.heightCm,
                      weightKg: parsed.data.weightKg,
                      notes: parsed.data.notes,
                    }
                  )

                  setGrowthRecords((current) =>
                    current
                      .map((item) => (item.id === updated.id ? updated : item))
                      .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
                  )
                  toast.success("Growth measurement updated")
                } else {
                  const saved = await addGrowthRecord(auth.accessToken, auth.spreadsheet.spreadsheetId, {
                    kidId: kid.id,
                    measuredAt: toIso(parsed.data.measuredAt),
                    heightCm: parsed.data.heightCm,
                    weightKg: parsed.data.weightKg,
                    notes: parsed.data.notes,
                  })

                  const updatedKid = await updateKid(auth.accessToken, auth.spreadsheet.spreadsheetId, {
                    ...kid,
                    currentHeightCm: parsed.data.heightCm ?? kid.currentHeightCm,
                    currentWeightKg: parsed.data.weightKg ?? kid.currentWeightKg,
                  })

                  setGrowthRecords((current) => [saved, ...current])
                  setKid(updatedKid)
                  toast.success("Growth measurement added")
                }

                setIsGrowthOpen(false)
                setEditingGrowthId(null)
                resetGrowthForm()
              } catch (saveError) {
                toast.error(
                  saveError instanceof Error
                    ? saveError.message
                    : editingGrowthId
                      ? "Failed to update growth measurement"
                      : "Failed to add growth measurement"
                )
              } finally {
                releaseActionLock(actionKey)
              }
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="growth-time">Date and time</Label>
              <Input id="growth-time" type="datetime-local" {...growthForm.register("measuredAt")} />
              <p className="text-xs text-destructive">{growthForm.formState.errors.measuredAt?.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="growth-height">Height (cm)</Label>
                <Input id="growth-height" type="number" step="0.1" {...growthForm.register("heightCm")} />
                <p className="text-xs text-destructive">{growthForm.formState.errors.heightCm?.message}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="growth-weight">Weight (kg)</Label>
                <Input id="growth-weight" type="number" step="0.1" {...growthForm.register("weightKg")} />
                <p className="text-xs text-destructive">{growthForm.formState.errors.weightKg?.message}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="growth-notes">Notes</Label>
              <Textarea id="growth-notes" rows={3} {...growthForm.register("notes")} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={growthForm.formState.isSubmitting}>
                {growthForm.formState.isSubmitting ? (
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                ) : (
                  <HugeiconsIcon
                    icon={editingGrowthId ? FloppyDiskIcon : Add01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                {growthForm.formState.isSubmitting
                  ? editingGrowthId
                    ? "Updating..."
                    : "Adding..."
                  : editingGrowthId
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNoteOpen}
        onOpenChange={(open) => {
          setIsNoteOpen(open)
          if (!open) {
            setEditingNoteId(null)
            resetNoteForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNoteId ? "Edit note" : "Add note"}</DialogTitle>
            <DialogDescription>
              {editingNoteId
                ? "Update an existing note for this child."
                : "Record a new note for this child."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={noteForm.handleSubmit(async (values) => {
              const actionKey = editingNoteId
                ? `save-note-${editingNoteId}`
                : "save-note-new"
              if (!acquireActionLock(actionKey)) {
                return
              }

              if (!kid) {
                releaseActionLock(actionKey)
                return
              }

              const parsed = noteSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(parsed.error.issues[0]?.message ?? "Invalid note input")
                releaseActionLock(actionKey)
                return
              }

              try {
                if (editingNoteId) {
                  const existing = notes.find((item) => item.id === editingNoteId)
                  if (!existing) {
                    toast.error("Note record not found")
                    return
                  }

                  const updated = await updateNote(
                    auth.accessToken,
                    auth.spreadsheet.spreadsheetId,
                    {
                      ...existing,
                      recordedAt: toIso(parsed.data.recordedAt),
                      content: parsed.data.content,
                    }
                  )

                  setNotes((current) =>
                    current
                      .map((item) => (item.id === updated.id ? updated : item))
                      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
                  )
                  toast.success("Note updated")
                } else {
                  const saved = await addNote(auth.accessToken, auth.spreadsheet.spreadsheetId, {
                    kidId: kid.id,
                    recordedAt: toIso(parsed.data.recordedAt),
                    content: parsed.data.content,
                  })

                  setNotes((current) => [saved, ...current])
                  toast.success("Note added")
                }

                setIsNoteOpen(false)
                setEditingNoteId(null)
                resetNoteForm()
              } catch (saveError) {
                toast.error(
                  saveError instanceof Error
                    ? saveError.message
                    : editingNoteId
                      ? "Failed to update note"
                      : "Failed to add note"
                )
              } finally {
                releaseActionLock(actionKey)
              }
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="note-time">Date and time</Label>
              <Input id="note-time" type="datetime-local" {...noteForm.register("recordedAt")} />
              <p className="text-xs text-destructive">{noteForm.formState.errors.recordedAt?.message}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note-content">Content</Label>
              <Textarea id="note-content" rows={4} {...noteForm.register("content")} />
              <p className="text-xs text-destructive">{noteForm.formState.errors.content?.message}</p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={noteForm.formState.isSubmitting}>
                {noteForm.formState.isSubmitting ? (
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                ) : (
                  <HugeiconsIcon
                    icon={editingNoteId ? FloppyDiskIcon : Add01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                {noteForm.formState.isSubmitting
                  ? editingNoteId
                    ? "Updating..."
                    : "Adding..."
                  : editingNoteId
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
