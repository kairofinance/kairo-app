"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccount, useEnsName, useSignMessage } from "wagmi";
import { verifyMessage } from "viem";
import Image from "next/image";
import { User, Profile } from "@prisma/client";
import useTranslation from "next-translate/useTranslation";
import Spinner from "@/components/Spinner";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useAlert } from "@/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import Settings from "./Modals/Settings";
import { CogIcon } from "@heroicons/react/24/outline";

interface ProfileClientProps {
  address: string;
  ensName: string | null;
  dictionary: any;
  lang: string;
}

type UserWithProfile = User & { profile: Profile | null };

const ProfileClient: React.FC<ProfileClientProps> = ({
  address,
  ensName: initialEnsName,
  dictionary,
  lang,
}) => {
  const { address: connectedAddress } = useAccount();
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation("common");
  const [profileData, setProfileData] = useState({
    nickname: "",
    username: "",
    bio: "",
    website: "",
    email: "",
    profilePicture: "/default-profile.png",
    peopleWorkedWith: 0,
    joinedDate: "",
  });
  const isOwnProfile = connectedAddress === address;
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfileData, setEditedProfileData] = useState({
    nickname: "",
    username: "",
    bio: "",
    website: "",
    email: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { signMessageAsync } = useSignMessage();
  const { alertState, showAlert, dismissAlert } = useAlert();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch ENS name if not provided
  const { data: fetchedEnsName, isLoading: isEnsLoading } = useEnsName({
    address: address as `0x${string}`,
  });

  const ensName = initialEnsName || fetchedEnsName || null;

  const profileFetchedRef = useRef(false);
  const initialProfileDataRef = useRef<typeof profileData | null>(null);
  const addressRef = useRef(address);
  const langRef = useRef(lang);

  useEffect(() => {
    console.log("ProfileClient useEffect triggered");
    const fetchUserProfile = async () => {
      if (profileFetchedRef.current) {
        console.log("Profile already fetched, skipping");
        return;
      }

      console.log("Fetching user profile");
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/getProfile?addressOrEns=${addressRef.current}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received user data:", data);
        setUser(data.user);

        if (data.user.profile) {
          const profile = data.user.profile;
          const newProfileData = {
            nickname: profile.nickname || "",
            username: profile.username || "",
            bio: profile.bio || "",
            website: profile.website || "",
            email: profile.email || "",
            profilePicture: profile.profilePicture || "/default-profile.png",
            peopleWorkedWith: profile.peopleWorkedWith || 0,
            joinedDate: new Date(data.user.createdAt).toLocaleDateString(
              langRef.current
            ),
          };
          setProfileData(newProfileData);
          setEditedProfileData({
            nickname: newProfileData.nickname,
            username: newProfileData.username,
            bio: newProfileData.bio,
            website: newProfileData.website,
            email: newProfileData.email,
          });
          initialProfileDataRef.current = newProfileData;
        } else {
          // If there's no profile, set default values
          const defaultValues = {
            nickname: "",
            username: "",
            bio: "",
            website: "",
            email: "",
            profilePicture: "/default-profile.png",
            peopleWorkedWith: 0,
            joinedDate: new Date(data.user.createdAt).toLocaleDateString(
              langRef.current
            ),
          };
          setProfileData(defaultValues);
          setEditedProfileData({
            nickname: "",
            username: "",
            bio: "",
            website: "",
            email: "",
          });
          initialProfileDataRef.current = defaultValues;
        }
        profileFetchedRef.current = true;
        console.log("Profile fetched and set");
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []); // Empty dependency array

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setImageError("Please select a JPG or PNG image.");
        return;
      }
      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setImageError("Image size should not exceed 1MB.");
        return;
      }

      // File is valid, clear any previous errors
      setImageError(null);

      // Create a URL for the file and update the profileData
      const imageUrl = URL.createObjectURL(file);
      setProfileData((prevData) => ({
        ...prevData,
        profilePicture: imageUrl,
      }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      setError("Please connect your wallet to update your profile.");
      return;
    }

    console.log("Submitting profile update");
    try {
      const message = `Update profile for ${connectedAddress}`;
      const signature = await signMessageAsync({ message });

      const dataToSend = {
        ...editedProfileData,
        address: connectedAddress,
        signature,
        message,
      };

      console.log("Sending data to update profile:", dataToSend);

      const response = await fetch("/api/updateProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log("Profile updated successfully:", result);
      setProfileData((prev) => ({
        ...prev,
        ...editedProfileData,
      }));
      showAlert("Profile updated successfully", "success");
    } catch (error) {
      console.error("Detailed error updating profile:", error);
      showAlert(
        `Failed to update profile: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "error"
      );
    }
  };

  if (isLoading || isEnsLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <>
      {alertState && (
        <AlertMessage
          message={alertState.message}
          type={alertState.type}
          onDismiss={dismissAlert}
        />
      )}
      <div className="mx-auto relative max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="absolute top-2 right-2">
          {isOwnProfile && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CogIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              {t("Settings")}
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile picture section */}
          <div>
            <div className="mt-1 flex items-center">
              <div className="relative group">
                <Image
                  src={profileData.profilePicture || "/default-profile.png"}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full"
                />
                <h1 className="text-xl font-bold mt-5 text-zinc-900 dark:text-zinc-100">
                  {profileData.nickname}
                </h1>
                <h2 className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                  @{profileData.username}
                </h2>
                <p className="text-base mt-4 text-zinc-800 dark:text-zinc-100">
                  {profileData.bio || "No bio available"}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {imageError && (
              <p className="mt-2 text-sm text-red-500">{imageError}</p>
            )}
          </div>

          {/* Other form fields */}
          {/* ... (nickname, bio, website, email inputs) ... */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {profileData.peopleWorkedWith}{" "}
                <span className="text-zinc-800 dark:text-zinc-300">
                  {" " + t("worked with")}
                </span>
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
        </form>
      </div>
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profileData={profileData}
        editedProfileData={editedProfileData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        fileInputRef={fileInputRef}
        t={t}
      />
    </>
  );
};

export default ProfileClient;
