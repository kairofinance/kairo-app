import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import StreamsClient from "./StreamsClient";

async function getDashboardData() {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return { dictionary, lang };
}

export default async function StreamsPage() {
  const { dictionary, lang } = await getDashboardData();

  return (
    <AuthWrapper>
      <Suspense fallback={<Spinner />}>
        <StreamsClient />
      </Suspense>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
