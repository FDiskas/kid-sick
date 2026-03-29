let gisScriptPromise: Promise<void> | null = null

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: {
              access_token?: string
              expires_in?: number
              error?: string
            }) => void
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void
          }
          revoke: (token: string, done?: () => void) => void
        }
      }
    }
  }
}

export async function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return
  }

  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      )

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true })
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google Identity Services")),
          { once: true }
        )
        return
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"))
      document.head.appendChild(script)
    })
  }

  await gisScriptPromise
}
