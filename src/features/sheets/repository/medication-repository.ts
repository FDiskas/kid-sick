import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import {
  appendRow,
  deleteRowsByIndexes,
  ensureSpreadsheetShape,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import type { MedicationRecord } from "@/features/health/types"
import {
  createId,
  rowFromObject,
  valueAt,
} from "@/features/sheets/repository/shared"

export async function listMedicationRecords(
  token: string,
  spreadsheetId: string,
  kidId: string
) {
  const rows = await readSheetRows(
    token,
    spreadsheetId,
    SHEET_NAMES.medicationLogs
  )

  const items: MedicationRecord[] = rows.rows
    .map((row) => ({
      id: valueAt(row.values, 0),
      kidId: valueAt(row.values, 1),
      takenAt: valueAt(row.values, 2),
      medicationName: valueAt(row.values, 3),
      dose: Number(valueAt(row.values, 4)),
      unit: valueAt(row.values, 5),
      notes: valueAt(row.values, 6),
    }))
    .filter((item) => item.kidId === kidId)

  return items.sort((a, b) => b.takenAt.localeCompare(a.takenAt))
}

export async function addMedicationRecord(
  token: string,
  spreadsheetId: string,
  item: Omit<MedicationRecord, "id">
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const payload: MedicationRecord = {
    ...item,
    id: createId(),
  }

  await appendRow(
    token,
    spreadsheetId,
    SHEET_NAMES.medicationLogs,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.medicationLogs], {
      ...payload,
      dose: payload.dose.toString(),
    })
  )

  return payload
}

export async function updateMedicationRecord(
  token: string,
  spreadsheetId: string,
  record: MedicationRecord
) {
  const rows = await readSheetRows(
    token,
    spreadsheetId,
    SHEET_NAMES.medicationLogs
  )
  const existingRow = rows.rows.find(
    (row) => valueAt(row.values, 0) === record.id
  )

  if (!existingRow) {
    throw new Error("Medication record not found")
  }

  await updateRow(
    token,
    spreadsheetId,
    `${SHEET_NAMES.medicationLogs}!A${existingRow.rowIndex}:G${existingRow.rowIndex}`,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.medicationLogs], {
      id: record.id,
      kidId: record.kidId,
      takenAt: record.takenAt,
      medicationName: record.medicationName,
      dose: record.dose.toString(),
      unit: record.unit,
      notes: record.notes,
    })
  )

  return record
}

export async function deleteMedicationRecord(
  token: string,
  spreadsheetId: string,
  recordId: string
) {
  const rows = await readSheetRows(
    token,
    spreadsheetId,
    SHEET_NAMES.medicationLogs
  )
  const rowIndex = rows.rows.find(
    (row) => valueAt(row.values, 0) === recordId
  )?.rowIndex

  if (!rowIndex) {
    throw new Error("Medication record not found")
  }

  await deleteRowsByIndexes(token, spreadsheetId, SHEET_NAMES.medicationLogs, [
    rowIndex,
  ])
}
