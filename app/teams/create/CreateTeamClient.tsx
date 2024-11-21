"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import CreateTeam from "../components/CreateTeam";
import Link from "next/link";

interface CreateTeamClientProps {
  initialDictionary: any;
  initialLang: string;
}

export default function CreateTeamClient({
  initialDictionary,
  initialLang,
}: CreateTeamClientProps) {
  const { address } = useAppKitAccount();

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
            create_team
          </span>
        </div>

        {/* Create Team Section */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            create_team
          </h2>
          <CreateTeam address={address} />
        </div>
      </div>
    </div>
  );
}
