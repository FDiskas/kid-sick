import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import {
  appendRow,
  deleteRowsByIndexes,
  ensureSpreadsheetShape,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import type { KidProfile } from "@/features/health/types"
import {
  nowIso,
  readSheetRowsSafe,
  rowFromObject,
  toNumber,
  valueAt,
} from "@/features/sheets/repository/shared"

type KidSheetRow = KidProfile & { rowIndex: number }

export async function listKids(
  token: string,
  spreadsheetId: string
): Promise<KidSheetRow[]> {
  const sheetData = await readSheetRows(token, spreadsheetId, SHEET_NAMES.kids)

  return sheetData.rows.map((row) => ({
    id: valueAt(row.values, 0),
    name: valueAt(row.values, 1),
    birthDate: valueAt(row.values, 2),
    currentHeightCm: toNumber(valueAt(row.values, 3)),
    currentWeightKg: toNumber(valueAt(row.values, 4)),
    notes: valueAt(row.values, 5),
    createdAt: valueAt(row.values, 6),
    updatedAt: valueAt(row.values, 7),
    rowIndex: row.rowIndex,
  }))
}

export async function createKid(
  token: string,
  spreadsheetId: string,
  kid: Omit<KidProfile, "id" | "createdAt" | "updatedAt">
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const timestamp = nowIso()
  const payload: KidProfile = {
    id: crypto.randomUUID(),
    name: kid.name,
    birthDate: kid.birthDate,
    currentHeightCm: kid.currentHeightCm,
    currentWeightKg: kid.currentWeightKg,
    notes: kid.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await appendRow(
    token,
    spreadsheetId,
    SHEET_NAMES.kids,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.kids], {
      ...payload,
      currentHeightCm: payload.currentHeightCm?.toString(),
      currentWeightKg: payload.currentWeightKg?.toString(),
    })
  )

  return payload
}

export async function updateKid(
  token: string,
  spreadsheetId: string,
  kid: KidProfile
) {
  const rows = await listKids(token, spreadsheetId)
  const existing = rows.find((row) => row.id === kid.id)

  if (!existing) {
    throw new Error("Kid not found")
  }

  const updated: KidProfile = {
    ...kid,
    updatedAt: nowIso(),
  }

  await updateRow(
    token,
    spreadsheetId,
    `${SHEET_NAMES.kids}!A${existing.rowIndex}:H${existing.rowIndex}`,
    rowFromObject(SHEET_HEADERS[SHEET_NAMES.kids], {
      ...updated,
      currentHeightCm: updated.currentHeightCm?.toString(),
      currentWeightKg: updated.currentWeightKg?.toString(),
    })
  )

  return updated
}

export async function deleteKidCascade(
  token: string,
  spreadsheetId: string,
  kidId: string
) {
  const [kidsRows, temperatureRows, medicationRows, growthRows, notesRows] =
    await Promise.all([
      readSheetRows(token, spreadsheetId, SHEET_NAMES.kids),
      readSheetRows(token, spreadsheetId, SHEET_NAMES.temperatureLogs),
      readSheetRows(token, spreadsheetId, SHEET_NAMES.medicationLogs),
      readSheetRows(token, spreadsheetId, SHEET_NAMES.growthLogs),
      readSheetRowsSafe(token, spreadsheetId, SHEET_NAMES.notes),
    ])

  const kidRowIndexes = kidsRows.rows
    .filter((row) => valueAt(row.values, 0) === kidId)
    .map((row) => row.rowIndex)

  if (kidRowIndexes.length === 0) {
    throw new Error("Kid not found")
  }

  const temperatureRowIndexes = temperatureRows.rows
    .filter((row) => valueAt(row.values, 1) === kidId)
    .map((row) => row.rowIndex)

  const medicationRowIndexes = medicationRows.rows
    .filter((row) => valueAt(row.values, 1) === kidId)
    .map((row) => row.rowIndex)

  const growthRowIndexes = growthRows.rows
    .filter((row) => valueAt(row.values, 1) === kidId)
    .map((row) => row.rowIndex)

  const notesRowIndexes = notesRows.rows
    .filter((row) => valueAt(row.values, 1) === kidId)
    .map((row) => row.rowIndex)

  await Promise.all([
    deleteRowsByIndexes(
      token,
      spreadsheetId,
      SHEET_NAMES.temperatureLogs,
      temperatureRowIndexes
    ),
    deleteRowsByIndexes(
      token,
      spreadsheetId,
      SHEET_NAMES.medicationLogs,
      medicationRowIndexes
    ),
    deleteRowsByIndexes(
      token,
      spreadsheetId,
      SHEET_NAMES.growthLogs,
      growthRowIndexes
    ),
    deleteRowsByIndexes(
      token,
      spreadsheetId,
      SHEET_NAMES.notes,
      notesRowIndexes
    ),
  ])

  await deleteRowsByIndexes(
    token,
    spreadsheetId,
    SHEET_NAMES.kids,
    kidRowIndexes
  )
}
