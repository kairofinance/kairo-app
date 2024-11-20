"use client";

import React, { useState } from "react";
import TimeFrameSelector from "./components/TimeFrameSelector";
import CashFlowOverview from "./components/CashFlowOverview";
import ExpensesChart from "./components/ExpensesChart";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import TokenActivityTimeline from "./components/TokenActivityTimeline";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useAccountStats } from "@/hooks/useAccountStats";
import TokenBalanceGraph from "./components/TokenBalanceGraph";
import { subDays } from "date-fns";
import TokenInflow from "./components/TokenInflow";

// Add props interface at the top
interface DashboardClientProps {
  initialDictionary: any; // Replace 'any' with proper dictionary type if available
  initialLang: string;
}

const AccountStats = () => {
  const { address } = useAccount();
  const stats = useAccountStats(address);

  if (stats.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
              <div className="h-4 w-24 bg-white/[0.05] rounded" />
            </div>
            <div className="h-4 w-16 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: DocumentTextIcon,
      label: "Invoices Created",
      value: stats.totalInvoices || 0,
    },
    {
      icon: CheckCircleIcon,
      label: "Invoices Paid",
      value: stats.totalPaidInvoices || 0,
    },
    {
      icon: ArrowPathIcon,
      label: "Completed Streams",
      value: stats.completedStreams || 0,
    },
    {
      icon: BanknotesIcon,
      label: "Vests Unlocked",
      value: stats.unlockedVests || 0,
    },
    {
      icon: BanknotesIcon,
      label: "Gross Income",
      value: stats.unlockedVests || "$" + 0,
    },
  ];

  return (
    <div className="relative">
      <div className="space-y-4 pr-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <item.icon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, title, value, change }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-7"
  >
    <div className="flex items-center gap-2">
      <span className="text-white/40 font-jetbrains text-sm">&gt;</span>
      <h3 className="text-sm font-medium text-white/60 font-jetbrains">
        {title.toLowerCase().replace(" ", "_")}
      </h3>
    </div>
    <div className="mt-6">
      <p className="text-3xl font-jetbrains font-semibold text-white tabular-nums">
        {value}
      </p>
      {change && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-jetbrains text-white/40">#</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-jetbrains ${
                change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-sm font-jetbrains text-white/40">
              vs_last_period
            </span>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default function OverviewClientClient({
  initialDictionary,
  initialLang,
}: DashboardClientProps) {
  const [timeFrame, setTimeFrame] = useState("7d");

  const cashFlowData = {
    incoming: {
      total: "$12,450.00",
      change: 12.5,
    },
    outgoing: {
      total: "$8,230.00",
      change: -5.2,
    },
  };

  const expensesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    incoming: [4000, 3000, 5000, 4500, 6000, 5500],
    outgoing: [3000, 2500, 4000, 3500, 4500, 4000],
  };

  const activityData = Array.from({ length: 10 }, (_, i) => ({
    date: subDays(new Date(), Math.floor(Math.random() * 7)),
    type: ["payment", "stream", "invoice"][Math.floor(Math.random() * 3)] as
      | "payment"
      | "stream"
      | "invoice",
    amount: `$${(Math.random() * 1000).toFixed(2)}`,
    description: [
      "Payment received from Alice",
      "Stream started to Bob",
      "Invoice created for Charlie",
      "Payment sent to Dave",
      "Stream ended with Eve",
      "Invoice paid by Frank",
    ][Math.floor(Math.random() * 6)],
  }));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* First Row - CashFlow + Inflow and Monthly Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Overview */}
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              overview
            </h2>

            <div className="space-y-8">
              {/* Cashflow Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white/40 font-jetbrains text-sm">
                    $
                  </span>
                  <span className="text-sm font-jetbrains text-white/60">
                    cashflow
                  </span>
                </div>
                <CashFlowOverview {...cashFlowData} />
              </div>

              {/* Divider */}
              <div className="border-b border-white/[0.08]" />

              {/* Inflow Section */}
              <TokenInflow />
            </div>
          </div>

          {/* Right Column - Monthly Analytics */}
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              monthly analytics
            </h2>

            <ExpensesChart data={expensesData} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            stats
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox
              icon={DocumentTextIcon}
              title="Pending Invoices"
              value="12"
              change={3.2}
            />
            <StatBox
              icon={ArrowPathIcon}
              title="Active Streams"
              value="5"
              change={1.5}
            />
            <StatBox
              icon={ClockIcon}
              title="Active Vests"
              value="3"
              change={-2.0}
            />
            <StatBox
              icon={BanknotesIcon}
              title="Pending Claims"
              value="8"
              change={4.7}
            />
          </div>
        </div>

        {/* Recent Activity Row */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            recent activity
          </h2>

          <TokenBalanceGraph data={activityData} days={7} />
        </div>
      </div>
    </div>
  );
}
