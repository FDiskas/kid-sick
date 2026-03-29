import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  temperatureSchema,
  type TemperatureFormInput,
} from "@/features/health/schemas"
import { getTemperatureUnitPreference } from "@/features/health/temperature-unit-preference"
import type { KidProfile, TemperatureRecord } from "@/features/health/types"
import {
  addTemperatureRecord,
  deleteTemperatureRecord,
  updateTemperatureRecord,
} from "@/features/sheets/health-repository"
import type { KidAuth, LockHelpers } from "@/pages/kid-page/types"
import { toInputDateTime, toIso } from "@/pages/kid-page/utils"

type TemperatureControllerArgs = {
  auth: KidAuth | null
  kid: KidProfile | null
  temperatures: TemperatureRecord[]
  setTemperatures: Dispatch<SetStateAction<TemperatureRecord[]>>
  setDeletingRecordId: Dispatch<SetStateAction<string | null>>
  locks: LockHelpers
}

function getDefaultTemperatureFormValues(): Partial<TemperatureFormInput> {
  return {
    measuredAt: toInputDateTime(new Date().toISOString()),
    value: undefined,
    unit: getTemperatureUnitPreference(),
    method: "",
    notes: "",
  }
}

export function useTemperatureRecords({
  auth,
  kid,
  temperatures,
  setTemperatures,
  setDeletingRecordId,
  locks,
}: TemperatureControllerArgs) {
  const [isTempOpen, setIsTempOpen] = useState(false)
  const [editingTemperatureId, setEditingTemperatureId] = useState<
    string | null
  >(null)

  const form = useForm<TemperatureFormInput>({
    defaultValues: getDefaultTemperatureFormValues(),
  })

  function resetForm() {
    form.reset(getDefaultTemperatureFormValues())
  }

  async function submit(values: TemperatureFormInput) {
    const actionKey = editingTemperatureId
      ? `save-temperature-${editingTemperatureId}`
      : "save-temperature-new"
    if (!locks.acquireActionLock(actionKey)) {
      return
    }

    if (!kid || !auth) {
      locks.releaseActionLock(actionKey)
      return
    }

    const parsed = temperatureSchema.safeParse(values)
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Invalid temperature input"
      )
      locks.releaseActionLock(actionKey)
      return
    }

    try {
      if (editingTemperatureId) {
        const existing = temperatures.find(
          (item) => item.id === editingTemperatureId
        )
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
        const saved = await addTemperatureRecord(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            kidId: kid.id,
            measuredAt: toIso(parsed.data.measuredAt),
            value: parsed.data.value,
            unit: parsed.data.unit,
            method: parsed.data.method,
            notes: parsed.data.notes,
          }
        )
        setTemperatures((current) => [saved, ...current])
        toast.success("Temperature added")
      }

      setIsTempOpen(false)
      setEditingTemperatureId(null)
      resetForm()
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : editingTemperatureId
            ? "Failed to update temperature"
            : "Failed to add temperature"
      )
    } finally {
      locks.releaseActionLock(actionKey)
    }
  }

  async function remove(record: TemperatureRecord) {
    const actionKey = `delete-temperature-${record.id}`
    if (!locks.acquireActionLock(actionKey)) {
      return
    }

    if (!auth) {
      locks.releaseActionLock(actionKey)
      return
    }

    if (!window.confirm("Delete this temperature record?")) {
      locks.releaseActionLock(actionKey)
      return
    }

    setDeletingRecordId(record.id)
    try {
      await deleteTemperatureRecord(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        record.id
      )
      setTemperatures((current) =>
        current.filter((item) => item.id !== record.id)
      )
      if (editingTemperatureId === record.id) {
        setEditingTemperatureId(null)
        setIsTempOpen(false)
        resetForm()
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
      locks.releaseActionLock(actionKey)
    }
  }

  function startCreate() {
    setEditingTemperatureId(null)
    resetForm()
    setIsTempOpen(true)
  }

  function startEdit(record: TemperatureRecord) {
    setEditingTemperatureId(record.id)
    form.reset({
      measuredAt: toInputDateTime(record.measuredAt),
      value: record.value,
      unit: record.unit,
      method: record.method ?? "",
      notes: record.notes ?? "",
    })
    setIsTempOpen(true)
  }

  return {
    form,
    isTempOpen,
    setIsTempOpen,
    editingTemperatureId,
    submit,
    remove,
    startCreate,
    startEdit,
    resetForm,
  }
}
