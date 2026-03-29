export type KidProfile = {
  id: string
  name: string
  birthDate: string
  currentHeightCm?: number
  currentWeightKg?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type TemperatureRecord = {
  id: string
  kidId: string
  measuredAt: string
  value: number
  unit: "C" | "F"
  method?: string
  notes?: string
}

export type MedicationRecord = {
  id: string
  kidId: string
  takenAt: string
  medicationName: string
  dose: number
  unit: string
  notes?: string
}

export type GrowthRecord = {
  id: string
  kidId: string
  measuredAt: string
  heightCm?: number
  weightKg?: number
  notes?: string
}

export type SpreadsheetContext = {
  spreadsheetId: string
  spreadsheetUrl: string
}
