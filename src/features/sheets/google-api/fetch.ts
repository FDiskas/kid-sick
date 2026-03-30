import { AUTH_ERROR_EVENT } from "@/features/auth/auth-utils"

export async function googleFetch<T>(
  token: string,
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT))
    }
    const body = await response.text()
    throw new Error(`Google API error ${response.status}: ${body}`)
  }

  return (await response.json()) as T
}
