import { Suspense } from "react";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import SpinningLogo from "@/components/SpinningLogo";
import CreateTeamClient from "./CreateTeamClient";
import { getCacheHeaders } from "@/utils/cache-headers";

export default async function CreateTeamPage() {
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
        <CreateTeamClient initialDictionary={dictionary} initialLang={lang} />
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
    title: "Create Team | Kairo",
    description: "Create a new team",
    other: {
      headers,
    },
  };
}

export const dynamic = "force-dynamic";
