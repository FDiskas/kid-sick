import { readSheetRows } from "@/features/sheets/google-api"

export type IndexedRow = {
  rowIndex: number
  values: string[]
}

export function valueAt(values: string[], index: number) {
  return values[index] ?? ""
}

export function toNumber(input: string): number | undefined {
  const parsed = Number.parseFloat(input)
  if (Number.isNaN(parsed)) {
    return undefined
  }
  return parsed
}

export function rowFromObject(
  headers: readonly string[],
  payload: Record<string, string | undefined>
) {
  return headers.map((header) => payload[header] ?? "")
}

export function nowIso() {
  return new Date().toISOString()
}

export function createId() {
  return crypto.randomUUID()
}

export async function readSheetRowsSafe(
  token: string,
  spreadsheetId: string,
  sheetName: string
) {
  try {
    return await readSheetRows(token, spreadsheetId, sheetName)
  } catch (error) {
    if (error instanceof Error && error.message.includes("INVALID_ARGUMENT")) {
      return {
        headers: [] as string[],
        rows: [] as IndexedRow[],
      }
    }

    throw error
  }
}
