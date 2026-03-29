import {
  appendRow,
  readSheetRows,
  updateRow,
} from "@/features/sheets/google-api"
import { SHEET_HEADERS, SHEET_NAMES } from "@/features/sheets/sheets-schema"
import type {
  GrowthRecord,
  KidProfile,
  MedicationRecord,
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
