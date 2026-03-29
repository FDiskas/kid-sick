import { useState, type Dispatch, type SetStateAction } from "react"
import { useMutation } from "@tanstack/react-query"
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
import { translate } from "@/lib/translate"

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

  const saveNoteMutation = useMutation({
    mutationFn: async (payload: {
      values: NoteFormInput
      editingNoteId: string | null
    }) => {
      if (!kid || !auth) {
        throw new Error(translate.failedToSaveNote)
      }

      if (payload.editingNoteId) {
        const existing = notes.find((item) => item.id === payload.editingNoteId)
        if (!existing) {
          throw new Error("Note record not found")
        }

        const updated = await updateNote(
          auth.accessToken,
          auth.spreadsheet.spreadsheetId,
          {
            ...existing,
            recordedAt: toIso(payload.values.recordedAt),
            content: payload.values.content,
          }
        )

        return {
          kind: "update" as const,
          record: updated,
        }
      }

      const saved = await addNote(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        {
          kidId: kid.id,
          recordedAt: toIso(payload.values.recordedAt),
          content: payload.values.content,
        }
      )

      return {
        kind: "create" as const,
        record: saved,
      }
    },
    onSuccess: (result) => {
      if (result.kind === "update") {
        setNotes((current) =>
          current
            .map((item) =>
              item.id === result.record.id ? result.record : item
            )
            .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
        )
        toast.success(translate.noteUpdated)
      } else {
        setNotes((current) => [result.record, ...current])
        toast.success(translate.noteAdded)
      }

      setIsNoteOpen(false)
      setEditingNoteId(null)
      resetForm()
    },
    onError: (saveError) => {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : editingNoteId
            ? translate.failedToUpdateNote
            : translate.failedToAddNote
      )
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (record: NoteRecord) => {
      if (!auth) {
        throw new Error(translate.failedToDeleteNote)
      }

      await deleteNote(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        record.id
      )

      return record
    },
    onSuccess: (record) => {
      setNotes((current) => current.filter((item) => item.id !== record.id))
      if (editingNoteId === record.id) {
        setEditingNoteId(null)
        setIsNoteOpen(false)
        resetForm()
      }
      toast.success(translate.noteDeleted)
    },
    onError: (deleteError) => {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : translate.failedToDeleteNote
      )
    },
    onSettled: () => {
      setDeletingRecordId(null)
    },
  })

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
      toast.error(parsed.error.issues[0]?.message ?? translate.invalidNoteInput)
      locks.releaseActionLock(actionKey)
      return
    }

    try {
      await saveNoteMutation.mutateAsync({
        values: parsed.data,
        editingNoteId,
      })
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
      await deleteNoteMutation.mutateAsync(record)
    } finally {
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
