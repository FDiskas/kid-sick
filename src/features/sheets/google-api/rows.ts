import {
  GOOGLE_SHEETS_API,
  type SheetSummary,
} from "@/features/sheets/google-api/constants"
import { googleFetch } from "@/features/sheets/google-api/fetch"

export async function readSheetRows(
  token: string,
  spreadsheetId: string,
  sheetName: string
) {
  type ValuesResponse = {
    values?: string[][]
  }

  const encodedRange = encodeURIComponent(`${sheetName}!A1:Z5000`)
  const response = await googleFetch<ValuesResponse>(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}/values/${encodedRange}`
  )

  const values = response.values ?? []
  if (values.length === 0) {
    return {
      headers: [] as string[],
      rows: [] as Array<{ rowIndex: number; values: string[] }>,
    }
  }

  const [headers, ...rows] = values
  const indexedRows = rows
    .map((row, index) => ({ rowIndex: index + 2, values: row }))
    .filter((row) => row.values.some((cell) => cell !== ""))

  return {
    headers: headers ?? [],
    rows: indexedRows,
  }
}

export async function appendRow(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  values: string[]
) {
  const encodedRange = encodeURIComponent(`${sheetName}!A1`)
  await googleFetch(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [values] }),
    }
  )
}

export async function updateRow(
  token: string,
  spreadsheetId: string,
  range: string,
  values: string[]
) {
  const encodedRange = encodeURIComponent(range)
  await googleFetch(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [values] }),
    }
  )
}

export async function deleteRowsByIndexes(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  rowIndexes: number[]
) {
  if (rowIndexes.length === 0) {
    return
  }

  type SheetMetaResponse = {
    sheets?: SheetSummary[]
  }

  const metadata = await googleFetch<SheetMetaResponse>(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`
  )

  const targetSheet = metadata.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName
  )

  const sheetId = targetSheet?.properties?.sheetId
  if (sheetId === undefined) {
    throw new Error(`Sheet '${sheetName}' not found`)
  }

  const sortedUniqueIndexes = [...new Set(rowIndexes)]
    .filter((rowIndex) => rowIndex >= 2)
    .sort((a, b) => b - a)

  if (sortedUniqueIndexes.length === 0) {
    return
  }

  await googleFetch(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      body: JSON.stringify({
        requests: sortedUniqueIndexes.map((rowIndex) => ({
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        })),
      }),
    }
  )
}
