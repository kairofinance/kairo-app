"use client";
import React from "react";
import { Disclosure, DisclosureButton } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <Disclosure as="nav" className="bg-opacity-30 border-b-1 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left side with logo and navigation */}
          <div className="flex">
            <Link
              href={`/`}
              className="flex flex-shrink-0 items-center place-items-center gap-2"
            >
              <Image
                src="/kairo-dark.svg"
                alt="kairoLogo"
                width={100}
                height={30}
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-kairo-black-a20 p-2 text-kairo-white hover:bg-kairo-white hover:text-zinc-500 focus:outline-none focus:ring-2 ring-kairo-green focus:ring-offset-2">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
    </Disclosure>
  );
};

export default Navbar;
