"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import { useTeams } from "@/hooks/useTeams";

interface TeamsListProps {
  address?: string;
}

const roleColors = {
  OWNER: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  ADMIN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  MEMBER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function TeamsList({ address }: TeamsListProps) {
  const { teams, isLoading } = useTeams(address);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!teams?.length) {
    return (
      <div className="rounded-lg bg-white/5 border border-white/10">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <BoltIcon className="w-8 h-8 text-yellow-500/50" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No teams yet</h3>
          <p className="text-zinc-400">Create a team to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {teams.map((team) => (
        <Link href={`/teams/${team.id}`} key={team.id}>
          <motion.div
            whileHover={{ y: -2 }}
            className="group flex items-center justify-between p-6 
                     rounded-lg bg-white/[0.03] hover:bg-white/[0.06]
                     border border-white/10 hover:border-white/20
                     transition-all duration-200"
          >
            <div className="flex items-center gap-5">
              {/* Team Avatar */}
              <div className="shrink-0">
                <div
                  className="w-12 h-12 rounded-lg bg-white/5 
                            border border-white/10 overflow-hidden"
                >
                  {team.profilePicture ? (
                    <Image
                      src={team.profilePicture}
                      alt={team.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg font-medium text-white/60">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-white">
                    {team.name}
                  </h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                      roleColors[team.role]
                    }`}
                  >
                    {team.role.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{team.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      Active {new Date(team.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ChevronRightIcon
              className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 
                                    transition-colors shrink-0"
            />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
