"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroProps {
  lang: string;
  dictionary: any;
}

export default function Hero({ lang, dictionary }: HeroProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div></div>;
  }

  // Use dictionary.hero instead of t
  const t = dictionary.hero || {};

  return (
    <div className="flex place-items-center place-content-center h-full">
      <div className="relative isolate flex place-content-center place-items-center m-auto">
        <div className="mx-auto max-w-4xl lg:items-center place-content-center place-items-center m-auto">
          <div className="mx-auto lg:mx-0 lg:flex-auto ">
            <div className="flex">
              <Image
                src="/kairo-dark.svg"
                alt="kairoLogo"
                width={120}
                height={30}
              />
              <h1 className="my-auto max-w-lg text-xs font-bold tracking-tight text-zinc-900 dark:text-white">
                {t.title || "Coming soon"}
              </h1>
            </div>
            <h1 className="mt-2 max-w-lg text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t.title || "Web3 billing, simplified."}
            </h1>
            <p className="mt-6 text-md leading-8 text-zinc-600 dark:text-zinc-100">
              {t.description ||
                "Streamline your freelance and DAO billing processes with decentralized and secure solutions. Leverage ZK-Snark technology to ensure your billing information remains private."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
