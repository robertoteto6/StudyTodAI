import { type Locale, SUPPORTED_LOCALES } from "@/lib/types";

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getSafeLocale(value: string): Locale {
  return isLocale(value) ? value : "es";
}
