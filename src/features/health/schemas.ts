import { z } from "zod"

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
      .positive(`${fieldName} must be positive`)
      .max(max, tooLargeMessage)
      .optional()
  )

export const kidSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name is too long"),
  birthDate: z.string().min(1, "Birthday is required"),
  currentHeightCm: optionalPositiveNumber(
    "Height",
    250,
    "Height seems invalid"
  ),
  currentWeightKg: optionalPositiveNumber(
    "Weight",
    300,
    "Weight seems invalid"
  ),
  notes: z.string().max(500, "Notes are too long").optional(),
})

export const temperatureSchema = z.object({
  measuredAt: z.string().min(1, "Measurement date/time is required"),
  value: z.coerce
    .number()
    .min(30, "Temperature is too low")
    .max(45, "Temperature is too high"),
  unit: z.enum(["C", "F"]),
  method: z.string().max(80, "Method is too long").optional(),
  notes: z.string().max(500, "Notes are too long").optional(),
})

export const medicationSchema = z.object({
  takenAt: z.string().min(1, "Medication time is required"),
  medicationName: z
    .string()
    .min(1, "Medication name is required")
    .max(120, "Medication name is too long"),
  dose: z.coerce
    .number()
    .positive("Dose must be positive")
    .max(10000, "Dose seems invalid"),
  unit: z.string().min(1, "Dose unit is required").max(30, "Unit is too long"),
  notes: z.string().max(500, "Notes are too long").optional(),
})

export const growthSchema = z
  .object({
    measuredAt: z.string().min(1, "Measurement date/time is required"),
    heightCm: optionalPositiveNumber("Height", 250, "Height seems invalid"),
    weightKg: optionalPositiveNumber("Weight", 300, "Weight seems invalid"),
    notes: z.string().max(500, "Notes are too long").optional(),
  })
  .superRefine((value, context) => {
    if (value.heightCm === undefined && value.weightKg === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["heightCm"],
        message: "Provide at least height or weight",
      })
    }
  })

export type KidFormInput = z.infer<typeof kidSchema>
export type TemperatureFormInput = z.infer<typeof temperatureSchema>
export type MedicationFormInput = z.infer<typeof medicationSchema>
export type GrowthFormInput = z.infer<typeof growthSchema>
