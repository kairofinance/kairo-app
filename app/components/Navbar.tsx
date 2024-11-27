"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import SpinningLogo from "./SpinningLogo";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartPieIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTeams } from "@/hooks/useTeams";
import { Team } from "@/types/team";
import { useTeamContext } from "@/contexts/TeamContext";

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
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            {isLoading ? (
              <SpinningLogo />
            ) : (
              <h1 className="cursor-pointer font-jetbrains text-white font-bold text-xl select-none transition-colors duration-200">
                KAIRO
              </h1>
            )}
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
                        ? "bg-zinc-800"
                        : "bg-zinc-900 hover:bg-zinc-800"
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
                onMouseEnter={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold
                         rounded-full transition-all duration-200
                         text-zinc-200
                         bg-zinc-900 hover:bg-zinc-800"
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
                  <span className="text-sm font-medium font-jetbrains">
                    {selectedTeam
                      ? selectedTeam.name
                      : address
                      ? `${address.slice(0, 6)}-${address.slice(-4)}`
                      : "Account"}
                  </span>
                </div>
              </button>

              {/* Enhanced Modal with Team Selection */}
              {showModal && (
                <div
                  ref={modalRef}
                  onMouseLeave={() => setShowModal(false)}
                  className="absolute right-0 mt-2 p-7 z-50 rounded-lg border border-white/[0.2] backdrop-blur-2xl bg-black/80 outline outline-1 outline-white/[0.2] w-80"
                >
                  <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 backdrop-blur-3xl font-garet bg-black/20 font-extrabold text-white">
                    Account View
                  </h2>

                  {/* Context Selection */}
                  <div className="space-y-2 mb-6">
                    {/* Personal Account */}
                    <button
                      onClick={() => handleTeamSelect(null)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg
                        transition-all duration-200 group
                        ${
                          !selectedTeamId
                            ? "bg-white/[0.04] border border-white/20"
                            : "hover:bg-white/[0.02]"
                        }`}
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/[0.02] border border-white/10">
                        <Image
                          src={avatarUrl}
                          alt="Personal"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-white/80 group-hover:text-white">
                          Personal Account
                        </span>
                        <span className="text-xs text-white/40">
                          {address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : ""}
                        </span>
                      </div>
                    </button>

                    {/* Teams */}
                    {isTeamsLoading ? (
                      // Loading state for teams
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div
                            key={`skeleton-${i}`}
                            className="w-full flex items-center gap-3 p-3 rounded-lg
                                     bg-white/[0.02] animate-pulse"
                          >
                            <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/10" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-24 bg-white/[0.04] rounded" />
                              <div className="h-3 w-16 bg-white/[0.04] rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Teams list
                      teams?.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => handleTeamSelect(team.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg
                            transition-all duration-200 group
                            ${
                              selectedTeamId === team.id
                                ? "bg-white/[0.04] border border-white/20"
                                : "hover:bg-white/[0.02]"
                            }`}
                        >
                          <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/10">
                            {team.profilePicture ? (
                              <Image
                                src={team.profilePicture}
                                alt={team.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
                                <span className="text-sm font-medium text-white/40">
                                  {team.name.slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-white/80 group-hover:text-white">
                              {team.name}
                            </span>
                            <span className="text-xs text-white/40">
                              {team.role.toLowerCase()}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Account Actions */}
                  <div className="space-y-2">
                    <Link
                      href="/teams"
                      onClick={() => setShowModal(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium
                        rounded-lg transition-all duration-200 w-full
                        text-white/60 hover:text-white
                        bg-white/[0.02] hover:bg-white/[0.04]"
                    >
                      <UserGroupIcon className="h-4 w-4" />
                      <span>Teams</span>
                    </Link>
                    <button
                      onClick={() => {
                        open({ view: "Connect" });
                        setShowModal(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium
                        rounded-lg transition-all duration-200 w-full
                        text-white/60 hover:text-white
                        bg-white/[0.02] hover:bg-white/[0.04]"
                    >
                      <UserCircleIcon className="h-4 w-4" />
                      <span>Change Wallet</span>
                    </button>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowModal(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium
                        rounded-lg transition-all duration-200 w-full
                        text-white/60 hover:text-white
                        bg-white/[0.02] hover:bg-white/[0.04]"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>

                  {/* Status Line */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/[0.08]">
                    <span className="text-white/40 font-jetbrains text-sm">
                      $
                    </span>
                    <span className="text-sm font-jetbrains text-white/60">
                      status:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-jetbrains text-white/40">
                        connected
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
