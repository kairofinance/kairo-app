"use client";
import React, { memo, useMemo, Fragment, useState } from "react";
import { Disclosure, Menu, Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { useChainId, useConfig } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { sepolia } from "viem/chains";

// Define menu items for each section
const invoiceItems = [
  {
    name: "Create Invoice",
    href: "/",
    description: "Generate a new invoice instantly",
  },
  {
    name: "View Invoices",
    href: "/invoices",
    description: "See all your pending invoices",
  },
];

const dashboardItems = [
  {
    name: "Overview",
    href: "/dashboard",
    description: "Get a bird's eye view of your activity",
  },
];

const contactItems = [
  {
    name: "Address Book",
    href: "/contacts",
    description: "View and manage your saved addresses",
  },
];

// Add this CSS at the top of your Navbar component
const glowAnimation = `
  .kairo-title {
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kairo-title:hover {
    color: rgb(234, 88, 12);
    letter-spacing: 0.5px;
  }

  .kairo-title::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: -2px;
    left: 0;
    background: rgb(234, 88, 12);
    transform-origin: bottom right;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kairo-title:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`;

const Navbar = () => {
  const pathname = usePathname();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const config = useConfig();
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

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

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      await switchNetwork(config, { chainId: sepolia.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  return (
    <Disclosure as="nav" className="shadow-sm">
      {({ open: isOpen }) => (
        <>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              {/* Left Navigation - Always on left */}
              <div className="hidden md:flex md:w-1/3 md:justify-start">
                <div className="flex space-x-2">
                  {/* Invoice Popover */}
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`inline-flex items-center uppercase text-sm px-3 py-[5px] rounded-full font-semibold ${
                            pathname === "/"
                              ? "text-black bg-white"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          Invoices
                          <ChevronDownIcon
                            className={`ml-2 h-4 w-4 transition ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </Popover.Button>

                        <Transition
                          enter="transition duration-200 ease-out"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition duration-150 ease-in"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute left-0 z-10 mt-2 w-screen max-w-xs transform">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="relative bg-black/80 backdrop-blur-sm p-3">
                                {invoiceItems.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-start rounded-lg p-3 hover:bg-white/10 transition"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {item.name}
                                      </p>
                                      <p className="mt-1 text-xs text-white/60">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>

                  {/* Dashboard Popover */}
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`inline-flex items-center uppercase text-sm px-3 py-[5px] rounded-full font-semibold ${
                            pathname.includes("/dashboard")
                              ? "text-black bg-white"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          Dashboard
                          <ChevronDownIcon
                            className={`ml-2 h-4 w-4 transition ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </Popover.Button>

                        <Transition
                          enter="transition duration-200 ease-out"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition duration-150 ease-in"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute left-0 z-10 mt-2 w-screen max-w-xs transform">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="relative bg-black/80 backdrop-blur-sm p-3">
                                {dashboardItems.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-start rounded-lg p-3 hover:bg-white/10 transition"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {item.name}
                                      </p>
                                      <p className="mt-1 text-xs text-white/60">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>

                  {/* Contacts Popover */}
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`inline-flex items-center uppercase text-sm px-3 py-[5px] rounded-full font-semibold ${
                            pathname.includes("/contacts")
                              ? "text-black bg-white"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          Contacts
                          <ChevronDownIcon
                            className={`ml-2 h-4 w-4 transition ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </Popover.Button>

                        <Transition
                          enter="transition duration-200 ease-out"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition duration-150 ease-in"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute left-0 z-10 mt-2 w-screen max-w-xs transform">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="relative bg-black/80 backdrop-blur-sm p-3">
                                {contactItems.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-start rounded-lg p-3 hover:bg-white/10 transition"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {item.name}
                                      </p>
                                      <p className="mt-1 text-xs text-white/60">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                </div>
              </div>

              {/* Center Logo - will hug left only on mobile when menu is open */}
              <div
                className={`flex ${
                  isOpen ? "flex-1" : "flex-1 md:flex-none md:w-1/3"
                } ${isOpen ? "" : "md:justify-center"}`}
              >
                <style jsx>{glowAnimation}</style>
                <h1 className="font-garet-heavy cursor-pointer uppercase text-white font-extrabold text-2xl kairo-title">
                  Kairo
                </h1>
              </div>

              {/* Right Section */}
              <div className="flex md:w-1/3 justify-end">
                <div className="hidden md:flex md:items-center space-x-2">
                  {/* Network Selector */}
                  <Menu as="div" className="relative">
                    <Menu.Button
                      className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
                      disabled={isSwitchingNetwork}
                    >
                      <div className="flex items-center">
                        {chainId === sepolia.id ? (
                          <>
                            <span className="relative flex h-2 w-2 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span>Sepolia</span>
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2 mr-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span>Wrong Network</span>
                          </>
                        )}
                        <ChevronDownIcon className="ml-2 h-4 w-4 text-white/60" />
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 shadow-2xl">
                        <div className="px-1 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "bg-white/10" : ""
                                } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-white transition-all duration-200`}
                                onClick={handleSwitchNetwork}
                                disabled={
                                  chainId === sepolia.id || isSwitchingNetwork
                                }
                              >
                                <div className="flex items-center">
                                  <span className="relative flex h-2 w-2 mr-2">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  <span>Sepolia Testnet</span>
                                  {chainId === sepolia.id && (
                                    <span className="ml-auto text-orange-600">
                                      •
                                    </span>
                                  )}
                                </div>
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* Existing Connect/Account button */}
                  {isConnected ? (
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-[5px] hover:bg-white/20">
                        <span className="text-sm font-semibold text-white">
                          {address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : "Connected"}
                        </span>
                      </Menu.Button>
                      <Transition
                        enter="transition duration-200 ease-out"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition duration-150 ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 rounded-lg bg-black/80 backdrop-blur-sm py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  href={item.href}
                                  onClick={item.onClick}
                                  className={`block px-4 py-2 text-sm text-white ${
                                    active ? "bg-white/10" : ""
                                  }`}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <button
                      onClick={() => open({ view: "Connect" })}
                      className="relative flex items-center font-semibold gap-x-4 px-3 py-1 text-sm leading-6 hover:bg-white/10 text-white rounded-full"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center md:hidden ml-auto">
                  <Disclosure.Button className="p-2 rounded-md text-white hover:bg-white/10">
                    {isOpen ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {[...invoiceItems, ...dashboardItems, ...contactItems].map(
                (item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === item.href
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              )}
              {!isConnected && (
                <button
                  onClick={() => open({ view: "Connect" })}
                  className="relative flex w-full mt-2 place-items-center place-content-center items-center font-semibold gap-x-4 px-3 py-1 text-sm leading-6 hover:bg-white/10 text-white rounded-full"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            {isConnected && (
              <div className="border-t border-white/10 pb-3 pt-4">
                <div className="px-4 text-sm font-medium text-white">
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
                      className="block px-4 py-2 text-base text-white hover:bg-white/10"
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
