import { type LanguageCode } from "../../lib/translate"

const LANGUAGE_STORAGE_KEY = "kid-sick.language"

export function isLanguageCode(value: LanguageCode): value is LanguageCode {
  return value === "en" || value === "lt"
}

export function getLanguagePreference(): LanguageCode {
  if (typeof window === "undefined") {
    return "en"
  }

  const storedValue = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode
  if (!storedValue || !isLanguageCode(storedValue)) {
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
