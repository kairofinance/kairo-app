import React, { useState, useEffect, useRef } from "react";
import { useAccount, useEnsName, useSignMessage } from "wagmi";
import Image from "next/image";
import { User, Profile } from "@prisma/client";
import useTranslation from "next-translate/useTranslation";
import Spinner from "@/components/Spinner";
import { useAlert } from "@/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import Settings from "../modals/settings";
import { CogIcon, LinkIcon } from "@heroicons/react/24/outline";
import ImageCropModal from "../modals/image-crop";
import { blobToFile, dataURLtoFile, isDataURL } from "@/utils/fileHelpers";
import type { ChangeEvent } from "react";

interface ProfileClientProps {
  address: string;
  ensName: string | null;
  dictionary: any;
  lang: string;
}

type UserWithProfile = User & { profile: Profile | null };

// Update the handleFileChange type
const handleFileChange = (
  e: ChangeEvent<HTMLInputElement>,
  type: "avatar" | "banner"
) => {
  const file = e.target.files?.[0];
  if (file) {
    // ... rest of the function
  }
};
