import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { noteSchema, type NoteFormInput } from "@/features/health/schemas"
import type { KidProfile, NoteRecord } from "@/features/health/types"
import {
  addNote,
  deleteNote,
  updateNote,
} from "@/features/sheets/health-repository"
import type { KidAuth, LockHelpers } from "@/pages/kid-page/types"
import { toInputDateTime, toIso } from "@/pages/kid-page/utils"

type NoteControllerArgs = {
  auth: KidAuth | null
  kid: KidProfile | null
  notes: NoteRecord[]
  setNotes: Dispatch<SetStateAction<NoteRecord[]>>
  setDeletingRecordId: Dispatch<SetStateAction<string | null>>
  locks: LockHelpers
}

export function useNoteRecords({
  auth,
  kid,
  notes,
  setNotes,
  setDeletingRecordId,
  locks,
}: NoteControllerArgs) {
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const form = useForm<NoteFormInput>({
    defaultValues: {
      recordedAt: toInputDateTime(new Date().toISOString()),
      content: "",
    },
  })

  function resetForm() {
    form.reset({
      recordedAt: toInputDateTime(new Date().toISOString()),
      content: "",
    })
  }

  async function submit(values: NoteFormInput) {
    const actionKey = editingNoteId
      ? `save-note-${editingNoteId}`
      : "save-note-new"
    if (!locks.acquireActionLock(actionKey)) return
    if (!kid || !auth) {
      locks.releaseActionLock(actionKey)
      return
    }

    const parsed = noteSchema.safeParse(values)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid note input")
      locks.releaseActionLock(actionKey)
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
        const saved = await addNote(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            kidId: kid.id,
            recordedAt: toIso(parsed.data.recordedAt),
            content: parsed.data.content,
          }
        )
        setNotes((current) => [saved, ...current])
        toast.success("Note added")
      }

      setIsNoteOpen(false)
      setEditingNoteId(null)
      resetForm()
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : editingNoteId
            ? "Failed to update note"
            : "Failed to add note"
      )
    } finally {
      locks.releaseActionLock(actionKey)
    }
  }

  async function remove(record: NoteRecord) {
    const actionKey = `delete-note-${record.id}`
    if (!locks.acquireActionLock(actionKey)) return
    if (!auth) {
      locks.releaseActionLock(actionKey)
      return
    }
    if (!window.confirm("Delete this note?")) {
      locks.releaseActionLock(actionKey)
      return
    }

    setDeletingRecordId(record.id)
    try {
      await deleteNote(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        record.id
      )
      setNotes((current) => current.filter((item) => item.id !== record.id))
      if (editingNoteId === record.id) {
        setEditingNoteId(null)
        setIsNoteOpen(false)
        resetForm()
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
      locks.releaseActionLock(actionKey)
    }
  }

  function startCreate() {
    setEditingNoteId(null)
    resetForm()
    setIsNoteOpen(true)
  }

  function startEdit(record: NoteRecord) {
    setEditingNoteId(record.id)
    form.reset({
      recordedAt: toInputDateTime(record.recordedAt),
      content: record.content,
    })
    setIsNoteOpen(true)
  }

  return {
    form,
    isNoteOpen,
    setIsNoteOpen,
    editingNoteId,
    submit,
    remove,
    startCreate,
    startEdit,
    resetForm,
  }
}
