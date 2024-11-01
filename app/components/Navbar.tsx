"use client";
import React, { memo, useMemo } from "react";
import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";

interface DisclosureRenderProps {
  open: boolean;
}

interface MenuItemProps {
  active: boolean;
}

const navigation = [
  { name: "Create", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Contacts", href: "/contacts" },
];

const Navbar = () => {
  const pathname = usePathname();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const userNavigation = useMemo(
    () => [
      {
        name: "Sign Out",
        href: "#",
        onClick: disconnect,
      },
    ],
    [disconnect]
  );

  return (
    <Disclosure
      as="nav"
      className="bg-kairo-black-a20 bg-opacity-10 border-b border-kairo-black-a40/20 shadow-sm"
    >
      {({ open: isOpen }: DisclosureRenderProps) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and Testnet Indicator */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/kairo-dark.svg"
                      alt="Kairo"
                      width={120}
                      height={30}
                      priority
                      style={{
                        width: "120px",
                        height: "auto",
                      }}
                    />
                  </Link>
                </div>
                <div className="hidden sm:flex items-center px-2.5 py-1 text-sm leading-6 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full">
                  <span className="font-semibold">Testnet</span>
                </div>
              </div>

              {/* Centered Navigation */}
              <div className="hidden md:flex flex-1 justify-center">
                <div className="flex space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center border-b-2 p-3 px-1 pt-8 text-base font-medium ${
                        pathname === item.href
                          ? "border-kairo-green text-kairo-white"
                          : "border-transparent text-kairo-white/60 hover:text-kairo-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex md:items-center">
                {isConnected ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center gap-2 rounded-full bg-kairo-black-a20 px-3 py-2 hover:bg-kairo-black-a40">
                      <Image
                        width={24}
                        height={24}
                        className="rounded-full"
                        src="/default-profile.png"
                        alt="profile"
                      />
                      <span className="text-sm font-semibold text-kairo-white">
                        {address
                          ? `${address.slice(0, 6)}...${address.slice(-4)}`
                          : "Connected"}
                      </span>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 rounded-lg bg-kairo-black-a20 py-1 shadow-lg">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }: MenuItemProps) => (
                            <Link
                              href={item.href}
                              onClick={item.onClick}
                              className={`block px-4 py-2 text-sm rounded-md text-kairo-white ${
                                active ? "bg-kairo-black-a40" : ""
                              }`}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Menu>
                ) : (
                  <button
                    onClick={() => open({ view: "Connect" })}
                    className="relative flex items-center font-semibold gap-x-4 px-3 py-1 text-sm leading-6 hover:bg-kairo-green-a20/50 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <Disclosure.Button className="p-2 rounded-md text-kairo-white hover:bg-kairo-black-a40">
                  {isOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "bg-kairo-black-a20 text-kairo-green"
                      : "text-kairo-white hover:bg-kairo-black-a40"
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {!isConnected && (
                <button
                  onClick={() => open({ view: "Connect" })}
                  className="w-full mt-2 rounded-full bg-kairo-green-a20 px-3 py-2 text-sm font-semibold text-kairo-green hover:bg-kairo-green/50"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            {isConnected && (
              <div className="border-t border-kairo-black-a40 pb-3 pt-4">
                <div className="px-4 text-sm font-medium text-kairo-white">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "Connected"}
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      onClick={item.onClick}
                      className="block px-4 py-2 text-base text-kairo-white hover:bg-kairo-black-a40"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default memo(Navbar);
