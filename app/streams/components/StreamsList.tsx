"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/utils/date-format";

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
const mockStreams: Stream[] = [
  {
    id: "1",
    streamId: "1",
    amount: "1000000000", // 1,000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
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
    amount: "5000000000", // 5,000 USDC
    tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    senderAddress: "0x892d35Cc6634C0532925a3b844Bc454e4438f892",
    recipientAddress: "0x123d35Cc6634C0532925a3b844Bc454e4438f123",
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), // 36h from now
    isPaused: true,
    streamedAmount: "1000000000", // 1,000 USDC streamed
    remainingAmount: "4000000000", // 4,000 USDC remaining
  },
];

const calculateStreamProgress = (stream: Stream) => {
  const now = Date.now();
  const start = new Date(stream.startTime).getTime();
  const end = new Date(stream.endTime).getTime();
  const totalDuration = end - start;
  const elapsed = now - start;

  return {
    progress: Math.min((elapsed / totalDuration) * 100, 100),
    status: stream.isPaused ? "paused" : now >= end ? "completed" : "streaming",
  };
};

export default function StreamsList({
  streams: providedStreams,
  isLoading,
  view,
}: StreamsListProps) {
  // Use mock data if no streams provided
  const streams = providedStreams?.length ? providedStreams : mockStreams;

  if (isLoading) {
    return (
      <div className="font-jetbrains">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <span className="text-white/40 text-sm animate-pulse">
            loading_streams...
          </span>
        </div>
      </div>
    );
  }

  if (!streams?.length) {
    return (
      <div className="font-jetbrains">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <span className="text-white/40 text-sm">no_{view}_streams_found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {streams.map((stream) => {
        const streamProgress = calculateStreamProgress(stream);

        return (
          <Link
            key={stream.id}
            href={`/stream/${stream.streamId}`}
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
                    <span className="text-emerald-500 text-sm">stream</span>
                    <span className="text-white/40 text-sm">
                      #{stream.streamId}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Image
                      src={`/tokens/${getTokenSymbol(stream.tokenAddress)}.png`}
                      alt={getTokenSymbol(stream.tokenAddress)}
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                    <span className="text-sm text-white/80">
                      {formatAmount(stream.amount, stream.tokenAddress)}
                    </span>
                    <span className="text-sm text-white/40">
                      {getTokenSymbol(stream.tokenAddress)}
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
                        ? stream.senderAddress
                        : stream.recipientAddress}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        streamProgress.status === "paused"
                          ? "bg-orange-500"
                          : streamProgress.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-orange-500 animate-pulse"
                      }`}
                    />
                    <span className="text-sm text-white/40">
                      {formatRelativeTime(stream.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="mt-4 space-y-2">
                {/* Progress Bar */}
                <div className="relative h-1 bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full transition-all duration-300 ${
                      stream.isPaused
                        ? "bg-orange-500/40"
                        : "bg-gradient-to-r from-orange-600/40 via-orange-500/40 to-orange-600/40 bg-[length:200%_100%] animate-[streaming_4s_ease_infinite]"
                    }`}
                    style={{ width: `${streamProgress.progress}%` }}
                  />
                </div>

                {/* Progress Details */}
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/40">
                    {formatAmount(stream.streamedAmount, stream.tokenAddress)}{" "}
                    streamed
                  </span>
                  <span className="text-white/40">
                    {formatAmount(stream.remainingAmount, stream.tokenAddress)}{" "}
                    remaining
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
