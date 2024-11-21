import React from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

interface ActivityTimelineProps {
  address: string;
}

interface Activity {
  id: string;
  type: "invoice" | "stream" | "vest";
  title: string;
  amount: string;
  token: string;
  timestamp: string;
  status: string;
}

export default function ActivityTimeline({ address }: ActivityTimelineProps) {
  // Sample data - replace with real data fetching
  const activities: Activity[] = [
    {
      id: "1",
      type: "invoice",
      title: "Invoice Created",
      amount: "1,234.56",
      token: "USDC",
      timestamp: "2024-02-20T10:00:00Z",
      status: "pending",
    },
    {
      id: "2",
      type: "stream",
      title: "Stream Started",
      amount: "500.00",
      token: "USDC",
      timestamp: "2024-02-19T15:30:00Z",
      status: "active",
    },
    {
      id: "3",
      type: "vest",
      title: "Vest Created",
      amount: "10,000.00",
      token: "USDC",
      timestamp: "2024-02-18T09:15:00Z",
      status: "active",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <DocumentTextIcon className="w-4 h-4 text-orange-500" />;
      case "stream":
        return <ArrowPathIcon className="w-4 h-4 text-emerald-500" />;
      case "vest":
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">
          get recent_activity --limit=5
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Link
            href={`/${activity.type}/${activity.id}`}
            key={activity.id}
            className="block group"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getIcon(activity.type)}
                    <span className="text-sm font-jetbrains text-white/80">
                      {activity.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src={`/tokens/${activity.token}.png`}
                      alt={activity.token}
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                    <span className="text-sm font-jetbrains text-white">
                      {activity.amount}
                    </span>
                    <span className="text-sm font-jetbrains text-white/40">
                      {activity.token}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-jetbrains text-white/40">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-jetbrains text-orange-500">
                    {activity.status}
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">synced</span>
        </div>
      </div>
    </div>
  );
}
