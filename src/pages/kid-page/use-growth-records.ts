import { useState, type Dispatch, type SetStateAction } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { growthSchema, type GrowthFormInput } from "@/features/health/schemas"
import type { GrowthRecord, KidProfile } from "@/features/health/types"
import {
  addGrowthRecord,
  deleteGrowthRecord,
  updateGrowthRecord,
  updateKid,
} from "@/features/sheets/health-repository"
import type { KidAuth, LockHelpers } from "@/pages/kid-page/types"
import { toInputDateTime, toIso } from "@/pages/kid-page/utils"

type GrowthControllerArgs = {
  auth: KidAuth | null
  kid: KidProfile | null
  growthRecords: GrowthRecord[]
  setGrowthRecords: Dispatch<SetStateAction<GrowthRecord[]>>
  setKid: Dispatch<SetStateAction<KidProfile | null>>
  setDeletingRecordId: Dispatch<SetStateAction<string | null>>
  locks: LockHelpers
}

export function useGrowthRecords({
  auth,
  kid,
  growthRecords,
  setGrowthRecords,
  setKid,
  setDeletingRecordId,
  locks,
}: GrowthControllerArgs) {
  const [isGrowthOpen, setIsGrowthOpen] = useState(false)
  const [editingGrowthId, setEditingGrowthId] = useState<string | null>(null)

  const saveGrowthMutation = useMutation({
    mutationFn: async (payload: {
      values: GrowthFormInput
      editingGrowthId: string | null
    }) => {
      if (!kid || !auth) {
        throw new Error("Failed to save growth measurement")
      }

      if (payload.editingGrowthId) {
        const existing = growthRecords.find(
          (item) => item.id === payload.editingGrowthId
        )
        if (!existing) {
          throw new Error("Growth record not found")
        }

        const updated = await updateGrowthRecord(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            ...existing,
            measuredAt: toIso(payload.values.measuredAt),
            heightCm: payload.values.heightCm,
            weightKg: payload.values.weightKg,
            notes: payload.values.notes,
          }
        )

        return {
          kind: "update" as const,
          record: updated,
          kid: null,
        }
      }

      const saved = await addGrowthRecord(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        {
          kidId: kid.id,
          measuredAt: toIso(payload.values.measuredAt),
          heightCm: payload.values.heightCm,
          weightKg: payload.values.weightKg,
          notes: payload.values.notes,
        }
      )

      const updatedKid = await updateKid(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        {
          ...kid,
          currentHeightCm: payload.values.heightCm ?? kid.currentHeightCm,
          currentWeightKg: payload.values.weightKg ?? kid.currentWeightKg,
        }
      )

      return {
        kind: "create" as const,
        record: saved,
        kid: updatedKid,
      }
    },
    onSuccess: (result) => {
      if (result.kind === "update") {
        setGrowthRecords((current) =>
          current
            .map((item) =>
              item.id === result.record.id ? result.record : item
            )
            .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
        )
        toast.success("Growth measurement updated")
      } else {
        setGrowthRecords((current) => [result.record, ...current])
        if (result.kid) {
          setKid(result.kid)
        }
        toast.success("Growth measurement added")
      }

      setIsGrowthOpen(false)
      setEditingGrowthId(null)
      resetForm()
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : editingGrowthId
            ? "Failed to update growth measurement"
            : "Failed to add growth measurement"
      )
    },
  })

  const deleteGrowthMutation = useMutation({
    mutationFn: async (record: GrowthRecord) => {
      if (!auth) {
        throw new Error("Failed to delete growth record")
      }

      await deleteGrowthRecord(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        record.id
      )

      return record
    },
    onSuccess: (record) => {
      setGrowthRecords((current) =>
        current.filter((item) => item.id !== record.id)
      )
      if (editingGrowthId === record.id) {
        setEditingGrowthId(null)
        setIsGrowthOpen(false)
        resetForm()
      }
      toast.success("Growth record deleted")
    },
    onError: (deleteError) => {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete growth record"
      )
    },
    onSettled: () => {
      setDeletingRecordId(null)
    },
  })

  const form = useForm<GrowthFormInput>({
    defaultValues: {
      measuredAt: toInputDateTime(new Date().toISOString()),
      heightCm: undefined,
      weightKg: undefined,
      notes: "",
    },
  })

  function resetForm() {
    form.reset({
      measuredAt: toInputDateTime(new Date().toISOString()),
      heightCm: undefined,
      weightKg: undefined,
      notes: "",
    })
  }

  async function submit(values: GrowthFormInput) {
    const actionKey = editingGrowthId
      ? `save-growth-${editingGrowthId}`
      : "save-growth-new"
    if (!locks.acquireActionLock(actionKey)) return
    if (!kid || !auth) {
      locks.releaseActionLock(actionKey)
      return
    }

    const parsed = growthSchema.safeParse(values)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid growth input")
      locks.releaseActionLock(actionKey)
      return
    }

    try {
      await saveGrowthMutation.mutateAsync({
        values: parsed.data,
        editingGrowthId,
      })
    } finally {
      locks.releaseActionLock(actionKey)
    }
  }

  async function remove(record: GrowthRecord) {
    const actionKey = `delete-growth-${record.id}`
    if (!locks.acquireActionLock(actionKey)) return
    if (!auth) {
      locks.releaseActionLock(actionKey)
      return
    }
    if (!window.confirm("Delete this growth record?")) {
      locks.releaseActionLock(actionKey)
      return
    }

    setDeletingRecordId(record.id)
    try {
      await deleteGrowthMutation.mutateAsync(record)
    } finally {
      locks.releaseActionLock(actionKey)
    }
  }

  function startCreate() {
    setEditingGrowthId(null)
    resetForm()
    setIsGrowthOpen(true)
  }

  function startEdit(record: GrowthRecord) {
    setEditingGrowthId(record.id)
    form.reset({
      measuredAt: toInputDateTime(record.measuredAt),
      heightCm: record.heightCm,
      weightKg: record.weightKg,
      notes: record.notes ?? "",
    })
    setIsGrowthOpen(true)
  }

  return {
    form,
    isGrowthOpen,
    setIsGrowthOpen,
    editingGrowthId,
    submit,
    remove,
    startCreate,
    startEdit,
    resetForm,
  }
}
