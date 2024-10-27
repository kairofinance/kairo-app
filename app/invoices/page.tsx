import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import InvoicesClient from "./InvoicesClient";

async function getInvoicesData() {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return { dictionary, lang };
}

export default async function InvoicesPage() {
  const { dictionary, lang } = await getInvoicesData();

  return (
    <AuthWrapper>
      <Suspense fallback={<Spinner />}>
        <InvoicesClient />
      </Suspense>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
