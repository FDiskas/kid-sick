import { useState } from "react"
import { Navigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GoogleDriveIcon,
  Loading03Icon,
  Heart,
} from "@hugeicons/core-free-icons"

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

export function AuthPage() {
  const { auth, isLoading, signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)

  if (auth) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-red-500">
            <HugeiconsIcon
              icon={Heart}
              strokeWidth={2}
              className="size-6 text-white"
            />
          </div>
          <CardTitle className="text-2xl">Kid Sick Tracker</CardTitle>
          <CardDescription>
            Track your child's health data securely in your own Google Drive
          </CardDescription>
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
                    : "Unable to complete Google authorization"
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
            {isLoading ? "Connecting..." : "Authorize Google Drive"}
          </Button>
          <Alert className="p-4">
            <AlertTitle>Scopes requested</AlertTitle>
            <AlertDescription>
              Drive file access and Sheets read/write are used to create and
              update your tracker workbook.
            </AlertDescription>
          </Alert>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-1 text-center text-xs text-gray-500">
            <p className="text-left">
              By signing in, you authorize this app to:
            </p>
            <ul className="ml-6 list-disc text-left">
              <li>Create a spreadsheet in your Google Drive</li>
              <li>
                Read and write your health tracking data in the spreadsheet
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
