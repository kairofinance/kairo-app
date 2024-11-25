"use client";

import React, { useState, useEffect } from "react";
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
import { readContract } from "@wagmi/core";
import { parseUnits } from "viem";
import { useAlert } from "@/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { STREAM_MANAGER_ADDRESS } from "../../../contracts/addresses";
import { StreamManagerABI } from "../../../contracts/StreamManager.sol/StreamManager";
import { sepolia } from "viem/chains";
import { ERC20ABI } from "../../../contracts/ERC20.sol/ERC20";
import { client } from "../../../wagmi.config";
import {
  ArrowPathIcon,
  UserCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

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

const FEE_PERCENTAGE = 1.5; // 1.5%

interface CreateStreamProps {
  onDataUpdate: (
    recipients: { address: string; amount: string }[],
    duration: { value: string; unit: string; inHours: number }
  ) => void;
}

export default function CreateStream({ onDataUpdate }: CreateStreamProps) {
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

    // Validate recipients
    if (
      !recipients.every((r) => isAddress(r.address) && parseFloat(r.amount) > 0)
    ) {
      showAlert(
        "Please enter valid addresses and amounts for all recipients.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    try {
      const recipientAddresses = recipients.map(
        (r) => r.address as `0x${string}`
      );
      const recipientAmounts = recipients.map((r) =>
        parseUnits(r.amount, selectedToken.decimals)
      );

      // Calculate total amount needed including fee
      const totalAmount = recipientAmounts.reduce(
        (sum, amount) => sum + amount,
        BigInt(0)
      );

      // Calculate fee amount (1.5%) with 200 token cap
      const maxFee = BigInt(200) * BigInt(10 ** selectedToken.decimals);
      const calculatedFee = (totalAmount * BigInt(15)) / BigInt(1000);
      const feeAmount = calculatedFee > maxFee ? maxFee : calculatedFee;
      const totalWithFee = totalAmount + feeAmount;

      // Check current allowance
      const allowance = (await readContract(client, {
        address: selectedToken.address as `0x${string}`,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, STREAM_MANAGER_ADDRESS[sepolia.id]],
      })) as bigint;

      // Handle token approval if needed
      if (allowance < totalWithFee) {
        showAlert("Approving token spending...", "info");

        const approveTx = await writeContractAsync({
          address: selectedToken.address as `0x${string}`,
          abi: ERC20ABI,
          functionName: "approve",
          args: [STREAM_MANAGER_ADDRESS[sepolia.id], totalWithFee],
        });

        // Wait for approval transaction to be confirmed
        const approvalReceipt = await client.waitForTransactionReceipt({
          hash: approveTx,
        });

        if (approvalReceipt.status !== "success") {
          throw new Error("Approval transaction failed");
        }

        showAlert("Token approval successful. Creating stream...", "info");
      }

      // Get current timestamp for startTime
      const startTime = BigInt(Math.floor(Date.now() / 1000));
      // Calculate endTime by adding duration in seconds to startTime
      const endTime = startTime + BigInt(Math.floor(durationInHours * 3600));

      const streamTx = await writeContractAsync({
        address: STREAM_MANAGER_ADDRESS[sepolia.id],
        abi: StreamManagerABI,
        functionName: "createStreams",
        args: [
          recipientAddresses,
          recipientAmounts,
          selectedToken.address as `0x${string}`,
          startTime,
          endTime,
        ],
      });

      // Wait for stream creation transaction to be confirmed
      const streamReceipt = await client.waitForTransactionReceipt({
        hash: streamTx,
      });

      if (streamReceipt.status !== "success") {
        throw new Error("Stream creation failed");
      }

      showAlert("Stream created successfully!", "success");
      router.push(`/stream/${streamTx}`);
    } catch (error: any) {
      console.error("Error creating stream:", error);
      const errorMessage = error.message || "Failed to create stream";
      // Check for specific error types
      if (errorMessage.toLowerCase().includes("allowance")) {
        showAlert("Please approve token spending first", "error");
      } else if (errorMessage.toLowerCase().includes("insufficient")) {
        showAlert("Insufficient token balance", "error");
      } else {
        showAlert(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      recipients.some((r) => r.amount || r.address) ||
      durationValue !== "0"
    ) {
      onDataUpdate(recipients, {
        value: durationValue,
        unit: durationUnit.value,
        inHours: durationUnit.inHours,
      });
    }
  }, [recipients, durationValue, durationUnit, onDataUpdate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="relative outline-1 bg-white/[0.02] outline outline-white/[0.2] p-7">
        <h2 className="text-lg absolute z-20 -top-4 font-jetbrains left-6 px-2 bg-black font-garet font-extrabold text-white">
          Details
        </h2>

        <div className="space-y-6">
          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Select Token
            </label>
            <div className="flex gap-2">
              {tokens.map((token) => (
                <button
                  key={token.name}
                  onClick={() => setSelectedToken(token)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200
                    ${
                      selectedToken.name === token.name
                        ? "bg-white/[0.08]"
                        : "bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                >
                  <Image
                    src={token.image}
                    width={20}
                    height={20}
                    alt={token.name}
                    className="rounded-full"
                  />
                  <span className="text-white/80">{token.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Recipients
            </label>
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
                    className="flex-1 bg-white/[0.02] rounded-lg px-4 py-3 text-white 
                             placeholder:text-white/20 transition-all duration-200
                             hover:bg-white/[0.04] focus:bg-white/[0.04]"
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
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Duration
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                className="flex-1 bg-white/[0.02] rounded-lg px-4 py-3 text-white 
                         placeholder:text-white/20 transition-all duration-200
                         hover:bg-white/[0.04] focus:bg-white/[0.04]"
              />
              <select
                value={durationUnit.value}
                onChange={(e) => {
                  const newUnit = timeUnits.find(
                    (unit) => unit.value === e.target.value
                  );
                  if (newUnit) setDurationUnit(newUnit);
                }}
                className="w-32 bg-white/[0.02] rounded-lg px-4 py-3 text-white 
                         transition-all duration-200 hover:bg-white/[0.04]"
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
          <button
            onClick={handleSubmit}
            disabled={isLoading || isPending}
            className="w-full bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 rounded-lg
                     py-3 px-6 text-white font-medium"
          >
            {isLoading || isPending ? "Processing..." : "Create Stream"}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative outline-1 bg-white/[0.02] outline outline-white/[0.2] p-7">
        <h2 className="text-lg absolute z-20 -top-4 font-jetbrains left-6 px-2 bg-black font-garet font-extrabold text-white">
          Preview
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <Image
                  src={selectedToken.image}
                  width={16}
                  height={16}
                  alt={selectedToken.name}
                  className="opacity-80"
                />
              </div>
              <span className="text-sm text-white/60">Total Amount</span>
            </div>
            <span className="text-sm font-medium text-white">
              {totalAmount.toLocaleString()} {selectedToken.name}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <ArrowPathIcon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Stream Rate</span>
            </div>
            <span className="text-sm font-medium text-white">
              {streamRate.toFixed(6)} {selectedToken.name}/hr
            </span>
          </div>

          {recipients.map((recipient, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200"
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
                {recipient.amount || "0"} {selectedToken.name}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <CalendarIcon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Duration</span>
            </div>
            <span className="text-sm font-medium text-white">
              {durationValue} {durationUnit.label}
            </span>
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
