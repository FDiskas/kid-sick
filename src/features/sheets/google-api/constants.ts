export const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3"
export const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4"

export type SpreadsheetInfo = {
  spreadsheetId: string
  spreadsheetUrl: string
}

export type SheetSummary = {
  properties?: {
    sheetId?: number
    title?: string
  }
}
