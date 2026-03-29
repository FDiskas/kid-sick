import { useCallback, useMemo, useState, type SetStateAction } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
import { sheetsQueryKeys } from "@/features/sheets/query-keys"
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
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const spreadsheetId = auth?.spreadsheet.spreadsheetId ?? ""
  const isEnabled = Boolean(auth && kidId)

  const kidsQuery = useQuery({
    queryKey: sheetsQueryKeys.kids(spreadsheetId),
    queryFn: async () => {
      if (!auth) {
        throw new Error("Could not load kid data")
      }

      return listKids(auth.accessToken, auth.spreadsheet.spreadsheetId)
    },
    enabled: isEnabled,
  })

  const temperaturesQuery = useQuery({
    queryKey: sheetsQueryKeys.temperatures(spreadsheetId, kidId ?? ""),
    queryFn: async () => {
      if (!auth || !kidId) {
        throw new Error("Could not load kid data")
      }

      return listTemperatureRecords(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        kidId
      )
    },
    enabled: isEnabled,
  })

  const medicationsQuery = useQuery({
    queryKey: sheetsQueryKeys.medications(spreadsheetId, kidId ?? ""),
    queryFn: async () => {
      if (!auth || !kidId) {
        throw new Error("Could not load kid data")
      }

      return listMedicationRecords(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        kidId
      )
    },
    enabled: isEnabled,
  })

  const growthRecordsQuery = useQuery({
    queryKey: sheetsQueryKeys.growthRecords(spreadsheetId, kidId ?? ""),
    queryFn: async () => {
      if (!auth || !kidId) {
        throw new Error("Could not load kid data")
      }

      return listGrowthRecords(
        auth.accessToken,
        auth.spreadsheet.spreadsheetId,
        kidId
      )
    },
    enabled: isEnabled,
  })

  const notesQuery = useQuery({
    queryKey: sheetsQueryKeys.notes(spreadsheetId, kidId ?? ""),
    queryFn: async () => {
      if (!auth || !kidId) {
        throw new Error("Could not load kid data")
      }

      return listNotes(auth.accessToken, auth.spreadsheet.spreadsheetId, kidId)
    },
    enabled: isEnabled,
  })

  const kid = useMemo(
    () => kidsQuery.data?.find((item) => item.id === kidId) ?? null,
    [kidId, kidsQuery.data]
  )
  const temperatures = useMemo(
    () => temperaturesQuery.data ?? [],
    [temperaturesQuery.data]
  )
  const medications = useMemo(
    () => medicationsQuery.data ?? [],
    [medicationsQuery.data]
  )
  const growthRecords = useMemo(
    () => growthRecordsQuery.data ?? [],
    [growthRecordsQuery.data]
  )
  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data])

  const setKid = useCallback(
    (nextValue: SetStateAction<KidProfile | null>) => {
      if (!kidId) {
        return
      }

      queryClient.setQueryData<KidProfile[]>(
        sheetsQueryKeys.kids(spreadsheetId),
        (current = []) => {
          const currentKid = current.find((item) => item.id === kidId) ?? null
          const nextKid =
            typeof nextValue === "function"
              ? (nextValue as (value: KidProfile | null) => KidProfile | null)(
                  currentKid
                )
              : nextValue

          if (!nextKid) {
            return current
          }

          return current.map((item) =>
            item.id === nextKid.id ? nextKid : item
          )
        }
      )
    },
    [kidId, queryClient, spreadsheetId]
  )

  const setTemperatures = useCallback(
    (nextValue: SetStateAction<TemperatureRecord[]>) => {
      if (!kidId) {
        return
      }

      queryClient.setQueryData<TemperatureRecord[]>(
        sheetsQueryKeys.temperatures(spreadsheetId, kidId),
        (current = []) =>
          typeof nextValue === "function"
            ? (
                nextValue as (value: TemperatureRecord[]) => TemperatureRecord[]
              )(current)
            : nextValue
      )
    },
    [kidId, queryClient, spreadsheetId]
  )

  const setMedications = useCallback(
    (nextValue: SetStateAction<MedicationRecord[]>) => {
      if (!kidId) {
        return
      }

      queryClient.setQueryData<MedicationRecord[]>(
        sheetsQueryKeys.medications(spreadsheetId, kidId),
        (current = []) =>
          typeof nextValue === "function"
            ? (nextValue as (value: MedicationRecord[]) => MedicationRecord[])(
                current
              )
            : nextValue
      )
    },
    [kidId, queryClient, spreadsheetId]
  )

  const setGrowthRecords = useCallback(
    (nextValue: SetStateAction<GrowthRecord[]>) => {
      if (!kidId) {
        return
      }

      queryClient.setQueryData<GrowthRecord[]>(
        sheetsQueryKeys.growthRecords(spreadsheetId, kidId),
        (current = []) =>
          typeof nextValue === "function"
            ? (nextValue as (value: GrowthRecord[]) => GrowthRecord[])(current)
            : nextValue
      )
    },
    [kidId, queryClient, spreadsheetId]
  )

  const setNotes = useCallback(
    (nextValue: SetStateAction<NoteRecord[]>) => {
      if (!kidId) {
        return
      }

      queryClient.setQueryData<NoteRecord[]>(
        sheetsQueryKeys.notes(spreadsheetId, kidId),
        (current = []) =>
          typeof nextValue === "function"
            ? (nextValue as (value: NoteRecord[]) => NoteRecord[])(current)
            : nextValue
      )
    },
    [kidId, queryClient, spreadsheetId]
  )

  const error = [
    kidsQuery.error,
    temperaturesQuery.error,
    medicationsQuery.error,
    growthRecordsQuery.error,
    notesQuery.error,
  ].find((queryError) => queryError instanceof Error)

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
    isLoading:
      kidsQuery.isPending ||
      temperaturesQuery.isPending ||
      medicationsQuery.isPending ||
      growthRecordsQuery.isPending ||
      notesQuery.isPending,
    error: error instanceof Error ? error.message : null,
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
