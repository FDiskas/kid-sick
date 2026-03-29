import { Link, Outlet } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { Heart, Logout01Icon, Settings01Icon } from "@hugeicons/core-free-icons"

import { GitHubFooter } from "./github-footer"
import { translate } from "@/lib/translate"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/features/auth/auth-context"

export function AppShell() {
  const { auth, signOut } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-[radial-gradient(circle_at_top_right,var(--color-primary)/12%,transparent_40%),radial-gradient(circle_at_20%_10%,var(--color-accent)/10%,transparent_32%)]">
      <header className="border-b bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex flex-row items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <div className="mx-auto flex size-9 flex-row items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-red-500">
              <HugeiconsIcon
                icon={Heart}
                strokeWidth={2}
                className="size-6 text-white"
              />
            </div>
            <div>{translate.title}</div>
          </Link>
          <div className="flex items-center gap-2">
            {auth ? (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <span
                  className="size-2 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                {translate.googleConnected}
              </Badge>
            ) : null}
            {auth ? (
              <Button variant="outline" onClick={signOut}>
                <HugeiconsIcon
                  icon={Logout01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                {translate.logout}
              </Button>
            ) : null}
            <Link
              to="/settings"
              className={buttonVariants({ variant: "outline", size: "icon" })}
              aria-label={translate.openSettings}
              title={translate.openSettings}
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <GitHubFooter />
    </div>
  )
}
