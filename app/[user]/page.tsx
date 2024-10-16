import React from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/utils/get-dictionary";
import { cookies } from "next/headers";
import { i18n, Locale } from "@/utils/i18n-config";
import Spinner from "@/components/Spinner";
import ProfileClient from "./ProfileClient";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

async function getProfileData(user: string) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;
  const dictionary = await getDictionary(lang);

  let address: string;
  if (user.endsWith(".eth")) {
    // It's an ENS name
    const resolvedAddress = await publicClient.getEnsAddress({ name: user });
    if (!resolvedAddress) {
      notFound();
    }
    address = resolvedAddress;
  } else if (user.startsWith("0x")) {
    // It's an Ethereum address
    address = user;
  } else {
    notFound();
  }

  return {
    dictionary,
    lang,
    address,
    ensName: user.endsWith(".eth") ? user : null,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { user: string };
}) {
  const { dictionary, lang, address, ensName } = await getProfileData(
    params.user
  );

  return (
    <Suspense fallback={<Spinner />}>
      <ProfileClient
        address={address}
        ensName={ensName}
        dictionary={dictionary}
        lang={lang}
      />
    </Suspense>
  );
}
