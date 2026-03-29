import {
  appendRow,
  deleteRowsByIndexes,
  ensureSpreadsheetShape,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import type {
  GrowthRecord,
  KidProfile,
  MedicationRecord,
  NoteRecord,
  TemperatureRecord,
} from "@/features/health/types"

function valueAt(values: string[], index: number) {
  return values[index] ?? ""
}

function toNumber(input: string): number | undefined {
  const parsed = Number.parseFloat(input)
  if (Number.isNaN(parsed)) {
    return undefined
  }
  return parsed
}

function rowFromObject(
  headers: readonly string[],
  payload: Record<string, string | undefined>
) {
  return headers.map((header) => payload[header] ?? "")
}

function nowIso() {
  return new Date().toISOString()
}

function createId() {
  return crypto.randomUUID()
}

async function readSheetRowsSafe(
  token: string,
  spreadsheetId: string,
  sheetName: string
) {
  try {
    return await readSheetRows(token, spreadsheetId, sheetName)
  } catch (error) {
    // If sheet doesn't exist, return empty
    if (error instanceof Error && error.message.includes("INVALID_ARGUMENT")) {
      return {
        headers: [] as string[],
        rows: [] as Array<{ rowIndex: number; values: string[] }>,
      }
    }
    throw error
  }
}

export async function listKids(token: string, spreadsheetId: string) {
  const sheetData = await readSheetRows(token, spreadsheetId, SHEET_NAMES.kids)

  return sheetData.rows.map((row) => {
    const item: KidProfile & { rowIndex: number } = {
      id: valueAt(row.values, 0),
      name: valueAt(row.values, 1),
      birthDate: valueAt(row.values, 2),
      currentHeightCm: toNumber(valueAt(row.values, 3)),
      currentWeightKg: toNumber(valueAt(row.values, 4)),
      notes: valueAt(row.values, 5),
      createdAt: valueAt(row.values, 6),
      updatedAt: valueAt(row.values, 7),
      rowIndex: row.rowIndex,
    }

    return item
  })
}

export async function createKid(
  token: string,
  spreadsheetId: string,
  kid: Omit<KidProfile, "id" | "createdAt" | "updatedAt">
) {
  await ensureSpreadsheetShape(token, spreadsheetId)

  const timestamp = nowIso()
  const payload: KidProfile = {
    id: createId(),
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
    // If the Notes sheet doesn't exist yet, return empty array
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

  const timestamp = new Date().toISOString()
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
