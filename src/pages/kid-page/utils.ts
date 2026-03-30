import { format } from "date-fns"

import type {
  GrowthRecord,
  MedicationRecord,
  TemperatureRecord,
} from "@/features/health/types"

export type MiniChartPoint = {
  label: string
  value: number
}

export function toIso(localDateTime: string) {
  return new Date(localDateTime).toISOString()
}

export function toInputDateTime(iso: string) {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return format(parsed, "yyyy-MM-dd'T'HH:mm")
}

export function renderDateTime(value: string) {
  return format(new Date(value), "yyyy-MM-dd HH:mm")
}

export function normalizeTemperatureToCelsius(value: number, unit: "C" | "F") {
  if (unit === "F") {
    return ((value - 32) * 5) / 9
  }

  return value
}

export function buildTemperatureTrend(temperatures: TemperatureRecord[]) {
  return temperatures
    .slice()
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
    .slice(-12)
    .map((entry) => ({
      label: entry.measuredAt,
      value: Number(
        normalizeTemperatureToCelsius(entry.value, entry.unit).toFixed(2)
      ),
    }))
}

export function buildMedicationPerDay(medications: MedicationRecord[]) {
  const countByDay = new Map<string, number>()

  // Get the last 10 days to ensure we always show a timeline
  const today = new Date()
  for (let i = 9; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayKey = format(date, "yyyy-MM-dd")
    countByDay.set(dayKey, 0)
  }

  for (const entry of medications) {
    try {
      const dayKey = format(new Date(entry.takenAt), "yyyy-MM-dd")
      if (countByDay.has(dayKey)) {
        countByDay.set(dayKey, (countByDay.get(dayKey) ?? 0) + 1)
      }
    } catch {
      // Skip invalid dates
    }
  }

  return Array.from(countByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, value]) => ({
      label: day,
      value,
    }))
}

import { translate } from "@/lib/translate"

export function buildMostUsedMedication(medications: MedicationRecord[]) {
  const countByMedication = new Map<string, number>()

  for (const entry of medications) {
    const key = entry.medicationName.trim() || translate.unnamedMedication
    countByMedication.set(key, (countByMedication.get(key) ?? 0) + 1)
  }

  let winner: { name: string; count: number } | null = null
  for (const [name, count] of countByMedication) {
    if (!winner || count > winner.count) {
      winner = { name, count }
    }
  }

  return winner
}

export function buildGrowthTrend(
  growthRecords: GrowthRecord[],
  key: "heightCm" | "weightKg"
): MiniChartPoint[] {
  return growthRecords
    .slice()
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
    .filter((entry) => typeof entry[key] === "number")
    .slice(-10)
    .map((entry) => ({
      label: entry.measuredAt,
      value: entry[key] ?? 0,
    }))
}
