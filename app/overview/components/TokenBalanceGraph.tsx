import { motion } from "framer-motion";
import { format, eachDayOfInterval, subDays, isSameDay } from "date-fns";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClockIcon,
  PauseIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import React from "react";
import Card from "@/components/shared/ui/Card";

interface ActivityType {
  id: string;
  type:
    | "invoice_created"
    | "invoice_received"
    | "invoice_paid"
    | "stream_started"
    | "stream_paused"
    | "stream_stopped"
    | "stream_completed"
    | "vest_started"
    | "vest_paused"
    | "vest_stopped"
    | "vest_completed";
  timestamp: Date;
  amount: string;
  streamRate?: string;
  tokenSymbol: string;
  counterparty: {
    address: string;
    name?: string;
    image?: string;
    isTeam?: boolean;
  };
  team?: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  description: string;
  isIncoming: boolean;
}

interface TokenBalanceGraphProps {
  data: ActivityType[];
  days?: number;
  isLoading?: boolean;
}

export default function TokenBalanceGraph({
  data,
  days = 7,
  isLoading = false,
}: TokenBalanceGraphProps) {
  // Group activities by date using useMemo to ensure consistent rendering
  const groupedActivities = React.useMemo(() => {
    return data.reduce((acc, activity) => {
      const date = format(new Date(activity.timestamp), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        ...activity,
        timestamp: new Date(activity.timestamp),
      });
      return acc;
    }, {} as Record<string, ActivityType[]>);
  }, [data]);

  // Sort dates in descending order
  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedActivities).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedActivities]);

  // Format time consistently
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  // Format date consistently
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getActivityIcon = (type: ActivityType["type"], isIncoming: boolean) => {
    switch (type) {
      case "invoice_created":
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />;
      case "invoice_received":
        return <DocumentTextIcon className="w-4 h-4 text-orange-500" />;
      case "invoice_paid":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case "stream_started":
        return (
          <ArrowPathIcon
            className={`w-4 h-4 ${
              isIncoming ? "text-emerald-500" : "text-blue-500"
            }`}
          />
        );
      case "stream_paused":
        return <PauseIcon className="w-4 h-4 text-orange-500" />;
      case "stream_stopped":
        return <StopIcon className="w-4 h-4 text-red-500" />;
      case "stream_completed":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case "vest_started":
        return (
          <ClockIcon
            className={`w-4 h-4 ${
              isIncoming ? "text-emerald-500" : "text-blue-500"
            }`}
          />
        );
      case "vest_paused":
        return <PauseIcon className="w-4 h-4 text-orange-500" />;
      case "vest_stopped":
        return <StopIcon className="w-4 h-4 text-red-500" />;
      case "vest_completed":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-white/60" />;
    }
  };

  const getAmountDisplay = (activity: ActivityType) => {
    // For stream rates, show more precision
    if (activity.streamRate) {
      const amount = parseFloat(activity.streamRate);
      const decimals = activity.tokenSymbol === "USDC" ? 2 : 4;
      return `${amount.toFixed(decimals)} ${activity.tokenSymbol}/hr`;
    }

    // For regular amounts
    const amount = parseFloat(activity.amount);
    const decimals = activity.tokenSymbol === "USDC" ? 2 : 4;
    return `${amount.toFixed(decimals)} ${activity.tokenSymbol}`;
  };

  if (isLoading) {
    return (
      <Card title="Activity">
        <div className="space-y-8 p-3">
          {[...Array(3)].map((_, dayIndex) => (
            <div key={dayIndex} className="px-5">
              {/* Date Header Skeleton */}
              <div className="mb-4">
                <div className="h-4 w-32 bg-white/[0.02] rounded animate-pulse" />
              </div>

              {/* Activities Skeleton */}
              <div className="space-y-2">
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Time and Icon */}
                      <div className="flex items-center gap-3">
                        <div className="w-[60px] h-4 bg-white/[0.02] rounded animate-pulse" />
                        <div className="w-4 h-4 bg-white/[0.02] rounded animate-pulse" />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-full bg-white/[0.02] animate-pulse" />
                        {/* Description */}
                        <div className="w-48 h-4 bg-white/[0.02] rounded animate-pulse" />
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/[0.02] animate-pulse" />
                      <div className="w-20 h-4 bg-white/[0.02] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Activity">
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date}>
            {/* Date Header */}
            <div className="mb-4">
              <span className="text-sm font-medium text-white/40">
                {formatDate(date)}
              </span>
            </div>

            {/* Activities */}
            <div className="space-y-2">
              {groupedActivities[date].map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    {/* Time and Icon */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/40 w-[60px]">
                        {formatTime(activity.timestamp)}
                      </span>
                      {getActivityIcon(activity.type, activity.isIncoming)}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Counterparty Image */}
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                        {activity.team ? (
                          activity.team.profilePicture ? (
                            <Image
                              src={activity.team.profilePicture}
                              alt={activity.team.name}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
                              <span className="text-xs font-medium text-white/40">
                                {activity.team.name.slice(0, 2)}
                              </span>
                            </div>
                          )
                        ) : (
                          <Image
                            src={
                              activity.counterparty.image ||
                              `https://cdn.stamp.fyi/avatar/${activity.counterparty.address}?s=50`
                            }
                            alt={
                              activity.counterparty.name ||
                              activity.counterparty.address
                            }
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Description */}
                      <span className="text-sm text-white/90">
                        {activity.team && (
                          <span className="text-white/60">
                            via {activity.team.name} •{" "}
                          </span>
                        )}
                        {activity.description}
                      </span>
                    </div>
                  </div>

                  {/* Amount with Token Icon */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-4 h-4 rounded-full overflow-hidden">
                      <Image
                        src={`/tokens/${activity.tokenSymbol}.png`}
                        alt={activity.tokenSymbol}
                        width={16}
                        height={16}
                        className="object-cover opacity-80"
                      />
                    </div>
                    <span className="text-sm font-medium text-white/90">
                      {getAmountDisplay(activity)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {sortedDates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40">No recent activity</p>
          </div>
        )}
      </div>
    </Card>
  );
}
