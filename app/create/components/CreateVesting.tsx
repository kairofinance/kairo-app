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
} from "recharts";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { useAlert } from "@/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { VEST_MANAGER_ADDRESS } from "../../../contracts/addresses";
import { VestManagerABI } from "../../../contracts/VestManager.sol/VestManager";
import { sepolia } from "viem/chains";
import { client } from "../../../wagmi.config";
import { ERC20ABI } from "../../../contracts/ERC20.sol/ERC20";
import { UserCircleIcon, CalendarIcon } from "@heroicons/react/24/outline";

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
        });

        // Wait for vesting creation transaction to be confirmed
        const vestingReceipt = await client.waitForTransactionReceipt({
          hash: vestingTx,
        });

        if (vestingReceipt.status !== "success") {
          throw new Error("Vesting schedule creation failed");
        }
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
            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg"
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
                      className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white 
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
                        placeholder="Amount"
                        className="w-full bg-white/[0.02] rounded-lg px-4 pr-16 py-3 text-white 
                                 placeholder:text-white/20 transition-all duration-200
                                 hover:bg-white/[0.04] focus:bg-white/[0.04]"
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
                        className="w-full bg-white/[0.02] rounded-lg px-4 pr-20 py-3 text-white 
                                 placeholder:text-white/20 transition-all duration-200
                                 hover:bg-white/[0.04] focus:bg-white/[0.04]"
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
                        className="w-full bg-white/[0.02] rounded-lg px-4 pr-20 py-3 text-white 
                                 placeholder:text-white/20 transition-all duration-200
                                 hover:bg-white/[0.04] focus:bg-white/[0.04]"
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
                        className="w-full bg-white/[0.02] rounded-lg px-4 pr-12 py-3 text-white 
                                 placeholder:text-white/20 transition-all duration-200
                                 hover:bg-white/[0.04] focus:bg-white/[0.04]"
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
          <button
            onClick={handleSubmit}
            disabled={isLoading || isPending}
            className="w-full bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 rounded-lg
                     py-3 px-6 text-white font-medium"
          >
            {isLoading || isPending ? "Processing..." : "Create Vesting"}
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
              <div className="text-right">
                <span className="text-sm font-medium text-white">
                  {recipient.amount || "0"} {selectedToken.name}
                </span>
                <div className="text-xs text-white/40">
                  {recipient.cliffDuration} months cliff,{" "}
                  {recipient.vestingDuration} months vesting
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <CalendarIcon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Initial Release</span>
            </div>
            <span className="text-sm font-medium text-white">
              {recipients[0]?.initialRelease || "0"}%
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
