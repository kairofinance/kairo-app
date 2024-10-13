"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, useSignMessage, useEnsName } from "wagmi";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

// Remove or update these imports based on your project structure
// import AuthWrapper from "@/auth/AuthWrapper";
// import Spinner from "@/components/Spinner";

// Inline the shortenAddress function if it's not available in a separate file
const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface ProfileData {
  nickname: string;
  bio: string;
  website: string;
  email: string;
  profilePicture: string;
  peopleWorkedWith: number;
  joinedDate: string;
}

const ProfilePage = () => {
  const params = useParams();
  const { t } = useTranslation("common");
  const userIdentifier = params.user as string;
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    nickname: "",
    bio: "",
    website: "",
    email: "",
    profilePicture: "",
    peopleWorkedWith: 0,
    joinedDate: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const isOwnProfile = address?.toLowerCase() === userIdentifier.toLowerCase();

  const { data: ensName } = useEnsName({
    address: userIdentifier as `0x${string}`,
  });
  const displayName = ensName || shortenAddress(userIdentifier);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/getProfile?address=${encodeURIComponent(userIdentifier)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();
        if (data.user && data.user.profile) {
          setProfileData({
            nickname: data.user.profile.nickname || "",
            bio: data.user.profile.bio || "",
            website: data.user.profile.website || "",
            email: data.user.profile.email || "",
            profilePicture: data.user.profile.profilePicture || "",
            peopleWorkedWith: data.user.profile.peopleWorkedWith || 0,
            joinedDate: new Date(data.user.createdAt)
              .toISOString()
              .split("T")[0],
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userIdentifier]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "image/jpeg" || file.type === "image/png") {
        setSelectedFile(file);
        setProfileData((prev) => ({
          ...prev,
          profilePicture: URL.createObjectURL(file),
        }));
      } else {
        alert("Please select a JPEG or PNG image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !address) return;

    const formData = new FormData();
    formData.append("address", address);
    formData.append("profileData", JSON.stringify(profileData));
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    const message = `Update profile for ${address} with data: ${JSON.stringify(
      profileData
    )}`;
    try {
      const signature = await signMessageAsync({ message });
      formData.append("signature", signature);
      formData.append("message", message);

      const response = await fetch("/api/updateProfile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully");
        if (result.profilePictureUrl) {
          setProfileData((prev) => ({
            ...prev,
            profilePicture: result.profilePictureUrl,
          }));
        }
        setSelectedFile(null);
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (isLoading) {
    // Replace with your own loading indicator if Spinner is not available
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">
        {displayName}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile picture section */}
        <div>
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Profile Picture
          </label>
          <div className="mt-1 flex items-center">
            <div className="relative group">
              <Image
                src={profileData.profilePicture || "/default-profile.jpg"}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full"
              />
              {isOwnProfile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer text-white"
                  >
                    Change
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other form fields */}
        {/* ... (nickname, bio, website, email inputs) ... */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("profile.peopleWorkedWith")}
            </label>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {profileData.peopleWorkedWith}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("profile.joined")}
            </label>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {profileData.joinedDate}
            </p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("profile.save")}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;
