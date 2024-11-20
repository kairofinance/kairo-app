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
  CartesianGrid,
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
      <div className="relative outline-2 outline outline-white/[0.2] p-7">
        <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
          details
        </h2>

        <div className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <h3 className="text-sm font-jetbrains text-white/60">
                select_token
              </h3>
            </div>
            <div className="flex gap-2">
              {tokens.map((token) => (
                <motion.button
                  key={token.name}
                  onClick={() => setSelectedToken(token)}
                  className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                    ${
                      selectedToken.name === token.name
                        ? "bg-white/[0.08]"
                        : "bg-white/[0.02]"
                    }
                    hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
                >
                  <Image
                    src={token.image}
                    width={16}
                    height={16}
                    alt={token.name}
                    className="opacity-80"
                  />
                  <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                    {token.name.toLowerCase()}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <h3 className="text-sm font-jetbrains text-white/60">
                recipients
              </h3>
            </div>
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
                    className="flex-1 bg-white/[0.02] font-jetbrains rounded-none px-4 py-3 
                             text-white placeholder-white/40 border border-white/[0.08] 
                             focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                             transition-all duration-200"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      value={recipient.amount}
                      onChange={(e) =>
                        handleRecipientChange(index, "amount", e.target.value)
                      }
                      className="w-32 bg-white/[0.02] font-jetbrains rounded-none px-4 pr-16 py-3 
                               text-white placeholder-white/40 border border-white/[0.08] 
                               focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                               transition-all duration-200"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
                      {selectedToken.name}
                    </span>
                  </div>
                  {index > 0 && (
                    <motion.button
                      onClick={() => removeRecipient(index)}
                      className="p-2 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.02] hover:bg-white/[0.04] 
                               hover:border-white/[0.12] text-white/40 hover:text-white transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="font-jetbrains">x</span>
                    </motion.button>
                  )}
                </div>
              ))}
              <motion.button
                onClick={addRecipient}
                className="flex items-center gap-2 text-sm font-jetbrains text-white/40 hover:text-white/60"
              >
                <span>$</span>
                <span>add_recipient</span>
              </motion.button>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <h3 className="text-sm font-jetbrains text-white/60">duration</h3>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 pr-20 py-3 
                           text-white placeholder-white/40 border border-white/[0.08] 
                           focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                           transition-all duration-200"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
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
                className="w-32 bg-white/[0.02] font-jetbrains rounded-none px-4 py-3 text-white 
                         border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04] 
                         transition-all duration-200"
              >
                {timeUnits.map((unit) => (
                  <option
                    key={unit.value}
                    value={unit.value}
                    className="bg-zinc-900 text-white font-jetbrains"
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
            className="w-full py-3 px-6 font-jetbrains text-sm text-white 
                     bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200
                     border border-white/[0.08] hover:border-white/[0.12]"
          >
            <span className="flex items-center gap-2">
              <span className="text-white/40">$</span>
              {isLoading || isPending ? "processing..." : "create_stream"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative outline-2 outline outline-white/[0.2] p-7">
        <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
          preview
        </h2>

        <div className="space-y-6">
          {/* Command Line Header */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-jetbrains text-sm">$</span>
            <span className="text-sm font-jetbrains text-white/60">
              cat stream.json
            </span>
          </div>

          {/* Stream Details */}
          <div className="font-jetbrains text-sm space-y-2">
            <div className="text-white/40">{`{`}</div>
            <div className="pl-4 space-y-1">
              {/* Total Amount */}
              <div className="flex items-start">
                <span className="text-emerald-500">
                  &quot;total_amount&quot;
                </span>
                <span className="text-white/40 mx-2">:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/80">
                    {totalAmount.toLocaleString()}
                  </span>
                  <Image
                    src={selectedToken.image}
                    width={14}
                    height={14}
                    alt={selectedToken.name}
                    className="opacity-60"
                  />
                  <span className="text-white/40">{selectedToken.name}</span>
                </div>
              </div>

              {/* Stream Rate */}
              <div className="flex items-start">
                <span className="text-emerald-500">
                  &quot;stream_rate&quot;
                </span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/80">
                  {`${streamRate.toFixed(6)} ${selectedToken.name}/hr`}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;duration&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/80">
                  {`${durationValue} ${durationUnit.label}`}
                </span>
              </div>

              {/* Recipients */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;recipients&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/40">[</span>
              </div>
              <div className="pl-4">
                {recipients.map((recipient, index) => (
                  <div key={index} className="text-white/80">
                    {`{ "address": "${
                      recipient.address || "null"
                    }", "amount": "${recipient.amount || "0"} ${
                      selectedToken.name
                    }" }${index < recipients.length - 1 ? "," : ""}`}
                  </div>
                ))}
              </div>
              <div className="text-white/40">]</div>
            </div>
            <div className="text-white/40">{`}`}</div>
          </div>

          {/* Graph Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <span className="text-sm font-jetbrains text-white/60">
                plot stream_data --format=chart
              </span>
            </div>

            <div className="relative h-[300px] border border-white/[0.08] bg-white/[0.02] p-4">
              {totalAmount > 0 && durationInHours > 0 ? (
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
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="totalGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="recipientGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
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
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "rgba(255, 255, 255, 0.4)",
                        fontSize: 11,
                        fontFamily: "JetBrains Mono",
                      }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "rgba(255, 255, 255, 0.4)",
                        fontSize: 11,
                        fontFamily: "JetBrains Mono",
                      }}
                      dx={-10}
                      tickFormatter={(value) =>
                        `${value.toLocaleString()} ${selectedToken.name}`
                      }
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="font-jetbrains rounded-none bg-black/90 border border-white/10 px-4 py-3">
                              <p className="text-[10px] font-medium text-white/60 mb-2">
                                $ time {label}
                              </p>
                              {payload.map((entry: any, index: number) => (
                                <div
                                  key={`tooltip-${index}`}
                                  className="flex items-center gap-2 py-1"
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <p className="text-[11px] font-medium text-white/80">
                                    {entry.name === "total"
                                      ? "$ total_stream"
                                      : `$ recipient_${entry.name.replace(
                                          "recipient",
                                          ""
                                        )}`}
                                    <span className="ml-2 text-white/40">
                                      =
                                    </span>
                                    <span className="ml-2">
                                      {entry.value.toLocaleString()}{" "}
                                      {selectedToken.name}
                                    </span>
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
                      strokeWidth={1.5}
                      fill="url(#totalGradient)"
                      dot={false}
                    />
                    {recipients.map((_, index) => (
                      <Area
                        key={`recipient-${index}`}
                        type="monotone"
                        dataKey={`recipient${index + 1}`}
                        stroke="#f97316"
                        strokeWidth={1.5}
                        fill="url(#recipientGradient)"
                        dot={false}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/40 font-jetbrains text-sm space-y-2">
                  <span>$ No data available for plotting</span>
                  <span className="text-white/20">
                    Enter stream details to visualize...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Terminal Status Line */}
          <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
            <span className="text-white/40 font-jetbrains text-sm">$</span>
            <span className="text-sm font-jetbrains text-white/60">
              status:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-jetbrains text-white/40">
                ready_to_deploy
              </span>
            </div>
          </div>
        </div>
      </div>

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
