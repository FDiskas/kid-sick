import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import {
  appendRow,
  deleteRowsByIndexes,
  ensureSpreadsheetShape,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import type { GrowthRecord } from "@/features/health/types"
import {
  createId,
  rowFromObject,
  toNumber,
  valueAt,
} from "@/features/sheets/repository/shared"

export async function listGrowthRecords(
  token: string,
  spreadsheetId: string,
  kidId: string
) {
  const rows = await readSheetRows(token, spreadsheetId, SHEET_NAMES.growthLogs)

  const items: GrowthRecord[] = rows.rows
    .map((row) => ({
      id: valueAt(row.values, 0),
      kidId: valueAt(row.values, 1),
      measuredAt: valueAt(row.values, 2),
      heightCm: toNumber(valueAt(row.values, 3)),
      weightKg: toNumber(valueAt(row.values, 4)),
      notes: valueAt(row.values, 5),
    }))
    .filter((item) => item.kidId === kidId)

  return items.sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
}

export async function addGrowthRecord(
  token: string,
  spreadsheetId: string,
  item: Omit<GrowthRecord, "id">
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const payload: GrowthRecord = {
    ...item,
    id: createId(),
  }

  await appendRow(
    token,
    spreadsheetId,
    SHEET_NAMES.growthLogs,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.growthLogs], {
      ...payload,
      heightCm: payload.heightCm?.toString(),
      weightKg: payload.weightKg?.toString(),
    })
  )

  return payload
}

export async function updateGrowthRecord(
  token: string,
  spreadsheetId: string,
  record: GrowthRecord
) {
  const rows = await readSheetRows(token, spreadsheetId, SHEET_NAMES.growthLogs)
  const existingRow = rows.rows.find(
    (row) => valueAt(row.values, 0) === record.id
  )

  if (!existingRow) {
    throw new Error("Growth record not found")
  }

  await updateRow(
    token,
    spreadsheetId,
    `${SHEET_NAMES.growthLogs}!A${existingRow.rowIndex}:F${existingRow.rowIndex}`,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.growthLogs], {
      id: record.id,
      kidId: record.kidId,
      measuredAt: record.measuredAt,
      heightCm: record.heightCm?.toString(),
      weightKg: record.weightKg?.toString(),
      notes: record.notes,
    })
  )

  return record
}

export async function deleteGrowthRecord(
  token: string,
  spreadsheetId: string,
  recordId: string
) {
  const rows = await readSheetRows(token, spreadsheetId, SHEET_NAMES.growthLogs)
  const rowIndex = rows.rows.find(
    (row) => valueAt(row.values, 0) === recordId
  )?.rowIndex

  if (!rowIndex) {
    throw new Error("Growth record not found")
  }

  await deleteRowsByIndexes(token, spreadsheetId, SHEET_NAMES.growthLogs, [
    rowIndex,
  ])
}
