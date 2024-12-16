"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  ChevronDownIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useTeams } from "@/components/shared/hooks/useTeams";
import { useTeamContext } from "@/components/context/TeamContext";
import { AnimatePresence, motion } from "framer-motion";
import Card from "@/components/shared/ui/Card";

// Define the navigation type
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
}

// Update navigation items to be dynamic based on context
const getNavigationItems = (
  selectedTeamId: string | null
): NavigationItem[] => {
  return [
    { name: "Overview", href: "/overview", icon: ChartPieIcon },
    { name: "Create", href: "/create", icon: PlusIcon },
    { name: "View", href: "/view", icon: DocumentDuplicateIcon },
  ];
};

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { teams } = useTeams(address);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const teamSelectorRef = useRef<HTMLDivElement>(null);
  const {
    selectedTeamId,
    selectedTeam,
    setSelectedTeamId,
    teams: contextTeams,
    isLoading: isTeamsLoading,
  } = useTeamContext();
  const router = useRouter();

  // Get dynamic navigation items based on context
  const navigationItems = getNavigationItems(selectedTeamId);

  const avatarUrl = address
    ? `https://cdn.stamp.fyi/avatar/${address}?s=50`
    : "";

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close team selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        teamSelectorRef.current &&
        !teamSelectorRef.current.contains(event.target as Node)
      ) {
        setShowTeamSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to handle team selection
  const handleTeamSelect = (teamId: string | null) => {
    setSelectedTeamId(teamId);
    setShowModal(false);

    // If we're on /teams and switching to team context, redirect to /overview
    if (pathname === "/teams" && teamId) {
      router.push("/overview");
    }
  };

  return (
    <nav className="h-16 flex items-center justify-between z-50">
      <div className="mx-auto max-w-6xl w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <CubeIcon className="text-white w-6" />
          </Link>

          {/* Desktop Navigation - Now using dynamic items */}
          {isConnected && (
            <div className="hidden lg:flex items-center gap-2 p-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-[0.4rem] text-sm font-semibold
                    rounded-full transition-all duration-200 place-items-end
                    text-zinc-200
                    ${
                      pathname === item.href
                        ? "bg-zinc-900"
                        : "hover:bg-zinc-900"
                    }
                  `}
                >
                  <item.icon className="h-4 w-4 -mr-2 my-auto" />
                  <span className="-mb-1">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Account Button Section */}
        <div className="relative">
          {isConnected ? (
            <div>
              <button
                onClick={() => setShowModal(!showModal)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold
                         rounded-full transition-all duration-200
                         text-zinc-200
                          hover:bg-zinc-900"
              >
                <div className="flex items-center gap-2">
                  {selectedTeam ? (
                    <div className="flex items-center justify-center w-5 h-5">
                      {selectedTeam.profilePicture ? (
                        <Image
                          src={selectedTeam.profilePicture}
                          alt={selectedTeam.name}
                          width={20}
                          height={20}
                          className="rounded-full object-cover w-5 h-5"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/[0.02] flex items-center justify-center">
                          <span className="text-xs text-white/60">
                            {selectedTeam.name.slice(0, 2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-5 h-5">
                      <Image
                        src={avatarUrl}
                        alt="Wallet Avatar"
                        width={20}
                        height={20}
                        className="rounded-full object-cover w-5 h-5"
                      />
                    </div>
                  )}
                  <span className="text-sm font-jetbrains">
                    {selectedTeam
                      ? selectedTeam.name
                      : address
                      ? `${address.slice(0, 6)}-${address.slice(-4)}`
                      : "Account"}
                  </span>
                </div>
              </button>

              {/* Enhanced Modal with Team Selection */}
              <AnimatePresence>
                {showModal && (
                  <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-[400px]"
                  >
                    <Card title="Account">
                      <div className="space-y-8">
                        {/* Context Selection */}
                        <div className="px-5">
                          <div className="mb-4">
                            <span className="text-sm font-medium text-white/40">
                              Switch Context
                            </span>
                          </div>

                          <div className="space-y-2">
                            {/* Personal Account */}
                            <button
                              onClick={() => handleTeamSelect(null)}
                              className="flex items-center justify-between w-full p-4 rounded-xl 
                                       border border-white/[0.08] hover:border-white/[0.12] 
                                       bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                                  <Image
                                    src={avatarUrl}
                                    alt="Personal"
                                    width={24}
                                    height={24}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="text-sm text-white/90">
                                    Personal Account
                                  </span>
                                  <span className="text-xs text-white/40">
                                    {address
                                      ? `${address.slice(
                                          0,
                                          6
                                        )}...${address.slice(-4)}`
                                      : ""}
                                  </span>
                                </div>
                              </div>
                              {!selectedTeamId && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              )}
                            </button>

                            {/* Teams */}
                            {isTeamsLoading ? (
                              <div className="space-y-2">
                                {[1, 2].map((i) => (
                                  <div
                                    key={`skeleton-${i}`}
                                    className="flex items-center justify-between p-4 rounded-xl 
                                             border border-white/[0.08] bg-zinc-800/50"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-6 h-6 rounded-full bg-white/[0.02] animate-pulse" />
                                      <div className="space-y-2">
                                        <div className="h-4 w-24 bg-white/[0.02] rounded animate-pulse" />
                                        <div className="h-3 w-16 bg-white/[0.02] rounded animate-pulse" />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              teams?.map((team) => (
                                <button
                                  key={team.id}
                                  onClick={() => handleTeamSelect(team.id)}
                                  className="flex items-center justify-between w-full p-4 rounded-xl 
                                           border border-white/[0.08] hover:border-white/[0.12] 
                                           bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                                      {team.profilePicture ? (
                                        <Image
                                          src={team.profilePicture}
                                          alt={team.name}
                                          width={24}
                                          height={24}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
                                          <span className="text-xs text-white/40">
                                            {team.name.slice(0, 2)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm text-white/90">
                                        {team.name}
                                      </span>
                                      <span className="text-xs text-white/40">
                                        {team.role.toLowerCase()}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedTeamId === team.id && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Account Actions */}
                        <div className="px-5">
                          <div className="mb-4">
                            <span className="text-sm font-medium text-white/40">
                              Actions
                            </span>
                          </div>

                          <div className="space-y-2">
                            <Link
                              href="/teams"
                              onClick={() => setShowModal(false)}
                              className="flex items-center gap-3 p-4 rounded-xl 
                                       border border-white/[0.08] hover:border-white/[0.12] 
                                       bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200"
                            >
                              <UserGroupIcon className="w-4 h-4 text-white/60" />
                              <span className="text-sm text-white/90">
                                Teams
                              </span>
                            </Link>
                            <button
                              onClick={async () => {
                                await disconnect();
                                open({ view: "Connect" });
                                setShowModal(false);
                              }}
                              className="flex items-center gap-3 w-full p-4 rounded-xl 
                                       border border-white/[0.08] hover:border-white/[0.12] 
                                       bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200"
                            >
                              <UserCircleIcon className="w-4 h-4 text-white/60" />
                              <span className="text-sm text-white/90">
                                Change Wallet
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                disconnect();
                                setShowModal(false);
                              }}
                              className="flex items-center gap-3 w-full p-4 rounded-xl 
                                       border border-white/[0.08] hover:border-white/[0.12] 
                                       bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200"
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4 text-white/60" />
                              <span className="text-sm text-white/90">
                                Disconnect Wallet
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Status Line */}
                        <div className="px-5">
                          <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
                            <span className="text-sm text-white/40">
                              Connected to Sepolia
                            </span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => open({ view: "Connect" })}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium
                       rounded-full transition-all duration-200
                       text-zinc-200
                       bg-zinc-900 hover:bg-zinc-800"
            >
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - Update to use dynamic items */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-black/95 z-40">
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <div className="relative outline-2 outline outline-white/[0.2] p-7">
              <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-black font-garet font-extrabold text-zinc-500">
                menu
              </h2>
              <MobileMenu
                onClose={() => setIsMobileMenuOpen(false)}
                navigationItems={navigationItems}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Update MobileMenu to accept navigation items
const MobileMenu = ({
  onClose,
  navigationItems,
}: {
  onClose: () => void;
  navigationItems: NavigationItem[];
}) => {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <ul role="list" className="flex flex-1 flex-col gap-2">
        {navigationItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={() => onClose()}
              className={`
                group flex items-center gap-3 px-4 py-2 rounded-full
                transition-all duration-200
                ${
                  pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-900 text-white/70 hover:bg-zinc-800 hover:text-white"
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-jetbrains">
                {item.name.toLowerCase()}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">
            connected
          </span>
        </div>
      </div>
    </div>
  );
};
