import { useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { sheetsQueryKeys } from "@/features/sheets/query-keys"

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null)
  const [deletingKidId, setDeletingKidId] = useState<string | null>(null)
  const deleteLocksRef = useRef<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const spreadsheetId = auth?.spreadsheet.spreadsheetId ?? ""

  const form = useForm<KidFormInput>({ defaultValues: defaultKidValues })

  const kidsQuery = useQuery({
    queryKey: sheetsQueryKeys.kids(spreadsheetId),
    queryFn: async () => {
      if (!auth) {
        throw new Error("Unable to load kids")
      }

      return listKids(auth.accessToken, auth.spreadsheet.spreadsheetId)
    },
    enabled: Boolean(auth),
  })

  const saveKidMutation = useMutation({
    mutationFn: async (payload: {
      values: KidFormInput
      editingKid: KidProfile | null
    }) => {
      if (!auth) {
        throw new Error("Failed to save kid profile")
      }

      if (payload.editingKid) {
        const updatedKid = await updateKid(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            ...payload.editingKid,
            ...payload.values,
          }
        )

        return {
          kind: "update" as const,
          kid: updatedKid,
        }
      }

      const createdKid = await createKid(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        payload.values
      )

      return {
        kind: "create" as const,
        kid: createdKid,
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<KidProfile[]>(
        sheetsQueryKeys.kids(spreadsheetId),
        (current = []) =>
          result.kind === "create"
            ? [result.kid, ...current]
            : current.map((item) =>
                item.id === result.kid.id ? result.kid : item
              )
      )

      toast.success(
        result.kind === "create" ? "Kid profile created" : "Kid profile updated"
      )
      setIsDialogOpen(false)
      setEditingKid(null)
      form.reset(defaultKidValues)
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save kid profile"
      )
    },
  })

  const deleteKidMutation = useMutation({
    mutationFn: async (kid: KidProfile) => {
      if (!auth) {
        throw new Error("Failed to delete kid")
      }

      await deleteKidCascade(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        kid.id
      )

      return kid
    },
    onSuccess: (kid) => {
      queryClient.setQueryData<KidProfile[]>(
        sheetsQueryKeys.kids(spreadsheetId),
        (current = []) => current.filter((item) => item.id !== kid.id)
      )
      queryClient.removeQueries({
        queryKey: sheetsQueryKeys.kid(spreadsheetId, kid.id),
      })

      if (editingKid?.id === kid.id) {
        setEditingKid(null)
        setIsDialogOpen(false)
      }

      toast.success("Kid and related records deleted")
    },
    onError: (deleteError) => {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete kid"
      )
    },
    onSettled: () => {
      setDeletingKidId(null)
    },
  })

  const dialogTitle = useMemo(
    () => (editingKid ? "Edit kid profile" : "Add kid profile"),
    [editingKid]
  )

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

    await saveKidMutation.mutateAsync({
      values: { ...parsed.data, notes: parsed.data.notes ?? "" },
      editingKid,
    })
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
      await deleteKidMutation.mutateAsync(kid)
    } finally {
      deleteLocksRef.current.delete(actionKey)
    }
  }

  return {
    kids: kidsQuery.data ?? [],
    isLoading: kidsQuery.isPending,
    error: kidsQuery.error instanceof Error ? kidsQuery.error.message : null,
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
