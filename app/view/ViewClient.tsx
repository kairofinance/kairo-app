"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowPathIcon,
  ClockIcon,
  DocumentTextIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { formatUnits } from "viem";
import { useTeamContext } from "@/components/context/TeamContext";
import { formatRelativeTime } from "@/utils/date-format";
import Spinner from "@/components/Spinner";
import Card from "@/components/shared/ui/Card";
import ErrorDisplay from "@/components/shared/ui/ErrorDisplay";

interface Node {
  id: string;
  type: "stream" | "vest" | "invoice";
  amount: string;
  tokenAddress: string;
  status: "active" | "paused" | "completed";
  senderAddress: string;
  recipientAddress: string;
  counterpartyAddress: string;
  endDate?: string;
  streamRate?: string;
  cliffDate?: string;
  dueDate?: string;
  isIncoming: boolean;
  teamId?: string;
  team?: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

export default function ViewClient() {
  const { address } = useAppKitAccount();
  const { selectedTeam } = useTeamContext();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", address, selectedTeam?.id],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/flows/active?${new URLSearchParams({
            address: address || "",
            teamId: selectedTeam?.id || "",
          })}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        return response.json();
      } catch (error) {
        console.error("Error fetching activities:", error);
        return { streams: [], vests: [], invoices: [] };
      }
    },
    enabled: !!address,
  });

  // Group activities by type
  const groupedActivities = {
    streams: activities?.streams || [],
    vests: activities?.vests || [],
    invoices: activities?.invoices || [],
  };

  const ActivitySection = ({
    title,
    activities,
    type,
  }: {
    title: string;
    activities: Node[];
    type: string;
  }) => {
    // Group activities by date
    const groupedActivities = React.useMemo(() => {
      return activities.reduce((acc, activity) => {
        const date = new Date(
          activity.endDate ||
            activity.dueDate ||
            activity.cliffDate ||
            new Date()
        )
          .toISOString()
          .split("T")[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {} as Record<string, Node[]>);
    }, [activities]);

    // Sort dates in descending order
    const sortedDates = React.useMemo(() => {
      return Object.keys(groupedActivities).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );
    }, [groupedActivities]);

    const formatDate = (date: string) => {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date));
    };

    if (isLoading) {
      return (
        <div className="m-7">
          <Card title={title}>
            <div className="min-h-[200px] flex items-center justify-center">
              <Spinner />
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="m-7">
        <Card title={title}>
          {sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">No active {type}</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="px-5">
                <div className="mb-4">
                  <span className="text-sm font-medium text-white/40">
                    {formatDate(date)}
                  </span>
                </div>

                <div className="space-y-2">
                  {groupedActivities[date].map((activity, idx) => (
                    <Link
                      key={activity.id}
                      href={`/${activity.type}/${activity.id}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            {activity.type === "stream" && (
                              <ArrowPathIcon
                                className={`w-4 h-4 ${
                                  activity.isIncoming
                                    ? "text-emerald-500"
                                    : "text-blue-500"
                                }`}
                              />
                            )}
                            {activity.type === "vest" && (
                              <ClockIcon
                                className={`w-4 h-4 ${
                                  activity.isIncoming
                                    ? "text-emerald-500"
                                    : "text-blue-500"
                                }`}
                              />
                            )}
                            {activity.type === "invoice" && (
                              <DocumentTextIcon className="w-4 h-4 text-orange-500" />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                              {activity.team?.profilePicture ? (
                                <Image
                                  src={activity.team.profilePicture}
                                  alt={activity.team.name}
                                  width={24}
                                  height={24}
                                  className="object-cover"
                                />
                              ) : (
                                <Image
                                  src={`https://cdn.stamp.fyi/avatar/${activity.counterpartyAddress}?s=50`}
                                  alt={activity.counterpartyAddress}
                                  width={24}
                                  height={24}
                                  className="object-cover"
                                />
                              )}
                            </div>

                            <span className="text-sm text-white/90">
                              {activity.team && (
                                <span className="text-white/60">
                                  via {activity.team.name} •{" "}
                                </span>
                              )}
                              {activity.isIncoming
                                ? "Receiving from"
                                : "Sending to"}{" "}
                              {!activity.team &&
                                `${activity.counterpartyAddress.slice(
                                  0,
                                  6
                                )}...${activity.counterpartyAddress.slice(-4)}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-4 h-4 rounded-full overflow-hidden">
                            <Image
                              src="/tokens/USDC.png"
                              alt="USDC"
                              width={16}
                              height={16}
                              className="object-cover opacity-80"
                            />
                          </div>
                          <span className="text-sm font-medium text-white/90">
                            {formatUnits(BigInt(activity.amount), 6)} USDC
                            {activity.streamRate && "/hr"}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    );
  };

  if (!address) {
    return (
      <ErrorDisplay
        title="Wallet Not Connected"
        message="Please connect your wallet to view your flows"
        icon={<WalletIcon className="w-6 h-6 text-white/40" />}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <ActivitySection
          title="Active Streams"
          activities={groupedActivities.streams}
          type="streams"
        />
        <ActivitySection
          title="Active Vests"
          activities={groupedActivities.vests}
          type="vests"
        />
        <ActivitySection
          title="Pending Invoices"
          activities={groupedActivities.invoices}
          type="invoices"
        />
      </div>
    </div>
  );
}
