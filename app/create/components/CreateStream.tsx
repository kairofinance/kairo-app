"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Line } from "react-chartjs-2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { useAlert } from "@/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { STREAM_MANAGER_ADDRESS } from "@/config/contracts";
import { StreamManagerABI } from "@/config/abis";

const tokens = [
  {
    name: "USDC",
    image: "/tokens/USDC.png",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
  },
  {
    name: "DAI",
    image: "/tokens/DAI.png",
    address: "0x552ceaDf3B47609897279F42D3B3309B604896f3",
    decimals: 18,
  },
];

interface Recipient {
  address: string;
  amount: string;
}

const timeUnits = [
  { value: "minute", label: "Minutes", inHours: 1 / 60 },
  { value: "hour", label: "Hours", inHours: 1 },
  { value: "day", label: "Days", inHours: 24 },
  { value: "week", label: "Weeks", inHours: 24 * 7 },
  { value: "month", label: "Months", inHours: 24 * 30 },
] as const;

type TimeUnit = (typeof timeUnits)[number];

export default function CreateStream() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", amount: "" },
  ]);
  const [durationValue, setDurationValue] = useState<string>("0");
  const [durationUnit, setDurationUnit] = useState<TimeUnit>(timeUnits[1]);
  const [isLoading, setIsLoading] = useState(false);

  const { alertState, showAlert, dismissAlert } = useAlert();
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // Calculate total amount
  const totalAmount = recipients.reduce((sum, recipient) => {
    const amount = parseFloat(recipient.amount) || 0;
    return sum + amount;
  }, 0);

  // Convert duration to hours for calculations
  const durationInHours = parseFloat(durationValue) * durationUnit.inHours;

  // Calculate stream rate for visualization
  const streamRate =
    totalAmount && durationInHours ? totalAmount / durationInHours : 0;

  // Chart data
  const graphData = {
    labels: Array.from(
      { length: 10 },
      (_, i) => `${((i * durationInHours) / 10).toFixed(1)}h`
    ),
    datasets: [
      {
        label: "Total Stream",
        data: Array.from({ length: 10 }, (_, i) => (i * totalAmount) / 10),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
      ...recipients.map((recipient, index) => ({
        label: `Recipient ${index + 1}`,
        data: Array.from(
          { length: 10 },
          (_, i) => (i * parseFloat(recipient.amount || "0")) / 10
        ),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      })),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { size: 10 },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        titleFont: { size: 10 },
        bodyFont: { size: 11 },
        titleColor: "rgba(255, 255, 255, 0.6)",
        bodyColor: "rgba(255, 255, 255, 0.9)",
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { size: 10 },
          callback: (value: number) =>
            `${value.toLocaleString()} ${selectedToken.name}`,
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { size: 10 },
        },
      },
    },
  } as const;

  // Handler for updating recipient info
  const handleRecipientChange = (
    index: number,
    field: keyof Recipient,
    value: string
  ) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  // Handler for adding new recipient
  const addRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "" }]);
  };

  // Handler for removing recipient
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      showAlert("Please connect your wallet first.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const recipientAddresses = recipients.map((r) => r.address);
      const recipientAmounts = recipients.map((r) =>
        parseUnits(r.amount, selectedToken.decimals)
      );

      const result = await writeContractAsync({
        address: STREAM_MANAGER_ADDRESS,
        abi: StreamManagerABI,
        functionName: "createStream",
        args: [
          recipientAddresses,
          recipientAmounts,
          BigInt(Math.floor(durationInHours * 3600)), // Convert hours to seconds
          selectedToken.address,
        ],
      });

      showAlert("Stream created successfully!", "success");
      router.push(`/stream/${result}`);
    } catch (error: any) {
      console.error("Error creating stream:", error);
      showAlert(error.message || "Failed to create stream", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="space-y-6">
        {/* Token Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/60">Select Token</h3>
          <div className="flex gap-2">
            {tokens.map((token) => (
              <motion.button
                key={token.name}
                onClick={() => setSelectedToken(token)}
                className={`
                  inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 border
                  ${
                    selectedToken.name === token.name
                      ? "bg-white/[0.08] text-white border-white/[0.12]"
                      : "bg-white/[0.02] text-white/70 border-white/[0.08] hover:bg-white/[0.04] hover:text-white hover:border-white/[0.12]"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src={token.image}
                  width={20}
                  height={20}
                  alt={token.name}
                  className="mr-2"
                />
                {token.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/60">Recipients</h3>
          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) =>
                    handleRecipientChange(index, "address", e.target.value)
                  }
                  placeholder="0x.../ENS"
                  className="flex-1 bg-white/[0.02] rounded-lg px-4 py-3 text-white placeholder-white/40 
                           border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.04]
                           transition-all duration-200"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={recipient.amount}
                    onChange={(e) =>
                      handleRecipientChange(index, "amount", e.target.value)
                    }
                    className="w-32 bg-white/[0.02] rounded-lg pl-4 pr-16 py-3 text-white placeholder-white/40 
                             border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.04]
                             transition-all duration-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    {selectedToken.name}
                  </span>
                </div>
                {index > 0 && (
                  <motion.button
                    onClick={() => removeRecipient(index)}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] 
                             hover:border-white/[0.12] text-white/40 hover:text-white transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>
            ))}
            <motion.button
              onClick={addRecipient}
              className="text-sm font-medium text-white/50 hover:text-orange-500/80 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + Add recipient
            </motion.button>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/60">Duration</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                className="w-full bg-white/[0.02] rounded-lg pl-4 pr-20 py-3 text-white placeholder-white/40 
                         border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.04]
                         transition-all duration-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                {durationUnit.label}
              </span>
            </div>
            <select
              value={durationUnit.value}
              onChange={(e) => {
                const newUnit = timeUnits.find(
                  (unit) => unit.value === e.target.value
                );
                if (newUnit) setDurationUnit(newUnit);
              }}
              className="w-32 bg-white/[0.02] rounded-lg px-4 py-3 text-white border border-white/[0.08]
                       focus:border-white/[0.12] focus:bg-white/[0.04] transition-all duration-200"
            >
              {timeUnits.map((unit) => (
                <option
                  key={unit.value}
                  value={unit.value}
                  className="bg-zinc-900 text-white"
                >
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading || isPending}
          className="w-full py-4 px-6 rounded-lg text-sm font-medium text-white 
                   bg-orange-600/90 hover:bg-orange-500/90 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-orange-500/10
                   shadow-lg shadow-orange-600/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading || isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Stream...
            </span>
          ) : (
            "Create Stream"
          )}
        </motion.button>
      </div>

      {/* Visualization Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">
              Stream Preview
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-[10px] text-white/60">Total Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                <span className="text-[10px] text-white/60">Individual</span>
              </div>
            </div>
          </div>

          {/* Graph */}
          {totalAmount > 0 && durationInHours > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Array.from({ length: 10 }, (_, i) => ({
                    name: `${((i * durationInHours) / 10).toFixed(1)}h`,
                    total: (i * totalAmount) / 10,
                    ...recipients.reduce(
                      (acc, recipient, index) => ({
                        ...acc,
                        [`recipient${index + 1}`]:
                          (i * parseFloat(recipient.amount || "0")) / 10,
                      }),
                      {}
                    ),
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="totalGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="recipientGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }}
                    dx={-10}
                    tickFormatter={(value) =>
                      `${value.toLocaleString()} ${selectedToken.name}`
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-black/90 border border-white/10 px-3 py-2">
                            <p className="text-[10px] font-medium text-white/60 mb-1">
                              {label}
                            </p>
                            {payload.map((entry: any, index: number) => (
                              <div
                                key={`tooltip-${index}`}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <p className="text-[11px] font-medium text-white">
                                  {entry.name}: {entry.value.toLocaleString()}{" "}
                                  {selectedToken.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{
                      stroke: "rgba(255, 255, 255, 0.1)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#totalGradient)"
                    dot={false}
                  />
                  {recipients.map((_, index) => (
                    <Area
                      key={`recipient-${index}`}
                      type="monotone"
                      dataKey={`recipient${index + 1}`}
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#recipientGradient)"
                      dot={false}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-white/40">
              Enter stream details to see visualization
            </div>
          )}

          {/* Stream Details */}
          <div className="space-y-4 mt-6">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="text-sm text-white/40 mb-1">Total Amount</div>
              <div className="flex items-center gap-2">
                <Image
                  src={selectedToken.image}
                  width={24}
                  height={24}
                  alt={selectedToken.name}
                  className="opacity-80"
                />
                <span className="text-xl font-light text-white">
                  {totalAmount.toLocaleString()} {selectedToken.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <div className="text-sm text-white/40 mb-1">Stream Rate</div>
                <div className="text-white">
                  {streamRate.toFixed(6)} {selectedToken.name}/hr
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <div className="text-sm text-white/40 mb-1">Duration</div>
                <div className="text-white">
                  {durationValue} {durationUnit.label}
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-sm text-white/40">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Draft Stream</span>
          </div>
        </div>
      </motion.div>

      {alertState && (
        <AlertMessage
          message={alertState.message}
          type={alertState.type}
          onDismiss={dismissAlert}
        />
      )}
    </div>
  );
}
