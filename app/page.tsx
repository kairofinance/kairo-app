import { Suspense } from "react";
import Hero from "@/components/Hero";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";

export default async function Home() {
  const cookieStore = cookies();
  const langCookie = (await cookieStore).get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return (
    <Suspense fallback={<Spinner />}>
      <Hero />
    </Suspense>
  );
}

export const dynamic = "force-static";
