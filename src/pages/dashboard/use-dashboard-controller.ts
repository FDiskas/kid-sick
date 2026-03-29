import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { SpreadsheetContext, KidProfile } from "@/features/health/types"
import { kidSchema, type KidFormInput } from "@/features/health/schemas"
import {
  createKid,
  deleteKidCascade,
  listKids,
  updateKid,
} from "@/features/sheets/health-repository"

export const defaultKidValues: KidFormInput = {
  name: "",
  birthDate: "",
  currentHeightCm: undefined,
  currentWeightKg: undefined,
  notes: "",
}

function isoDateOnly(value: string) {
  return value.slice(0, 10)
}

export function useDashboardController(
  auth: {
    accessToken: string
    spreadsheet: SpreadsheetContext
  } | null
) {
  const [kids, setKids] = useState<KidProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null)
  const [deletingKidId, setDeletingKidId] = useState<string | null>(null)
  const deleteLocksRef = useRef<Set<string>>(new Set())

  const form = useForm<KidFormInput>({ defaultValues: defaultKidValues })

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
            loadError instanceof Error
              ? loadError.message
              : "Unable to load kids"
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

  function openCreateDialog() {
    setEditingKid(null)
    form.reset(defaultKidValues)
    setIsDialogOpen(true)
  }

  function openEditDialog(kid: KidProfile) {
    setEditingKid(kid)
    form.reset({
      name: kid.name,
      birthDate: isoDateOnly(kid.birthDate),
      currentHeightCm: kid.currentHeightCm,
      currentWeightKg: kid.currentWeightKg,
      notes: kid.notes,
    })
    setIsDialogOpen(true)
  }

  async function submitKid(values: KidFormInput) {
    if (!auth) {
      return
    }

    const parsed = kidSchema.safeParse(values)
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Invalid kid profile input"
      )
      return
    }

    const payload = { ...parsed.data, notes: parsed.data.notes ?? "" }

    try {
      if (editingKid) {
        const updatedKid = await updateKid(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            ...editingKid,
            ...payload,
          }
        )
        setKids((existing) =>
          existing.map((item) =>
            item.id === updatedKid.id ? updatedKid : item
          )
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
  }

  async function deleteKid(kid: KidProfile) {
    if (!auth) {
      return
    }

    const actionKey = `delete-kid-${kid.id}`
    if (deleteLocksRef.current.has(actionKey)) {
      return
    }

    deleteLocksRef.current.add(actionKey)
    const confirmed = window.confirm(
      `Delete ${kid.name}? This will permanently remove the kid profile and all related temperature, medication, and growth records.`
    )

    if (!confirmed) {
      deleteLocksRef.current.delete(actionKey)
      return
    }

    setDeletingKidId(kid.id)
    try {
      await deleteKidCascade(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        kid.id
      )
      setKids((existing) => existing.filter((item) => item.id !== kid.id))

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
      deleteLocksRef.current.delete(actionKey)
    }
  }

  return {
    kids,
    isLoading,
    error,
    form,
    dialogTitle,
    isDialogOpen,
    setIsDialogOpen,
    editingKid,
    deletingKidId,
    openCreateDialog,
    openEditDialog,
    submitKid,
    deleteKid,
  }
}
