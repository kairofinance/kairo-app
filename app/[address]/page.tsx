import { Suspense } from "react";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import SpinningLogo from "@/components/SpinningLogo";
import ProfileClient from "./ProfileClient";
import { getCacheHeaders } from "@/utils/cache-headers";
import type { Metadata } from "next";

export default async function ProfilePage({ params }: any) {
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
        <ProfileClient
          address={params.address}
          initialDictionary={dictionary}
          initialLang={lang}
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  return {
    title: `Profile ${params.address.slice(0, 6)}... | Kairo`,
    description: `View profile and activity for ${params.address}`,
  };
}

export const dynamic = "force-dynamic";
