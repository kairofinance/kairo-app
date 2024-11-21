"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useTeams } from "@/hooks/useTeams";

interface TeamsListProps {
  address?: string;
}

export default function TeamsList({ address }: TeamsListProps) {
  const { teams, isLoading } = useTeams(address);

  // Generate a unique color based on team name
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-jetbrains text-sm">$</span>
          <span className="text-sm font-jetbrains text-white/60">
            loading_teams...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">
          get my_teams
        </span>
      </div>

      <div className="space-y-2">
        {teams?.map((team) => (
          <Link
            href={`/teams/${team.id}`}
            key={team.id}
            className="block group"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-white/40 font-jetbrains text-sm">
                    &gt;
                  </span>
                  {/* Team Profile Picture */}
                  <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center">
                    {team?.profilePicture ? (
                      <Image
                        src={team?.profilePicture}
                        alt={team.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${getTeamColor(
                          team.name
                        )} bg-opacity-20`}
                      >
                        <span className="text-lg font-bold text-white/80">
                          {team.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-jetbrains text-white/80">
                        {team.name.toLowerCase()}
                      </span>
                      <span className="text-xs font-jetbrains text-emerald-500">
                        {team.role.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-jetbrains text-white/40">
                        #
                      </span>
                      <span className="text-xs font-jetbrains text-white/40">
                        {team.memberCount} members
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 font-jetbrains text-sm">
                      last_active:
                    </span>
                    <span className="text-sm font-jetbrains text-white/60">
                      {new Date(team.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">synced</span>
        </div>
      </div>
    </div>
  );
}
