"use client";

import { useState, useEffect } from "react";
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
  editedProfileData: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
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
  t,
}: SettingsProps) {
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="col-span-full flex items-center gap-x-8">
                      <Image
                        src={
                          profileData.profilePicture || "/default-profile.png"
                        }
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                      <div>
                        <button
                          type="button"
                          className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change avatar
                        </button>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">
                          JPG or PNG. 1MB max.
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
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Email address
                      </label>
                      <div className="mt-2">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={editedProfileData.email}
                          onChange={handleInputChange}
                          className="block w-full rounded-md px-2 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
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
