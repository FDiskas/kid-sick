import { env } from "@/config/env"
import { SHEET_HEADERS } from "@/features/sheets/sheets-schema"

const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3"
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4"

type SpreadsheetInfo = {
  spreadsheetId: string
  spreadsheetUrl: string
}

type SheetSummary = {
  properties?: {
    title?: string
  }
}

async function googleFetch<T>(
  token: string,
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google API error ${response.status}: ${body}`)
  }

  return (await response.json()) as T
}

export async function findOrCreateSpreadsheet(token: string) {
  const title = `${env.sheetTitlePrefix} - Data`
  const query = encodeURIComponent(
    `name='${title.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
  )

  type DriveSearchResponse = {
    files?: Array<{ id: string; webViewLink?: string }>
  }

  const searchUrl = `${GOOGLE_DRIVE_API}/files?q=${query}&pageSize=1&fields=files(id,webViewLink)`
  const found = await googleFetch<DriveSearchResponse>(token, searchUrl)

  const existing = found.files?.[0]
  if (existing?.id) {
    return {
      spreadsheetId: existing.id,
      spreadsheetUrl:
        existing.webViewLink ??
        `https://docs.google.com/spreadsheets/d/${existing.id}/edit`,
    } satisfies SpreadsheetInfo
  }

  type CreateSheetResponse = {
    spreadsheetId: string
    spreadsheetUrl?: string
  }

  const createResult = await googleFetch<CreateSheetResponse>(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets`,
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          title,
        },
      }),
    }
  )

  return {
    spreadsheetId: createResult.spreadsheetId,
    spreadsheetUrl:
      createResult.spreadsheetUrl ??
      `https://docs.google.com/spreadsheets/d/${createResult.spreadsheetId}/edit`,
  } satisfies SpreadsheetInfo
}

export async function ensureSpreadsheetShape(
  token: string,
  spreadsheetId: string
) {
  type SheetMetaResponse = {
    sheets?: SheetSummary[]
  }

  const metadata = await googleFetch<SheetMetaResponse>(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`
  )

  const existingNames = new Set(
    metadata.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean)
  )

  const missingSheets = Object.keys(SHEET_HEADERS).filter(
    (sheetName) => !existingNames.has(sheetName)
  )

  if (missingSheets.length > 0) {
    await googleFetch(
      token,
      `${GOOGLE_SHEETS_API}/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        body: JSON.stringify({
          requests: missingSheets.map((title) => ({
            addSheet: { properties: { title } },
          })),
        }),
      }
    )
  }

  await Promise.all(
    Object.entries(SHEET_HEADERS).map(async ([sheetName, headers]) => {
      await updateRow(token, spreadsheetId, `${sheetName}!A1`, [...headers])
    })
  )
}

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
