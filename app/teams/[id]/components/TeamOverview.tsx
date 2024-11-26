"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  CalendarIcon,
  LinkIcon,
  WalletIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { useTeam } from "@/hooks/useTeam";
import Image from "next/image";
import CircularCropModal from "@/components/CircularCropModal";
import { useAlert } from "@/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import { Team } from "@/types/team";

interface TeamOverviewProps {
  team: Team;
  userAddress?: string;
  onDelete?: () => void;
  onLeave?: () => void;
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localPreviewImage?: string | null;
  pendingImageFormData?: FormData | null;
  onPendingImageChange?: (formData: FormData | null) => void;
  onLocalPreviewChange?: (url: string | null) => void;
  onImageUpload?: (formData: FormData) => Promise<string | undefined>;
}

export default function TeamOverview({
  team,
  userAddress,
  onDelete,
  onLeave,
  onFileSelect,
  localPreviewImage,
  pendingImageFormData,
  onPendingImageChange,
  onLocalPreviewChange,
  onImageUpload,
}: TeamOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [website, setWebsite] = useState(team.website || "");
  const [treasuryAddress, setTreasuryAddress] = useState(
    team.treasuryAddress || ""
  );
  const { updateTeam, isUpdating } = useTeam(team.id);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const { alertState, showAlert, dismissAlert } = useAlert();

  const isOwner =
    userAddress?.toLowerCase() === team.owner.address.toLowerCase();

  // Calculate if name can be changed
  const canChangeName = () => {
    if (!team.lastNameChange) return true;
    const lastChange = new Date(team.lastNameChange);
    const weekSince = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date() >= weekSince;
  };

  // Calculate time until name can be changed
  const getTimeUntilNameChange = () => {
    if (!team.lastNameChange) return null;
    const lastChange = new Date(team.lastNameChange);
    const nextChange = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now >= nextChange) return null;

    const diff = nextChange.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const handleSave = async () => {
    try {
      // First update the team details
      await updateTeam({
        name: canChangeName() ? name : undefined,
        description,
        website,
        treasuryAddress,
      });

      // Then if there's a pending image upload, handle it
      if (pendingImageFormData && onImageUpload) {
        const newProfilePicture = await onImageUpload(pendingImageFormData);
        if (newProfilePicture) {
          onLocalPreviewChange?.(newProfilePicture);
        }
      }

      setIsEditing(false);
      onPendingImageChange?.(null);
      showAlert("Team details updated successfully", "success");
    } catch (error) {
      console.error("Error updating team:", error);
      showAlert("Failed to update team details", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(team.name);
    setDescription(team.description || "");
    setWebsite(team.website || "");
    setTreasuryAddress(team.treasuryAddress || "");
    onPendingImageChange?.(null);
    onLocalPreviewChange?.(null);
  };

  const timeUntilNameChange = getTimeUntilNameChange();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create URL for the crop modal
    const imageUrl = URL.createObjectURL(file);
    setCropImageUrl(imageUrl);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob);

      // Store the FormData for later use
      setPendingImageFormData(formData);

      // Create a temporary preview URL and update through callback
      const previewUrl = URL.createObjectURL(croppedBlob);
      onLocalPreviewChange?.(previewUrl);
      setCropImageUrl(null);
    } catch (error) {
      console.error("Error handling cropped image:", error);
      setCropImageUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Overview</h3>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm
              text-white/40 hover:text-white/60 
              bg-white/[0.02] hover:bg-white/[0.04]
              rounded-lg transition-all duration-200"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Edit Section - Profile Picture and Team Name */}
      {isEditing && isOwner && (
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="text-sm text-white/40">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden group border border-white/10">
                {localPreviewImage || team.profilePicture ? (
                  <Image
                    src={localPreviewImage || team.profilePicture}
                    alt={team.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                    <span className="text-lg font-medium text-white/40">
                      {team.name.slice(0, 2)}
                    </span>
                  </div>
                )}
                <label
                  className="absolute inset-0 flex items-center justify-center 
                              bg-black/60 opacity-0 group-hover:opacity-100 
                              transition-opacity cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-1">
                    <PencilIcon className="w-4 h-4 text-white/60" />
                    <span className="text-xs text-white/60">Change</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-sm text-white/40">
                Click to upload a new team image
              </span>
            </div>
          </div>

          {/* Team Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/40">Team Name</label>
              {!canChangeName() && timeUntilNameChange && (
                <span className="text-xs text-orange-500/60">
                  Name change available in {timeUntilNameChange}
                </span>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canChangeName()}
              className={`w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                       transition-all duration-200 p-3 rounded-lg border border-white/10 
                       text-white disabled:opacity-50 disabled:cursor-not-allowed
                       ${!canChangeName() ? "hover:bg-white/[0.02]" : ""}`}
              placeholder="Enter team name"
            />
            {!canChangeName() && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-white/40"
              >
                Team names can only be changed once every 7 days
              </motion.p>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/40">Members</span>
          </div>
          <span className="text-xl font-medium text-white">
            {team.members.length}
          </span>
        </div>

        <div className="bg-white/[0.02] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/40">Created</span>
          </div>
          <span className="text-xl font-medium text-white">
            {new Date(team.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm text-white/40">Description</label>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                       transition-all duration-200 p-3 rounded-lg border border-white/10 
                       text-white resize-none h-32"
              placeholder="Add a team description..."
            />
          ) : (
            <p className="text-white/60 bg-white/[0.02] p-3 rounded-lg min-h-[80px]">
              {description || "No description provided"}
            </p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="text-sm text-white/40">Website</label>
          {isEditing ? (
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                       transition-all duration-200 p-3 rounded-lg border border-white/10 
                       text-white"
              placeholder="https://"
            />
          ) : (
            <div className="flex items-center gap-2 bg-white/[0.02] p-3 rounded-lg">
              <LinkIcon className="w-4 h-4 text-white/40" />
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white/80 transition-colors"
                >
                  {website}
                </a>
              ) : (
                <span className="text-white/40">Not set</span>
              )}
            </div>
          )}
        </div>

        {/* Treasury Address */}
        <div className="space-y-2">
          <label className="text-sm text-white/40">Treasury Address</label>
          {isEditing ? (
            <input
              type="text"
              value={treasuryAddress}
              onChange={(e) => setTreasuryAddress(e.target.value)}
              className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                       transition-all duration-200 p-3 rounded-lg border border-white/10 
                       text-white"
              placeholder="0x..."
            />
          ) : (
            <div className="flex items-center gap-2 bg-white/[0.02] p-3 rounded-lg">
              <WalletIcon className="w-4 h-4 text-white/40" />
              <span className="text-white/60">
                {treasuryAddress
                  ? `${treasuryAddress.slice(0, 6)}...${treasuryAddress.slice(
                      -4
                    )}`
                  : "Not set"}
              </span>
            </div>
          )}
        </div>

        {/* Danger Zone - Only show when editing */}
        {isEditing && (
          <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/40">Danger Zone</h4>
            {isOwner ? (
              <button
                onClick={onDelete}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                  text-sm font-medium text-red-500/60 hover:text-red-500/80 
                  bg-red-500/[0.02] hover:bg-red-500/[0.04]
                  border border-red-500/10 hover:border-red-500/20
                  rounded-lg transition-all duration-200"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete Team</span>
              </button>
            ) : (
              <button
                onClick={onLeave}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                  text-sm font-medium text-red-500/60 hover:text-red-500/80 
                  bg-red-500/[0.02] hover:bg-red-500/[0.04]
                  border border-red-500/10 hover:border-red-500/20
                  rounded-lg transition-all duration-200"
              >
                <UserMinusIcon className="w-4 h-4" />
                <span>Leave Team</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Controls */}
      {isEditing && (
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm
              text-white/60 hover:text-white/80 
              bg-white/[0.02] hover:bg-white/[0.04]
              rounded-lg transition-all duration-200"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 text-sm
              text-emerald-500 hover:text-emerald-400 
              bg-emerald-500/10 hover:bg-emerald-500/20
              rounded-lg transition-all duration-200"
          >
            <CheckIcon className="w-4 h-4" />
            <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      )}

      {cropImageUrl && (
        <CircularCropModal
          imageUrl={cropImageUrl}
          onCrop={handleCroppedImage}
          onCancel={() => setCropImageUrl(null)}
        />
      )}

      {/* Alert Message */}
      {alertState && (
        <AlertMessage
          message={alertState.message}
          type={alertState.type}
          onDismiss={dismissAlert}
        />
      )}
    </div>
  );
}
