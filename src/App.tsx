import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import { AppShell } from "@/components/app-shell"
import { RequireAuth } from "@/features/auth/require-auth"
import { AuthPage } from "@/pages/auth-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { KidPage } from "@/pages/kid-page"
import { SettingsPage } from "@/pages/settings-page"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/kids/:kidId" element={<KidPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
