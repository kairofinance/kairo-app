"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";

interface CreateTeamProps {
  address?: string;
}

export default function CreateTeam({ address }: CreateTeamProps) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const { createTeam, isCreating, createError } = useTeams(address);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !teamName.trim()) return;

    try {
      const result = await createTeam(
        {
          name: teamName.trim(),
          description: description.trim(),
          ownerAddress: address,
        },
        {
          onSuccess: (data) => {
            // Route directly to the new team's page
            if (data?.team?.id) {
              router.push(`/teams/${data.team.id}`);
            }
          },
        }
      );
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">
          create new_team
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Name Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-jetbrains text-sm">&gt;</span>
            <label className="text-sm font-jetbrains text-white/60">
              team_name
            </label>
          </div>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] transition-all duration-200 p-3 rounded-lg border border-white/[0.08] text-white font-jetbrains text-sm focus:outline-none focus:ring-1 focus:ring-orange-600/40"
            placeholder="enter team name"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-jetbrains text-sm">&gt;</span>
            <label className="text-sm font-jetbrains text-white/60">
              description
            </label>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] transition-all duration-200 p-3 rounded-lg border border-white/[0.08] text-white font-jetbrains text-sm focus:outline-none focus:ring-1 focus:ring-orange-600/40 min-h-[100px] resize-none"
            placeholder="enter team description"
          />
        </div>

        {/* Error Message */}
        {createError && (
          <div className="flex items-center gap-2 text-red-500">
            <span className="text-white/40 font-jetbrains text-sm">!</span>
            <span className="text-sm font-jetbrains">
              {createError instanceof Error
                ? createError.message
                : "Failed to create team"}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            type="submit"
            disabled={isCreating || !teamName.trim()}
            className="group flex items-center gap-3 px-4 py-3 backdrop-blur-sm 
                     bg-emerald-500/10 hover:bg-emerald-500/20 
                     border border-emerald-500/20 hover:border-emerald-500/30
                     transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     w-full sm:w-auto justify-center sm:justify-start"
          >
            <span className="text-emerald-500 font-jetbrains text-sm animate-pulse">
              $
            </span>
            <span className="text-sm font-jetbrains text-emerald-500 group-hover:text-emerald-400 transition-colors">
              {isCreating ? "creating..." : "create_team"}
            </span>
            {!isCreating && (
              <span className="ml-1 text-emerald-500 animate-pulse">▋</span>
            )}
          </button>
        </div>
      </form>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isCreating ? "bg-orange-600" : "bg-emerald-500"
            } animate-pulse`}
          />
          <span className="text-sm font-jetbrains text-white/40">
            {isCreating ? "creating" : "ready"}
          </span>
        </div>
      </div>
    </div>
  );
}
