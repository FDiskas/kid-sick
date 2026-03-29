import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GoogleSheetIcon,
  Loading03Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

import { useTheme } from "@/components/theme-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/features/auth/auth-context"
import {
  getTemperatureUnitPreference,
  isTemperatureUnit,
  setTemperatureUnitPreference,
  TEMPERATURE_UNIT_OPTIONS,
  type TemperatureUnit,
} from "@/features/health/temperature-unit-preference"
import { type Theme } from "@/components/theme-utils"
import { cn } from "@/lib/utils"

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

export function SettingsPage() {
  const { auth, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(
    getTemperatureUnitPreference
  )

  if (!auth) {
    return null
  }

  function handleTemperatureUnitChange(nextValue: TemperatureUnit | null) {
    if (!nextValue) {
      return
    }

    if (!isTemperatureUnit(nextValue)) {
      return
    }

    setTemperatureUnit(nextValue)
    setTemperatureUnitPreference(nextValue)
  }

  function handleThemeChange(nextValue: Theme | null) {
    if (!nextValue) {
      return
    }

    setTheme(nextValue)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Choose how the app theme should render for this browser.
          </p>
          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium" htmlFor="theme-select">
              Theme
            </label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Temperature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Pick your default unit for new temperature entries. Default is
            Celsius.
          </p>
          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium" htmlFor="temperature-unit">
              Default unit
            </label>
            <Select
              value={temperatureUnit}
              onValueChange={handleTemperatureUnitChange}
            >
              <SelectTrigger id="temperature-unit" className="w-full">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {TEMPERATURE_UNIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
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
