"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import TeamsList from "./components/TeamsList";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTeams } from "@/components/shared/hooks/useTeams";
import Spinner from "@/components/Spinner";

export default function TeamsClient() {
  const { address } = useAppKitAccount();
  const { teams = [], isLoading } = useTeams(address ?? "");

  if (!address) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-white/40">
              Please connect your wallet to view your teams
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="p-9">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-white">Teams</h2>
              <p className="text-white/80 mt-1 text-sm font-semibold">
                {teams.length} total team{teams.length !== 1 ? "s" : ""}
              </p>
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

          {/* Teams List */}
          <div className="space-y-6">
            <TeamsList address={address} />
          </div>
        </div>
      </div>
    </div>
  );
}
