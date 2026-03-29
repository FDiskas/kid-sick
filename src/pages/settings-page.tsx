import { useState } from "react"
import {
  translate,
  setTranslateLanguage,
  type LanguageCode,
} from "@/lib/translate"
import {
  getLanguagePreference,
  setLanguagePreference,
} from "@/features/language/language-preference"
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
  { value: "system", label: translate.themeSystem },
  { value: "light", label: translate.themeLight },
  { value: "dark", label: translate.themeDark },
]

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "lt", label: "Lietuvių" },
  { value: "en", label: "English" },
]

export function SettingsPage() {
  const [language, setLanguage] = useState<LanguageCode>(getLanguagePreference)
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
      <h1 className="text-2xl font-semibold">{translate.settingsTitle}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{translate.appearanceTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {translate.appearanceDescription}
          </p>
          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium" htmlFor="theme-select">
              {translate.themeLabel}
            </label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue placeholder={translate.themePlaceholder} />
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
          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium" htmlFor="language-select">
              {translate.languageLabel}
            </label>
            <Select
              value={language}
              onValueChange={(value) => {
                if (value) {
                  setLanguage(value as LanguageCode)
                  setTranslateLanguage(value as LanguageCode)
                  setLanguagePreference(value as LanguageCode)
                }
              }}
            >
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder={translate.languagePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
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
          <CardTitle>{translate.temperatureTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {translate.temperatureDescription}
          </p>
          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium" htmlFor="temperature-unit">
              {translate.temperatureUnitLabel}
            </label>
            <Select
              value={temperatureUnit}
              onValueChange={handleTemperatureUnitChange}
            >
              <SelectTrigger id="temperature-unit" className="w-full">
                <SelectValue
                  placeholder={translate.temperatureUnitPlaceholder}
                />
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
          <CardTitle>{translate.googleConnectionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            {translate.googleConnectionDescription}
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
              {translate.openMySheet}
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
              {isDisconnecting
                ? translate.disconnecting
                : translate.disconnectGoogle}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
