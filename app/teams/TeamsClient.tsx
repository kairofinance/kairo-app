"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import TeamsList from "./components/TeamsList";

interface TeamsClientProps {
  initialDictionary: any;
  initialLang: string;
}

export default function TeamsClient({
  initialDictionary,
  initialLang,
}: TeamsClientProps) {
  const { address } = useAppKitAccount();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Teams List Section */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            teams
          </h2>
          <TeamsList address={address} />
        </div>
      </div>
    </div>
  );
}
