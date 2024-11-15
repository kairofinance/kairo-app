"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import AddressDisplay from "@/components/shared/AddressDisplay";
import { formatRelativeTime } from "@/utils/date-format";
import {
  PauseIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

interface Stream {
  id: string;
  streamId: string;
  amount: string;
  tokenAddress: string;
  senderAddress: string;
  recipientAddress: string;
  startTime: string;
  endTime: string;
  isPaused: boolean;
  streamedAmount: string;
  remainingAmount: string;
}

interface StreamsListProps {
  streams?: Stream[];
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

function calculateProgress(
  streamedAmount: string,
  totalAmount: string
): number {
  const streamed = parseFloat(streamedAmount);
  const total = parseFloat(totalAmount);
  return (streamed / total) * 100;
}

function getRemainingTime(endTime: string): string {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const remaining = end - now;

  if (remaining <= 0) return "Ended";

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  }
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// Add mock data
const mockStreams: Stream[] = [
  {
    id: "1",
    streamId: "1",
    amount: "1000000000", // 1000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC
    senderAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    recipientAddress: "0x123d35Cc6634C0532925a3b844Bc454e4438f123",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h ago
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h from now
    isPaused: false,
    streamedAmount: "333000000", // 333 USDC streamed
    remainingAmount: "667000000", // 667 USDC remaining
  },
  {
    id: "2",
    streamId: "2",
    amount: "5000000000000000000000", // 5000 DAI
    tokenAddress: "0x552ceaDf3B47609897279F42D3B3309B604896f3", // DAI
    senderAddress: "0xEE644815E2693c7b2e5230ad924d127546C43207",
    recipientAddress: "0x456d35Cc6634C0532925a3b844Bc454e4438f456",
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), // 36h from now
    isPaused: true,
    streamedAmount: "1000000000000000000000", // 1000 DAI streamed
    remainingAmount: "4000000000000000000000", // 4000 DAI remaining
  },
  {
    id: "3",
    streamId: "3",
    amount: "2000000000", // 2000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC
    senderAddress: "0x789d35Cc6634C0532925a3b844Bc454e4438f789",
    recipientAddress: "0xEE644815E2693c7b2e5230ad924d127546C43207",
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48h ago
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
    isPaused: false,
    streamedAmount: "1500000000", // 1500 USDC streamed
    remainingAmount: "500000000", // 500 USDC remaining
  },
];

function WithdrawButton({
  stream,
  onWithdraw,
}: {
  stream: Stream;
  onWithdraw: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onWithdraw();
      }}
      className="flex items-center gap-2 px-4 py-1.5 rounded-full 
        text-[13px] font-medium
        bg-orange-600/10 hover:bg-orange-600/20
        text-orange-600/90 hover:text-orange-500
        border border-orange-600/20 hover:border-orange-600/30
        transition-all duration-200"
    >
      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
      <span>Withdraw</span>
    </button>
  );
}

function StreamStatus({ isPaused }: { isPaused: boolean }) {
  if (isPaused) {
    return (
      <div className="flex items-center gap-1.5 text-white/60 text-[13px]">
        <PauseIcon className="w-3 h-3" />
        <span>Paused</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-white/60 text-[13px]">
      <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
      <span>Streaming</span>
    </div>
  );
}

// Add this CSS keyframe at the top of the file, after the imports
const streamingAnimation = `
  @keyframes streaming {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export default function StreamsList({
  streams: providedStreams,
  isLoading,
  view,
}: StreamsListProps) {
  const streams = providedStreams?.length ? providedStreams : mockStreams;

  const handleWithdraw = async (streamId: string) => {
    console.log(`Withdrawing from stream ${streamId}`);
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

  if (!streams?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-white/40">No {view} streams active</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>
        {streamingAnimation}
      </style>
      <div className="space-y-3">
        {streams.map((stream) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/streams/${stream.streamId}`} className="block group">
              <div className="relative overflow-hidden rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={`/tokens/${getTokenSymbol(
                          stream.tokenAddress
                        )}.png`}
                        alt={getTokenSymbol(stream.tokenAddress)}
                        width={26}
                        height={26}
                        className="rounded-full"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-white/90 truncate">
                            {formatAmount(stream.amount, stream.tokenAddress)}
                          </span>
                          <StreamStatus isPaused={stream.isPaused} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-white/40 mt-0.5">
                          <span>{view === "incoming" ? "from" : "to"}</span>
                          <AddressDisplay
                            address={
                              view === "incoming"
                                ? stream.senderAddress
                                : stream.recipientAddress
                            }
                            className="text-white/60 hover:text-white/80 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                      {view === "incoming" && !stream.isPaused && (
                        <WithdrawButton
                          stream={stream}
                          onWithdraw={() => handleWithdraw(stream.streamId)}
                        />
                      )}
                      <ChevronRightIcon className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300
                          ${
                            !stream.isPaused
                              ? "bg-gradient-to-r from-orange-600/40 via-orange-500/40 to-orange-600/40 bg-[length:200%_100%]"
                              : "bg-orange-600/40"
                          }`}
                        style={{
                          width: `${calculateProgress(
                            stream.streamedAmount,
                            stream.amount
                          )}%`,
                          animation: !stream.isPaused
                            ? "streaming 4s ease infinite"
                            : "none",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[13px]">
                      <span className="text-white/40">
                        {formatAmount(
                          stream.streamedAmount,
                          stream.tokenAddress
                        )}{" "}
                        streamed
                      </span>
                      <span className="text-white/40">
                        {getRemainingTime(stream.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}
