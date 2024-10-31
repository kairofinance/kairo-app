"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccount, useEnsName, useSignMessage } from "wagmi";
import Image from "next/image";
import { User, Profile } from "@prisma/client";
import useTranslation from "next-translate/useTranslation";
import Spinner from "@/components/Spinner";
import { useAlert } from "@/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import Settings from "./modals/settings";
import { CogIcon, LinkIcon } from "@heroicons/react/24/outline";
import ImageCropModal from "./modals/ImageCropModal";
import { blobToFile, uploadImageToVercelBlob } from "@/utils/fileHelpers";

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
    username: "",
    bio: "",
    website: "",
    email: "",
    profilePicture: "/default-profile.png",
    bannerPicture: "/default-banner.png",
    peopleWorkedWith: 0,
    joinedDate: "",
    link: "",
  });
  const isOwnProfile = connectedAddress === address;
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfileData, setEditedProfileData] = useState({
    username: "",
    bio: "",
    website: "",
    email: "",
    link: "",
  });
  const { signMessageAsync } = useSignMessage();
  const { alertState, showAlert, dismissAlert } = useAlert();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: fetchedEnsName, isLoading: isEnsLoading } = useEnsName({
    address: address as `0x${string}`,
  });

  const ensName = initialEnsName || fetchedEnsName || null;

  const profileFetchedRef = useRef(false);
  const initialProfileDataRef = useRef<typeof profileData | null>(null);
  const addressRef = useRef(address);
  const langRef = useRef(lang);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (profileFetchedRef.current) return;

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
        if (!data.user) {
          throw new Error("User data not found in the response");
        }
        setUser(data.user);

        if (data.user.profile) {
          const profile = data.user.profile;
          const newProfileData = {
            username: profile.username || "",
            bio: profile.bio || "",
            website: profile.website || "",
            email: profile.email || "",
            profilePicture: profile.profilePicture || "/default-profile.png",
            bannerPicture: profile.bannerPicture || "/default-banner.png",
            peopleWorkedWith: profile.peopleWorkedWith || 0,
            joinedDate: new Date(data.user.createdAt).toLocaleDateString(
              langRef.current
            ),
            link: profile.link || "",
          };
          setProfileData(newProfileData);
          setEditedProfileData({
            username: newProfileData.username,
            bio: newProfileData.bio,
            website: newProfileData.website,
            email: newProfileData.email,
            link: newProfileData.link,
          });
          initialProfileDataRef.current = newProfileData;
        } else {
          const defaultValues = {
            username: "",
            bio: "",
            website: "",
            email: "",
            profilePicture: "/default-profile.png",
            bannerPicture: "/default-banner.png",
            peopleWorkedWith: 0,
            joinedDate: new Date(data.user.createdAt).toLocaleDateString(
              langRef.current
            ),
            link: "",
          };
          setProfileData(defaultValues);
          setEditedProfileData({
            username: "",
            bio: "",
            website: "",
            email: "",
            link: "",
          });
          initialProfileDataRef.current = defaultValues;
        }
        profileFetchedRef.current = true;
      } catch (error) {
        setError(
          `Failed to fetch user profile: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setImageError(`Please select a JPG or PNG image for the ${type}.`);
        return;
      }
      if (file.size > 20971520) {
        setImageError(
          `${
            type === "avatar" ? "Avatar" : "Banner"
          } image size should not exceed 20MB.`
        );
        return;
      }

      setImageError(null);

      const uploadedImageUrl = await uploadImageToVercelBlob(file);

      setProfileData((prevData) => ({
        ...prevData,
        [type === "avatar" ? "profilePicture" : "bannerPicture"]:
          uploadedImageUrl,
      }));
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!connectedAddress) {
      setError("Please connect your wallet to update your profile.");
      return;
    }

    try {
      const message = `Update profile for ${connectedAddress}`;
      const signature = await signMessageAsync({ message });

      const form = new FormData();
      form.append("address", connectedAddress);
      form.append("signature", signature);
      form.append("message", message);
      form.append("profileData", JSON.stringify(formData));

      const response = await fetch("/api/updateProfile", {
        method: "POST",
        body: form,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      setProfileData((prev) => ({
        ...prev,
        ...result.profile,
      }));
      setEditedProfileData(result.profile);
      showAlert("Profile updated successfully", "success");
    } catch (error) {
      showAlert(
        `Failed to update profile: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "error"
      );
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File(
        [blob],
        cropType === "avatar" ? "profile.png" : "banner.png",
        { type: "image/png" }
      );

      const uploadedImageUrl = await uploadImageToVercelBlob(file);

      setProfileData((prevData) => ({
        ...prevData,
        [cropType === "avatar" ? "profilePicture" : "bannerPicture"]:
          uploadedImageUrl,
      }));
    } catch (error) {
      setImageError("Failed to process the cropped image.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="text-center p-2 flex place-items-center mx-auto place-content-center bg-kairo-green-a80 border border-kairo-green-a20 text-kairo-black">
        <h2 className="text-lg font-bold mr-2">Error: </h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p>User not found. Please check the address and try again.</p>
      </div>
    );
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
      <div className="mx-auto relative max-w-3xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="relative">
          <div className="w-full shadow-md h-48 overflow-hidden relative">
            <Image
              src={profileData.bannerPicture || "/default-banner.png"}
              alt="Profile Banner"
              fill
              style={{ objectFit: "cover" }}
              quality={100}
              priority
            />
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <div className="-mt-[60px] flex relative items-center">
              <div className="absolute top-5 right-2 mt-[60px]">
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-semibold rounded-md text-kairo-black bg-kairo-green hover:bg-kairo-green-a60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kairo-green"
                  >
                    <CogIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    {t("Settings")}
                  </button>
                )}
              </div>
              <div className="relative group rounded-full ml-3">
                <Image
                  src={profileData.profilePicture || "/default-profile.png"}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full bg-kairo-black-a100 p-[1px]"
                />
                <h1 className="text-xl font-bold mt-5 text-kairo-black-a20 text-kairo-white">
                  {profileData.username || address}
                </h1>
                <h2 className="text-sm mt-1 font-medium text-kairo-black-a40 text-zinc-400">
                  @{address}
                </h2>
                <p className="text-base mt-4 text-zinc-800 text-kairo-white">
                  {profileData.bio || "No bio available"}
                </p>
                {profileData.link && (
                  <a
                    href={profileData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center mt-5 text-md text-kairo-green hover:text-kairo-green"
                  >
                    <LinkIcon className="h-5 w-5 mr-2 text-zinc-500" />
                    {new URL(profileData.link).hostname}
                  </a>
                )}
              </div>
            </div>
            {imageError && (
              <p className="mt-2 text-sm text-kairo-green">{imageError}</p>
            )}
          </div>
        </div>
      </div>
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profileData={profileData}
        editedProfileData={editedProfileData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleFileChange={(e) => handleFileChange(e, "avatar")}
        handleBannerFileChange={(e) => handleFileChange(e, "banner")}
        fileInputRef={fileInputRef}
        bannerFileInputRef={bannerFileInputRef}
        t={t}
      />
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={cropType === "avatar" ? 1 : 16 / 9}
        isProfilePicture={cropType === "avatar"}
      />
    </>
  );
};

export default ProfileClient;
