import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import {
  appendRow,
  deleteRowsByIndexes,
  ensureSpreadsheetShape,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import type { NoteRecord } from "@/features/health/types"
import {
  createId,
  nowIso,
  readSheetRowsSafe,
  rowFromObject,
  valueAt,
} from "@/features/sheets/repository/shared"

export async function listNotes(
  token: string,
  spreadsheetId: string,
  kidId: string
) {
  try {
    const rows = await readSheetRows(token, spreadsheetId, SHEET_NAMES.notes)

    const items: NoteRecord[] = rows.rows
      .map((row) => ({
        id: valueAt(row.values, 0),
        kidId: valueAt(row.values, 1),
        content: valueAt(row.values, 2),
        recordedAt: valueAt(row.values, 3),
        createdAt: valueAt(row.values, 4),
        updatedAt: valueAt(row.values, 5),
      }))
      .filter((item) => item.kidId === kidId)

    return items.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
  } catch (error) {
    if (error instanceof Error && error.message.includes("INVALID_ARGUMENT")) {
      return []
    }

    throw error
  }
}

export async function addNote(
  token: string,
  spreadsheetId: string,
  item: Omit<NoteRecord, "id" | "createdAt" | "updatedAt">
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const timestamp = nowIso()
  const payload: NoteRecord = {
    ...item,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await appendRow(
    token,
    spreadsheetId,
    SHEET_NAMES.notes,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.notes], payload)
  )

  return payload
}

export async function updateNote(
  token: string,
  spreadsheetId: string,
  record: NoteRecord
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const rows = await readSheetRows(token, spreadsheetId, SHEET_NAMES.notes)
  const existingRow = rows.rows.find(
    (row) => valueAt(row.values, 0) === record.id
  )

  if (!existingRow) {
    throw new Error("Note not found")
  }

  const updated: NoteRecord = {
    ...record,
    updatedAt: nowIso(),
  }

  await updateRow(
    token,
    spreadsheetId,
    `${SHEET_NAMES.notes}!A${existingRow.rowIndex}:F${existingRow.rowIndex}`,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.notes], updated)
  )

  return updated
}

export async function deleteNote(
  token: string,
  spreadsheetId: string,
  recordId: string
) {
  const rows = await readSheetRowsSafe(token, spreadsheetId, SHEET_NAMES.notes)
  const rowIndex = rows.rows.find(
    (row) => valueAt(row.values, 0) === recordId
  )?.rowIndex

  if (!rowIndex) {
    throw new Error("Note not found")
  }

  await deleteRowsByIndexes(token, spreadsheetId, SHEET_NAMES.notes, [rowIndex])
}
