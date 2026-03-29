export const sheetsQueryKeys = {
  all: (spreadsheetId: string) => ["sheets", spreadsheetId] as const,
  kids: (spreadsheetId: string) =>
    [...sheetsQueryKeys.all(spreadsheetId), "kids"] as const,
  kid: (spreadsheetId: string, kidId: string) =>
    [...sheetsQueryKeys.all(spreadsheetId), "kid", kidId] as const,
  temperatures: (spreadsheetId: string, kidId: string) =>
    [...sheetsQueryKeys.kid(spreadsheetId, kidId), "temperatures"] as const,
  medications: (spreadsheetId: string, kidId: string) =>
    [...sheetsQueryKeys.kid(spreadsheetId, kidId), "medications"] as const,
  growthRecords: (spreadsheetId: string, kidId: string) =>
    [...sheetsQueryKeys.kid(spreadsheetId, kidId), "growth-records"] as const,
  notes: (spreadsheetId: string, kidId: string) =>
    [...sheetsQueryKeys.kid(spreadsheetId, kidId), "notes"] as const,
}
