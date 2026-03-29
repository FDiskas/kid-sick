import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  medicationSchema,
  type MedicationFormInput,
} from "@/features/health/schemas"
import type { KidProfile, MedicationRecord } from "@/features/health/types"
import {
  addMedicationRecord,
  deleteMedicationRecord,
  updateMedicationRecord,
} from "@/features/sheets/health-repository"
import type { KidAuth, LockHelpers } from "@/pages/kid-page/types"
import { toInputDateTime, toIso } from "@/pages/kid-page/utils"

type MedicationControllerArgs = {
  auth: KidAuth | null
  kid: KidProfile | null
  medications: MedicationRecord[]
  setMedications: Dispatch<SetStateAction<MedicationRecord[]>>
  setDeletingRecordId: Dispatch<SetStateAction<string | null>>
  locks: LockHelpers
}

export function useMedicationRecords({
  auth,
  kid,
  medications,
  setMedications,
  setDeletingRecordId,
  locks,
}: MedicationControllerArgs) {
  const [isMedOpen, setIsMedOpen] = useState(false)
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(
    null
  )

  const form = useForm<MedicationFormInput>({
    defaultValues: {
      takenAt: toInputDateTime(new Date().toISOString()),
      medicationName: "",
      dose: undefined,
      unit: "ml",
      notes: "",
    },
  })

  function resetForm() {
    form.reset({
      takenAt: toInputDateTime(new Date().toISOString()),
      medicationName: "",
      dose: undefined,
      unit: "ml",
      notes: "",
    })
  }

  async function submit(values: MedicationFormInput) {
    const actionKey = editingMedicationId
      ? `save-medication-${editingMedicationId}`
      : "save-medication-new"
    if (!locks.acquireActionLock(actionKey)) return
    if (!kid || !auth) {
      locks.releaseActionLock(actionKey)
      return
    }

    const parsed = medicationSchema.safeParse(values)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid medication input")
      locks.releaseActionLock(actionKey)
      return
    }

    try {
      if (editingMedicationId) {
        const existing = medications.find(
          (item) => item.id === editingMedicationId
        )
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
        const saved = await addMedicationRecord(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            kidId: kid.id,
            takenAt: toIso(parsed.data.takenAt),
            medicationName: parsed.data.medicationName,
            dose: parsed.data.dose,
            unit: parsed.data.unit,
            notes: parsed.data.notes,
          }
        )
        setMedications((current) => [saved, ...current])
        toast.success("Medication added")
      }

      setIsMedOpen(false)
      setEditingMedicationId(null)
      resetForm()
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : editingMedicationId
            ? "Failed to update medication"
            : "Failed to add medication"
      )
    } finally {
      locks.releaseActionLock(actionKey)
    }
  }

  async function remove(record: MedicationRecord) {
    const actionKey = `delete-medication-${record.id}`
    if (!locks.acquireActionLock(actionKey)) return
    if (!auth) {
      locks.releaseActionLock(actionKey)
      return
    }
    if (!window.confirm("Delete this medication record?")) {
      locks.releaseActionLock(actionKey)
      return
    }

    setDeletingRecordId(record.id)
    try {
      await deleteMedicationRecord(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        record.id
      )
      setMedications((current) =>
        current.filter((item) => item.id !== record.id)
      )
      if (editingMedicationId === record.id) {
        setEditingMedicationId(null)
        setIsMedOpen(false)
        resetForm()
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
      locks.releaseActionLock(actionKey)
    }
  }

  function startCreate() {
    setEditingMedicationId(null)
    resetForm()
    setIsMedOpen(true)
  }

  function startEdit(record: MedicationRecord) {
    setEditingMedicationId(record.id)
    form.reset({
      takenAt: toInputDateTime(record.takenAt),
      medicationName: record.medicationName,
      dose: record.dose,
      unit: record.unit,
      notes: record.notes ?? "",
    })
    setIsMedOpen(true)
  }

  return {
    form,
    isMedOpen,
    setIsMedOpen,
    editingMedicationId,
    submit,
    remove,
    startCreate,
    startEdit,
    resetForm,
  }
}
