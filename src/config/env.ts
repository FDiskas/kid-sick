const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined
const SHEET_TITLE_PREFIX =
  (import.meta.env.VITE_SHEET_TITLE_PREFIX as string | undefined) ??
  "Kid Sick Tracker"

if (!GOOGLE_CLIENT_ID) {
  console.warn(
    "VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will fail until this is configured."
  )
}

export const env = {
  googleClientId: GOOGLE_CLIENT_ID ?? "",
  sheetTitlePrefix: SHEET_TITLE_PREFIX,
} as const
