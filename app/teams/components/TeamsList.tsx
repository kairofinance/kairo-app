"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useTeams } from "@/components/shared/hooks/useTeams";

interface TeamsListProps {
  address?: string;
}

export default function TeamsList({ address }: TeamsListProps) {
  const { teams, isLoading } = useTeams(address);

  return (
    <div className="space-y-6">
      {/* Title Section - Matching main header style */}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-white/[0.02] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !teams?.length && (
        <div className="rounded-lg bg-white/[0.02] border border-white/10">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
              <UserGroupIcon className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white/60 mb-2">
              No teams yet
            </h3>
            <p className="text-sm text-white/40">
              Create a team to get started
            </p>
          </div>
        </div>
      )}

      {/* Teams List */}
      {!isLoading && teams && teams.length > 0 && (
        <div className="space-y-3 flex flex-col">
          {teams.map((team) => (
            <Link href={`/teams/${team.id}`} key={team.id}>
              <motion.div
                whileHover={{ y: -2 }}
                className="group flex items-center justify-between p-6 
                         rounded-lg bg-white/[0.02] hover:bg-white/[0.04]
                         border border-white/10 hover:border-white/20
                         transition-all duration-200"
              >
                <div className="flex items-center gap-5">
                  {/* Team Avatar */}
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 overflow-hidden">
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
                          <span className="text-lg font-medium text-white/40">
                            {team.name.slice(0, 2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white/80">
                        {team.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/[0.02] text-white/40">
                        {team.role.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{team.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          Active{" "}
                          {new Date(team.lastActivity).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <ChevronRightIcon className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
