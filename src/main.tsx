import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/features/auth/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/lib/query-client"
import { setTranslateLanguage } from "@/lib/translate"
import { getLanguagePreference } from "@/features/language/language-preference.ts"

setTranslateLanguage(getLanguagePreference())

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
