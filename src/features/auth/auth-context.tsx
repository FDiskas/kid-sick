/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { env } from "@/config/env"
import { loadGoogleIdentityScript } from "@/features/google/gis"
import {
  ensureSpreadsheetShape,
  findOrCreateSpreadsheet,
} from "@/features/sheets/google-api"
import type { SpreadsheetContext } from "@/features/health/types"

type AuthState = {
  accessToken: string
  expiresAt: number
  spreadsheet: SpreadsheetContext
}

type AuthContextValue = {
  auth: AuthState | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ")

const AUTH_STORAGE_KEY = "kid-sick.auth"

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

function readPersistedAuth(): AuthState | null {
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

async function requestAccessToken(prompt: "consent" | "") {
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

      tokenClient.requestAccessToken({ prompt })
    }
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState | null>(() =>
    readPersistedAuth()
  )
  const [isLoading, setIsLoading] = React.useState(false)

  const signIn = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const tokenResult = await requestAccessToken("consent")
      const spreadsheet = await findOrCreateSpreadsheet(tokenResult.accessToken)
      await ensureSpreadsheetShape(
        tokenResult.accessToken,
        spreadsheet.spreadsheetId
      )

      setAuth({
        accessToken: tokenResult.accessToken,
        expiresAt: Date.now() + tokenResult.expiresIn * 1000,
        spreadsheet,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = React.useCallback(() => {
    if (auth?.accessToken && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(auth.accessToken)
    }
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }, [auth])

  React.useEffect(() => {
    if (!auth) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  }, [auth])

  React.useEffect(() => {
    if (!auth) {
      return
    }

    const timeoutMs = auth.expiresAt - Date.now() - 60_000

    if (timeoutMs <= 0) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setAuth(null)
      return
    }

    const timeout = window.setTimeout(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setAuth(null)
    }, timeoutMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [auth])

  const value = React.useMemo(
    () => ({
      auth,
      isLoading,
      signIn,
      signOut,
    }),
    [auth, isLoading, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
