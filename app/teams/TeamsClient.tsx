"use client";

import React, { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import TeamsList from "./components/TeamsList";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTeams } from "@/hooks/useTeams";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useTeamContext } from "@/contexts/TeamContext";
import { Team } from "@/types/team";

interface TeamFlow {
  id: string;
  type: "stream" | "vest";
  amount: string;
  tokenAddress: string;
  isIncoming: boolean;
  counterpartyAddress: string;
  teamId?: string;
}

interface Position {
  x: number;
  y: number;
  isIncoming: boolean;
}

export default function TeamsClient() {
  const { address } = useAppKitAccount();
  const { selectedTeamId } = useTeamContext();
  const [flows, setFlows] = useState<TeamFlow[]>([]);
  const [isLoadingFlows, setIsLoadingFlows] = useState(true);

  // Update the query to use the flows/active endpoint
  const { data: flowsData } = useQuery({
    queryKey: ["team-flows", address, selectedTeamId],
    queryFn: async () => {
      if (!address) return { flows: [] };

      try {
        // Use the unified flows/active endpoint
        const response = await fetch(
          `/api/flows/active?address=${address}${
            selectedTeamId ? `&teamId=${selectedTeamId}` : ""
          }`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch flows");
        }

        const data = await response.json();

        // Filter out only stream and vest activities
        const flows = (data.activities || []).filter(
          (activity: any) =>
            activity.type === "stream" || activity.type === "vest"
        );

        return { flows };
      } catch (error) {
        console.error("Error fetching flows:", error);
        return { flows: [] };
      }
    },
    enabled: !!address,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { teams = [] } = useTeams(address ?? "");

  if (!address) return null;

  // Updated position calculation for better visual arrangement
  const getTeamPositions = (teams: Team[]): Position[] => {
    if (teams.length === 0) return [];

    const baseRadius = 180;
    const positions: Position[] = [];

    // Updated angle distribution for better flow visualization
    const angleOrder = [
      180, // Left (incoming)
      0, // Right (outgoing)
      135, // Top left (incoming)
      45, // Top right (outgoing)
      225, // Bottom left (incoming)
      315, // Bottom right (outgoing)
    ];

    for (let i = 0; i < teams.length; i++) {
      const layer = Math.floor(i / angleOrder.length);
      const angle = angleOrder[i % angleOrder.length];
      const radius = baseRadius + layer * 60;
      const angleInRadians = (angle * Math.PI) / 180;

      positions.push({
        x: radius * Math.cos(angleInRadians),
        y: radius * Math.sin(angleInRadians),
        isIncoming: angle > 90 && angle < 270, // Left half is incoming
      });
    }

    return positions;
  };

  const teamPositions = getTeamPositions(teams);

  // Function to draw SVG path from center to team
  const getPathToTeam = (x: number, y: number) => {
    const midX = x * 0.5;
    const midY = y * 0.5;
    return `M 0,0 Q ${midX},${midY} ${x},${y}`;
  };

  return (
    <div className="min-h-screen mt-5">
      <div className="max-w-6xl mx-auto space-y-12 p-9">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-white">Teams</h2>
              <span className="px-2 py-1 rounded-full bg-white/[0.02] text-sm text-white/60">
                {teams.length} total
              </span>
            </div>

            <Link
              href="/teams/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-emerald-500 hover:text-emerald-400 
                bg-emerald-500/10 hover:bg-emerald-500/20 
                transition-all duration-200 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Team</span>
            </Link>
          </div>

          {/* Mindmap Visual */}
          <div className="relative h-[600px] rounded-lg bg-gradient-to-b from-white/[0.02] to-transparent mb-12 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />

              <div className="relative w-full h-full flex items-center justify-center">
                {/* SVG Container for paths */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  style={{ transform: "translate(50%, 50%)" }}
                >
                  {/* Simplified gradient for basic lines */}
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                    </linearGradient>
                  </defs>

                  {teams.map((team, index) => {
                    const position = teamPositions[index];
                    const teamFlows =
                      flowsData?.flows.filter(
                        (f: TeamFlow) => f.teamId === team.id
                      ) || [];

                    return (
                      <g key={`connection-${team.id}`}>
                        {/* Base connecting line */}
                        <path
                          d={getPathToTeam(position.x, position.y)}
                          className={`stroke-white/10 ${
                            position.isIncoming
                              ? "stroke-emerald-500/10"
                              : "stroke-blue-500/10"
                          }`}
                          fill="none"
                          strokeWidth="2"
                        />

                        {/* Flow indicator line */}
                        <path
                          d={getPathToTeam(position.x, position.y)}
                          stroke="url(#lineGradient)"
                          fill="none"
                          strokeWidth="1.5"
                          className={`opacity-50 ${
                            teamFlows.length > 0 ? "visible" : "invisible"
                          }`}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Team nodes */}
                {teams.map((team, index) => {
                  const position = teamPositions[index];
                  const isOwner = team.role === "OWNER";

                  return (
                    <motion.div
                      key={`node-${team.id}`}
                      className="absolute cursor-pointer"
                      style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Link href={`/teams/${team.id}`}>
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                          {/* Main circle */}
                          <div
                            className={`
                            w-14 h-14 rounded-full 
                            bg-white/[0.03] hover:bg-white/[0.06]
                            border border-white/20
                            flex items-center justify-center
                            backdrop-blur-sm overflow-hidden
                            ${
                              isOwner
                                ? "border-opacity-40"
                                : "border-opacity-20"
                            }
                            transition-all duration-200
                          `}
                          >
                            {team.profilePicture ? (
                              <Image
                                src={team.profilePicture}
                                alt={team.name}
                                width={56}
                                height={56}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-base font-medium text-white/60">
                                {team.name.slice(0, 2)}
                              </span>
                            )}
                          </div>

                          {/* Team name */}
                          <div className="absolute mt-2 text-xs whitespace-nowrap left-1/2 -translate-x-1/2">
                            <span className="font-medium text-white/40">
                              {team.name}
                            </span>
                          </div>

                          {/* Role indicator */}
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.02] text-white/40">
                            {team.role.toLowerCase()}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Center user node */}
                <motion.div
                  className="absolute z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative">
                    {/* Pulsing ring */}
                    <motion.div
                      className="absolute rounded-full border border-white/20"
                      style={{ inset: "-8px" }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <Image
                      src={`https://cdn.stamp.fyi/avatar/${address}?s=50`}
                      alt="User"
                      width={56}
                      height={56}
                      className="rounded-full border border-white/20 relative z-10"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-6">
          <TeamsList address={address} />
        </div>
      </div>
    </div>
  );
}
