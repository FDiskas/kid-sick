import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export function SettingsPage() {
  const { auth, signOut } = useAuth()

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
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Open my sheet
            </a>
            <Button variant="destructive" onClick={signOut}>
              Disconnect Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
