"use client";

import React, { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowPathIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { formatUnits } from "viem";
import { useTeamContext } from "@/contexts/TeamContext";

interface Activity {
  id: string;
  type: "stream" | "vest" | "invoice";
  amount: string;
  tokenAddress: string;
  status: "active" | "paused" | "completed";
  counterpartyAddress: string;
  endDate?: string;
  streamRate?: string;
  cliffDate?: string;
  dueDate?: string;
  isIncoming: boolean;
  teamId?: string;
}

interface Position {
  x: number;
  y: number;
  isIncoming: boolean;
}

// Move these helper functions outside
const getActivityPositions = (activities: Activity[]): Position[] => {
  if (activities.length === 0) return [];

  const baseRadius = 180;
  const positions: Position[] = [];

  // Separate incoming and outgoing activities
  const incomingActivities = activities.filter((a: Activity) => a.isIncoming);
  const outgoingActivities = activities.filter((a: Activity) => !a.isIncoming);

  // Calculate angles for balanced distribution
  const incomingAngles = generateAngles(incomingActivities.length, 90, 270); // Left half
  const outgoingAngles = generateAngles(outgoingActivities.length, -90, 90); // Right half

  // Position incoming activities
  incomingActivities.forEach((_: Activity, index: number) => {
    const angle = incomingAngles[index];
    const layer = Math.floor(index / 4);
    const radius = baseRadius + layer * 60;
    const angleInRadians = (angle * Math.PI) / 180;

    positions.push({
      x: radius * Math.cos(angleInRadians),
      y: radius * Math.sin(angleInRadians),
      isIncoming: true,
    });
  });

  // Position outgoing activities
  outgoingActivities.forEach((_: Activity, index: number) => {
    const angle = outgoingAngles[index];
    const layer = Math.floor(index / 4);
    const radius = baseRadius + layer * 60;
    const angleInRadians = (angle * Math.PI) / 180;

    positions.push({
      x: radius * Math.cos(angleInRadians),
      y: radius * Math.sin(angleInRadians),
      isIncoming: false,
    });
  });

  return positions;
};

const generateAngles = (
  count: number,
  startAngle: number,
  endAngle: number
): number[] => {
  if (count === 0) return [];
  if (count === 1) return [(startAngle + endAngle) / 2];

  const step = (endAngle - startAngle) / (count - 1);
  return Array.from({ length: count }, (_, i: number) => startAngle + step * i);
};

const getPathToActivity = (x: number, y: number, isIncoming: boolean) => {
  const midX = x * 0.5;
  const midY = y * 0.5;

  // Add slight curve based on direction
  const curveOffset = isIncoming ? -20 : 20;
  const controlX = midX + curveOffset * Math.sign(x);
  const controlY = midY + curveOffset * Math.sign(y);

  return `M 0,0 Q ${controlX},${controlY} ${x},${y}`;
};

// Filter out invoices from the mindmap activities
const getVisualActivities = (activities: Activity[]) => {
  return activities.filter(
    (activity) => activity.type === "stream" || activity.type === "vest"
  );
};

// Add this type for hover details
interface HoverDetails {
  x: number;
  y: number;
  activity: Activity | null;
}

export default function ViewClient() {
  const { address } = useAppKitAccount();
  const { selectedTeamId } = useTeamContext();
  const [view, setView] = useState<"incoming" | "outgoing">("incoming");
  const [hoverDetails, setHoverDetails] = useState<HoverDetails | null>(null);

  // Move the query inside the component
  const { data, isLoading } = useQuery({
    queryKey: ["activities", address, view, selectedTeamId],
    queryFn: async () => {
      if (!address) return { activities: [] };

      try {
        const response = await fetch(
          `/api/flows/active?address=${address}&type=${view}${
            selectedTeamId ? `&teamId=${selectedTeamId}` : ""
          }`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch activities");
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.activities)) {
          console.warn("Unexpected response format:", data);
          return { activities: [] };
        }

        return data;
      } catch (error) {
        console.error("Error fetching activities:", error);
        return { activities: [] };
      }
    },
    enabled: !!address,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    placeholderData: { activities: [] },
  });

  // Get the filtered activities for the visual
  const visualActivities = data?.activities
    ? data.activities.filter(
        (activity: Activity) =>
          activity.type === "stream" || activity.type === "vest"
      )
    : [];

  // Add function to format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Add SVG definitions as a component
  const SvgDefs = () => (
    <defs>
      <linearGradient id="incomingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.1)" />
        <stop offset="50%" stopColor="rgba(16, 185, 129, 0.5)" />
        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
      </linearGradient>
      <linearGradient id="outgoingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
        <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
      </linearGradient>
    </defs>
  );

  // Add ActivityPath component for the path rendering
  const ActivityPath = ({
    position,
    activity,
  }: {
    position: any;
    activity: Activity;
  }) => (
    <path
      d={getPathToActivity(position.x, position.y, activity.isIncoming)}
      fill="none"
      stroke={`url(#${
        activity.isIncoming ? "incomingGradient" : "outgoingGradient"
      })`}
      strokeWidth="4"
      filter="url(#glow)"
      strokeDasharray="6,3"
      className="transition-all duration-300 group-hover:stroke-[8] group-hover:stroke-opacity-75"
    >
      <animate
        attributeName="stroke-dashoffset"
        values={activity.isIncoming ? "12;0" : "0;12"}
        dur="0.75s"
        repeatCount="indefinite"
      />
    </path>
  );

  if (!address) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-black font-garet font-extrabold text-zinc-500">
              error
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">$</span>
                <span className="text-sm font-jetbrains text-red-500">
                  wallet_not_connected
                </span>
              </div>
              <p className="text-sm font-jetbrains text-white/60 pl-4">
                Please connect your wallet to view your activities
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-5">
      <div className="max-w-6xl mx-auto space-y-12 p-9">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-white">
                Active Flows
              </h2>
              <span className="px-2 py-1 rounded-full bg-white/[0.02] text-sm text-white/60">
                {data?.activities?.length || 0} total
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView("incoming")}
                className={`flex items-center gap-2 px-3 py-2 text-sm
                  ${
                    view === "incoming"
                      ? "text-emerald-500 bg-emerald-500/10"
                      : "text-white/60 bg-white/[0.02]"
                  }
                  hover:bg-white/[0.04] rounded-lg transition-all duration-200`}
              >
                Incoming
              </button>
              <button
                onClick={() => setView("outgoing")}
                className={`flex items-center gap-2 px-3 py-2 text-sm
                  ${
                    view === "outgoing"
                      ? "text-emerald-500 bg-emerald-500/10"
                      : "text-white/60 bg-white/[0.02]"
                  }
                  hover:bg-white/[0.04] rounded-lg transition-all duration-200`}
              >
                Outgoing
              </button>
            </div>
          </div>

          {/* Mindmap Visual */}
          <div className="relative h-[600px] rounded-lg bg-gradient-to-b from-white/[0.02] to-transparent mb-12 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />

              <div className="relative w-full h-full flex items-center justify-center">
                {/* SVG Container for paths */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  style={{ transform: "translate(50%, 50%)" }}
                >
                  <SvgDefs />

                  <defs>
                    <filter
                      id="glow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feFlood
                        floodColor="white"
                        floodOpacity="0.2"
                        result="glowColor"
                      />
                      <feComposite
                        in="glowColor"
                        in2="coloredBlur"
                        operator="in"
                        result="softGlow"
                      />
                      <feMerge>
                        <feMergeNode in="softGlow" />
                        <feMergeNode in="softGlow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {visualActivities.map((activity: Activity, index: number) => {
                    const position = getActivityPositions(
                      visualActivities.length
                    )[index];
                    const pathId = `path-${activity.id}`;
                    return (
                      <g
                        key={pathId}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoverDetails({
                            x: rect.left + window.scrollX,
                            y: rect.top + window.scrollY,
                            activity,
                          });
                        }}
                        onMouseLeave={() => setHoverDetails(null)}
                        className="cursor-pointer group"
                      >
                        <ActivityPath position={position} activity={activity} />

                        {[...Array(3)].map((_, i) => (
                          <circle
                            key={`particle-${activity.id}-${i}`}
                            r={2 - i * 0.5}
                            fill="white"
                            opacity={0.8 - i * 0.2}
                            filter="url(#glow)"
                          >
                            <animateMotion
                              dur={`${1 + i * 0.2}s`}
                              begin={`-${i * 0.3}s`}
                              repeatCount="indefinite"
                              path={getPathToActivity(
                                position.x,
                                position.y,
                                activity.isIncoming
                              )}
                              rotate="auto"
                              keyPoints="1;0"
                              keyTimes="0;1"
                              calcMode="linear"
                            />
                          </circle>
                        ))}
                      </g>
                    );
                  })}
                </svg>

                {/* Activity nodes with updated labels */}
                {visualActivities.map((activity: Activity, index: number) => {
                  const position = getActivityPositions(
                    visualActivities.length
                  )[index];
                  return (
                    <motion.div
                      key={`node-${activity.id}`}
                      className="absolute cursor-pointer"
                      style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Link href={`/${activity.type}/${activity.id}`}>
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                          <div
                            className="w-14 h-14 rounded-full 
                                        bg-white/[0.03] hover:bg-white/[0.06]
                                        border border-white/20
                                        flex items-center justify-center
                                        backdrop-blur-sm overflow-hidden
                                        transition-all duration-200"
                          >
                            <Image
                              src={`https://cdn.stamp.fyi/avatar/${activity.counterpartyAddress}?s=56`}
                              alt={`${activity.counterpartyAddress}`}
                              width={56}
                              height={56}
                              className="object-cover"
                            />
                          </div>

                          {/* Updated Activity details */}
                          <div className="absolute mt-2 text-xs whitespace-nowrap left-1/2 -translate-x-1/2 space-y-1">
                            <span className="block font-medium text-white/60">
                              {formatAddress(activity.counterpartyAddress)}
                            </span>
                            <span className="block font-medium text-white/40">
                              {formatUnits(BigInt(activity.amount), 6)} USDC
                            </span>
                          </div>

                          {/* Updated Flow type indicator */}
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.02]">
                            <span
                              className={`
                                ${
                                  activity.type === "stream"
                                    ? "text-emerald-500/60"
                                    : ""
                                }
                                ${
                                  activity.type === "vest"
                                    ? "text-blue-500/60"
                                    : ""
                                }
                              `}
                            >
                              {activity.type === "stream"
                                ? "Stream"
                                : "Vesting"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Center user node */}
                <motion.div
                  className="absolute z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute rounded-full border border-white/20"
                      style={{ inset: "-8px" }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <Image
                      src={`https://cdn.stamp.fyi/avatar/${address}?s=50`}
                      alt="User"
                      width={56}
                      height={56}
                      className="rounded-full border border-white/20 relative z-10"
                    />
                  </div>
                </motion.div>

                {/* Hover Details Tooltip */}
                {hoverDetails && hoverDetails.activity && (
                  <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                      left: `${hoverDetails.x}px`,
                      top: `${hoverDetails.y - 80}px`,
                    }}
                  >
                    <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 shadow-xl">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">
                            {view === "incoming" ? "From" : "To"}:
                          </span>
                          <span className="text-xs font-medium text-white">
                            {formatAddress(
                              hoverDetails.activity.counterpartyAddress
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Amount:</span>
                          <span className="text-xs font-medium text-white">
                            {formatUnits(
                              BigInt(hoverDetails.activity.amount),
                              6
                            )}{" "}
                            USDC
                          </span>
                        </div>
                        {hoverDetails.activity.type === "stream" &&
                          hoverDetails.activity.streamRate && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/40">
                                Rate:
                              </span>
                              <span className="text-xs font-medium text-white">
                                {hoverDetails.activity.streamRate} USDC/hr
                              </span>
                            </div>
                          )}
                        {hoverDetails.activity.type === "vest" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40">
                              Cliff:
                            </span>
                            <span className="text-xs font-medium text-white">
                              {new Date(
                                hoverDetails.activity.cliffDate || ""
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Invoices Section */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-black font-garet font-extrabold text-zinc-500">
            {selectedTeamId ? "team invoices" : "pending invoices"}
          </h2>

          {/* Invoices List */}
          <div className="space-y-4">
            {data?.activities
              .filter((activity: Activity) => activity.type === "invoice")
              .map((invoice: Activity) => (
                <Link
                  key={invoice.id}
                  href={`/invoice/${invoice.id}`}
                  className="block group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4
                             bg-white/[0.02] hover:bg-white/[0.04] 
                             rounded-lg transition-all duration-200"
                  >
                    {/* Left Section */}
                    <div className="flex items-center gap-6">
                      {/* Profile Picture */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                        <Image
                          src={`https://cdn.stamp.fyi/avatar/${invoice.counterpartyAddress}?s=40`}
                          alt={invoice.counterpartyAddress}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-2">
                        <Image
                          src="/tokens/USDC.png"
                          alt="USDC"
                          width={16}
                          height={16}
                          className="opacity-80"
                        />
                        <span className="text-sm text-white/80">
                          {formatUnits(BigInt(invoice.amount), 6)} USDC
                        </span>
                      </div>

                      {/* Counterparty */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/40">
                          {view === "incoming" ? "from" : "to"}
                        </span>
                        <span className="text-sm text-white/60">
                          {`${invoice.counterpartyAddress.slice(
                            0,
                            6
                          )}...${invoice.counterpartyAddress.slice(-4)}`}
                        </span>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                      {/* Due Date Badge */}
                      <div className="px-2 py-1 rounded-full text-xs text-orange-500/60 bg-orange-500/[0.08]">
                        Due{" "}
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "No due date"}
                      </div>

                      {/* Direction Indicator */}
                      <div className="text-sm text-white/40">
                        {view === "incoming" ? "←" : "→"}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}

            {/* Empty State - Updated to show context */}
            {!data?.activities.some((a: Activity) => a.type === "invoice") && (
              <div className="flex items-center justify-center py-12 text-white/40">
                No {selectedTeamId ? "team" : "pending"} invoices
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
