import type { SpreadsheetContext } from "@/features/health/types"

export type KidAuth = {
  accessToken: string
  spreadsheet: SpreadsheetContext
}

export type LockHelpers = {
  acquireActionLock: (key: string) => boolean
  releaseActionLock: (key: string) => void
}
