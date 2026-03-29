import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GoogleSheetIcon,
  Loading03Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export function SettingsPage() {
  const { auth, signOut } = useAuth()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  if (!auth) {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Google Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Your health records are stored in your own Google Drive spreadsheet.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={auth.spreadsheet.spreadsheetUrl}
              rel="noreferrer"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex items-center gap-2"
              )}
            >
              <HugeiconsIcon
                icon={GoogleSheetIcon}
                strokeWidth={2}
                className="size-4"
              />
              Open my sheet
            </a>
            <Button
              variant="destructive"
              disabled={isDisconnecting}
              onClick={() => {
                if (isDisconnecting) {
                  return
                }

                setIsDisconnecting(true)
                try {
                  signOut()
                } finally {
                  setIsDisconnecting(false)
                }
              }}
            >
              {isDisconnecting ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="size-4 animate-spin"
                />
              ) : (
                <HugeiconsIcon
                  icon={Logout01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              )}
              {isDisconnecting ? "Disconnecting..." : "Disconnect Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
