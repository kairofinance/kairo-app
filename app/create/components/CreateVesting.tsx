"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useAlert } from "@/components/shared/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import { VEST_MANAGER_ADDRESS } from "../../../contracts/addresses";
import { VestManagerABI } from "../../../contracts/VestManager.sol/VestManager";
import { sepolia } from "viem/chains";
import { client } from "../../../wagmi.config";
import {
  UserCircleIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTeamContext } from "@/components/context/TeamContext";
import { ERC20ABI } from "../../../contracts/ERC20.sol/ERC20";
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

interface VestingRecipient {
  recipient: string;
  amount: string;
  cliffDuration: string;
  vestingDuration: string;
  initialRelease: string;
}

interface CreateVestingProps {
  onDataUpdate: (
    recipients: {
      recipient: string;
      amount: string;
      cliffDuration: string;
      vestingDuration: string;
      initialRelease: string;
    }[]
  ) => void;
}

export default function CreateVesting({ onDataUpdate }: CreateVestingProps) {
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
  const { readContract } = useReadContract();
  const { selectedTeam } = useTeamContext();

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
      // Calculate total amount needed including fees for all vesting schedules
      const totalBaseAmount = recipients.reduce((sum, recipient) => {
        const amount = parseUnits(
          recipient.amount.replace(/,/g, ""),
          selectedToken.decimals
        );
        return sum + amount;
      }, BigInt(0));

      // Calculate fee amount (1.5%) with 200 token cap
      const maxFee = BigInt(200) * BigInt(10 ** selectedToken.decimals);
      const calculatedFee = (totalBaseAmount * BigInt(15)) / BigInt(1000);
      const feeAmount = calculatedFee > maxFee ? maxFee : calculatedFee;
      const totalWithFee = totalBaseAmount + feeAmount;

      // Check current allowance
      const allowance = (await readContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, VEST_MANAGER_ADDRESS[sepolia.id]],
      })) as bigint;

      // Handle token approval if needed
      if (allowance < totalWithFee) {
        showAlert("Approving token spending...", "info");

        const approveTx = await writeContractAsync({
          address: selectedToken.address as `0x${string}`,
          abi: ERC20ABI,
          functionName: "approve",
          args: [VEST_MANAGER_ADDRESS[sepolia.id], totalWithFee],
        });

        // Wait for approval transaction to be confirmed
        const approvalReceipt = await client.waitForTransactionReceipt({
          hash: approveTx,
        });

        if (approvalReceipt.status !== "success") {
          throw new Error("Approval transaction failed");
        }

        showAlert(
          "Token approval successful. Creating vesting schedules...",
          "info"
        );
      }

      // Create multiple vesting schedules in a loop
      for (const recipient of recipients) {
        const parsedAmount = parseUnits(
          recipient.amount.replace(/,/g, ""),
          selectedToken.decimals
        );

        const cliffSeconds = BigInt(
          Math.floor(parseFloat(recipient.cliffDuration) * 30 * 24 * 60 * 60)
        );
        const vestingSeconds = BigInt(
          Math.floor(parseFloat(recipient.vestingDuration) * 30 * 24 * 60 * 60)
        );
        const initialReleasePercentage = BigInt(
          Math.floor(parseFloat(recipient.initialRelease) * 100)
        );

        const vestingTx = await writeContractAsync({
          address: VEST_MANAGER_ADDRESS[sepolia.id],
          abi: VestManagerABI.abi,
          functionName: "createVestingSchedule",
          args: [
            recipient.recipient,
            selectedToken.address as `0x${string}`,
            parsedAmount,
            cliffSeconds,
            vestingSeconds,
            initialReleasePercentage,
          ],
          chainId: sepolia.id,
        });

        // Wait for vesting creation transaction to be confirmed
        const vestingReceipt = await client.waitForTransactionReceipt({
          hash: vestingTx,
        });

        if (vestingReceipt.status !== "success") {
          throw new Error("Vesting schedule creation failed");
        }

        // Update database with team context
        await fetch("/api/vesting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vestingId: vestingTx,
            grantor: selectedTeam
              ? selectedTeam.treasuryAddress || address
              : address,
            beneficiary: recipient.recipient,
            tokenAddress: selectedToken.address,
            amount: recipient.amount,
            cliffDuration: recipient.cliffDuration,
            vestingDuration: recipient.vestingDuration,
            initialRelease: recipient.initialRelease,
            creationTransactionHash: vestingTx,
            teamId: selectedTeam?.id || undefined,
            createdBy: address, // Store the actual wallet that created it
          }),
        });
      }

      showAlert("Vesting schedules created successfully!", "success");
      router.push("/vesting");
    } catch (error: any) {
      console.error("Error creating vesting schedules:", error);
      const errorMessage =
        error.message || "Failed to create vesting schedules";
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

  // Inside the component, add useEffect to update parent when data changes
  useEffect(() => {
    if (recipients.some((r) => r.amount || r.recipient)) {
      onDataUpdate(recipients);
    }
  }, [recipients, onDataUpdate]);

  // Add balance check hooks
  const { data: tokenBalance = BigInt(0) } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint };

  // Add balance check function
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
                  value={recipient.recipient}
                  onChange={(e) =>
                    handleRecipientChange(index, "recipient", e.target.value)
                  }
                  placeholder="0x.../ENS"
                  icon={<UserCircleIcon className="w-4 h-4" />}
                  error={
                    recipient.recipient && !isAddress(recipient.recipient)
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  value={recipient.cliffDuration}
                  onChange={(e) =>
                    handleRecipientChange(
                      index,
                      "cliffDuration",
                      e.target.value
                    )
                  }
                  placeholder="Cliff"
                  icon={<ClockIcon className="w-4 h-4" />}
                  suffix="Months"
                  type="number"
                  min="0"
                />

                <Input
                  value={recipient.vestingDuration}
                  onChange={(e) =>
                    handleRecipientChange(
                      index,
                      "vestingDuration",
                      e.target.value
                    )
                  }
                  placeholder="Duration"
                  icon={<CalendarIcon className="w-4 h-4" />}
                  suffix="Months"
                  type="number"
                  min="0"
                />

                <Input
                  value={recipient.initialRelease}
                  onChange={(e) =>
                    handleRecipientChange(
                      index,
                      "initialRelease",
                      e.target.value
                    )
                  }
                  placeholder="Initial"
                  icon={<ArrowPathIcon className="w-4 h-4" />}
                  suffix="%"
                  type="number"
                  min="0"
                  max="100"
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

      {/* Create Button */}
      <button
        onClick={handleSubmit}
        disabled={
          isLoading ||
          isPending ||
          !hasEnoughBalance() ||
          !recipients.every(
            (r) =>
              isAddress(r.recipient) &&
              parseFloat(r.amount) > 0 &&
              parseFloat(r.vestingDuration) > 0
          )
        }
        className="w-full bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-50 
                 disabled:cursor-not-allowed transition-all duration-200 rounded-lg
                 py-3 px-6 text-white font-medium border border-white/[0.08]"
      >
        {isLoading || isPending
          ? "Processing..."
          : !hasEnoughBalance()
          ? "Insufficient Balance"
          : "Create Vesting"}
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
