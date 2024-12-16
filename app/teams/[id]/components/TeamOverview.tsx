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
import { useTeam } from "@/components/shared/hooks/useTeam";
import Image from "next/image";
import CircularCropModal from "@/components/CircularCropModal";
import { useAlert } from "@/components/shared/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import { Team } from "@/types/team";
import Card from "@/components/shared/ui/Card";
import Input from "@/components/shared/ui/Input";

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
  const { alertState, showAlert } = useAlert();

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
      await updateTeam({
        name: canChangeName() ? name : undefined,
        description,
        website,
        treasuryAddress,
      });

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
    <Card
      title="Overview"
      action={
        !isEditing && isOwner ? (
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
        ) : null
      }
    >
      {isEditing ? (
        <div className="space-y-6">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canChangeName()}
            helper={
              !canChangeName()
                ? `Name can be changed in ${getTimeUntilNameChange()}`
                : undefined
            }
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description"
          />

          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Add website URL"
          />

          <Input
            label="Treasury Address"
            value={treasuryAddress}
            onChange={(e) => setTreasuryAddress(e.target.value)}
            placeholder="Add treasury address"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-white/60 hover:text-white/80
                       bg-white/[0.02] hover:bg-white/[0.04]
                       rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-4 py-2 text-sm text-emerald-500 hover:text-emerald-400
                       bg-emerald-500/10 hover:bg-emerald-500/20
                       rounded-lg transition-all duration-200"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-white/40 mb-2">Description</h3>
            <p className="text-white/80">
              {team.description || "No description provided"}
            </p>
          </div>

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
      )}
    </Card>
  );
}
