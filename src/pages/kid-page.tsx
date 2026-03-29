import { format } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
              "mb-2 inline-flex px-0 text-muted-foreground"
            )}
          >
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
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Temperature logs</CardTitle>
                <Button
                  onClick={() => {
                    setEditingTemperatureId(null)
                    resetTemperatureForm()
                    setIsTempOpen(true)
                  }}
                >
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
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                if (!window.confirm("Delete this temperature record?")) {
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
                                }
                              }}
                            >
                              Delete
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
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Medication logs</CardTitle>
                <Button
                  onClick={() => {
                    setEditingMedicationId(null)
                    resetMedicationForm()
                    setIsMedOpen(true)
                  }}
                >
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
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                if (!window.confirm("Delete this medication record?")) {
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
                                }
                              }}
                            >
                              Delete
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
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Growth history</CardTitle>
                <Button
                  onClick={() => {
                    setEditingGrowthId(null)
                    resetGrowthForm()
                    setIsGrowthOpen(true)
                  }}
                >
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
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                if (!window.confirm("Delete this growth record?")) {
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
                                }
                              }}
                            >
                              Delete
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
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Button
                  onClick={() => {
                    setEditingNoteId(null)
                    resetNoteForm()
                    setIsNoteOpen(true)
                  }}
                >
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
                              onClick={() => {
                                setEditingNoteId(row.id)
                                noteForm.reset({
                                  recordedAt: toInputDateTime(row.recordedAt),
                                  content: row.content,
                                })
                                setIsNoteOpen(true)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingRecordId === row.id}
                              onClick={async () => {
                                if (!window.confirm("Delete this note?")) {
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
                                }
                              }}
                            >
                              Delete
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
              if (!kid) {
                return
              }

              const parsed = temperatureSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(
                  parsed.error.issues[0]?.message ?? "Invalid temperature input"
                )
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
              <Button type="submit">{editingTemperatureId ? "Update" : "Add"}</Button>
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
              if (!kid) {
                return
              }

              const parsed = medicationSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(
                  parsed.error.issues[0]?.message ?? "Invalid medication input"
                )
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
              <Button type="submit">{editingMedicationId ? "Update" : "Add"}</Button>
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
              if (!kid) {
                return
              }

              const parsed = growthSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(parsed.error.issues[0]?.message ?? "Invalid growth input")
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
              <Button type="submit">{editingGrowthId ? "Update" : "Add"}</Button>
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
              if (!kid) {
                return
              }

              const parsed = noteSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(parsed.error.issues[0]?.message ?? "Invalid note input")
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
              <Button type="submit">{editingNoteId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
