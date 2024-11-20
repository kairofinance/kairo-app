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
import { VESTING_MANAGER_ADDRESS } from "@/config/contracts";
import { VestingManagerABI } from "@/config/abis";

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

interface VestingRecipient {
  recipient: string;
  amount: string;
  cliffDuration: string;
  vestingDuration: string;
  initialRelease: string;
}

export default function CreateVesting() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [recipients, setRecipients] = useState<VestingRecipient[]>([
    {
      recipient: "",
      amount: "",
      cliffDuration: "0",
      vestingDuration: "0",
      initialRelease: "0",
    },
  ]);
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

  // Handler for updating recipient info
  const handleRecipientChange = (
    index: number,
    field: keyof VestingRecipient,
    value: string
  ) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  // Handler for adding new recipient
  const addRecipient = () => {
    setRecipients([
      ...recipients,
      {
        recipient: "",
        amount: "",
        cliffDuration: "0",
        vestingDuration: "0",
        initialRelease: "0",
      },
    ]);
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
      // Create multiple vesting schedules in a loop
      // for (const recipient of recipients) {
      //   const parsedAmount = parseUnits(
      //     recipient.amount.replace(/,/g, ""),
      //     selectedToken.decimals
      //   );

      //   await writeContractAsync({
      //     address: VESTING_MANAGER_ADDRESS,
      //     abi: VestingManagerABI,
      //     functionName: "createVesting",
      //     args: [
      //       recipient.recipient,
      //       parsedAmount,
      //       BigInt(parseFloat(recipient.cliffDuration) * 30 * 24 * 60 * 60),
      //       BigInt(parseFloat(recipient.vestingDuration) * 30 * 24 * 60 * 60),
      //       parseFloat(recipient.initialRelease) * 100,
      //       selectedToken.address,
      //     ],
      //   });
      // }

      showAlert("Vesting schedules created successfully!", "success");
      router.push("/vesting");
    } catch (error: any) {
      console.error("Error creating vesting schedules:", error);
      showAlert(error.message || "Failed to create vesting schedules", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate vesting schedule points for visualization
  const calculateVestingPoints = (recipient: VestingRecipient) => {
    if (!recipient.amount) return [];

    const totalAmount = parseFloat(recipient.amount.replace(/,/g, ""));
    const initialAmount =
      (totalAmount * parseFloat(recipient.initialRelease)) / 100;
    const vestingAmount = totalAmount - initialAmount;

    const points = [];
    const totalMonths =
      parseFloat(recipient.cliffDuration) +
      parseFloat(recipient.vestingDuration);

    // Initial release point
    points.push({ x: 0, y: initialAmount });

    // Cliff period
    for (let i = 1; i <= parseFloat(recipient.cliffDuration); i++) {
      points.push({ x: i, y: initialAmount });
    }

    // Linear vesting period
    const monthlyVesting =
      vestingAmount / parseFloat(recipient.vestingDuration);
    for (let i = 1; i <= parseFloat(recipient.vestingDuration); i++) {
      const month = parseFloat(recipient.cliffDuration) + i;
      points.push({ x: month, y: initialAmount + monthlyVesting * i });
    }

    return points;
  };

  // Get the maximum duration among all recipients
  const maxDuration = Math.max(
    ...recipients.map(
      (r) => parseFloat(r.cliffDuration) + parseFloat(r.vestingDuration)
    )
  );

  // Generate chart data for all recipients
  const generateChartData = () => {
    if (!recipients.some((r) => parseFloat(r.amount) > 0)) return [];

    const monthlyData = Array.from(
      { length: Math.ceil(maxDuration) + 1 },
      (_, month) => ({
        name: `Month ${month}`,
        total: 0,
        ...recipients.reduce(
          (acc, _, index) => ({
            ...acc,
            [`recipient${index + 1}`]: 0,
          }),
          {}
        ),
      })
    );

    recipients.forEach((recipient, index) => {
      const points = calculateVestingPoints(recipient);
      points.forEach((point) => {
        const monthIndex = Math.floor(point.x);
        if (monthlyData[monthIndex]) {
          (monthlyData[monthIndex] as any)[`recipient${index + 1}`] = point.y;
          monthlyData[monthIndex].total += point.y;
        }
      });
    });

    return monthlyData;
  };

  const chartData = generateChartData();

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
                <div
                  key={index}
                  className="space-y-3 p-4 bg-white/[0.02] border border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 font-jetbrains text-sm">
                        $
                      </span>
                      <span className="text-sm font-jetbrains text-white/60">
                        recipient_{index + 1}
                      </span>
                    </div>
                    {index > 0 && (
                      <motion.button
                        onClick={() => removeRecipient(index)}
                        className="p-2 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.02] hover:bg-white/[0.04] 
                                 hover:border-white/[0.12] text-white/40 hover:text-white transition-all duration-200"
                      >
                        <span className="font-jetbrains">x</span>
                      </motion.button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={recipient.recipient}
                      onChange={(e) =>
                        handleRecipientChange(
                          index,
                          "recipient",
                          e.target.value
                        )
                      }
                      placeholder="0x.../ENS"
                      className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 py-3 
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
                        placeholder="Amount"
                        className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 pr-16 py-3 
                                 text-white placeholder-white/40 border border-white/[0.08] 
                                 focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                                 transition-all duration-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
                        {selectedToken.name}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={recipient.cliffDuration}
                        onChange={(e) =>
                          handleRecipientChange(
                            index,
                            "cliffDuration",
                            e.target.value
                          )
                        }
                        placeholder="Cliff"
                        className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 pr-20 py-3 
                                 text-white placeholder-white/40 border border-white/[0.08] 
                                 focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                                 transition-all duration-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
                        Months
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={recipient.vestingDuration}
                        onChange={(e) =>
                          handleRecipientChange(
                            index,
                            "vestingDuration",
                            e.target.value
                          )
                        }
                        placeholder="Duration"
                        className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 pr-20 py-3 
                                 text-white placeholder-white/40 border border-white/[0.08] 
                                 focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                                 transition-all duration-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
                        Months
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={recipient.initialRelease}
                        onChange={(e) =>
                          handleRecipientChange(
                            index,
                            "initialRelease",
                            e.target.value
                          )
                        }
                        placeholder="Initial"
                        className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 pr-12 py-3 
                                 text-white placeholder-white/40 border border-white/[0.08] 
                                 focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                                 transition-all duration-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
                        %
                      </span>
                    </div>
                  </div>
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
              {isLoading || isPending ? "processing..." : "create_vesting"}
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
              cat vesting.json
            </span>
          </div>

          {/* JSON-like Preview */}
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

              {/* Recipients */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;schedules&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/40">[</span>
              </div>
              <div className="pl-4">
                {recipients.map((recipient, index) => (
                  <div key={index} className="text-white/80">
                    {`{
                      "recipient": "${recipient.recipient || "null"}",
                      "amount": "${recipient.amount || "0"} ${
                      selectedToken.name
                    }",
                      "cliff": "${recipient.cliffDuration} months",
                      "duration": "${recipient.vestingDuration} months",
                      "initial": "${recipient.initialRelease}%"
                    }${index < recipients.length - 1 ? "," : ""}`}
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
                plot vesting_schedule --format=chart
              </span>
            </div>

            <div className="relative h-[300px] border border-white/[0.08] bg-white/[0.02] p-4">
              {totalAmount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
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
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
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
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0}
                        />
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
                                    {entry.name === "total"
                                      ? "Total: "
                                      : `Recipient ${entry.name.replace(
                                          "recipient",
                                          ""
                                        )}: `}
                                    {entry.value.toLocaleString()}{" "}
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
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/40 font-jetbrains text-sm space-y-2">
                  <span>$ No data available for plotting</span>
                  <span className="text-white/20">
                    Enter vesting details to visualize...
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
