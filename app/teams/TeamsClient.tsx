"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import TeamsList from "./components/TeamsList";
import Link from "next/link";
import { BoltIcon } from "@heroicons/react/24/solid";

export default function TeamsClient() {
  const { address } = useAppKitAccount();

  if (!address) return null;

  return (
    <div className="min-h-screen pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BoltIcon className="w-7 h-7 text-yellow-500" />
              <h1 className="text-2xl font-medium text-white">Teams</h1>
            </div>
            <p className="text-base text-zinc-400">
              Collaborate and manage token streams together
            </p>
          </div>
          <Link
            href="/teams/create"
            className="flex items-center gap-2 px-5 py-2.5 
                     bg-white/5 hover:bg-white/10
                     border border-white/10 hover:border-white/20
                     rounded-lg transition-all duration-200"
          >
            <BoltIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-white">New Team</span>
          </Link>
        </div>

        {/* Teams List */}
        <TeamsList address={address} />
      </div>
    </div>
  );
}
