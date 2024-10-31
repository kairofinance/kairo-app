"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

export default function Hero() {
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
              <h1 className="my-auto max-w-lg text-xs font-bold tracking-tight text-white">
                {"Coming soon"}
              </h1>
            </div>
            <h1 className="mt-2 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {"Web3 billing, simplified."}
            </h1>
            <p className="mt-6 text-md leading-8 text-zinc-100 max-w-2xl">
              {
                "Streamline your freelance and DAO billing processes with decentralized and secure solutions, all in one place."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
