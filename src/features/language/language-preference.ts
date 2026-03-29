import { type LanguageCode } from "../../lib/translate"

const LANGUAGE_STORAGE_KEY = "kid-sick.language"

export function isLanguageCode(value: string | null): value is LanguageCode {
  return value === "en" || value === "lt" || value === "pl" || value === "ru"
}

export function getLanguagePreference(): LanguageCode {
  if (typeof window === "undefined") {
    return "en"
  }

  const storedValue = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (!isLanguageCode(storedValue)) {
    return "en"
  }

  return storedValue
}

export function setLanguagePreference(language: LanguageCode): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}
