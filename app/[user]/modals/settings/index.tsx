import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ImageSection from "./ImageSection";
import ImageCropModal from "../ImageCropModal";
import type { ChangeEvent } from "react";
import React, { useState, useEffect } from "react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  editedProfileData: {
    username: string;
    bio: string;
    website: string;
    email: string;
    link: string;
  };
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (formData: any) => Promise<void>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleBannerFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  bannerFileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
}

export default function Settings({
  isOpen,
  onClose,
  profileData,
  editedProfileData,
  handleInputChange,
  handleSubmit,
  handleFileChange,
  fileInputRef,
  handleBannerFileChange,
  bannerFileInputRef,
  t,
}: SettingsProps): JSX.Element {
  const [localProfilePicture, setLocalProfilePicture] = useState<string>(
    profileData.profilePicture || "/default-profile.png"
  );
  const [localBannerPicture, setLocalBannerPicture] = useState<string>(
    profileData.bannerPicture || "/default-banner.png"
  );
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

  useEffect(() => {
    if (isOpen) {
      setLocalProfilePicture(
        profileData.profilePicture || "/default-profile.png"
      );
      setLocalBannerPicture(profileData.bannerPicture || "/default-banner.png");
    }
  }, [isOpen, profileData]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit({
      ...editedProfileData,
      profilePicture: localProfilePicture,
      bannerPicture: localBannerPicture,
    });
    onClose();
  };

  const handleLocalFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCropImageSrc(imageUrl);
      setCropType(type);
      setIsCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    fetch(croppedImageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          cropType === "avatar" ? "profile.png" : "banner.png",
          { type: "image/png" }
        );
        const newImageUrl = URL.createObjectURL(file);
        if (cropType === "avatar") {
          setLocalProfilePicture(newImageUrl);
        } else {
          setLocalBannerPicture(newImageUrl);
        }
      });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <div className="fixed inset-0 backdrop-blur-md transition-opacity" />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-kairo-black shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md text-kairo-white hover:text-kairo-green focus:outline-none focus:ring-2 focus:ring-kairo-green focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="bg-kairo-black-a20/50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title className="text-lg mb-10 font-medium leading-6 text-kairo-white">
                    Account Settings
                  </Dialog.Title>
                  <div className="mt-2">
                    <form onSubmit={onSubmit} className="space-y-6">
                      <ImageSection
                        type="avatar"
                        currentImage={localProfilePicture}
                        onImageClick={() => fileInputRef.current?.click()}
                        inputRef={fileInputRef}
                        onFileChange={(e) => handleLocalFileChange(e, "avatar")}
                      />
                      <ImageSection
                        type="banner"
                        currentImage={localBannerPicture}
                        onImageClick={() => bannerFileInputRef.current?.click()}
                        inputRef={bannerFileInputRef}
                        onFileChange={(e) => handleLocalFileChange(e, "banner")}
                      />
                      <div className="col-span-full">
                        <label
                          htmlFor="username"
                          className="block text-sm font-medium text-kairo-white"
                        >
                          Username
                        </label>
                        <div className="mt-1">
                          <input
                            id="username"
                            name="username"
                            type="text"
                            value={editedProfileData.username}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-kairo-black-a20 bg-kairo-black-a20 text-kairo-white shadow-sm focus:border-kairo-green focus:ring-kairo-green sm:text-sm px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-kairo-white"
                        >
                          Bio
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={editedProfileData.bio}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-kairo-black-a20 bg-kairo-black-a20 text-kairo-white shadow-sm focus:border-kairo-green focus:ring-kairo-green sm:text-sm px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label
                          htmlFor="link"
                          className="block text-sm font-medium text-kairo-white"
                        >
                          Profile Link
                        </label>
                        <div className="mt-1">
                          <input
                            id="link"
                            name="link"
                            type="url"
                            value={editedProfileData.link}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-kairo-black-a20 bg-kairo-black-a20 text-kairo-white shadow-sm focus:border-kairo-green focus:ring-kairo-green sm:text-sm px-3 py-2"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-kairo-green px-4 py-2 text-base font-medium text-kairo-white shadow-sm hover:bg-kairo-green-a20 focus:outline-none focus:ring-2 focus:ring-kairo-green focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {t("Save")}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-kairo-black-a20 bg-kairo-black-a40 px-4 py-2 text-base font-medium text-kairo-white shadow-sm hover:bg-kairo-black-a20 focus:outline-none focus:ring-2 focus:ring-kairo-green focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={onClose}
                        >
                          {t("Cancel")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={cropType === "avatar" ? 1 : 16 / 9}
        isProfilePicture={cropType === "avatar"}
      />
    </Dialog>
  );
}
