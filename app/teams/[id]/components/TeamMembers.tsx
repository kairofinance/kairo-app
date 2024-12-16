"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  UserPlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTeam } from "@/components/shared/hooks/useTeam";
import { Team } from "@/types/team";
import Card from "@/components/shared/ui/Card";
import { useAlert } from "@/components/shared/hooks/useAlert";
import { isAddress } from "viem";
import Input from "@/components/shared/ui/Input";

export default function TeamMembers({ team }: { team: Team }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteAddress, setInviteAddress] = useState("");
  const { inviteMember, isInvitingMember, removeMember } = useTeam(team.id);
  const { showAlert } = useAlert();

  const isOwner =
    team.owner.address.toLowerCase() === team.owner.address.toLowerCase();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteAddress.trim()) return;

    try {
      await inviteMember({
        address: inviteAddress,
        role: "MEMBER",
      });
      setInviteAddress("");
      setShowInviteModal(false);
      showAlert("Invitation sent successfully", "success");
    } catch (error) {
      console.error("Error inviting member:", error);
      showAlert("Failed to send invitation", "error");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      showAlert("Member removed successfully", "success");
    } catch (error) {
      console.error("Error removing member:", error);
      showAlert("Failed to remove member", "error");
    }
  };

  return (
    <>
      <Card
        title="Members"
        action={
          isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm 
                       bg-white/[0.02] hover:bg-white/[0.05] 
                       border border-white/[0.08] hover:border-white/[0.12] 
                       rounded-lg transition-all duration-200"
            >
              <UserPlusIcon className="w-4 h-4 text-white/60" />
              <span className="text-white/60">Invite</span>
            </button>
          )
        }
      >
        <div className="space-y-2">
          {team.members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-center justify-between p-3
                       bg-white/[0.02] hover:bg-white/[0.04] 
                       rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
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
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">
                      {`${member.user.address.slice(
                        0,
                        6
                      )}...${member.user.address.slice(-4)}`}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full bg-white/[0.02] 
                      ${
                        member.role === "OWNER"
                          ? "text-yellow-500/60"
                          : "text-white/40"
                      }`}
                    >
                      {member.role.toLowerCase()}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {isOwner && member.role !== "OWNER" && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-xs text-red-500/60 hover:text-red-500/80 
                             bg-red-500/[0.02] hover:bg-red-500/[0.04]
                             px-2 py-1 rounded transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pending Invites Section */}
        {team.invites &&
          team.invites.some((invite) => invite.status === "PENDING") && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-white/40">
                Pending Invites
              </h4>
              {team.invites
                .filter((invite) => invite.status === "PENDING")
                .map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3
                         bg-white/[0.02] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/40">
                        {`${invite.invitee.address.slice(
                          0,
                          6
                        )}...${invite.invitee.address.slice(-4)}`}
                      </span>
                      <span className="text-xs text-orange-500/60 px-2 py-0.5 rounded-full bg-orange-500/[0.02]">
                        pending
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-black border border-white/10 rounded-lg p-6">
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Invite Member
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <Input
                label="Wallet Address"
                value={inviteAddress}
                onChange={(e) => setInviteAddress(e.target.value)}
                placeholder="0x... or ENS"
                error={
                  inviteAddress && !isAddress(inviteAddress)
                    ? "Invalid address format"
                    : undefined
                }
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white/80
                           bg-white/[0.02] hover:bg-white/[0.04]
                           rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isInvitingMember ||
                    !inviteAddress.trim() ||
                    !isAddress(inviteAddress)
                  }
                  className="px-4 py-2 text-sm text-emerald-500 hover:text-emerald-400
                           bg-emerald-500/10 hover:bg-emerald-500/20
                           rounded-lg transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInvitingMember ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
