"use client";
import React, { useEffect, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Cookies from "js-cookie";
import { getDictionary } from "@/utils/get-dictionary";
import { Locale } from "@/utils/i18n-config";

interface NavbarProps {
  currentLang: Locale;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar: React.FC<NavbarProps> = ({ currentLang }) => {
  const [dictionary, setDictionary] = React.useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(currentLang);
      setDictionary(dict);
    };
    loadDictionary();
  }, [currentLang]);

  useEffect(() => {
    setIsMounted(true);
    const darkModePref = Cookies.get("darkMode");
    setDarkMode(darkModePref === "true");
    if (darkModePref === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSignIn = async () => {
    if (!isConnected) {
      try {
        await connect({ connector: connectors[0] }); // Use the first available connector
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      Cookies.set("darkMode", newMode.toString(), { expires: 365 });
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const handleSignOut = () => {
    disconnect();
  };

  if (!isMounted || !dictionary) {
    return null;
  }

  const userNavigation = [
    {
      name: dictionary.navbar.yourProfile,
      href: address ? `/${address}` : "#",
    },
    { name: dictionary.navbar.settings, href: "#" },
    { name: dictionary.navbar.signOut, href: "#", onClick: handleSignOut },
  ];

  const navigation = [
    { name: dictionary.navbar.dashboard, href: "/dashboard" },
  ];

  const navigationWithCurrent = navigation.map((item) => ({
    ...item,
    current: pathname === `${item.href}`,
    href: `${item.href}`,
  }));

  return (
    <Disclosure as="nav" className="dark:bg-opacity-30 border-b-1 shadow-sm">
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
            <div className="hidden md:-my-px md:ml-6 md:flex md:space-x-8">
              {navigationWithCurrent.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={classNames(
                    item.current
                      ? "border-kairo-green dark:text-kairo-white text-kairo-black-a20"
                      : "border-transparent text-zinc-500 dark:text-zinc-300/60 dark:hover:text-zinc-300 hover:text-zinc-700",
                    "inline-flex items-center border-b-2 px-1 pt-1 text-base font-medium"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side with actions */}
          <div className="hidden md:ml-6 md:flex md:items-center gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="rounded-full p-1 text-kairo-black-a40 dark:text-zinc-300 hover:bg-kairo-white dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-kairo-green focus:ring-offset-0"
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Profile/Connect Button */}
            {isConnected ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative rounded-full dark:hover:bg-zinc-800/80 px-3 py-2 gap-2 bg-zinc-800/50 flex text-sm focus:outline-none shadow-md focus:ring-2 focus:ring-kairo-green focus:ring-offset-3">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <Image
                      width="24"
                      height="24"
                      className="w-6 h-6 rounded-full bg-kairo-white my-auto"
                      src="/default-profile.png"
                      alt="profile"
                    />
                    <span className="ml-auto flex items-center gap-x-1 my-auto text-sm font-semibold text-kairo-black-a40 dark:text-kairo-white">
                      {address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : "Connected"}
                    </span>
                  </MenuButton>
                </div>
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-kairo-white dark:text-kairo-white dark:bg-zinc-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      {({ active }) => (
                        <Link
                          href={item.href}
                          onClick={item.onClick}
                          className={classNames(
                            active ? "bg-kairo-white dark:bg-zinc-800" : "",
                            "block px-4 py-2 text-sm dark:text-kairo-white text-zinc-700"
                          )}
                        >
                          {item.name}
                        </Link>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            ) : (
              <button
                onClick={handleSignIn}
                className="ml-auto flex items-center gap-x-1 rounded-full text-kairo-green bg-kairo-green-a20 bg-opacity-30 px-3 py-2 text-sm font-semibold shadow-lg hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-kairo-white dark:bg-kairo-black-a20 p-2 text-zinc-400 dark:text-kairo-white hover:bg-kairo-white hover:text-zinc-500 focus:outline-none focus:ring-2 ring-kairo-green focus:ring-offset-2">
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
      <DisclosurePanel className="md:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigationWithCurrent.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current
                  ? "border-kairo-green bg-red-50 text-red-700 dark:text-kairo-green-a80 dark:bg-zinc-800"
                  : "border-transparent text-kairo-black-a40 dark:text-kairo-white hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-800",
                "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 pb-3 pt-4">
          <div className="flex items-center px-4">
            {isConnected ? (
              <div className="ml-3">
                <div className="text-base font-medium text-zinc-800 dark:text-kairo-white">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "Connected"}
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="ml-auto flex items-center gap-x-1 rounded-full text-kairo-green bg-kairo-green-a20 bg-opacity-30 px-3 py-2 text-sm font-semibold shadow-lg hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Connect Wallet
              </button>
            )}
          </div>
          <div className="mt-3 space-y-1">
            {userNavigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                onClick={item.onClick}
                className="block px-4 py-2 text-base font-medium dark:text-kairo-white dark:hover:bg-zinc-800 text-zinc-500 hover:bg-kairo-white hover:text-zinc-800"
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default Navbar;
