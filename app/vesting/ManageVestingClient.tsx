"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { XCircleIcon } from "@heroicons/react/24/solid";
import VestingList from "./components/VestingList";
import ToggleView from "@/components/shared/ToggleView";
import SectionHeader from "@/components/shared/ui/SectionHeader";

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: custom * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function ManageVestingClient() {
  const { address } = useAppKitAccount();
  const [view, setView] = useState<"incoming" | "outgoing">("incoming");

  const { data: vestingSchedules, isLoading } = useQuery({
    queryKey: ["active-vesting", address, view],
    queryFn: async () => {
      if (!address) return { schedules: [] };
      const response = await fetch(
        `/api/vesting/active?address=${address}&type=${view}`
      );
      if (!response.ok) throw new Error("Failed to fetch vesting schedules");
      return response.json();
    },
    enabled: !!address,
  });

  if (!address) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-8 text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-orange-600/90" />
            <h3 className="mt-2 text-lg font-medium text-white/90">
              Wallet Not Connected
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Please connect your wallet to view your vesting schedules
            </p>
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/[0.02] via-transparent to-transparent opacity-50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={fadeInVariant}
          custom={0}
        >
          <SectionHeader
            title="Active Vesting Schedules"
            description="Manage your token vesting schedules"
          >
            <ToggleView view={view} onChange={setView} />
          </SectionHeader>

          {/* Vesting List */}
          <div className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-6 group">
            <VestingList
              schedules={vestingSchedules?.schedules || []}
              isLoading={isLoading}
              view={view}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
