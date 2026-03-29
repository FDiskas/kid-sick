import { Link, NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/features/auth/auth-context"

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark")
      }}
    >
      Theme: {theme}
    </Button>
  )
}

export function AppShell() {
  const { auth, signOut } = useAuth()

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_right,var(--color-primary)/12%,transparent_40%),radial-gradient(circle_at_20%_10%,var(--color-accent)/10%,transparent_32%)]">
      <header className="border-b bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Kid Sick Tracker
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              }
            >
              Dashboard
            </NavLink>
            <span className="text-muted-foreground">/</span>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              }
            >
              Settings
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {auth ? <Badge variant="secondary">Google Connected</Badge> : null}
            {auth ? (
              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            ) : null}
            <ThemeToggleButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
