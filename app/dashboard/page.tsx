import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import DashboardClient from "./DashboardClient";
import { getCacheHeaders } from "@/utils/cache-headers";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const langCookie = (await cookieStore).get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return (
    <AuthWrapper>
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Spinner />
            </div>
          }
        >
          <DashboardClient initialDictionary={dictionary} initialLang={lang} />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

// Add metadata with cache headers
export async function generateMetadata() {
  const headers = getCacheHeaders({
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300,
  });

  return {
    title: "Dashboard | Kairo",
    description: "View your dashboard and recent activity",
    other: {
      headers,
    },
  };
}

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
