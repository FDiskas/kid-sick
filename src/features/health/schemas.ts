import { z } from "zod"
import { translate, withParams } from "@/lib/translate"

const optionalPositiveNumber = (
  fieldName: string,
  max: number,
  tooLargeMessage: string
) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined
      }

      return Number(value)
    },
    z.coerce
      .number()
      .positive(withParams(translate.mustBePositive, { field: fieldName }))
      .max(max, tooLargeMessage)
      .optional()
  )

export const kidSchema = z.object({
  name: z
    .string()
    .min(1, translate.nameRequired)
    .max(80, translate.nameTooLong),
  birthDate: z.string().min(1, translate.birthdayRequired),
  currentHeightCm: optionalPositiveNumber(
    "Height",
    250,
    translate.heightInvalid
  ),
  currentWeightKg: optionalPositiveNumber(
    "Weight",
    300,
    translate.weightInvalid
  ),
  notes: z.string().max(500, translate.notesTooLong).optional(),
})

const TEMPERATURE_RANGE_BY_UNIT = {
  C: { min: 30, max: 45 },
  F: { min: 86, max: 113 },
} as const

export const temperatureSchema = z
  .object({
    measuredAt: z.string().min(1, translate.datetimeRequired),
    value: z.coerce.number(),
    unit: z.enum(["C", "F"]),
    method: z.string().max(80, translate.methodTooLong).optional(),
    notes: z.string().max(500, translate.notesTooLong).optional(),
  })
  .superRefine((value, context) => {
    const range = TEMPERATURE_RANGE_BY_UNIT[value.unit]

    if (value.value < range.min) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: translate.temperatureTooLow,
      })
    }

    if (value.value > range.max) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: translate.temperatureTooHigh,
      })
    }
  })

export const noteSchema = z.object({
  recordedAt: z.string().min(1, translate.datetimeRequired),
  content: z
    .string()
    .min(1, translate.noteContentRequired)
    .max(1000, translate.noteTooLong),
})

export type NoteFormInput = z.infer<typeof noteSchema>

export const medicationSchema = z.object({
  takenAt: z.string().min(1, translate.medicationTimeRequired),
  medicationName: z
    .string()
    .min(1, translate.medicationNameRequired)
    .max(120, translate.medicationNameTooLong),
  dose: z.coerce
    .number()
    .positive(translate.dosePositive)
    .max(10000, translate.doseInvalid),
  unit: z
    .string()
    .min(1, translate.doseUnitRequired)
    .max(30, translate.unitTooLong),
  notes: z.string().max(500, translate.notesTooLong).optional(),
})

export const growthSchema = z
  .object({
    measuredAt: z.string().min(1, translate.datetimeRequired),
    heightCm: optionalPositiveNumber("Height", 250, translate.heightInvalid),
    weightKg: optionalPositiveNumber("Weight", 300, translate.weightInvalid),
    notes: z.string().max(500, translate.notesTooLong).optional(),
  })
  .superRefine((value, context) => {
    if (value.heightCm === undefined && value.weightKg === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["heightCm"],
        message: translate.provideHeightOrWeight,
      })
    }
  })

export type KidFormInput = z.infer<typeof kidSchema>
export type TemperatureFormInput = z.infer<typeof temperatureSchema>
export type MedicationFormInput = z.infer<typeof medicationSchema>
export type GrowthFormInput = z.infer<typeof growthSchema>
