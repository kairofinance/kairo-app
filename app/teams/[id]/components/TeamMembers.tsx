"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlusIcon,
  UserMinusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTeam } from "@/hooks/useTeam";

interface TeamMembersProps {
  team: any; // Will be replaced with proper type
  userAddress?: string;
}

export default function TeamMembers({ team, userAddress }: TeamMembersProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "promote" | "demote" | "remove";
    memberId: string;
    role?: string;
  } | null>(null);
  const [inviteAddress, setInviteAddress] = useState("");
  const {
    addMember,
    isAddingMember,
    updateMember,
    isUpdatingMember,
    removeMember,
    isRemovingMember,
  } = useTeam(team.id);

  const isOwner =
    userAddress?.toLowerCase() === team.owner.address.toLowerCase();

  const handlePromote = async (memberId: string, currentRole: string) => {
    if (currentRole === "MEMBER") {
      await updateMember({ memberId, role: "ADMIN" });
    }
  };

  const handleDemote = async (memberId: string, currentRole: string) => {
    if (currentRole === "ADMIN") {
      await updateMember({ memberId, role: "MEMBER" });
    }
  };

  const handleRemove = async (memberId: string) => {
    await removeMember(memberId);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteAddress.trim()) return;

    try {
      await addMember({
        address: inviteAddress,
        role: "MEMBER",
      });
      setInviteAddress("");
      setShowInviteModal(false);
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case "promote":
          await updateMember({
            memberId: confirmAction.memberId,
            role: "ADMIN",
          });
          break;
        case "demote":
          await updateMember({
            memberId: confirmAction.memberId,
            role: "MEMBER",
          });
          break;
        case "remove":
          await removeMember(confirmAction.memberId);
          break;
      }
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setConfirmAction(null);
      setShowConfirmModal(false);
      setIsManaging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-jetbrains text-sm">$</span>
          <span className="text-sm font-jetbrains text-white/60">
            get team_members
          </span>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManaging(!isManaging)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-jetbrains ${
                isManaging
                  ? "text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                  : "text-white/60 hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04]"
              } transition-all duration-200`}
            >
              <UsersIcon className="w-4 h-4" />
              {isManaging ? "done" : "manage_members"}
            </button>
            {!isManaging && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-jetbrains text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200"
              >
                <UserPlusIcon className="w-4 h-4" />
                invite_member
              </button>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="bg-white/[0.02] p-4">
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">
                  &gt;
                </span>
                <span className="text-sm font-jetbrains text-white/60">
                  invite_address
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-white/40 hover:text-white/60"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={inviteAddress}
              onChange={(e) => setInviteAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] transition-all duration-200 p-3 text-white font-jetbrains text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAddingMember || !inviteAddress.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-jetbrains text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingMember ? "inviting..." : "send_invite"}
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="bg-white/[0.02] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-jetbrains text-white/60">
              confirm_action
            </span>
          </div>
          <p className="text-sm font-jetbrains text-white/80 mb-4">
            {confirmAction.type === "remove"
              ? "Are you sure you want to remove this member?"
              : confirmAction.type === "promote"
              ? "Are you sure you want to promote this member to admin?"
              : "Are you sure you want to demote this member to regular member?"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-jetbrains text-white/60 hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
            >
              cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className="px-4 py-2 text-sm font-jetbrains text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-all duration-200"
            >
              confirm
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {team.members.map((member: any) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white/40 font-jetbrains text-sm">
                  &gt;
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 overflow-hidden">
                    <Image
                      src={
                        member.user.profilePicture ||
                        `https://cdn.stamp.fyi/avatar/${member.user.address}?s=50`
                      }
                      alt={member.user.address}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-jetbrains text-white/80">
                        {`${member.user.address.slice(
                          0,
                          6
                        )}...${member.user.address.slice(-4)}`}
                      </span>
                      <span className="text-xs font-jetbrains text-emerald-500">
                        {member.role.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-jetbrains text-white/40">
                        joined: {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {isManaging &&
                isOwner &&
                member.user.address !== team.owner.address && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "promote",
                          memberId: member.id,
                          role: member.role,
                        });
                        setShowConfirmModal(true);
                      }}
                      disabled={member.role === "ADMIN"}
                      className="px-3 py-1 text-xs font-jetbrains text-white/40 hover:text-white/60 transition-colors disabled:opacity-50 bg-white/[0.02] hover:bg-white/[0.04] rounded"
                    >
                      promote
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "demote",
                          memberId: member.id,
                          role: member.role,
                        });
                        setShowConfirmModal(true);
                      }}
                      disabled={member.role === "MEMBER"}
                      className="px-3 py-1 text-xs font-jetbrains text-white/40 hover:text-white/60 transition-colors disabled:opacity-50 bg-white/[0.02] hover:bg-white/[0.04] rounded"
                    >
                      demote
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "remove",
                          memberId: member.id,
                        });
                        setShowConfirmModal(true);
                      }}
                      className="px-3 py-1 text-xs font-jetbrains text-red-500/40 hover:text-red-500/60 transition-colors bg-white/[0.02] hover:bg-white/[0.04] rounded"
                    >
                      remove
                    </button>
                  </div>
                )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">
            {isAddingMember || isUpdatingMember || isRemovingMember
              ? "updating..."
              : isManaging
              ? "managing"
              : "synced"}
          </span>
        </div>
      </div>
    </div>
  );
}
