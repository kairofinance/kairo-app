"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import AddressDisplay from "@/components/shared/AddressDisplay";
import { formatRelativeTime } from "@/utils/date-format";
import {
  LockClosedIcon,
  LockOpenIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

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

const tokenDecimals: { [key: string]: number } = {
  USDC: 6,
  DAI: 18,
  ETH: 18,
};

function getTokenSymbol(tokenAddress: string): string {
  const tokenMap: { [key: string]: string } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "USDC",
    "0x552ceaDf3B47609897279F42D3B3309B604896f3": "DAI",
  };
  return tokenMap[tokenAddress] || "Unknown";
}

function formatAmount(amount: string, tokenAddress: string): string {
  const token = getTokenSymbol(tokenAddress);
  const decimals = tokenDecimals[token] || 18;
  const formattedAmount = formatUnits(BigInt(amount), decimals);
  const wholeNumber = parseInt(formattedAmount).toLocaleString();
  return `${wholeNumber} ${token || "Unknown"}`;
}

function calculateProgress(vestedAmount: string, totalAmount: string): number {
  const vested = parseFloat(vestedAmount);
  const total = parseFloat(totalAmount);
  return (vested / total) * 100;
}

function getVestingStatus(schedule: VestingSchedule): {
  status: "locked" | "vesting" | "completed";
  label: string;
} {
  const now = Date.now();
  const cliffEnd = new Date(schedule.cliffEnd).getTime();
  const endTime = new Date(schedule.endTime).getTime();

  if (now < cliffEnd) {
    return { status: "locked", label: "Locked" };
  } else if (now >= endTime) {
    return { status: "completed", label: "Completed" };
  } else {
    return { status: "vesting", label: "Vesting" };
  }
}

function VestingStatus({ status, label }: { status: string; label: string }) {
  const getStatusIcon = () => {
    switch (status) {
      case "locked":
        return <LockClosedIcon className="w-3 h-3" />;
      case "vesting":
        return (
          <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
        );
      case "completed":
        return <LockOpenIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-white/60 text-[13px]">
      {getStatusIcon()}
      <span>{label}</span>
    </div>
  );
}

// Mock data for development
const mockSchedules: VestingSchedule[] = [
  {
    id: "1",
    scheduleId: "1",
    amount: "10000000000", // 10,000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    issuerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    beneficiaryAddress: "0x123d35Cc6634C0532925a3b844Bc454e4438f123",
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    cliffEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    initialRelease: 10,
    vestedAmount: "2000000000",
    claimableAmount: "1000000000",
    remainingAmount: "8000000000",
  },
  // Add more mock schedules as needed
];

export default function VestingList({
  schedules: providedSchedules,
  isLoading,
  view,
}: VestingListProps) {
  const schedules = providedSchedules?.length
    ? providedSchedules
    : mockSchedules;

  const handleClaim = async (scheduleId: string) => {
    console.log(`Claiming from schedule ${scheduleId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-white/[0.08] p-4"
          >
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-full" />
                <div className="h-5 w-32 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!schedules?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-white/40">No {view} vesting schedules found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => {
        const vestingStatus = getVestingStatus(schedule);

        return (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={`/vesting/${schedule.scheduleId}`}
              className="block group"
            >
              <div className="relative overflow-hidden rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={`/tokens/${getTokenSymbol(
                          schedule.tokenAddress
                        )}.png`}
                        alt={getTokenSymbol(schedule.tokenAddress)}
                        width={26}
                        height={26}
                        className="rounded-full"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-white/90 truncate">
                            {formatAmount(
                              schedule.amount,
                              schedule.tokenAddress
                            )}
                          </span>
                          <VestingStatus
                            status={vestingStatus.status}
                            label={vestingStatus.label}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-white/40 mt-0.5">
                          <span>{view === "incoming" ? "from" : "to"}</span>
                          <AddressDisplay
                            address={
                              view === "incoming"
                                ? schedule.issuerAddress
                                : schedule.beneficiaryAddress
                            }
                            className="text-white/60 hover:text-white/80 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                      {view === "incoming" &&
                        parseFloat(schedule.claimableAmount) > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleClaim(schedule.scheduleId);
                            }}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full 
                            text-[13px] font-medium
                            bg-orange-600/10 hover:bg-orange-600/20
                            text-orange-600/90 hover:text-orange-500
                            border border-orange-600/20 hover:border-orange-600/30
                            transition-all duration-200"
                          >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                            <span>Claim</span>
                          </button>
                        )}
                      <ChevronRightIcon className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-600/40 transition-all duration-300"
                        style={{
                          width: `${calculateProgress(
                            schedule.vestedAmount,
                            schedule.amount
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[13px]">
                      <span className="text-white/40">
                        {formatAmount(
                          schedule.vestedAmount,
                          schedule.tokenAddress
                        )}{" "}
                        vested
                      </span>
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
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
