"use client";

import Image from "next/image";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (formData: any) => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleBannerFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
}: SettingsProps) {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(editedProfileData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute left-0 top-0 hidden pl-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white dark:bg-zinc-800 text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-zinc-900 dark:text-white"
                >
                  Account Settings
                </DialogTitle>
                <div className="mt-2">
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="col-span-full flex items-center gap-x-8">
                      {profileData.profilePicture &&
                        profileData.profilePicture !==
                          "/default-profile.png" && (
                          <div className="relative w-24 h-24">
                            <Image
                              src={profileData.profilePicture.replace(
                                /^\//,
                                ""
                              )} // Remove leading slash if present
                              alt="Profile"
                              fill
                              style={{ objectFit: "cover" }}
                              className="rounded-full"
                            />
                          </div>
                        )}
                      <div>
                        <button
                          type="button"
                          className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change avatar
                        </button>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">
                          JPG or PNG. 2MB max.
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/jpeg,image/png"
                        />
                      </div>
                    </div>

                    <div className="col-span-full flex items-center gap-x-8">
                      {profileData.bannerPicture &&
                        profileData.bannerPicture !== "/default-banner.png" && (
                          <div className="relative w-48 h-24">
                            <Image
                              src={profileData.bannerPicture.replace(/^\//, "")} // Remove leading slash if present
                              alt="Banner"
                              fill
                              style={{ objectFit: "cover" }}
                              className="rounded-md"
                            />
                          </div>
                        )}
                      <div>
                        <button
                          type="button"
                          className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                          onClick={() => bannerFileInputRef.current?.click()}
                        >
                          Change banner
                        </button>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">
                          JPG or PNG. 2MB max.
                        </p>
                        <input
                          type="file"
                          ref={bannerFileInputRef}
                          onChange={handleBannerFileChange}
                          className="hidden"
                          accept="image/jpeg,image/png"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Username
                      </label>
                      <div className="mt-2">
                        <input
                          id="username"
                          name="username"
                          type="text"
                          value={editedProfileData.username}
                          onChange={handleInputChange}
                          className="block w-full rounded-md px-2 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Bio
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={editedProfileData.bio}
                          onChange={handleInputChange}
                          className="block w-full rounded-md px-2 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6 resize-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="link"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Profile Link
                      </label>
                      <div className="mt-2">
                        <input
                          id="link"
                          name="link"
                          type="url"
                          value={editedProfileData.link}
                          onChange={handleInputChange}
                          className="block w-full rounded-md px-2 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:ml-3 sm:w-auto"
                      >
                        {t("Save")}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
