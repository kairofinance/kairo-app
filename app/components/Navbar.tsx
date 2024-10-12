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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusSmallIcon } from "@heroicons/react/24/solid";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useConnect } from "wagmi";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Stream", href: "#" },
  { name: "Projects", href: "#" },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

// @ts-ignore
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function ProfilePicture() {
  return (
    <>
      <span className="relative inline-block">
        <Image
          alt=""
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          className="rounded-full"
          width={"40"}
          height={"40"}
        />
        <span className="absolute right-0 top-0 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white" />
      </span>
    </>
  );
}

const Navbar = React.memo(() => {
  const pathname = usePathname();
  const appKit = useAppKit();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  const navigationWithCurrent = navigation.map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

  return (
    <Disclosure
      as="nav"
      className="bg-gray-200 bg-opacity-30 backdrop-blur-md shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link
              href="/"
              className="flex flex-shrink-0 items-center place-items-center gap-2"
            >
              <div className="h-4 w-4 bg-red-500" />
              <div className="font-bold text-xl text-gray-900">Kairo</div>
            </Link>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {navigationWithCurrent.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={classNames(
                    item.current
                      ? "border-red-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                  )}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex text-sm focus:outline-none shadow-xl rounded-full focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <ProfilePicture />
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                {userNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    <a
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                    >
                      {item.name}
                    </a>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
            <div key="wallet">
              {isClient &&
                (isConnected ? (
                  <span className="ml-auto flex items-center gap-x-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Connected"}
                  </span>
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
            {isClient && isConnected && (
              <a
                href="#"
                className="ml-auto flex items-center gap-x-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <PlusSmallIcon aria-hidden="true" className="-ml-1.5 h-5 w-5" />
                New invoice
              </a>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
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

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigationWithCurrent.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-gray-200 pb-3 pt-4">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-red-200" />
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">
                {"0x2f...5e3"}
              </div>
            </div>
            <button
              type="button"
              className="relative ml-auto flex-shrink-0 rounded-full p-1 bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
