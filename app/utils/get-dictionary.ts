import type { Locale } from "./i18n-config";

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () =>
    import("../../locales/en/common.json").then((module) => module.default),
  fr: () =>
    import("../../locales/fr/common.json").then((module) => module.default),
  es: () =>
    import("../../locales/es/common.json").then((module) => module.default),
  pt: () =>
    import("../../locales/pt/common.json").then((module) => module.default),
  ja: () =>
    import("../../locales/ja/common.json").then((module) => module.default),
  zh: () =>
    import("../../locales/zh/common.json").then((module) => module.default),
  de: () =>
    import("../../locales/de/common.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!(locale in dictionaries)) {
    console.warn(
      `Dictionary for locale "${locale}" not found. Falling back to English.`
    );
    return dictionaries.en();
  }
  return dictionaries[locale]();
};
