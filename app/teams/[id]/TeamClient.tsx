"use client";

import React, { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import TeamOverview from "./components/TeamOverview";
import TeamMembers from "./components/TeamMembers";
import { useTeam } from "@/components/shared/hooks/useTeam";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/shared/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import CircularCropModal from "@/components/CircularCropModal";
import Spinner from "@/components/Spinner";
import Card from "@/components/shared/ui/Card";

interface TeamClientProps {
  teamId: string;
}

export default function TeamClient({ teamId }: TeamClientProps) {
  const { address } = useAppKitAccount();
  const { team, isLoading, error } = useTeam(teamId);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const { alertState, showAlert, dismissAlert } = useAlert();
  const [pendingImageFormData, setPendingImageFormData] =
    useState<FormData | null>(null);
  const [localPreviewImage, setLocalPreviewImage] = useState<string | null>(
    null
  );

  // Handle image selection
  const handleImageSelect = (formData: FormData) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Upload to server
        const response = await fetch(`/api/teams/${teamId}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();

        // Update with server URL
        if (data.team?.profilePicture) {
          setPreviewImage(data.team.profilePicture);
          showAlert("Profile picture updated successfully", "success");
        }
        resolve();
      } catch (error) {
        console.error("Error uploading image:", error);
        setPreviewImage(null);
        showAlert("Failed to update profile picture", "error");
        reject(error);
      }
    });
  };

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create URL for the crop modal
    const imageUrl = URL.createObjectURL(file);
    setCropImageUrl(imageUrl);
  };

  // Handle cropped image - now just stores locally
  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      // Create FormData for later use
      const formData = new FormData();
      formData.append("file", croppedBlob);
      setPendingImageFormData(formData);

      // Create temporary preview URL
      const previewUrl = URL.createObjectURL(croppedBlob);
      setLocalPreviewImage(previewUrl);
    } catch (error) {
      console.error("Error handling cropped image:", error);
    } finally {
      setCropImageUrl(null);
    }
  };

  // Handle image upload - now returns a promise
  const handleImageUpload = async (formData: FormData) => {
    const response = await fetch(`/api/teams/${teamId}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.team?.profilePicture;
  };

  // Handle crop modal cancel
  const handleCropCancel = () => {
    setCropImageUrl(null);
  };

  // Handle team deletion
  const handleDeleteTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team");
      }

      router.push("/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  // Handle leaving team
  const handleLeaveTeam = async () => {
    try {
      if (!team || !address) return;

      const currentMember = team.members.find(
        (member) => member.user.address.toLowerCase() === address.toLowerCase()
      );

      if (!currentMember) {
        console.error("Current user not found in team members");
        return;
      }

      const response = await fetch(
        `/api/teams/${teamId}/members/${currentMember.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to leave team");
      }

      router.push("/teams");
    } catch (error) {
      console.error("Error leaving team:", error);
      showAlert("Failed to leave team", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-500">
              {error instanceof Error ? error.message : "Team not found"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === team.owner.address.toLowerCase();

  return (
    <div className="min-h-screen mt-5">
      <div className="max-w-6xl mx-auto space-y-12 p-9">
        {/* Header with Back Navigation */}

        <div className="flex items-center">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors mb-6 font-jetbrains text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Teams</span>
          </Link>
        </div>

        {/* Team Header Section */}
        <div className="relative h-[300px] rounded-lg !mt-0 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />

            <div className="relative h-full flex items-center justify-center">
              {/* Team Visual */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center relative"
              >
                {/* Team Avatar */}
                <div className="relative mb-6">
                  {/* Pulsing rings */}
                  {[1, 2, 3].map((ring) => (
                    <motion.div
                      key={`ring-${team.id}-${ring}`}
                      className="absolute rounded-full border border-white/20"
                      style={{
                        inset: `-${ring * 12}px`,
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        delay: ring * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}

                  {/* Avatar Container */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-white/20 group z-10">
                    {team.profilePicture ? (
                      <Image
                        src={team.profilePicture}
                        alt={team.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                        <span className="text-2xl font-medium text-white/60">
                          {team.name.slice(0, 2)}
                        </span>
                      </div>
                    )}
                    {isOwner && isEditing && (
                      <label
                        className="absolute inset-0 flex items-center justify-center 
                                    bg-black/60 opacity-0 group-hover:opacity-100 
                                    transition-opacity cursor-pointer"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <PencilIcon className="w-5 h-5 text-white/60" />
                          <span className="text-xs font-medium text-white/60">
                            Change Image
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Team Info */}
                <h1 className="text-3xl font-semibold text-white mb-2 z-10">
                  {team.name}
                </h1>
                <div className="flex items-center gap-4 text-white/40 z-10">
                  <span>{team.memberCount} members</span>
                  <span>•</span>
                  <span>
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                  {team.role && team.role !== "OWNER" && (
                    <>
                      <span>•</span>
                      <span className="text-white/30">
                        {team.role.toLowerCase()}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Overview */}
          <div className="lg:col-span-2">
            <Card
              title="Overview"
              action={
                isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm 
                             bg-white/[0.02] hover:bg-white/[0.05] 
                             border border-white/[0.08] hover:border-white/[0.12] 
                             rounded-lg transition-all duration-200"
                  >
                    <PencilIcon className="w-4 h-4 text-white/60" />
                    <span className="text-white/60">Edit</span>
                  </button>
                )
              }
            >
              <div className="space-y-6">
                {/* Team Description */}
                <div>
                  <h3 className="text-sm text-white/40 mb-2">Description</h3>
                  <p className="text-white/80">
                    {team.description || "No description provided"}
                  </p>
                </div>

                {/* Team Website */}
                <div>
                  <h3 className="text-sm text-white/40 mb-2">Website</h3>
                  {team.website ? (
                    <a
                      href={team.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {team.website}
                    </a>
                  ) : (
                    <p className="text-white/40">No website provided</p>
                  )}
                </div>

                {/* Treasury Address */}
                <div>
                  <h3 className="text-sm text-white/40 mb-2">Treasury</h3>
                  {team.treasuryAddress ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white/80">
                        {`${team.treasuryAddress.slice(
                          0,
                          6
                        )}...${team.treasuryAddress.slice(-4)}`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-white/40">No treasury address set</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Team Members */}
          <div className="lg:col-span-1">
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
                    {/* ... keep existing member card content ... */}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-md w-full bg-black border border-white/10 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <h3 className="text-lg font-medium">Delete Team</h3>
              </div>

              <p className="text-white/60">
                Are you sure you want to delete this team? This action cannot be
                undone and will remove all team data.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white/60 
                           hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04]
                           rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeam}
                  className="px-4 py-2 text-sm font-medium text-red-500/60 
                           hover:text-red-500/80 bg-red-500/[0.02] hover:bg-red-500/[0.04]
                           rounded-lg transition-all duration-200"
                >
                  Delete Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Message */}
      {alertState && (
        <AlertMessage
          message={alertState.message}
          type={alertState.type}
          onDismiss={dismissAlert}
        />
      )}

      {/* Crop Modal */}
      {cropImageUrl && (
        <CircularCropModal
          imageUrl={cropImageUrl}
          onCrop={handleCroppedImage}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
