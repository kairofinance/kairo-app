"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/utils/date-format";

interface VestingSchedule {
  id: string;
  scheduleId: string;
  amount: string;
  tokenAddress: string;
  issuerAddress: string;
  beneficiaryAddress: string;
  startTime: string;
  cliffEnd: string;
  endTime: string;
  initialRelease: number;
  vestedAmount: string;
  claimableAmount: string;
  remainingAmount: string;
}

interface VestingListProps {
  schedules?: VestingSchedule[];
  isLoading: boolean;
  view: "incoming" | "outgoing";
}

const getTokenSymbol = (tokenAddress: string): string => {
  const tokenMap: { [key: string]: string } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "USDC",
    "0x552ceaDf3B47609897279F42D3B3309B604896f3": "DAI",
  };
  return tokenMap[tokenAddress] || "Unknown";
};

const formatAmount = (amount: string, tokenAddress: string): string => {
  const token = getTokenSymbol(tokenAddress);
  const decimals = token === "USDC" ? 6 : 18;
  const formattedAmount = formatUnits(BigInt(amount), decimals);
  return parseFloat(formattedAmount).toLocaleString();
};

// Add mock data
const mockSchedules: VestingSchedule[] = [
  {
    id: "1",
    scheduleId: "1",
    amount: "10000000000", // 10,000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    issuerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    beneficiaryAddress: "0x123d35Cc6634C0532925a3b844Bc454e4438f123",
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    cliffEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    initialRelease: 10,
    vestedAmount: "2000000000",
    claimableAmount: "1000000000",
    remainingAmount: "8000000000",
  },
  {
    id: "2",
    scheduleId: "2",
    amount: "50000000000", // 50,000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    issuerAddress: "0x892d35Cc6634C0532925a3b844Bc454e4438f892",
    beneficiaryAddress: "0x123d35Cc6634C0532925a3b844Bc454e4438f123",
    startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    cliffEnd: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    endTime: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years from now
    initialRelease: 5,
    vestedAmount: "5000000000",
    claimableAmount: "2500000000",
    remainingAmount: "45000000000",
  },
];

const calculateVestingProgress = (schedule: VestingSchedule) => {
  const now = Date.now();
  const start = new Date(schedule.startTime).getTime();
  const cliff = new Date(schedule.cliffEnd).getTime();
  const end = new Date(schedule.endTime).getTime();
  const totalDuration = end - start;

  // Before cliff
  if (now < cliff) {
    return {
      status: "locked",
      progress: (schedule.initialRelease / 100) * 100, // Only show initial release
      cliffPosition: ((cliff - start) / totalDuration) * 100,
    };
  }

  // After end
  if (now >= end) {
    return {
      status: "completed",
      progress: 100,
      cliffPosition: ((cliff - start) / totalDuration) * 100,
    };
  }

  // During vesting
  const vestedPercentage = ((now - start) / totalDuration) * 100;
  return {
    status: "vesting",
    progress: Math.min(
      vestedPercentage + (schedule.initialRelease / 100) * 100,
      100
    ),
    cliffPosition: ((cliff - start) / totalDuration) * 100,
  };
};

export default function VestingList({
  schedules: providedSchedules,
  isLoading,
  view,
}: VestingListProps) {
  // Use mock data if no schedules provided
  const schedules = providedSchedules?.length
    ? providedSchedules
    : mockSchedules;

  if (isLoading) {
    return (
      <div className="font-jetbrains">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <span className="text-white/40 text-sm animate-pulse">
            loading_schedules...
          </span>
        </div>
      </div>
    );
  }

  if (!schedules?.length) {
    return (
      <div className="font-jetbrains">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <span className="text-white/40 text-sm">
            no_{view}_schedules_found
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {schedules.map((schedule) => {
        const vestingProgress = calculateVestingProgress(schedule);

        return (
          <Link
            key={schedule.id}
            href={`/vesting/${schedule.scheduleId}`}
            className="block group"
          >
            <div className="flex flex-col px-6 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 font-jetbrains">
              {/* Top Section */}
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                  {/* Command and ID */}
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="text-white/40 text-sm">$</span>
                    <span className="text-emerald-500 text-sm">vest</span>
                    <span className="text-white/40 text-sm">
                      #{schedule.scheduleId}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Image
                      src={`/tokens/${getTokenSymbol(
                        schedule.tokenAddress
                      )}.png`}
                      alt={getTokenSymbol(schedule.tokenAddress)}
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                    <span className="text-sm text-white/80">
                      {formatAmount(schedule.amount, schedule.tokenAddress)}
                    </span>
                    <span className="text-sm text-white/40">
                      {getTokenSymbol(schedule.tokenAddress)}
                    </span>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                  {/* Address */}
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">
                      {view === "incoming" ? "from" : "to"}
                    </span>
                    <span className="text-sm text-white/60">
                      {view === "incoming"
                        ? schedule.issuerAddress
                        : schedule.beneficiaryAddress}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        vestingProgress.status === "locked"
                          ? "bg-red-500"
                          : vestingProgress.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-orange-500 animate-pulse"
                      }`}
                    />
                    <span className="text-sm text-white/40">
                      {formatRelativeTime(schedule.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="mt-4 space-y-2">
                {/* Progress Bar */}
                <div className="relative h-1 bg-white/[0.03] rounded-full overflow-hidden">
                  {/* Initial Release */}
                  <div
                    className="absolute h-full bg-emerald-500/40 transition-all duration-300"
                    style={{ width: `${schedule.initialRelease}%` }}
                  />
                  {/* Vesting Progress */}
                  <div
                    className="absolute h-full bg-orange-600/40 transition-all duration-300"
                    style={{ width: `${vestingProgress.progress}%` }}
                  />
                  {/* Cliff Marker */}
                  <div
                    className="absolute h-full w-0.5 bg-white/20"
                    style={{ left: `${vestingProgress.cliffPosition}%` }}
                  />
                </div>

                {/* Progress Details */}
                <div className="flex justify-between text-[13px]">
                  <div className="flex items-center gap-4">
                    <span className="text-white/40">
                      {schedule.initialRelease}% initial
                    </span>
                    <span className="text-white/40">
                      {formatAmount(
                        schedule.vestedAmount,
                        schedule.tokenAddress
                      )}{" "}
                      vested
                    </span>
                  </div>
                  <span className="text-white/40">
                    {formatAmount(
                      schedule.claimableAmount,
                      schedule.tokenAddress
                    )}{" "}
                    claimable
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
