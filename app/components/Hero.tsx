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
    <div className="">
      <div className="relative isolate pt-14">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 px-4 py-1 text-sm leading-6 text-zinc-600 dark:text-zinc-200 ring-1 ring-zinc-900/10 dark:ring-zinc-300 hover:ring-zinc-900/20 dark:hover:ring-zinc-200">
                <span className="font-semibold text-black dark:text-white">
                  {t.beta || "Beta"}
                </span>
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-zinc-900/10 dark:bg-zinc-300"
                />
                <a href="/dashboard" className="flex items-center gap-x-1">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {t.liveNow || "Live Now"}
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="-mr-2 h-5 w-5 text-zinc-400 dark:text-zinc-200"
                  />
                </a>
              </div>
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t.title || "Web3 billing, simplified."}
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-100">
              {t.description ||
                "Effortlessly manage your freelance and DAO billing processes, decentralized and secure."}
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <a
                href="/dashboard"
                className="outline-1 outline outline-black dark:outline-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black duration-300 px-3.5 py-2.5 text-sm font-semibold text-black dark:text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t.createInvoice || "Go to Dashboard"}
              </a>
              <a
                href="#"
                className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
              >
                {t.learnMore || "Learn more"} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow hue-rotate-[200deg]">
            <Image src="/calc.gif" width={500} height={500} alt="anim" />
          </div>
        </div>
      </div>
    </div>
  );
}
