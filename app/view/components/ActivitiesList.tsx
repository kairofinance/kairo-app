"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowPathIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { formatUnits } from "viem";
import { formatRelativeTime } from "@/utils/date-format";

interface Activity {
  id: string;
  type: "invoice" | "stream" | "vest";
  amount: string;
  tokenAddress: string;
  status: string;
  counterpartyAddress: string;
  endDate?: string;
  dueDate?: string;
  streamRate?: string;
  cliffDate?: string;
  isIncoming: boolean;
}

interface ActivitiesListProps {
  activities: Activity[];
  isLoading: boolean;
  view: "incoming" | "outgoing";
}

const getTokenSymbol = (tokenAddress: string): string => {
  const tokenMap: { [key: string]: string } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "USDC",
  };
  return tokenMap[tokenAddress] || "Unknown";
};

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "invoice":
      return DocumentTextIcon;
    case "stream":
      return ArrowPathIcon;
    case "vest":
      return ClockIcon;
  }
};

const getActivityStatus = (activity: Activity) => {
  switch (activity.type) {
    case "invoice":
      return {
        label: "Due",
        date: activity.dueDate,
        className: "text-orange-500/60 bg-orange-500/[0.08]",
      };
    case "stream":
      return {
        label: "Ends",
        date: activity.endDate,
        className: "text-emerald-500/60 bg-emerald-500/[0.08]",
      };
    case "vest":
      return {
        label: "Cliff",
        date: activity.cliffDate,
        className: "text-blue-500/60 bg-blue-500/[0.08]",
      };
  }
};

export default function ActivitiesList({
  activities,
  isLoading,
  view,
}: ActivitiesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-white/[0.02] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="flex items-center justify-center py-12 bg-white/[0.02] rounded-lg border border-white/10">
        <div className="text-center">
          <p className="text-white/40">No active flows found</p>
        </div>
      </div>
    );
  }

  // Group activities by type
  const groupedActivities = activities.reduce(
    (acc, activity) => {
      acc[activity.type].push(activity);
      return acc;
    },
    { invoice: [], stream: [], vest: [] } as Record<
      Activity["type"],
      Activity[]
    >
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities).map(([type, items]) => {
        if (items.length === 0) return null;

        return (
          <div key={type} className="space-y-4">
            <h3 className="text-lg font-medium text-white capitalize">
              {type}s
            </h3>
            <div className="space-y-2">
              {items.map((activity) => {
                const Icon = getActivityIcon(activity.type as Activity["type"]);
                const status = getActivityStatus(activity);

                return (
                  <Link
                    key={activity.id}
                    href={`/${activity.type}/${activity.id}`}
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
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-lg bg-white/[0.02] 
                                      border border-white/10 flex items-center justify-center"
                        >
                          <Icon className="w-5 h-5 text-white/60" />
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-2">
                          <Image
                            src={`/tokens/${getTokenSymbol(
                              activity.tokenAddress
                            )}.png`}
                            alt={getTokenSymbol(activity.tokenAddress)}
                            width={16}
                            height={16}
                            className="opacity-80"
                          />
                          <span className="text-sm text-white/80">
                            {formatUnits(BigInt(activity.amount), 6)}{" "}
                            {getTokenSymbol(activity.tokenAddress)}
                          </span>
                        </div>

                        {/* Counterparty */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/40">
                            {view === "incoming" ? "from" : "to"}
                          </span>
                          <span className="text-sm text-white/60">
                            {`${activity.counterpartyAddress.slice(
                              0,
                              6
                            )}...${activity.counterpartyAddress.slice(-4)}`}
                          </span>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        {status.date && (
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${status.className}`}
                          >
                            {status.label} {formatRelativeTime(status.date)}
                          </div>
                        )}

                        <ChevronRightIcon className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
