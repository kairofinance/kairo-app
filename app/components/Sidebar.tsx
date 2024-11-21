"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  PlusIcon,
  ChartPieIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

type IconComponent = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

interface NavigationItem {
  name: string;
  href: string;
  icon: IconComponent;
  current: boolean;
}

interface NavigationGroup {
  name: string;
  items: {
    name: string;
    href: string;
    icon: IconComponent;
  }[];
}

type NavigationElement = NavigationItem | NavigationGroup;

// Add teams data
const teams = [
  { id: 1, name: "Kairo", href: "/teams/kairo", initial: "K", current: false },
  { id: 2, name: "Reown", href: "/teams/reown", initial: "R", current: false },
  {
    id: 3,
    name: "Protocol",
    href: "/teams/protocol",
    initial: "P",
    current: false,
  },
];

const navigation: NavigationElement[] = [
  { name: "Home", href: "/", icon: HomeIcon, current: false },
  { name: "Overview", href: "/overview", icon: HomeIcon, current: false },
  { name: "Create", href: "/create", icon: PlusIcon, current: false },
  {
    name: "View",
    items: [
      {
        name: "Vesting Schedules",
        href: "/vesting",
        icon: DocumentDuplicateIcon,
      },
      { name: "Token Streams", href: "/streams", icon: DocumentDuplicateIcon },
      { name: "Invoices", href: "/invoices", icon: DocumentDuplicateIcon },
    ],
  },
  { name: "Teams", href: "/teams", icon: PlusIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Sidebar = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname);
  const { isConnected } = useAppKitAccount();

  const isNavigationGroup = (
    item: NavigationElement
  ): item is NavigationGroup => {
    return "items" in item;
  };

  const handleNavigation = (href: string) => {
    setActiveItem(href);
  };

  return (
    <>
      {isConnected && <div className="mr-[20rem]" />}
      <div
        className={`flex flex-col gap-y-5 overflow-y-auto bg-zinc-950 px-6 h-screen fixed
        transition-all duration-300 ease-in-out
        ${
          isConnected
            ? "w-[20rem] opacity-100 translate-x-0"
            : "w-0 opacity-0 -translate-x-full"
        }
      `}
      >
        {isConnected && (
          <nav className="flex flex-1 flex-col pt-12">
            <div className="relative outline-2 outline outline-white/[0.2] p-7">
              <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
                nav
              </h2>
              <ul role="list" className="flex flex-1 flex-col gap-y-1">
                {navigation.map((item) => {
                  if (isNavigationGroup(item)) {
                    return (
                      <React.Fragment key={item.name}>
                        {item.items.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={() => handleNavigation(subItem.href)}
                              className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                              ${
                                activeItem === subItem.href
                                  ? "bg-white/[0.08]"
                                  : "bg-white/[0.02]"
                              }
                              hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
                            >
                              <span className="text-white/40 font-jetbrains text-sm">
                                &gt;
                              </span>
                              <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                                {subItem.name.toLowerCase().replace(/ /g, "_")}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </React.Fragment>
                    );
                  }

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                        ${
                          activeItem === item.href
                            ? "bg-white/[0.08]"
                            : "bg-white/[0.02]"
                        }
                        hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
                      >
                        <span className="text-white/40 font-jetbrains text-sm">
                          &gt;
                        </span>
                        <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                          {item.name.toLowerCase()}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Teams Section */}
            <div className="relative outline-2 outline outline-white/[0.2] p-7 mt-6">
              <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
                teams
              </h2>
              <ul className="flex flex-1 flex-col gap-y-1">
                {teams.map((team) => (
                  <li key={team.name}>
                    <Link
                      href={team.href}
                      onClick={() => handleNavigation(team.href)}
                      className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                      ${
                        activeItem === team.href
                          ? "bg-white/[0.08]"
                          : "bg-white/[0.02]"
                      }
                      hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
                    >
                      <span className="text-white/40 font-jetbrains text-sm">
                        &gt;
                      </span>
                      <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                        {team.name.toLowerCase()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </>
  );
};

export default memo(Sidebar);
