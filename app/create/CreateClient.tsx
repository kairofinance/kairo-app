"use client";

import React, { useState, useCallback } from "react";
import {
  DocumentPlusIcon,
  ArrowPathIcon,
  ClockIcon,
  CalendarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import CreateInvoice from "./components/CreateInvoice";
import CreateStream from "./components/CreateStream";
import CreateVesting from "./components/CreateVesting";
import { motion } from "framer-motion";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import Card from "@/components/shared/ui/Card";

type CreationType = "invoice" | "stream" | "vesting";

const creationOptions = [
  {
    id: "invoice",
    name: "Invoice",
    description: "Generate instant token payments",
    title: "Create Invoice",
    subtitle: "Generate a new payment request",
    icon: DocumentPlusIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    previewData: Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 500,
    })),
  },
  {
    id: "stream",
    name: "Token Stream",
    description: "Real-time token streams with flexible rates",
    title: "Create Stream",
    subtitle: "Set up a continuous payment flow",
    icon: ArrowPathIcon,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    previewData: Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: 1000 - i * (1000 / 30),
    })),
  },
  {
    id: "vesting",
    name: "Vesting Schedule",
    description: "Token vesting with multiple parameters",
    title: "Create Vesting",
    subtitle: "Configure token distribution over time",
    icon: ClockIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    previewData: Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.min(1000, i * (1000 / 20)),
    })),
  },
];

interface GraphData {
  invoice?: {
    amount: string;
    dueDate: Date | null;
  };
  stream?: {
    recipients: { address: string; amount: string }[];
    duration: { value: string; unit: string; inHours: number };
  };
  vesting?: {
    recipients: {
      recipient: string;
      amount: string;
      cliffDuration: string;
      vestingDuration: string;
      initialRelease: string;
    }[];
  };
}

