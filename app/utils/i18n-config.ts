export type Lang = "en" | "fr" | "es" | "pt" | "ja" | "zh" | "de";

export const i18n = {
  defaultLocale: "en",
  locales: ["en", "fr", "es", "pt", "ja", "zh", "de"],
} as const;

export type Locale = (typeof i18n)["locales"][number];
