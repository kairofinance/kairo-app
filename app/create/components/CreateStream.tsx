"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { useWriteContract, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useAlert } from "@/components/shared/hooks/useAlert";
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
  PlusIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useTeamContext } from "@/components/context/TeamContext";
import Input from "@/components/shared/ui/Input";

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

  const { address, isConnected } = useAppKitAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { data: allowance = BigInt(0) } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: "allowance",
    args: address
      ? [address as `0x${string}`, STREAM_MANAGER_ADDRESS[sepolia.id]]
      : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint };
  const { data: tokenBalance = BigInt(0) } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint };

  const { selectedTeam } = useTeamContext();

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
    labels: Array.from({ length: 10 }, (_, i) => ({
      key: `time-${i}`,
      label: `${((i * durationInHours) / 10).toFixed(1)}h`,
    })).map((item) => item.label),
    datasets: [
      {
        label: "Total Stream",
        id: "total-stream",
        data: Array.from({ length: 10 }, (_, i) => ({
          x: i,
          y: (i * totalAmount) / 10,
          key: `total-${i}`,
        })),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
      ...recipients.map((recipient, recipientIndex) => ({
        label: `Recipient ${recipientIndex + 1}`,
        id: `recipient-${recipientIndex}`,
        data: Array.from({ length: 10 }, (_, i) => ({
          x: i,
          y: (i * parseFloat(recipient.amount || "0")) / 10,
          key: `recipient-${recipientIndex}-${i}`,
        })),
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
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return chart.data.datasets.map((dataset: any, i: number) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 2,
              hidden: false,
              index: i,
              key: `legend-${dataset.id}`,
            }));
          },
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
        callbacks: {
          label: function (context: any) {
            const value = context.raw || 0;
            return `${value.toFixed(2)} ${selectedToken.name}`;
          },
        },
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
          callback: (value: number, index: number) => {
            return `${((index * durationInHours) / 10).toFixed(1)}h`;
          },
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

  const hasEnoughBalance = useCallback(() => {
    if (!tokenBalance) return false;

    // Calculate total amount needed including fee
    const totalBaseAmount = recipients.reduce((sum, recipient) => {
      const amount = parseUnits(
        recipient.amount.replace(/,/g, "") || "0",
        selectedToken.decimals
      );
      return sum + amount;
    }, BigInt(0));

    const maxFee = BigInt(200) * BigInt(10 ** selectedToken.decimals);
    const calculatedFee = (totalBaseAmount * BigInt(15)) / BigInt(1000);
    const feeAmount = calculatedFee > maxFee ? maxFee : calculatedFee;
    const totalNeeded = totalBaseAmount + feeAmount;

    return tokenBalance >= totalNeeded;
  }, [tokenBalance, recipients, selectedToken.decimals]);

  // Add this validation function at component level
  const validateStreamParameters = () => {
    // Check if any recipient has invalid values
    for (const recipient of recipients) {
      if (!isAddress(recipient.address)) {
        throw new Error("Invalid recipient address");
      }

      const amount = parseFloat(recipient.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount specified");
      }
    }

    // Validate duration
    const duration = parseFloat(durationValue);
    if (isNaN(duration) || duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }

    // Calculate and validate end time
    const startTime = Math.floor(Date.now() / 1000) + 60;
    const endTime =
      startTime + Math.floor(duration * durationUnit.inHours * 3600);

    if (endTime <= startTime) {
      throw new Error("End time must be after start time");
    }

    // Validate total duration is within limits (e.g., 1 year)
    const maxDurationInSeconds = 365 * 24 * 3600; // 1 year
    if (endTime - startTime > maxDurationInSeconds) {
      throw new Error("Stream duration cannot exceed 1 year");
    }

    return {
      startTime: BigInt(startTime),
      endTime: BigInt(endTime),
    };
  };

  // Update the handleSubmit function
  const handleSubmit = async () => {
    if (!isConnected) {
      showAlert("Please connect your wallet first.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Validate all recipients and amounts
      for (const recipient of recipients) {
        if (!isAddress(recipient.address)) {
          throw new Error("Invalid recipient address");
        }
        if (!recipient.amount || parseFloat(recipient.amount) <= 0) {
          throw new Error("Invalid amount");
        }
      }

      // Calculate duration in seconds
      const durationInSeconds = Math.floor(
        parseFloat(durationValue) * durationUnit.inHours * 3600
      );
      if (durationInSeconds < 3600) {
        throw new Error("Duration must be at least 1 hour");
      }

      // Format amounts with proper decimals
      const recipientAddresses = recipients.map(
        (r) => r.address as `0x${string}`
      );
      const amounts = recipients.map((r) =>
        parseUnits(r.amount.replace(/,/g, ""), selectedToken.decimals)
      );

      // Calculate total amount for allowance check
      const totalAmount = amounts.reduce(
        (sum, amount) => sum + amount,
        BigInt(0)
      );

      // Check allowance
      if (allowance < totalAmount) {
        showAlert("Approving token spending...", "info");
        try {
          const approveTx = await writeContractAsync({
            address: selectedToken.address as `0x${string}`,
            abi: ERC20ABI,
            functionName: "approve",
            args: [STREAM_MANAGER_ADDRESS[sepolia.id], totalAmount],
            chainId: sepolia.id,
          });

          const approvalReceipt = await client.waitForTransactionReceipt({
            hash: approveTx,
          });

          if (approvalReceipt.status !== "success") {
            throw new Error("Token approval failed");
          }

          showAlert("Token approval successful. Creating stream...", "info");
        } catch (error: any) {
          if (error.message.includes("user rejected")) {
            throw new Error("User rejected token approval");
          }
          throw new Error("Failed to approve token spending");
        }
      }

      // Create the streams with proper struct format
      const streamTx = await writeContractAsync({
        address: STREAM_MANAGER_ADDRESS[sepolia.id],
        abi: StreamManagerABI,
        functionName: "createStreams",
        args: [
          [
            // Array of StreamParams structs
            ...recipients.map((recipient, index) => ({
              recipient: recipient.address as `0x${string}`,
              token: selectedToken.address as `0x${string}`,
              amount: amounts[index],
              duration: BigInt(durationInSeconds),
            })),
          ],
        ],
        chainId: sepolia.id,
      });

      showAlert("Stream creation submitted...", "info");

      const receipt = await client.waitForTransactionReceipt({
        hash: streamTx,
      });

      if (receipt.status === "success") {
        // Save all streams in a single API call
        await fetch("/api/streams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            streams: recipients.map((recipient, index) => ({
              streamId: `${streamTx}-${index}`,
              senderAddress: selectedTeam
                ? selectedTeam.treasuryAddress || address
                : address,
              recipientAddress: recipient.address,
              tokenAddress: selectedToken.address,
              amount: amounts[index].toString(),
              startTime: new Date(Date.now() + 60000), // start time in ms
              endTime: new Date(Date.now() + 60000 + durationInSeconds * 1000), // end time in ms
            })),
            creationTxHash: streamTx,
            teamId: selectedTeam?.id || null,
            createdBy: address,
          }),
        });

        showAlert("Stream(s) created successfully!", "success", {
          txHash: streamTx,
        });
        router.push(`/stream/${streamTx}`);
      } else {
        throw new Error("Stream creation failed");
      }
    } catch (error: any) {
      console.error("Stream creation error:", error);

      if (error.message.includes("user rejected")) {
        showAlert("Transaction cancelled", "info");
      } else if (error.message.includes("insufficient allowance")) {
        showAlert("Token approval needed", "error");
      } else if (error.message.includes("insufficient balance")) {
        showAlert("Insufficient token balance", "error");
      } else if (error.message.includes("TokenNotWhitelisted")) {
        showAlert("Token not supported", "error");
      } else if (error.message.includes("InvalidDuration")) {
        showAlert("Invalid duration specified", "error");
      } else {
        showAlert(error.message || "Failed to create stream", "error");
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
    <div className="space-y-8">
      {/* Token Selection */}
      <div className="space-y-2">
        <label className="text-sm text-white/40">Select Token</label>
        <div className="flex gap-2">
          {tokens.map((token) => (
            <button
              key={token.name}
              onClick={() => setSelectedToken(token)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200
                ${
                  selectedToken.name === token.name
                    ? "bg-zinc-800"
                    : "bg-zinc-800/50 hover:bg-zinc-800"
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
      <div className="space-y-4">
        <label className="text-sm text-white/40">Recipients</label>
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-white/[0.08] bg-zinc-800/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">
                  Recipient {index + 1}
                </span>
                {index > 0 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="p-2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  value={recipient.address}
                  onChange={(e) =>
                    handleRecipientChange(index, "address", e.target.value)
                  }
                  placeholder="0x.../ENS"
                  icon={<UserCircleIcon className="w-4 h-4" />}
                  error={
                    recipient.address && !isAddress(recipient.address)
                      ? "Invalid address format"
                      : undefined
                  }
                />

                <Input
                  value={recipient.amount}
                  onChange={(e) =>
                    handleRecipientChange(index, "amount", e.target.value)
                  }
                  placeholder="Amount"
                  tokenIcon={selectedToken.image}
                  suffix={selectedToken.name}
                />
              </div>
            </motion.div>
          ))}

          <button
            onClick={addRecipient}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Recipient</span>
          </button>
        </div>
      </div>

      {/* Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Duration"
          icon={<ClockIcon className="w-4 h-4" />}
          value={durationValue}
          onChange={(e) => setDurationValue(e.target.value)}
          placeholder="Enter duration"
          type="number"
          min="0"
        />

        <div className="space-y-2">
          <label className="text-sm text-white/40">Unit</label>
          <select
            value={durationUnit.value}
            onChange={(e) => {
              const newUnit = timeUnits.find(
                (unit) => unit.value === e.target.value
              );
              if (newUnit) setDurationUnit(newUnit);
            }}
            className="w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 
                     rounded-lg px-4 py-3 text-white border border-white/[0.08]
                     transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20"
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
      <button
        onClick={handleSubmit}
        disabled={
          isLoading ||
          isPending ||
          !hasEnoughBalance() ||
          !recipients.every(
            (r) =>
              isAddress(r.address) && parseFloat(r.amount.replace(/,/g, "")) > 0
          ) ||
          parseFloat(durationValue) <= 0
        }
        className="w-full bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-50 
                 disabled:cursor-not-allowed transition-all duration-200 rounded-lg
                 py-3 px-6 text-white font-medium border border-white/[0.08]"
      >
        {isLoading || isPending
          ? "Processing..."
          : !hasEnoughBalance()
          ? "Insufficient Balance"
          : "Create Stream"}
      </button>

      {/* Balance Display */}
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>Balance:</span>
        <span>
          {formatUnits(tokenBalance, selectedToken.decimals)}{" "}
          {selectedToken.name}
        </span>
      </div>
    </div>
  );
}
