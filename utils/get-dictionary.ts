import { Locale } from "./i18n-config";

export const getDictionary = async (locale: Locale) => {
  return (await import(`@/dictionaries/${locale}.json`)).default;
};
