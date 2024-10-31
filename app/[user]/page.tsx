import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/utils/get-dictionary";
import { i18n } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import ProfileClient from "./ProfileClient";
import { getEthereumClient } from "@/utils/ethereum-client";
import { getCacheHeaders } from "@/utils/cache-headers";

type Props = {
  params: {
    user: string;
  };
};

async function getLanguageSettings() {
  const lang = i18n.defaultLocale;
  const dictionary = await getDictionary(lang);
  return { lang, dictionary };
}

async function resolveEthAddress(userAddress: string | undefined) {
  if (!userAddress) return null;

  if (userAddress.endsWith(".eth")) {
    const client = getEthereumClient();
    return await client.getEnsAddress({ name: userAddress });
  }
  return userAddress.startsWith("0x") ? userAddress : null;
}

export default async function ProfilePage({ params }: Props) {
  const address = await resolveEthAddress(params.user);

  if (!address) {
    notFound();
  }

  const { dictionary, lang } = await getLanguageSettings();

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ProfileClient
          address={address}
          ensName={params.user.endsWith(".eth") ? params.user : null}
          dictionary={dictionary}
          lang={lang}
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  if (!params?.user) {
    return {
      title: "Profile Not Found | Kairo",
      description: "The requested profile could not be found",
    };
  }

  const address = await resolveEthAddress(params.user);
  if (!address) {
    notFound();
  }

  const displayName = params.user.endsWith(".eth") ? params.user : address;

  return {
    title: `${displayName}'s Profile | Kairo`,
    description: `View ${displayName}'s profile on Kairo`,
    other: {
      headers: getCacheHeaders({
        maxAge: 3600, // 1 hour for metadata
        staleWhileRevalidate: 300,
      }),
    },
  };
}

export async function generateStaticParams() {
  return [];
}
