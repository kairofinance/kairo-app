"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useAlert } from "@/components/shared/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { INVOICE_MANAGER_ADDRESS } from "../../../contracts/addresses";
import { InvoiceManagerABI } from "../../../contracts/InvoiceManager.sol/InvoiceManager";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { sepolia } from "viem/chains";
import { UserCircleIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { client } from "../../../wagmi.config";
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

interface InvoiceDetails {
  amount: string;
  recipient: string;
  dueDate: Date | null;
}

interface CreateInvoiceProps {
  onDataUpdate: (amount: string, dueDate: Date | null) => void;
}

export default function CreateInvoice({ onDataUpdate }: CreateInvoiceProps) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [details, setDetails] = useState<InvoiceDetails>({
    amount: "",
    recipient: "",
    dueDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { alertState, showAlert, dismissAlert } = useAlert();
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { selectedTeam } = useTeamContext();

  const { data: tokenBalance = BigInt(0) } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint };

  const hasEnoughBalance = useCallback(() => {
    if (!tokenBalance || !details.amount) return false;

    const amount = parseUnits(
      details.amount.replace(/,/g, "") || "0",
      selectedToken.decimals
    );
    const maxFee = BigInt(200) * BigInt(10 ** selectedToken.decimals);
    const calculatedFee = (amount * BigInt(15)) / BigInt(1000);
    const feeAmount = calculatedFee > maxFee ? maxFee : calculatedFee;
    const totalNeeded = amount + feeAmount;

    return tokenBalance >= totalNeeded;
  }, [tokenBalance, details.amount, selectedToken.decimals]);

  const handleDetailsChange = (
    field: keyof InvoiceDetails,
    value: string | Date | null
  ) => {
    setDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatAmount = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts[1]
      ? `.${parts[1].slice(0, selectedToken.decimals)}`
      : "";
    return integerPart + decimalPart;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, "");
    if (!inputValue) {
      handleDetailsChange("amount", "");
      return;
    }
    handleDetailsChange("amount", formatAmount(inputValue));
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      showAlert("Please connect your wallet first.", "error");
      return;
    }

    if (!details.recipient || !details.amount || !details.dueDate) {
      showAlert("Please fill in all required fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Validate recipient address
      if (!isAddress(details.recipient)) {
        throw new Error("Invalid recipient address");
      }

      // Validate amount is greater than 0
      const numericAmount = details.amount.replace(/,/g, "");
      if (parseFloat(numericAmount) <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Validate due date is in the future
      if (details.dueDate.getTime() <= Date.now()) {
        throw new Error("Due date must be in the future");
      }

      const parsedAmount = parseUnits(
        details.amount.replace(/,/g, ""),
        selectedToken.decimals
      );
      const dueDateTimestamp = Math.floor(details.dueDate.getTime() / 1000);

      // First, create the invoice on-chain
      try {
        const result = await writeContractAsync({
          address: INVOICE_MANAGER_ADDRESS[sepolia.id],
          abi: InvoiceManagerABI.abi,
          functionName: "createInvoice",
          args: [
            selectedTeam ? selectedTeam.treasuryAddress || address : address,
            details.recipient as `0x${string}`,
            parsedAmount,
            BigInt(dueDateTimestamp),
            selectedToken.address as `0x${string}`,
          ],
          chainId: sepolia.id,
        });

        // Wait for transaction confirmation
        const receipt = await client.waitForTransactionReceipt({
          hash: result,
        });

        if (receipt.status !== "success") {
          throw new Error("Transaction failed");
        }

        // After successful on-chain creation, create record in database
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            issuerAddress: selectedTeam
              ? selectedTeam.treasuryAddress || address
              : address,
            clientAddress: details.recipient,
            tokenAddress: selectedToken.address,
            amount: parsedAmount.toString(),
            dueDate: details.dueDate.toISOString(),
            creationTransactionHash: result,
            invoiceId: result,
            teamId: selectedTeam?.id || undefined,
            createdBy: address,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create invoice record");
        }

        const data = await response.json();
        showAlert("Invoice created successfully!", "success");
        router.push(`/invoice/${data.invoice.invoiceId}`);
      } catch (error: any) {
        // Handle specific contract errors
        if (error.message.includes("TokenNotWhitelisted")) {
          throw new Error("Selected token is not supported");
        } else if (error.message.includes("InvalidDueDate")) {
          throw new Error("Invalid due date");
        } else if (error.message.includes("InvalidAmount")) {
          throw new Error("Invalid amount");
        } else {
          throw new Error("Failed to create invoice on blockchain");
        }
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      showAlert(error.message || "Failed to create invoice", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (details.amount || details.dueDate) {
      onDataUpdate(details.amount, details.dueDate);
    }
  }, [details.amount, details.dueDate, onDataUpdate]);

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

      {/* Amount Input */}
      <Input
        label="Amount"
        value={details.amount}
        onChange={handleAmountChange}
        placeholder="Enter amount"
        tokenIcon={selectedToken.image}
        suffix={selectedToken.name}
      />

      {/* Recipient Input */}
      <Input
        label="Recipient"
        icon={<UserCircleIcon className="w-4 h-4" />}
        value={details.recipient}
        onChange={(e) => handleDetailsChange("recipient", e.target.value)}
        placeholder="Enter recipient address or ENS"
        error={
          details.recipient && !isAddress(details.recipient)
            ? "Invalid address format"
            : undefined
        }
      />

      {/* Due Date Input */}
      <div className="space-y-2">
        <label className="text-sm text-white/40 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-white/60" />
          Due Date
        </label>
        <DatePicker
          selected={details.dueDate}
          onChange={(date) => handleDetailsChange("dueDate", date)}
          minDate={new Date()}
          placeholderText="Select due date"
          className="w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 
                   rounded-lg px-4 py-3 text-white border border-white/[0.08]
                   placeholder:text-white/20 transition-all duration-200"
        />
      </div>

      {/* Create Button */}
      <button
        onClick={handleSubmit}
        disabled={
          isLoading ||
          isPending ||
          !hasEnoughBalance() ||
          !details.recipient ||
          !details.amount ||
          !details.dueDate ||
          !isAddress(details.recipient)
        }
        className="w-full bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-50 
                 disabled:cursor-not-allowed transition-all duration-200 rounded-lg
                 py-3 px-6 text-white font-medium border border-white/[0.08]"
      >
        {isLoading || isPending
          ? "Processing..."
          : !hasEnoughBalance()
          ? "Insufficient Balance"
          : "Create Invoice"}
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
