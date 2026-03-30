import { env } from "@/config/env"
import { loadGoogleIdentityScript } from "@/features/google/gis"
import type { SpreadsheetContext } from "@/features/health/types"

export type AuthState = {
  accessToken: string
  expiresAt: number
  spreadsheet: SpreadsheetContext
}

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file"
].join(" ")

export const AUTH_STORAGE_KEY = "kid-sick.auth"
export const AUTH_ERROR_EVENT = "google-api-401"

export function readPersistedAuth(): AuthState | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !parsed.spreadsheet ||
      typeof parsed.spreadsheet.spreadsheetId !== "string" ||
      typeof parsed.spreadsheet.spreadsheetUrl !== "string"
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    if (parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return {
      accessToken: parsed.accessToken,
      expiresAt: parsed.expiresAt,
      spreadsheet: parsed.spreadsheet,
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export async function requestAccessToken(prompt: "consent" | "none") {
  await loadGoogleIdentityScript()

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services is unavailable")
  }

  if (!env.googleClientId) {
    throw new Error("Missing VITE_GOOGLE_CLIENT_ID")
  }

  return new Promise<{ accessToken: string; expiresIn: number }>(
    (resolve, reject) => {
      const oauth2 = window.google?.accounts?.oauth2
      if (!oauth2) {
        reject(new Error("Google OAuth2 client is unavailable"))
        return
      }

      const tokenClient = oauth2.initTokenClient({
        client_id: env.googleClientId,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }

          if (!response.access_token) {
            reject(
              new Error("Google token response did not include an access token")
            )
            return
          }

          resolve({
            accessToken: response.access_token,
            expiresIn: response.expires_in ?? 3600,
          })
        },
      })

      tokenClient.requestAccessToken(prompt === "none" ? { prompt: "none" } : { prompt })
    }
  )
}
