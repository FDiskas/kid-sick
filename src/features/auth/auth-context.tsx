/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { useMutation } from "@tanstack/react-query"

import {
  AUTH_STORAGE_KEY,
  readPersistedAuth,
  requestAccessToken,
  type AuthState,
} from "@/features/auth/auth-utils"
import {
  ensureSpreadsheetShape,
  findOrCreateSpreadsheet,
} from "@/features/sheets/google-api"

type AuthContextValue = {
  auth: AuthState | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState | null>(() =>
    readPersistedAuth()
  )

  const signInMutation = useMutation({
    mutationFn: async () => {
      const tokenResult = await requestAccessToken("consent")
      const spreadsheet = await findOrCreateSpreadsheet(tokenResult.accessToken)
      await ensureSpreadsheetShape(
        tokenResult.accessToken,
        spreadsheet.spreadsheetId
      )

      return {
        accessToken: tokenResult.accessToken,
        expiresAt: Date.now() + tokenResult.expiresIn * 1000,
        spreadsheet,
      }
    },
    onSuccess: (nextAuth) => {
      setAuth(nextAuth)
    },
  })

  const signIn = React.useCallback(async () => {
    await signInMutation.mutateAsync()
  }, [signInMutation])

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
      isLoading: signInMutation.isPending,
      signIn,
      signOut,
    }),
    [auth, signInMutation.isPending, signIn, signOut]
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
