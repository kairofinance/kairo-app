import { Suspense } from "react";
import Hero from "@/components/Hero";
import Feature1 from "@/components/Feature1";
import Stats from "@/components/Stats";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import Bento from "./components/Bento";

export default async function Home() {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return (
    <Suspense fallback={<Spinner />}>
      <Hero lang={lang} dictionary={dictionary} />
      <Bento />
      <Feature1 dictionary={dictionary} />
      <Stats dictionary={dictionary} />
    </Suspense>
  );
}

export const dynamic = "force-static";
