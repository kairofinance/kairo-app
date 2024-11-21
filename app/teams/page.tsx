import { Suspense } from "react";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import SpinningLogo from "@/components/SpinningLogo";
import TeamsClient from "./TeamsClient";
import { getCacheHeaders } from "@/utils/cache-headers";

export default async function TeamsPage() {
  const cookieStore = cookies();
  const langCookie = (await cookieStore).get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <SpinningLogo />
          </div>
        }
      >
        <TeamsClient initialDictionary={dictionary} initialLang={lang} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata() {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  return {
    title: "Teams | Kairo",
    description: "Manage your teams and memberships",
    other: {
      headers,
    },
  };
}

export const dynamic = "force-dynamic";
