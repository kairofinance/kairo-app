"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserCircleIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useEnsName, useEnsAvatar, useBalance } from "wagmi";
import { usePublicClient } from "wagmi";
import { useTeams } from "@/components/shared/hooks/useTeams";

interface ProfileOverviewProps {
  address: string;
}

export default function ProfileOverview({ address }: ProfileOverviewProps) {
  const [firstTxTimestamp, setFirstTxTimestamp] = React.useState<string | null>(
    null
  );
  const publicClient = usePublicClient();
  const { teams, isLoading: isTeamsLoading } = useTeams(address);

  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1,
  });

  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`,
  });

  const avatarUrl =
    ensAvatar || `https://cdn.stamp.fyi/avatar/${address}?s=150`;

  React.useEffect(() => {
    const getFirstTransaction = async () => {
      try {
        const blockNumber = await publicClient?.getBlockNumber();
        const block = await publicClient?.getBlock({
          blockNumber,
        });
        if (block?.timestamp) {
          setFirstTxTimestamp(
            new Date(Number(block.timestamp) * 1000).toLocaleDateString()
          );
        }
      } catch (error) {
        console.error("Error fetching first transaction:", error);
      }
    };

    getFirstTransaction();
  }, [address, publicClient]);

  const getTeamColor = (name: string) => {
    const colors = [
      "bg-orange-600",
      "bg-emerald-600",
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
    ];
    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">
          get profile_info
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Image and Basic Info */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20">
              <Image src={avatarUrl} alt="Profile" width={80} height={80} />
              {ensName && (
                <div className="absolute -bottom-2 -right-2 bg-orange-600/20 border border-orange-600/40 p-1">
                  <UserCircleIcon className="w-4 h-4 text-orange-600" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">
                  &gt;
                </span>
                <span className="font-jetbrains text-white/80">
                  {isEnsLoading
                    ? "resolving..."
                    : ensName || `${address.slice(0, 8)}-${address.slice(-6)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">#</span>
                <span className="text-sm font-jetbrains text-white/60">
                  balance:{" "}
                  {ethBalance
                    ? Number(ethBalance.formatted).toFixed(4)
                    : "0.0000"}{" "}
                  ETH
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">#</span>
                <span className="text-sm font-jetbrains text-white/60">
                  first_seen: {firstTxTimestamp || "calculating..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-6 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-white/60" />
              <span className="text-sm font-jetbrains text-white/60">
                teams
              </span>
            </div>
            <div className="space-y-2">
              {isTeamsLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm font-jetbrains text-white/40">
                    loading...
                  </span>
                </div>
              ) : teams && teams.length > 0 ? (
                teams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="flex items-center justify-between py-2 border-b border-white/[0.08] last:border-0 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Team Profile Picture */}
                      <div className="h-8 w-8 overflow-hidden flex items-center justify-center">
                        {team.profilePicture ? (
                          <Image
                            src={team.profilePicture}
                            alt={team.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${getTeamColor(
                              team.name
                            )} bg-opacity-20`}
                          >
                            <span className="text-sm font-bold text-white/80">
                              {team.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-jetbrains text-white/80 group-hover:text-white/100">
                          {team.name.toLowerCase()}
                        </span>
                        <span className="text-xs font-jetbrains text-white/40">
                          ({team.memberCount} members)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-jetbrains text-emerald-500">
                      {team.role.toLowerCase()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm font-jetbrains text-white/40">
                    no teams yet
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">verified</span>
        </div>
      </div>
    </div>
  );
}
