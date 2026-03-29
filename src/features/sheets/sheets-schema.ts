export const SHEET_NAMES = {
  kids: "Kids",
  temperatureLogs: "TemperatureLogs",
  medicationLogs: "MedicationLogs",
  growthLogs: "GrowthLogs",
  notes: "Notes",
} as const

export const SHEET_HEADERS = {
  [SHEET_NAMES.kids]: [
    "id",
    "name",
    "birthDate",
    "currentHeightCm",
    "currentWeightKg",
    "notes",
    "createdAt",
    "updatedAt",
  ],
  [SHEET_NAMES.temperatureLogs]: [
    "id",
    "kidId",
    "measuredAt",
    "value",
    "unit",
    "method",
    "notes",
  ],
  [SHEET_NAMES.medicationLogs]: [
    "id",
    "kidId",
    "takenAt",
    "medicationName",
    "dose",
    "unit",
    "notes",
  ],
  [SHEET_NAMES.growthLogs]: [
    "id",
    "kidId",
    "measuredAt",
    "heightCm",
    "weightKg",
    "notes",
  ],
  [SHEET_NAMES.notes]: [
    "id",
    "kidId",
    "content",
    "recordedAt",
    "createdAt",
    "updatedAt",
  ],
} as const

export type SheetName = keyof typeof SHEET_NAMES
