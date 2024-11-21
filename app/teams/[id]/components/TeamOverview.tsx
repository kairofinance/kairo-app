"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UsersIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  LinkIcon,
  ShieldCheckIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { useTeam } from "@/hooks/useTeam";
import { useSafe } from "../../../hooks/useSafe";

interface TeamOverviewProps {
  team: any; // Will be replaced with proper type
  userAddress?: string;
}

export default function TeamOverview({ team, userAddress }: TeamOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [website, setWebsite] = useState(team.website || "");
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(team.profilePicture);
  const { updateTeam, isUpdating } = useTeam(team.id);
  const { isSafeApp, safeInfo, createSafe, proposeTx } = useSafe();
  const [treasuryAddress, setTreasuryAddress] = useState(
    team.treasuryAddress || ""
  );

  const isOwner =
    userAddress?.toLowerCase() === team.owner.address.toLowerCase();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setNewProfilePicture(file);
  };

  const handleSave = async () => {
    try {
      if (newProfilePicture) {
        const formData = new FormData();
        formData.append("file", newProfilePicture);

        const response = await fetch(`/api/teams/${team.id}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }
      }

      await updateTeam({
        name,
        description,
        website,
        treasuryAddress,
      });

      setIsEditing(false);
      setNewProfilePicture(null);
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewProfilePicture(null);
    setPreviewUrl(team.profilePicture);
    setTreasuryAddress(team.treasuryAddress || "");
  };

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

  const handleProposeTx = async () => {
    const tx = {
      to: "0x123...",
      value: "1000000000000000000", // 1 ETH
      data: "0x",
    };
    const txHash = await proposeTx(tx);
    console.log("Transaction proposed:", txHash);
  };

  const router = useRouter();

  const handleLeaveTeam = async () => {
    try {
      // Find the member ID for the current user
      const currentMember = team.members.find(
        (member: any) =>
          member.user.address.toLowerCase() === userAddress?.toLowerCase()
      );

      if (!currentMember) return;

      const response = await fetch(
        `/api/teams/${team.id}/members/${currentMember.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to leave team");
      }

      // Redirect to teams page after leaving
      router.push("/teams");
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-jetbrains text-sm">$</span>
          <span className="text-sm font-jetbrains text-white/60">
            get team_info
          </span>
        </div>
        {userAddress && (
          <div className="flex items-center gap-2">
            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-jetbrains text-white/60 hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
              >
                <PencilIcon className="w-4 h-4" />
                edit
              </button>
            )}
            {!isEditing && (
              <button
                onClick={handleLeaveTeam}
                className="flex items-center gap-2 px-4 py-2 text-sm font-jetbrains text-red-500/60 hover:text-red-500/80 bg-red-500/[0.02] hover:bg-red-500/[0.04] transition-all duration-200"
              >
                <UserMinusIcon className="w-4 h-4" />
                leave_team
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Team Profile Section */}
        <div className="md:col-span-1">
          <div className="bg-white/[0.02] p-3 rounded-lg space-y-3">
            <div className="relative group">
              {previewUrl || team.profilePicture ? (
                <Image
                  src={previewUrl || team.profilePicture}
                  alt={team.name}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center text-3xl font-bold uppercase bg-white/[0.02]">
                  <div
                    className={`absolute inset-0 ${getTeamColor(
                      team.name
                    )} opacity-20`}
                  />
                  <span className="relative text-white/80">
                    {team.name.slice(0, 2)}
                  </span>
                </div>
              )}

              {isOwner && isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <CloudArrowUpIcon className="w-5 h-5 text-white/60" />
                    <span className="text-xs font-jetbrains text-white/60">
                      select_image
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">
                  &gt;
                </span>
                <span className="text-sm font-jetbrains text-white/80">
                  {team.name.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">#</span>
                <span className="text-xs font-jetbrains text-white/40">
                  created {new Date(team.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Details Section */}
        <div className="md:col-span-3 flex flex-col h-full">
          {/* Team Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/[0.02] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <UsersIcon className="w-4 h-4 text-white/60" />
                <span className="text-sm font-jetbrains text-white/60">
                  members
                </span>
              </div>
              <span className="text-xl font-jetbrains text-white/80">
                {team.members.length}
              </span>
            </div>
            <div className="bg-white/[0.02] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DocumentIcon className="w-4 h-4 text-white/60" />
                <span className="text-sm font-jetbrains text-white/60">
                  treasury
                </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={treasuryAddress}
                  onChange={(e) => setTreasuryAddress(e.target.value)}
                  className="w-full bg-transparent outline outline-1 p-2 outline-white/[0.06] text-white/80 font-jetbrains text-sm focus:outline-none"
                  placeholder="0x..."
                />
              ) : treasuryAddress ? (
                <span className="text-sm font-jetbrains text-white/80">
                  {`${treasuryAddress.slice(0, 6)}...${treasuryAddress.slice(
                    -4
                  )}`}
                </span>
              ) : (
                <span className="text-sm font-jetbrains text-white/60">
                  not set
                </span>
              )}
            </div>
            <div className="bg-white/[0.02] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-white/60" />
                <span className="text-sm font-jetbrains text-white/60">
                  website
                </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-transparent outline outline-1 p-2 outline-white/[0.06] text-white/80 font-jetbrains text-sm focus:outline-none"
                  placeholder="https://"
                />
              ) : website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-jetbrains text-emerald-400 hover:text-emerald-300 truncate block"
                >
                  {website}
                </a>
              ) : (
                <p className="text-sm font-jetbrains text-white truncate block">
                  N/A
                </p>
              )}
            </div>
          </div>

          {/* Team Description - Now fills remaining height */}
          <div className="bg-white/[0.02] p-6 rounded-lg flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white/40 font-jetbrains text-sm">&gt;</span>
              <span className="text-sm font-jetbrains text-white/60">
                description
              </span>
            </div>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] transition-all duration-200 p-3 text-white font-jetbrains text-sm focus:outline-none focus:ring-1 focus:ring-orange-600/40 resize-none rounded-lg flex-1"
                placeholder="Enter team description..."
              />
            ) : (
              <p className="text-sm font-jetbrains text-white/80 leading-relaxed flex-1">
                {team.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Edit Controls */}
          {isEditing && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-jetbrains text-white/60 hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
              >
                <XMarkIcon className="w-4 h-4" />
                cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-jetbrains text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200"
              >
                <CheckIcon className="w-4 h-4" />
                {isUpdating ? "saving..." : "save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">
            {isEditing ? "editing" : "synced"}
          </span>
        </div>
      </div>
    </div>
  );
}
