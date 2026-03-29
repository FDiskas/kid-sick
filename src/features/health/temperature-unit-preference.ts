export type TemperatureUnit = "C" | "F"

const TEMPERATURE_UNIT_STORAGE_KEY = "kid-sick.temperature-unit"

export const TEMPERATURE_UNIT_OPTIONS: ReadonlyArray<{
  value: TemperatureUnit
  label: string
}> = [
  { value: "C", label: "Celsius" },
  { value: "F", label: "Fahrenheit" },
]

export function isTemperatureUnit(value: string): value is TemperatureUnit {
  return value === "C" || value === "F"
}

export function getTemperatureUnitPreference(): TemperatureUnit {
  if (typeof window === "undefined") {
    return "C"
  }

  const storedValue = localStorage.getItem(TEMPERATURE_UNIT_STORAGE_KEY)
  if (!storedValue || !isTemperatureUnit(storedValue)) {
    return "C"
  }

  return storedValue
}

export function setTemperatureUnitPreference(unit: TemperatureUnit): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(TEMPERATURE_UNIT_STORAGE_KEY, unit)
}
