import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;

  // Use lang to get the appropriate dictionary or handle localization
  // ...
}
