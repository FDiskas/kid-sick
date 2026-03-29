import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/features/auth/auth-context"
import { kidSchema, type KidFormInput } from "@/features/health/schemas"
import type { KidProfile } from "@/features/health/types"
import {
  createKid,
  deleteKidCascade,
  listKids,
  updateKid,
} from "@/features/sheets/health-repository"
import { cn } from "@/lib/utils"

function isoDateOnly(value: string) {
  return value.slice(0, 10)
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Alert>
      <AlertTitle>No kids added yet</AlertTitle>
      <AlertDescription>
        Start by adding your first child profile to begin tracking temperature, medication, and growth logs.
      </AlertDescription>
      <div className="mt-3">
        <Button onClick={onCreate}>Add First Kid</Button>
      </div>
    </Alert>
  )
}

export function DashboardPage() {
  const { auth } = useAuth()
  const [kids, setKids] = useState<KidProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null)
  const [deletingKidId, setDeletingKidId] = useState<string | null>(null)

  const form = useForm<KidFormInput>({
    defaultValues: {
      name: "",
      birthDate: "",
      currentHeightCm: undefined,
      currentWeightKg: undefined,
      notes: "",
    },
  })

  const dialogTitle = useMemo(
    () => (editingKid ? "Edit kid profile" : "Add kid profile"),
    [editingKid]
  )

  useEffect(() => {
    if (!auth) {
      return
    }

    const currentAuth: NonNullable<typeof auth> = auth

    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await listKids(
          currentAuth.accessToken,
          currentAuth.spreadsheet.spreadsheetId
        )
        if (isMounted) {
          setKids(result)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load kids"
          )
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
  }, [auth])

  if (!auth) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kids Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage child profiles and jump into detailed tracking records.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingKid(null)
            form.reset({
              name: "",
              birthDate: "",
              currentHeightCm: undefined,
              currentWeightKg: undefined,
              notes: "",
            })
            setIsDialogOpen(true)
          }}
        >
          Add Kid
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading data...</div>
      ) : kids.length === 0 ? (
        <EmptyState onCreate={() => setIsDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kids.map((kid) => (
            <Card key={kid.id}>
              <CardHeader>
                <CardTitle className="text-lg">{kid.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-muted-foreground">Birthday: {kid.birthDate}</div>
                <div className="text-muted-foreground">
                  Latest: {kid.currentHeightCm ?? "-"} cm / {kid.currentWeightKg ?? "-"} kg
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/kids/${kid.id}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Open details
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingKid(kid)
                      form.reset({
                        name: kid.name,
                        birthDate: isoDateOnly(kid.birthDate),
                        currentHeightCm: kid.currentHeightCm,
                        currentWeightKg: kid.currentWeightKg,
                        notes: kid.notes,
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingKidId === kid.id}
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `Delete ${kid.name}? This will permanently remove the kid profile and all related temperature, medication, and growth records.`
                      )

                      if (!confirmed) {
                        return
                      }

                      setDeletingKidId(kid.id)
                      try {
                        await deleteKidCascade(
                          auth.accessToken,
                          auth.spreadsheet.spreadsheetId,
                          kid.id
                        )

                        setKids((existing) =>
                          existing.filter((item) => item.id !== kid.id)
                        )

                        if (editingKid?.id === kid.id) {
                          setEditingKid(null)
                          setIsDialogOpen(false)
                        }

                        toast.success("Kid and related records deleted")
                      } catch (deleteError) {
                        toast.error(
                          deleteError instanceof Error
                            ? deleteError.message
                            : "Failed to delete kid"
                        )
                      } finally {
                        setDeletingKidId(null)
                      }
                    }}
                  >
                    {deletingKidId === kid.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Add core profile details and update height or weight anytime.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              const parsed = kidSchema.safeParse(values)
              if (!parsed.success) {
                toast.error(parsed.error.issues[0]?.message ?? "Invalid kid profile input")
                return
              }

              const payload = {
                ...parsed.data,
                notes: parsed.data.notes ?? "",
              }

              try {
                if (editingKid) {
                  const updatedKid = await updateKid(auth.accessToken, auth.spreadsheet.spreadsheetId, {
                    ...editingKid,
                    ...payload,
                  })

                  setKids((existing) =>
                    existing.map((item) => (item.id === updatedKid.id ? updatedKid : item))
                  )
                  toast.success("Kid profile updated")
                } else {
                  const createdKid = await createKid(
                    auth.accessToken,
                    auth.spreadsheet.spreadsheetId,
                    payload
                  )
                  setKids((existing) => [createdKid, ...existing])
                  toast.success("Kid profile created")
                }

                setIsDialogOpen(false)
                setEditingKid(null)
              } catch (saveError) {
                toast.error(
                  saveError instanceof Error
                    ? saveError.message
                    : "Failed to save kid profile"
                )
              }
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="kid-name">Name</Label>
              <Input id="kid-name" {...form.register("name")} />
              <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kid-birthday">Birthday</Label>
              <Input id="kid-birthday" type="date" {...form.register("birthDate")} />
              <p className="text-xs text-destructive">{form.formState.errors.birthDate?.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="kid-height">Height (cm)</Label>
                <Input id="kid-height" type="number" step="0.1" {...form.register("currentHeightCm")} />
                <p className="text-xs text-destructive">{form.formState.errors.currentHeightCm?.message}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kid-weight">Weight (kg)</Label>
                <Input id="kid-weight" type="number" step="0.1" {...form.register("currentWeightKg")} />
                <p className="text-xs text-destructive">{form.formState.errors.currentWeightKg?.message}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kid-notes">Notes</Label>
              <Textarea id="kid-notes" rows={3} {...form.register("notes")} />
              <p className="text-xs text-destructive">{form.formState.errors.notes?.message}</p>
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
