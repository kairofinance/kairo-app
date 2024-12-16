"use client";

import React, { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  UserGroupIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import CircularCropModal from "@/components/CircularCropModal";
import { useAlert } from "@/components/shared/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";

export default function CreateTeamClient() {
  const { address } = useAppKitAccount();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [pendingImageFormData, setPendingImageFormData] =
    useState<FormData | null>(null);
  const [localPreviewImage, setLocalPreviewImage] = useState<string | null>(
    null
  );
  const { alertState, showAlert, dismissAlert } = useAlert();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropImageUrl(imageUrl);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob);
      setPendingImageFormData(formData);

      const previewUrl = URL.createObjectURL(croppedBlob);
      setLocalPreviewImage(previewUrl);
      setCropImageUrl(null);
    } catch (error) {
      console.error("Error handling cropped image:", error);
      setCropImageUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      setIsLoading(true);

      // Create team
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          website,
          treasuryAddress,
          ownerAddress: address,
        }),
      });

      if (!response.ok) throw new Error("Failed to create team");

      const { team } = await response.json();

      // Upload image if exists
      if (pendingImageFormData) {
        const uploadResponse = await fetch(`/api/teams/${team.id}/upload`, {
          method: "POST",
          body: pendingImageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload team image");
        }
      }

      router.push(`/teams/${team.id}`);
    } catch (error) {
      console.error("Error creating team:", error);
      showAlert("Failed to create team", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-5">
      <div className="max-w-6xl mx-auto space-y-12 p-9">
        {/* Header with Back Navigation */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link
              href="/teams"
              className="flex items-center gap-2 px-3 py-1.5 text-sm
                text-white/40 hover:text-white/60 
                bg-white/[0.02] hover:bg-white/[0.04]
                rounded-lg transition-all duration-200"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Back to Teams</span>
            </Link>
          </div>
        </div>

        {/* Create Team Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Team Image */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-white/20 group">
                  {localPreviewImage ? (
                    <Image
                      src={localPreviewImage}
                      alt="Team preview"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                      <UserGroupIcon className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <label
                    className="absolute inset-0 flex items-center justify-center 
                                bg-black/60 opacity-0 group-hover:opacity-100 
                                transition-opacity cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <PencilIcon className="w-4 h-4 text-white/60" />
                      <span className="text-xs text-white/60">
                        {localPreviewImage ? "Change" : "Add Image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6 w-full">
                {/* Team Name */}
                <div className="space-y-2">
                  <label className="text-sm text-white/40">Team Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                           transition-all duration-200 p-3 rounded-lg border border-white/10 
                           text-white"
                    placeholder="Enter team name"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm text-white/40">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                           transition-all duration-200 p-3 rounded-lg border border-white/10 
                           text-white resize-none h-32"
                    placeholder="Add a team description..."
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="text-sm text-white/40">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                           transition-all duration-200 p-3 rounded-lg border border-white/10 
                           text-white"
                    placeholder="https://"
                  />
                </div>

                {/* Treasury Address */}
                <div className="space-y-2">
                  <label className="text-sm text-white/40">
                    Treasury Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                    className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.04] 
                           transition-all duration-200 p-3 rounded-lg border border-white/10 
                           text-white"
                    placeholder="0x..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-6">
                  <Link
                    href="/teams"
                    className="px-4 py-2 text-sm font-medium text-white/60 
                           hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04]
                           rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                           text-emerald-500 hover:text-emerald-400 
                           bg-emerald-500/10 hover:bg-emerald-500/20
                           rounded-lg transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {isLoading ? "Creating..." : "Create Team"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Crop Modal */}
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
