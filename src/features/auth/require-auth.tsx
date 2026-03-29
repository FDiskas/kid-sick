import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/features/auth/auth-context"

export function RequireAuth() {
  const { auth } = useAuth()
  const location = useLocation()

  if (!auth) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return <Outlet />
}
