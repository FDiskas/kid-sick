import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import {
  appendRow,
  deleteRowsByIndexes,
  ensureSpreadsheetShape,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import type { TemperatureRecord } from "@/features/health/types"
import {
  createId,
  rowFromObject,
  valueAt,
} from "@/features/sheets/repository/shared"

export async function listTemperatureRecords(
  token: string,
  spreadsheetId: string,
  kidId: string
) {
  const rows = await readSheetRows(
    token,
    spreadsheetId,
    SHEET_NAMES.temperatureLogs
  )

  const items: TemperatureRecord[] = rows.rows
    .map((row) => ({
      id: valueAt(row.values, 0),
      kidId: valueAt(row.values, 1),
      measuredAt: valueAt(row.values, 2),
      value: Number(valueAt(row.values, 3)),
      unit: (valueAt(row.values, 4) || "C") as "C" | "F",
      method: valueAt(row.values, 5),
      notes: valueAt(row.values, 6),
    }))
    .filter((item) => item.kidId === kidId)

  return items.sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
}

export async function addTemperatureRecord(
  token: string,
  spreadsheetId: string,
  item: Omit<TemperatureRecord, "id">
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const payload: TemperatureRecord = {
    ...item,
    id: createId(),
  }

  await appendRow(
    token,
    spreadsheetId,
    SHEET_NAMES.temperatureLogs,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.temperatureLogs], {
      ...payload,
      value: payload.value.toString(),
    })
  )

  return payload
}

export async function updateTemperatureRecord(
  token: string,
  spreadsheetId: string,
  record: TemperatureRecord
) {
  const rows = await readSheetRows(
    token,
    spreadsheetId,
    SHEET_NAMES.temperatureLogs
  )
  const existingRow = rows.rows.find(
    (row) => valueAt(row.values, 0) === record.id
  )

  if (!existingRow) {
    throw new Error("Temperature record not found")
  }

  await updateRow(
    token,
    spreadsheetId,
    `${SHEET_NAMES.temperatureLogs}!A${existingRow.rowIndex}:G${existingRow.rowIndex}`,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.temperatureLogs], {
      id: record.id,
      kidId: record.kidId,
      measuredAt: record.measuredAt,
      value: record.value.toString(),
      unit: record.unit,
      method: record.method,
      notes: record.notes,
    })
  )

  return record
}

export async function deleteTemperatureRecord(
  token: string,
  spreadsheetId: string,
  recordId: string
) {
  const rows = await readSheetRows(
    token,
    spreadsheetId,
    SHEET_NAMES.temperatureLogs
  )
  const rowIndex = rows.rows.find(
    (row) => valueAt(row.values, 0) === recordId
  )?.rowIndex

  if (!rowIndex) {
    throw new Error("Temperature record not found")
  }

  await deleteRowsByIndexes(token, spreadsheetId, SHEET_NAMES.temperatureLogs, [
    rowIndex,
  ])
}
