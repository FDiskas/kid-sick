/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { useMutation } from "@tanstack/react-query"

import {
  AUTH_STORAGE_KEY,
  AUTH_ERROR_EVENT,
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

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const tokenResult = await requestAccessToken("none")
      return {
        ...auth!,
        accessToken: tokenResult.accessToken,
        expiresAt: Date.now() + tokenResult.expiresIn * 1000,
      }
    },
    onSuccess: (nextAuth) => {
      setAuth(nextAuth)
    },
    onError: () => {
      signOut()
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
    const handle401 = () => signOut()
    window.addEventListener(AUTH_ERROR_EVENT, handle401)
    return () => window.removeEventListener(AUTH_ERROR_EVENT, handle401)
  }, [signOut])

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

    // Refresh 1 minute before expiration
    const refreshBufferMs = 60_000
    const timeoutMs = auth.expiresAt - Date.now() - refreshBufferMs

    if (timeoutMs <= 0) {
      refreshMutation.mutate()
      return
    }

    const timeout = window.setTimeout(() => {
      refreshMutation.mutate()
    }, timeoutMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [auth, refreshMutation])

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
