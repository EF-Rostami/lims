export const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "it", "nl", "pl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
};

export function isLocale(val: string): val is Locale {
  return SUPPORTED_LOCALES.includes(val as Locale);
}
