import { env } from "@/config/env"
import { SHEET_HEADERS } from "@/features/sheets/sheets-schema"
import {
  GOOGLE_DRIVE_API,
  GOOGLE_SHEETS_API,
  type SheetSummary,
} from "@/features/sheets/google-api/constants"
import { googleFetch } from "@/features/sheets/google-api/fetch"
import { updateRow } from "@/features/sheets/google-api/rows"

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
    }
  }

  type CreateSheetResponse = {
    spreadsheetId: string
    spreadsheetUrl?: string
  }

  const created = await googleFetch<CreateSheetResponse>(
    token,
    `${GOOGLE_SHEETS_API}/spreadsheets`,
    {
      method: "POST",
      body: JSON.stringify({ properties: { title } }),
    }
  )

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl:
      created.spreadsheetUrl ??
      `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`,
  }
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
