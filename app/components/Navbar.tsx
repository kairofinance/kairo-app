"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon, LanguageIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlusSmallIcon } from "@heroicons/react/24/solid";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useConnect, useEnsName, useDisconnect } from "wagmi";
import DOMPurify from "dompurify";
import Cookies from "js-cookie";
import { getDictionary } from "@/utils/get-dictionary";
import { Locale } from "@/utils/i18n-config";
import AnimatedButton from "./AnimatedButton";

interface NavbarProps {
  currentLang: Locale;
}

// @ts-ignore
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar: React.FC<NavbarProps> = ({ currentLang }) => {
  const [dictionary, setDictionary] = React.useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const appKit = useAppKit();
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsClient(true);
    // Check for dark mode preference in cookie on component mount
    const darkModePref = Cookies.get("darkMode");
    setDarkMode(darkModePref === "true");
    if (darkModePref === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (!isConnected) {
      setIsLoading(true);
      try {
        await appKit.open(); // Use open() instead of connect()
      } catch (error) {
        console.error("Connection error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [appKit, isConnected]);

  const handleSignOut = useCallback(async () => {
    try {
      await disconnect();
      // You might want to reset some app state here
      // For example: resetAppState();
    } catch (error) {
      console.error("Error during sign out:", error);
      // Optionally, show an error message to the user
    }
  }, [disconnect]);

  const toggleDarkMode = useCallback(() => {
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
  }, []);

  const handleLanguageChange = (newLang: string) => {
    Cookies.set("NEXT_LOCALE", newLang, { expires: 365 });
    router.refresh(); // This will trigger a re-render of the page with the new language
  };

  const getLogoText = useCallback((lang: string) => {
    return lang === "ja" ? "かいろ" : "Kairo";
  }, []);

  if (!isMounted || !dictionary) {
    return null; // or a loading placeholder
  }

  // Move userNavigation inside the component
  const userNavigation = [
    {
      name: dictionary.navbar.yourProfile,
      href: address ? `/${address}` : "#",
      onClick: address ? undefined : handleConnect,
    },
    { name: dictionary.navbar.settings, href: "#" },
    { name: dictionary.navbar.signOut, href: "#", onClick: handleSignOut },
  ];

  const navigation = [
    { name: dictionary.navbar.dashboard, href: "/dashboard" },
    { name: dictionary.navbar.streams, href: "/streams" },
    { name: "Invoices", href: "/invoices" },
  ];

  const navigationWithCurrent = navigation.map((item) => ({
    ...item,
    current: pathname === `${item.href}`,
    href: `${item.href}`,
  }));

  const sanitizedDisplayAddress = DOMPurify.sanitize(
    ensName ||
      (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected")
  );

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
    { code: "de", name: "Deutsch" },
  ];

  return (
    <Disclosure
      as="nav"
      className="bg-zinc-200 dark:bg-zinc-800 bg-opacity-30 dark:bg-opacity-30 border-b-1 shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link
              href={`/`}
              className="flex flex-shrink-0 items-center place-items-center gap-2"
            >
              <div className="h-4 w-4 bg-red-500" />
              <div className="font-bold text-xl text-zinc-900 dark:text-white">
                {getLogoText(currentLang)}
              </div>
            </Link>
            <div className="hidden md:-my-px md:ml-6 md:flex md:space-x-8">
              {navigationWithCurrent.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={classNames(
                    item.current
                      ? "border-red-500 dark:text-white text-zinc-900"
                      : "border-transparent text-zinc-500 dark:text-zinc-200 hover:border-zinc-300 hover:text-zinc-700",
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center gap-4">
            {/* Language switcher */}
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="rounded-full p-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-0">
                  <LanguageIcon className="h-6 w-6" aria-hidden="true" />
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-zinc-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                {languages.map((language) => (
                  <MenuItem key={language.code}>
                    {({ active }) => (
                      <button
                        onClick={() => handleLanguageChange(language.code)}
                        className={classNames(
                          active ? "bg-zinc-100 dark:bg-zinc-600" : "",
                          currentLang === language.code ? "font-bold" : "",
                          "block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 w-full text-left"
                        )}
                      >
                        {language.name}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>

            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="rounded-full p-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
            {/* Profile dropdown */}
            <div key="wallet">
              {isClient &&
                (isConnected ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <MenuButton className="relative flex text-sm focus:outline-none shadow-md rounded-md focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <span
                          className="ml-auto flex items-center gap-x-1 rounded-md outline-1 outline-zinc-300 outline px-3 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-100"
                          dangerouslySetInnerHTML={{
                            __html: sanitizedDisplayAddress,
                          }}
                        />
                      </MenuButton>
                    </div>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              onClick={item.onClick}
                              className={classNames(
                                active ? "bg-zinc-100" : "",
                                "block px-4 py-2 text-sm text-zinc-700"
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </MenuItems>
                  </Menu>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="ml-auto flex items-center gap-x-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                ))}
            </div>
            {isClient && isConnected && <AnimatedButton />}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-white dark:bg-zinc-900 p-2 text-zinc-400 dark:text-zinc-100 hover:bg-zinc-100 hover:text-zinc-500 focus:outline-none focus:ring-2 ring-red-500 focus:ring-offset-2">
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

      <DisclosurePanel className="md:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigationWithCurrent.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current
                  ? "border-red-500 bg-red-50 text-red-700 dark:text-red-300 dark:bg-zinc-800"
                  : "border-transparent text-zinc-600 dark:text-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-800",
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
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-red-200" />
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-zinc-800 dark:text-zinc-100">
                {sanitizedDisplayAddress}
              </div>
            </div>
            <button
              type="button"
              className="relative ml-auto flex-shrink-0 rounded-full p-1 bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-3 space-y-1">
            {userNavigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                className="block px-4 py-2 text-base font-medium dark:text-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
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

Navbar.displayName = "Navbar";

export default Navbar;