const PaymentTypeGraph = ({
  selectedType,
  graphData,
}: {
  selectedType: CreationType;
  graphData: GraphData;
}) => {
  // Check if we have valid data to display
  const hasValidData = () => {
    if (selectedType === "invoice") {
      return (
        graphData.invoice?.amount && parseFloat(graphData.invoice.amount) > 0
      );
    }
    if (selectedType === "stream") {
      return (
        graphData.stream?.recipients.some(
          (r) => parseFloat(r.amount || "0") > 0
        ) &&
        graphData.stream?.duration.value &&
        parseFloat(graphData.stream.duration.value) > 0
      );
    }
    if (selectedType === "vesting") {
      return graphData.vesting?.recipients.some(
        (r) =>
          parseFloat(r.amount || "0") > 0 &&
          (parseFloat(r.cliffDuration || "0") > 0 ||
            parseFloat(r.vestingDuration || "0") > 0)
      );
    }
    return false;
  };

  // If no valid data, show empty state
  if (!hasValidData()) {
    return (
      <div className="h-[300px] border border-white/[0.05] rounded-lg bg-white/[0.02] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div
            className={`mx-auto w-8 h-8 ${
              selectedType === "invoice"
                ? "text-orange-500"
                : selectedType === "stream"
                ? "text-emerald-500"
                : "text-blue-500"
            }`}
          >
            {selectedType === "invoice" && <DocumentPlusIcon />}
            {selectedType === "stream" && <ArrowPathIcon />}
            {selectedType === "vesting" && <ClockIcon />}
          </div>
          <p className="text-white/40 text-sm">
            Enter {selectedType} details to visualize payment flow
          </p>
        </div>
      </div>
    );
  }

  // Calculate total duration in days based on payment type
  const getTotalDurationInDays = () => {
    try {
      if (selectedType === "invoice" && graphData.invoice?.dueDate) {
        const days = Math.ceil(
          (graphData.invoice.dueDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        return Math.max(1, days); // Ensure at least 1 day
      }

      if (selectedType === "stream" && graphData.stream) {
        const days = Math.ceil(
          (parseFloat(graphData.stream.duration.value || "0") *
            graphData.stream.duration.inHours) /
            24
        );
        return Math.max(1, days);
      }

      if (selectedType === "vesting" && graphData.vesting?.recipients[0]) {
        const cliffDays =
          parseFloat(graphData.vesting.recipients[0].cliffDuration || "0") * 30;
        const vestingDays =
          parseFloat(graphData.vesting.recipients[0].vestingDuration || "0") *
          30;
        return Math.max(1, Math.ceil(cliffDays + vestingDays));
      }

      return 30; // Default duration
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 30;
    }
  };

  const totalDays = getTotalDurationInDays();
  const dataPoints = Math.min(30, Math.max(10, totalDays));

  // Generate data based on payment type and actual inputs
  const generateData = () => {
    if (selectedType === "invoice" && graphData.invoice) {
      return Array.from({ length: dataPoints }, (_, i) => {
        const currentDay = (i * totalDays) / (dataPoints - 1);
        const dueDay = graphData.invoice?.dueDate
          ? Math.floor(
              (graphData.invoice.dueDate.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          : totalDays / 2;

        return {
          x: `Day ${Math.round(currentDay)}`,
          y:
            currentDay >= dueDay
              ? parseFloat(graphData?.invoice?.amount || "0")
              : 0,
        };
      });
    }

    if (selectedType === "stream" && graphData.stream) {
      const totalAmount = graphData.stream.recipients.reduce(
        (sum, r) => sum + parseFloat(r.amount || "0"),
        0
      );

      // Calculate stream rate (per day)
      const streamRatePerDay = totalAmount / totalDays;

      return Array.from({ length: dataPoints }, (_, i) => {
        const currentDay = (i * totalDays) / (dataPoints - 1);
        return {
          x: `Day ${Math.round(currentDay)}`,
          y: currentDay * streamRatePerDay,
          streamRate: graphData.stream?.duration?.inHours
            ? streamRatePerDay * (24 / graphData.stream.duration.inHours)
            : 0,
        };
      });
    }

    if (selectedType === "vesting" && graphData.vesting) {
      return Array.from({ length: dataPoints }, (_, i) => {
        const currentDay = (i * totalDays) / (dataPoints - 1);
        let totalVested = 0;

        graphData?.vesting?.recipients.forEach((recipient) => {
          const totalAmount = parseFloat(recipient.amount || "0");
          const cliffDays = parseFloat(recipient.cliffDuration || "0") * 30;
          const vestingDays = parseFloat(recipient.vestingDuration || "0") * 30;
          const initialRelease =
            parseFloat(recipient.initialRelease || "0") / 100;

          if (currentDay === 0) {
            totalVested += totalAmount * initialRelease;
          } else if (currentDay <= cliffDays) {
            totalVested += totalAmount * initialRelease;
          } else if (currentDay <= cliffDays + vestingDays) {
            const vestedAmount = totalAmount * (1 - initialRelease);
            const daysSinceCliff = currentDay - cliffDays;
            const vestingProgress = daysSinceCliff / vestingDays;
            totalVested +=
              totalAmount * initialRelease + vestedAmount * vestingProgress;
          } else {
            totalVested += totalAmount;
          }
        });

        return {
          x: `Day ${Math.round(currentDay)}`,
          y: totalVested,
        };
      });
    }

    // Default empty data
    return Array.from({ length: dataPoints }, (_, i) => ({
      x: `Day ${Math.round((i * totalDays) / (dataPoints - 1))}`,
      y: 0,
    }));
  };

  const chartData = generateData();

  // Update the markers generation to ensure unique values
  const markers = Array.from({ length: 5 }, (_, i) => {
    const dayNumber = Math.round((i * totalDays) / 4);
    return {
      value: `Day ${dayNumber}`,
      dayNumber, // Used for uniqueness check
    };
  }).filter(
    (marker, index, self) =>
      // Remove duplicates based on dayNumber
      index === self.findIndex((m) => m.dayNumber === marker.dayNumber)
  );

  return (
    <div className="relative">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={
                    selectedType === "invoice"
                      ? "rgb(249, 115, 22)"
                      : selectedType === "stream"
                      ? "rgb(34, 197, 94)"
                      : "rgb(59, 130, 246)"
                  }
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor={
                    selectedType === "invoice"
                      ? "rgb(249, 115, 22)"
                      : selectedType === "stream"
                      ? "rgb(34, 197, 94)"
                      : "rgb(59, 130, 246)"
                  }
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.4)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              ticks={markers.map((m) => m.value)}
              tickFormatter={(props) => {
                const { x, y, payload } = props;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      key={`tick-${payload.value}-${x}-${y}`}
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.4)"
                      fontSize={10}
                      fontFamily="JetBrains Mono"
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
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
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload[0]) {
                  return null;
                }

                try {
                  const value = payload[0].value as number;
                  const data = payload[0].payload as { streamRate?: number };

                  return (
                    <div className="font-jetbrains rounded-lg bg-black/90 border border-white/10 px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{
                            backgroundColor:
                              selectedType === "invoice"
                                ? "rgb(249, 115, 22)"
                                : selectedType === "stream"
                                ? "rgb(34, 197, 94)"
                                : "rgb(59, 130, 246)",
                          }}
                        />
                        <p className="text-[10px] font-medium text-white/60">
                          {label}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-[10px] text-white/40">
                            {selectedType === "stream" ? "Received" : "Amount"}
                          </span>
                          <span className="text-[11px] font-medium text-white">
                            {value.toLocaleString()} USDC
                          </span>
                        </div>

                        {selectedType === "stream" && data.streamRate && (
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-[10px] text-white/40">
                              Stream Rate
                            </span>
                            <span className="text-[11px] font-medium text-white">
                              {data.streamRate.toFixed(2)} USDC/hr
                            </span>
                          </div>
                        )}

                        {selectedType === "vesting" && (
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-[10px] text-white/40">
                              Progress
                            </span>
                            <span className="text-[11px] font-medium text-white">
                              {Math.min(100, (value / 1000) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error("Error rendering tooltip:", error);
                  return null;
                }
              }}
              cursor={{
                stroke: "rgba(255, 255, 255, 0.1)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke={
                selectedType === "invoice"
                  ? "rgb(249, 115, 22)"
                  : selectedType === "stream"
                  ? "rgb(34, 197, 94)"
                  : "rgb(59, 130, 246)"
              }
              strokeWidth={1.5}
              fill="url(#graphGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function CreateClient() {
  const [selectedType, setSelectedType] = useState<CreationType>("invoice");
  const [graphData, setGraphData] = useState<GraphData>({});
  const selectedOption = creationOptions.find((opt) => opt.id === selectedType);

  // Memoize the handlers with useCallback
  const handleInvoiceDataUpdate = useCallback(
    (amount: string, dueDate: Date | null) => {
      setGraphData((prev) => ({
        ...prev,
        invoice: { amount, dueDate },
      }));
    },
    []
  );

  const handleStreamDataUpdate = useCallback(
    (
      recipients: { address: string; amount: string }[],
      duration: { value: string; unit: string; inHours: number }
    ) => {
      setGraphData((prev) => ({
        ...prev,
        stream: { recipients, duration },
      }));
    },
    []
  );

  const handleVestingDataUpdate = useCallback(
    (
      recipients: {
        recipient: string;
        amount: string;
        cliffDuration: string;
        vestingDuration: string;
        initialRelease: string;
      }[]
    ) => {
      setGraphData((prev) => ({
        ...prev,
        vesting: { recipients },
      }));
    },
    []
  );

  const renderPreview = () => {
    switch (selectedType) {
      case "invoice":
        return (
          <div className="px-5 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.05]">
                  <Image
                    src="/tokens/USDC.png"
                    width={16}
                    height={16}
                    alt="USDC"
                    className="opacity-80"
                  />
                </div>
                <span className="text-sm text-white/60">Amount</span>
              </div>
              <span className="text-sm font-medium text-white">
                {graphData.invoice?.amount || "0"} USDC
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.05]">
                  <CalendarIcon className="w-4 h-4 text-white/60" />
                </div>
                <span className="text-sm text-white/60">Due Date</span>
              </div>
              <span className="text-sm font-medium text-white">
                {graphData.invoice?.dueDate?.toLocaleDateString() || "Not set"}
              </span>
            </div>
          </div>
        );

      case "stream":
        const streamRate =
          graphData.stream?.recipients.reduce(
            (sum, r) => sum + parseFloat(r.amount || "0"),
            0
          ) /
          (parseFloat(graphData.stream?.duration.value || "0") *
            (graphData.stream?.duration.inHours || 0));

        return (
          <div className="px-5 space-y-4">
            {graphData.stream?.recipients.map((recipient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.05]">
                    <UserCircleIcon className="w-4 h-4 text-white/60" />
                  </div>
                  <span className="text-sm text-white/60">
                    Recipient {index + 1}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {recipient.amount || "0"} USDC
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.05]">
                  <ArrowPathIcon className="w-4 h-4 text-white/60" />
                </div>
                <span className="text-sm text-white/60">Stream Rate</span>
              </div>
              <span className="text-sm font-medium text-white">
                {streamRate ? `${streamRate.toFixed(6)} USDC/hr` : "0 USDC/hr"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.05]">
                  <CalendarIcon className="w-4 h-4 text-white/60" />
                </div>
                <span className="text-sm text-white/60">Duration</span>
              </div>
              <span className="text-sm font-medium text-white">
                {graphData.stream?.duration.value || "0"}{" "}
                {graphData.stream?.duration.unit || "hours"}
              </span>
            </div>
          </div>
        );

      case "vesting":
        return (
          <div className="px-5 space-y-4">
            {graphData.vesting?.recipients.map((recipient, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <UserCircleIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">
                      Recipient {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {recipient.amount || "0"} USDC
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <CalendarIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">Schedule</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {recipient.cliffDuration || "0"} months cliff
                    </div>
                    <div className="text-sm text-white/60">
                      {recipient.vestingDuration || "0"} months vesting
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <ArrowPathIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">
                      Initial Release
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {recipient.initialRelease || "0"}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen mt-5">
      <div className="max-w-6xl mx-auto space-y-12 p-9">
        {/* Graph Section */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {selectedOption?.title}
              </h2>
              <p className="text-white/40 mt-1 font-semibold">
                {selectedOption?.subtitle}
              </p>
            </div>

            {/* Minimal Payment Type Selection */}
            <div className="flex gap-2">
              {creationOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedType(option.id as CreationType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      selectedType === option.id
                        ? "bg-white/[0.08] text-white"
                        : "bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                    }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Graph */}
          <PaymentTypeGraph selectedType={selectedType} graphData={graphData} />
        </div>

        {/* Creation Forms - Using new Card component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Details Section */}
          <Card title="Details">
            {selectedType === "invoice" && (
              <CreateInvoice onDataUpdate={handleInvoiceDataUpdate} />
            )}
            {selectedType === "stream" && (
              <CreateStream onDataUpdate={handleStreamDataUpdate} />
            )}
            {selectedType === "vesting" && (
              <CreateVesting onDataUpdate={handleVestingDataUpdate} />
            )}
          </Card>

          {/* Preview Section */}
          <Card title="Preview">{renderPreview()}</Card>
        </div>
      </div>
    </div>
  );
}
