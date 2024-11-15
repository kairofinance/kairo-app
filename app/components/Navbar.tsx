"use client";
import React, { memo, useMemo, Fragment, useState } from "react";
import { Disclosure, Menu, Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  GlobeAltIcon,
  WalletIcon,
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
const viewItems = [
  {
    name: "Vesting Schedules",
    href: "/vesting",
    description: "View and manage your token vesting schedules",
  },
  {
    name: "Token Streams",
    href: "/streams",
    description: "View and manage your active streams",
  },
  {
    name: "Invoices",
    href: "/invoices",
    description: "View your pending invoices",
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

// Add this new interface and array for networks
interface Network {
  name: string;
  chainId: number;
  isActive: boolean;
  icon?: string; // Optional icon path
}

const networks: Network[] = [
  {
    name: "SEPOLIA",
    chainId: sepolia.id,
    isActive: true,
  },
  {
    name: "ETHEREUM",
    chainId: 1,
    isActive: false,
  },
  {
    name: "POLYGON",
    chainId: 137,
    isActive: false,
  },
  {
    name: "OPTIMISM",
    chainId: 10,
    isActive: false,
  },
  {
    name: "ARBITRUM",
    chainId: 42161,
    isActive: false,
  },
  {
    name: "BASE",
    chainId: 8453,
    isActive: false,
  },
];

// Add this keyframe animation to the top of the file
const logoAnimation = `
  .logo-animate {
    transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                text-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .logo-animate:hover {
    color: rgb(234, 88, 12);
    text-shadow: 0 0 20px rgba(234, 88, 12, 0.3);
  }
`;

// Add this dropdown animation CSS
const dropdownAnimation = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-menu {
    animation: slideDown 0.2s ease-out;
  }
`;

// Update the navigation styles
const navLinkStyles = {
  base: `relative text-[15px] font-medium text-zinc-400 hover:text-white transition-all duration-200 after:content-[''] after:absolute after:bottom-[2px] after:left-0 after:w-full after:h-[1px] after:bg-white/20 after:origin-right after:scale-x-0 after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100`,
  active: `text-white after:scale-x-100 after:bg-zinc-400`,
};

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
    <Disclosure as="nav">
      {({ open: isDisclosureOpen }) => (
        <nav className="h-[70px] max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <style jsx global>
            {logoAnimation}
          </style>
          <div className="flex h-full items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <h1 className="cursor-pointer text-white font-bold text-lg logo-animate select-none transition-colors duration-200">
                kairo*
              </h1>
            </Link>

            {/* Navigation - Center Aligned */}
            <div className="hidden md:flex md:items-center md:justify-center flex-1">
              <div className="flex items-center h-[36px] space-x-8">
                {/* View Link with Dropdown */}
                <Popover className="relative group h-full flex items-center ">
                  <Popover.Button
                    className={`${navLinkStyles.base} ${
                      ["/vesting", "/streams", "/invoices"].some(
                        (path) =>
                          pathname.startsWith(path) &&
                          !pathname.includes("/create")
                      ) && navLinkStyles.active
                    }`}
                  >
                    View
                  </Popover.Button>

                  <div className="absolute left-0 top-full z-50 pt-3 w-screen max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="dropdown-menu bg-black/95 backdrop-blur-sm rounded-lg border border-white/[0.08] shadow-xl shadow-black/20">
                      {viewItems.map((item, index) => (
                        <React.Fragment key={item.name}>
                          <Link
                            href={item.href}
                            className="block px-5 py-3 hover:bg-white/[0.02] transition-colors duration-200"
                          >
                            <div className="text-[15px] text-white/80 hover:text-white transition-colors duration-200">
                              {item.name}
                            </div>
                            <div className="text-[13px] text-white/40 mt-1">
                              {item.description}
                            </div>
                          </Link>
                          {index < viewItems.length - 1 && (
                            <div className="mx-4 border-t border-white/[0.08]" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </Popover>

                {/* Create Link */}
                <Link
                  href="/create"
                  className={`${navLinkStyles.base} ${
                    pathname === "/create" && navLinkStyles.active
                  }`}
                >
                  Create
                </Link>

                {/* Overview Link */}
                <Link
                  href="/dashboard"
                  className={`${navLinkStyles.base} ${
                    pathname === "/dashboard" && navLinkStyles.active
                  }`}
                >
                  Overview
                </Link>

                {/* Contacts Link */}
                <Link
                  href="/contacts"
                  className={`${navLinkStyles.base} ${
                    pathname === "/contacts" && navLinkStyles.active
                  }`}
                >
                  Contacts
                </Link>
              </div>
            </div>

            {/* Account Section - Right Aligned */}
            <div className="flex items-center space-x-6">
              {isConnected ? (
                <Menu as="div" className="relative group">
                  <Menu.Button className="group text-zinc-300 bg-[#191919] px-4 py-1 rounded-full text-sm font-medium  inline-flex items-center gap-2 transition-colors duration-200">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Account"}
                  </Menu.Button>

                  <div className="absolute right-0 top-full z-50 pt-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="dropdown-menu bg-black/95 backdrop-blur-sm rounded-lg border border-white/[0.08] shadow-xl shadow-black/20">
                      {userNavigation.map((item, index) => (
                        <button
                          key={item.name}
                          onClick={item.onClick}
                          className="w-full text-left px-5 py-3 text-[15px] text-white/80 hover:text-white hover:bg-white/[0.02] transition-colors duration-200"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </Menu>
              ) : (
                <button
                  onClick={() => open({ view: "Connect" })}
                  className="text-sm text-white/80 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] px-4 py-1.5 rounded-full transition-all duration-200"
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Disclosure.Button className="text-white/80 hover:text-white transition-colors duration-200">
                {isDisclosureOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </Disclosure.Button>
            </div>
          </div>

          {/* Mobile menu panel */}
          <Disclosure.Panel className="md:hidden">
            {/* ... existing mobile menu content ... */}
          </Disclosure.Panel>

          <style jsx global>
            {dropdownAnimation}
          </style>
        </nav>
      )}
    </Disclosure>
  );
};

export default memo(Navbar);
