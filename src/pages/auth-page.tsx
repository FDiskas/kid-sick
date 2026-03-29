import { useState } from "react"
import { Navigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { GoogleDriveIcon, Loading03Icon } from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <CardHeader>
          <CardTitle>Sign in with Google to start tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This app stores your child health data in a spreadsheet created in
            your own Google Drive.
          </p>
          <Alert>
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
        </CardContent>
      </Card>
    </div>
  )
}
