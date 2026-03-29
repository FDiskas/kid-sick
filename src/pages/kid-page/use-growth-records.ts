import { useState, type Dispatch, type SetStateAction } from "react"
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
      if (editingGrowthId) {
        const existing = growthRecords.find(
          (item) => item.id === editingGrowthId
        )
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
        const saved = await addGrowthRecord(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            kidId: kid.id,
            measuredAt: toIso(parsed.data.measuredAt),
            heightCm: parsed.data.heightCm,
            weightKg: parsed.data.weightKg,
            notes: parsed.data.notes,
          }
        )

        const updatedKid = await updateKid(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            ...kid,
            currentHeightCm: parsed.data.heightCm ?? kid.currentHeightCm,
            currentWeightKg: parsed.data.weightKg ?? kid.currentWeightKg,
          }
        )

        setGrowthRecords((current) => [saved, ...current])
        setKid(updatedKid)
        toast.success("Growth measurement added")
      }

      setIsGrowthOpen(false)
      setEditingGrowthId(null)
      resetForm()
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : editingGrowthId
            ? "Failed to update growth measurement"
            : "Failed to add growth measurement"
      )
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
      await deleteGrowthRecord(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        record.id
      )
      setGrowthRecords((current) =>
        current.filter((item) => item.id !== record.id)
      )
      if (editingGrowthId === record.id) {
        setEditingGrowthId(null)
        setIsGrowthOpen(false)
        resetForm()
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
