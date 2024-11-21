import { Suspense } from "react";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import SpinningLogo from "@/components/SpinningLogo";
import TeamClient from "./TeamClient";
import { getCacheHeaders } from "@/utils/cache-headers";

interface TeamPageProps {
  params: {
    id: string;
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const [teamId, cookieStore] = await Promise.all([
    Promise.resolve(params.id),
    cookies(),
  ]);

  const langCookie = cookieStore.get("NEXT_LOCALE");
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
        <TeamClient
          teamId={teamId}
          initialDictionary={dictionary}
          initialLang={lang}
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: TeamPageProps) {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  const teamId = await Promise.resolve(params.id);

  return {
    title: `Team Details | Kairo`,
    description: "View and manage team details",
    other: {
      headers,
    },
  };
}

export const dynamic = "force-dynamic";
