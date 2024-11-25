"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  ChartPieIcon,
  UsersIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface NavItemProps {
  item: {
    name?: string;
    href: string;
    icon?: IconComponent;
  };
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

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
}

interface NavigationGroup {
  name: string;
  icon: IconComponent;
  items: NavigationItem[];
}

type NavigationElement = NavigationItem | NavigationGroup;

const teams = [
  { id: 1, name: "Plasma", href: "/teams/plasma" },
  { id: 2, name: "Reown", href: "/teams/reown" },
  { id: 3, name: "Protocol", href: "/teams/protocol" },
];

const navigation: NavigationElement[] = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Overview", href: "/overview", icon: ChartPieIcon },
  { name: "Create", href: "/create", icon: PlusIcon },
  {
    name: "View",
    icon: DocumentDuplicateIcon,
    items: [
      { name: "Vesting", href: "/vesting", icon: DocumentDuplicateIcon },
      { name: "Streams", href: "/streams", icon: DocumentDuplicateIcon },
      { name: "Invoices", href: "/invoices", icon: DocumentDuplicateIcon },
    ],
  },
  { name: "Teams", href: "/teams", icon: UsersIcon },
];

const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  children,
}) => (
  <motion.div
    whileHover={{ x: 4 }}
    className={`relative group ${isActive ? "text-white" : "text-zinc-500"}`}
  >
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center gap-3 py-2 px-3 transition-colors hover:text-white"
    >
      {item.icon && (
        <item.icon
          className={`h-4 w-4 transition-colors ${
            isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
          }`}
        />
      )}
      <span className="text-sm font-medium tracking-wide">
        {children || item.name}
      </span>
    </Link>
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute right-0 w-[2px] h-4 bg-white top-1/2 -translate-y-1/2"
      />
    )}
  </motion.div>
);

const Sidebar = () => {
  const pathname = usePathname();
  const { isConnected, address } = useAppKitAccount();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const { data: pendingInvites } = useQuery({
    queryKey: ["pendingInvites", address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(
        `/api/teams/invites?address=${address}&status=PENDING`
      );
      if (!response.ok) throw new Error("Failed to fetch invites");
      return response.json();
    },
    enabled: !!address,
  });

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  if (!isConnected) return null;

  return (
    <div className="fixed w-64 h-screen pt-20 px-4">
      <div className="space-y-8">
        <nav className="space-y-1">
          {navigation.map((item) => {
            if ("items" in item) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 group-hover:text-white" />
                      <span className="tracking-wide">{item.name}</span>
                    </div>
                    <ChevronRightIcon
                      className={`h-3 w-3 transition-transform duration-200 ${
                        expandedItems.includes(item.name) ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedItems.includes(item.name) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 space-y-1 overflow-hidden"
                      >
                        {item.items.map((subItem) => (
                          <NavItem
                            key={subItem.name}
                            item={subItem}
                            isActive={pathname === subItem.href}
                            onClick={() => {}}
                          >
                            {subItem.name}
                          </NavItem>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <NavItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
                onClick={() => {}}
              />
            );
          })}
        </nav>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Teams
            </h3>
            {pendingInvites?.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-500/10 text-orange-500 rounded-full">
                {pendingInvites.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {teams.map((team) => (
              <NavItem
                key={team.name}
                item={team}
                isActive={pathname === team.href}
                onClick={() => {}}
              >
                {team.name}
              </NavItem>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);
