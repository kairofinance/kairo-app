import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import InvoicesClient from "./InvoicesClient";

export async function getServerSideProps() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  return {
    props: {
      dictionary,
      lang,
    },
  };
}

export default function InvoicesPage({ dictionary, lang }: any) {
  return (
    <AuthWrapper>
      <Suspense fallback={<Spinner />}>
        <InvoicesClient dictionary={dictionary} lang={lang} />
      </Suspense>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
