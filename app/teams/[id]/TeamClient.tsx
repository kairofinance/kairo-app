"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import TeamOverview from "./components/TeamOverview";
import TeamMembers from "./components/TeamMembers";
import { useTeam } from "@/hooks/useTeam";
import Link from "next/link";

interface TeamClientProps {
  teamId: string;
}

export default function TeamClient({ teamId }: TeamClientProps) {
  const { address } = useAppKitAccount();
  const { team, isLoading, error } = useTeam(teamId);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-jetbrains text-sm">$</span>
            <span className="text-sm font-jetbrains text-white/60">
              loading_team...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-jetbrains text-sm">!</span>
            <span className="text-sm font-jetbrains text-red-500">
              {error instanceof Error ? error.message : "Team not found"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link
            href="/teams"
            className="flex items-center gap-2 text-sm font-jetbrains text-white/40 hover:text-white/60"
          >
            <span>$</span>
            <span>cd ..</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm font-jetbrains text-white/60">
            {team.name.toLowerCase()}
          </span>
        </div>

        {/* Team Overview Section */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            overview
          </h2>
          <TeamOverview team={team} userAddress={address} />
        </div>

        {/* Team Members Section */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            members
          </h2>
          <TeamMembers team={team} userAddress={address} />
        </div>
      </div>
    </div>
  );
}
