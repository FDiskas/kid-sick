import { useState } from "react"
import { Navigate } from "react-router-dom"
import {
  Cloud,
  Loader2,
  Heart,
  ShieldCheck,
  ClipboardList,
  LineChart,
  Info,
} from "lucide-react"

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
    <div className="flex min-h-svh flex-col bg-background selection:bg-primary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-pink-500 to-red-500 shadow-lg shadow-red-500/20">
              <Heart
                className="size-5 text-white"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Kid Sick
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant={language === "en" ? "secondary" : "ghost"}
              size="sm"
              className="px-2"
              onClick={() => handleLanguageChange("en")}
              title="English"
            >
              <span className="fi fi-us mr-1"></span>
              <span className="hidden sm:inline">EN</span>
            </Button>
            <Button
              variant={language === "lt" ? "secondary" : "ghost"}
              size="sm"
              className="px-2"
              onClick={() => handleLanguageChange("lt")}
              title="Lietuvių"
            >
              <span className="fi fi-lt mr-1"></span>
              <span className="hidden sm:inline">LT</span>
            </Button>
            <Button
              variant={language === "pl" ? "secondary" : "ghost"}
              size="sm"
              className="px-2"
              onClick={() => handleLanguageChange("pl")}
              title="Polski"
            >
              <span className="fi fi-pl mr-1"></span>
              <span className="hidden sm:inline">PL</span>
            </Button>
            <Button
              variant={language === "ru" ? "secondary" : "ghost"}
              size="sm"
              className="px-2"
              onClick={() => handleLanguageChange("ru")}
              title="Русский"
            >
              <span className="fi fi-ru mr-1"></span>
              <span className="hidden sm:inline">RU</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--color-primary-10)_0%,transparent_100%)] opacity-20" />
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="max-w-2xl animate-in fade-in slide-in-from-left duration-1000">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                  {translate.landingHeroTitle}
                </h1>
                <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                  {translate.landingHeroSubtitle}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                    <ShieldCheck
                      className="size-4 text-green-500"
                    />
                    {translate.featurePrivacyTitle}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                    <LineChart
                      className="size-4 text-blue-500"
                    />
                    {translate.featureChartsTitle}
                  </div>
                </div>
              </div>

              <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-primary/10 to-transparent blur-2xl" />
                <Card className="relative w-full border-primary/15 bg-card/80 shadow-2xl backdrop-blur-sm">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                      {translate.authorizeGoogle}
                    </CardTitle>
                    <CardDescription>
                      {translate.authDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Button
                      size="lg"
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
                      className="h-12 w-full text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <Loader2
                          className="size-5 animate-spin"
                        />
                      ) : (
                        <Cloud
                          className="size-5"
                        />
                      )}
                      {isLoading
                        ? translate.connecting
                        : translate.authorizeGoogle}
                    </Button>

                    <Alert className="border-primary/20 bg-primary/5 p-4 text-sm">
                      <Info
                        className="size-4 translate-y-0.5 text-primary"
                      />
                      <div className="ml-2">
                        <AlertTitle className="font-semibold text-primary">
                          {translate.scopesRequested}
                        </AlertTitle>
                        <AlertDescription className="text-muted-foreground mt-1">
                          {translate.scopesDrive}
                        </AlertDescription>
                      </div>
                    </Alert>

                    {error ? (
                      <Alert variant="destructive" className="animate-in head-shake duration-500">
                        <AlertTitle>{translate.signInFailed}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="space-y-3 rounded-xl border bg-muted/50 p-4 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {translate.bySigningIn}
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          {translate.createSpreadsheet}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          {translate.readWriteHealth}
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group rounded-2xl border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600 transition-colors group-hover:bg-green-500/20">
                  <ShieldCheck
                    className="size-6"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold">
                  {translate.featurePrivacyTitle}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed text-sm">
                  {translate.featurePrivacyDesc}
                </p>
              </div>

              <div className="group rounded-2xl border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20">
                  <ClipboardList
                    className="size-6"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold">
                  {translate.featureTrackingTitle}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed text-sm">
                  {translate.featureTrackingDesc}
                </p>
              </div>

              <div className="group rounded-2xl border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-purple-500/20">
                  <LineChart
                    className="size-6"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold">
                  {translate.featureChartsTitle}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed text-sm">
                  {translate.featureChartsDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                {translate.howItWorksTitle}
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  1
                </div>
                <p className="mt-6 font-medium text-lg leading-snug">
                  {translate.howItWorksStep1}
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  2
                </div>
                <p className="mt-6 font-medium text-lg leading-snug">
                  {translate.howItWorksStep2}
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  3
                </div>
                <p className="mt-6 font-medium text-lg leading-snug">
                  {translate.howItWorksStep3}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GitHubFooter />
    </div>
  )
}
