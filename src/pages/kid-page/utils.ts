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
  return iso.slice(0, 16)
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
      label: format(new Date(entry.measuredAt), "MM/dd"),
      value: Number(
        normalizeTemperatureToCelsius(entry.value, entry.unit).toFixed(2)
      ),
    }))
}

export function buildMedicationPerDay(medications: MedicationRecord[]) {
  const countByDay = new Map<string, number>()

  for (const entry of medications) {
    const dayKey = entry.takenAt.slice(0, 10)
    countByDay.set(dayKey, (countByDay.get(dayKey) ?? 0) + 1)
  }

  return Array.from(countByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-10)
    .map(([day, value]) => ({
      label: format(new Date(day), "MM/dd"),
      value,
    }))
}

export function buildMostUsedMedication(medications: MedicationRecord[]) {
  const countByMedication = new Map<string, number>()

  for (const entry of medications) {
    const key = entry.medicationName.trim() || "Unnamed"
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
      label: format(new Date(entry.measuredAt), "MM/dd"),
      value: entry[key] ?? 0,
    }))
}
