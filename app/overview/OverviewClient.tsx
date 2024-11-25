"use client";

import React from "react";
import {
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import { useAccountStats } from "@/hooks/useAccountStats";
import TokenBalanceGraph from "./components/TokenBalanceGraph";
import { subDays } from "date-fns";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DailyFlowGraph = () => {
  // Generate 30 days of data with inflow and outflow
  const data = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const inflow = Math.random() * 1000 + 500;
    const outflow = Math.random() * 800 + 200;
    return {
      date: date,
      inflow,
      outflow,
    };
  });

  // Calculate the maximum value for Y axis
  const maxValue = Math.max(...data.map((d) => d.inflow + d.outflow));
  const yAxisMax = Math.ceil((maxValue * 1.1) / 1000) * 1000;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Modified markers generation to ensure unique values
  const markers = Array.from({ length: 5 }, (_, i) => {
    const dayNumber = Math.round((i * 29) / 4);
    const date = data[dayNumber].date;
    return {
      value: formatDate(date),
      dayNumber,
      // Add a unique id
      id: date.toISOString(),
    };
  });

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(34, 197, 94)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(34, 197, 94)"
                  stopOpacity={0.6}
                />
              </linearGradient>
              <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(239, 68, 68)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(239, 68, 68)"
                  stopOpacity={0.6}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey={(data) => data.date.toISOString()} // Use ISO string as unique key
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255, 255, 255, 0.4)",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
              }}
              ticks={markers.map((m) => m.id)} // Use unique IDs for ticks
              tickFormatter={(value) => formatDate(new Date(value))} // Format the ISO string back to display format
              interval={0}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255, 255, 255, 0.4)",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
              }}
              dx={-10}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={[0, yAxisMax]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;

                const inflow = Number(
                  payload.find((p) => p.dataKey === "inflow")?.value || 0
                );
                const outflow = Number(
                  payload.find((p) => p.dataKey === "outflow")?.value || 0
                );
                const total = inflow + outflow;

                return (
                  <div className="font-jetbrains rounded-lg bg-black/80 border border-white/20 px-4 py-3 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[11px] font-medium text-white/80">
                        {formatDate(payload[0].payload.date)}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[11px] text-white/60">
                          Inflow
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[12px] font-medium text-emerald-500">
                            ${inflow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[11px] text-white/60">
                          Outflow
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="text-[12px] font-medium text-red-500">
                            ${outflow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/20">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-[11px] text-white/60">
                            Total Flow
                          </span>
                          <span className="text-[12px] font-semibold text-white">
                            ${total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
              cursor={{
                stroke: "rgba(255, 255, 255, 0.05)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Bar
              dataKey="outflow"
              fill="url(#outflowGradient)"
              radius={[0, 0, 0, 0]}
              stackId="stack"
              maxBarSize={40}
            />
            <Bar
              dataKey="inflow"
              fill="url(#inflowGradient)"
              radius={[2, 2, 0, 0]}
              stackId="stack"
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default function OverviewClientClient({}) {
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
        {/* Money Flow Graph Section - removed outline and background */}
        <div className="p-9">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Monthly Flow
              </h2>
              <p className="text-white/40 mt-1 font-semibold">
                Last 30 days of transactions
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-sm text-emerald-500 font-semibold">
                  Total Inflow
                </span>
                <p className="font-jetbrains text-xl text-white mt-1">
                  $45,234.00
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-rose-500 font-semibold">
                  Total Outflow
                </span>
                <p className="font-jetbrains text-xl text-white mt-1">
                  $32,819.00
                </p>
              </div>
            </div>
          </div>

          {/* Graph */}
          <DailyFlowGraph />
        </div>

        {/* Recent Activity Row */}
        <TokenBalanceGraph data={activityData} days={7} />
      </div>
    </div>
  );
}
