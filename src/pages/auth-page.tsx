import { useState } from "react"
import { Navigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GoogleDriveIcon,
  Loading03Icon,
  Heart,
} from "@hugeicons/core-free-icons"

import { GitHubFooter } from "../components/github-footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-context"
import {
  translate,
  setTranslateLanguage,
  type LanguageCode,
} from "@/lib/translate"
import {
  getLanguagePreference,
  setLanguagePreference,
} from "@/features/language/language-preference"
import "flag-icons/css/flag-icons.min.css"

export function AuthPage() {
  const { auth, isLoading, signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<LanguageCode>(getLanguagePreference)

  function handleLanguageChange(newLang: LanguageCode) {
    if (newLang === language) return
    setLanguage(newLang)
    setTranslateLanguage(newLang)
    setLanguagePreference(newLang)
  }

  if (auth) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-lg border-primary/25 bg-linear-to-br from-primary/10 to-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-red-500">
              <HugeiconsIcon
                icon={Heart}
                strokeWidth={2}
                className="size-6 text-white"
              />
            </div>
            <CardTitle className="text-2xl">{translate.title}</CardTitle>
            <CardDescription>{translate.authDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              disabled={isLoading}
              onClick={async () => {
                setError(null)
                try {
                  await signIn()
                } catch (signInError) {
                  setError(
                    signInError instanceof Error
                      ? signInError.message
                      : translate.signInErrorDefault
                  )
                }
              }}
              className="w-full"
            >
              {isLoading ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="size-4 animate-spin"
                />
              ) : (
                <HugeiconsIcon
                  icon={GoogleDriveIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              )}
              {isLoading ? translate.connecting : translate.authorizeGoogle}
            </Button>
            <Alert className="p-4">
              <AlertTitle>{translate.scopesRequested}</AlertTitle>
              <AlertDescription>{translate.scopesDrive}</AlertDescription>
            </Alert>
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>{translate.signInFailed}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-1 text-center text-xs text-gray-500">
              <p className="text-left">{translate.bySigningIn}</p>
              <ul className="ml-6 list-disc text-left">
                <li>{translate.createSpreadsheet}</li>
                <li>{translate.readWriteHealth}</li>
              </ul>
            </div>
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant={language === "en" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleLanguageChange("en")}
                title="English"
              >
                <span className="fi fi-us"></span>
              </Button>
              <Button
                variant={language === "lt" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleLanguageChange("lt")}
                title="Lietuvių"
              >
                <span className="fi fi-lt"></span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <GitHubFooter />
    </div>
  )
}
