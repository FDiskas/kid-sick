import { useEffect, useMemo, useState } from "react"

import type {
  GrowthRecord,
  KidProfile,
  MedicationRecord,
  NoteRecord,
  SpreadsheetContext,
  TemperatureRecord,
} from "@/features/health/types"
import {
  listGrowthRecords,
  listKids,
  listMedicationRecords,
  listNotes,
  listTemperatureRecords,
} from "@/features/sheets/health-repository"
import {
  buildGrowthTrend,
  buildMedicationPerDay,
  buildMostUsedMedication,
  buildTemperatureTrend,
  normalizeTemperatureToCelsius,
} from "@/pages/kid-page/utils"

type KidAuth = {
  accessToken: string
  spreadsheet: SpreadsheetContext
}

export function useKidPageData(
  auth: KidAuth | null,
  kidId: string | undefined
) {
  const [kid, setKid] = useState<KidProfile | null>(null)
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>([])
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (!auth || !kidId) {
      return
    }

    const currentAuth: NonNullable<typeof auth> = auth
    const currentKidId: string = kidId

    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [kids, tempRows, medRows, growthRows, noteRows] =
          await Promise.all([
            listKids(
              currentAuth.accessToken,
              currentAuth.spreadsheet.spreadsheetId
            ),
            listTemperatureRecords(
              currentAuth.accessToken,
              currentAuth.spreadsheet.spreadsheetId,
              currentKidId
            ),
            listMedicationRecords(
              currentAuth.accessToken,
              currentAuth.spreadsheet.spreadsheetId,
              currentKidId
            ),
            listGrowthRecords(
              currentAuth.accessToken,
              currentAuth.spreadsheet.spreadsheetId,
              currentKidId
            ),
            listNotes(
              currentAuth.accessToken,
              currentAuth.spreadsheet.spreadsheetId,
              currentKidId
            ),
          ])

        if (isMounted) {
          setKid(kids.find((item) => item.id === currentKidId) ?? null)
          setTemperatures(tempRows)
          setMedications(medRows)
          setGrowthRecords(growthRows)
          setNotes(noteRows)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load kid data"
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [auth, kidId])

  const latestGrowth = useMemo(() => growthRecords[0], [growthRecords])
  const latestTemperature = useMemo(
    () => temperatures[0] ?? null,
    [temperatures]
  )
  const temperatureTrend = useMemo(
    () => buildTemperatureTrend(temperatures),
    [temperatures]
  )

  const feverCount = useMemo(
    () =>
      temperatures.filter(
        (entry) => normalizeTemperatureToCelsius(entry.value, entry.unit) >= 38
      ).length,
    [temperatures]
  )

  const medicationPerDay = useMemo(
    () => buildMedicationPerDay(medications),
    [medications]
  )
  const mostUsedMedication = useMemo(
    () => buildMostUsedMedication(medications),
    [medications]
  )
  const growthHeightTrend = useMemo(
    () => buildGrowthTrend(growthRecords, "heightCm"),
    [growthRecords]
  )
  const growthWeightTrend = useMemo(
    () => buildGrowthTrend(growthRecords, "weightKg"),
    [growthRecords]
  )

  return {
    kid,
    setKid,
    temperatures,
    setTemperatures,
    medications,
    setMedications,
    growthRecords,
    setGrowthRecords,
    notes,
    setNotes,
    isLoading,
    error,
    deletingRecordId,
    setDeletingRecordId,
    latestGrowth,
    latestTemperature,
    temperatureTrend,
    feverCount,
    medicationPerDay,
    mostUsedMedication,
    growthHeightTrend,
    growthWeightTrend,
  }
}
