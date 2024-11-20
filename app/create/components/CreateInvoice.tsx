"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { useAlert } from "@/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { INVOICE_MANAGER_ADDRESS } from "@/config/contracts";
import { InvoiceManagerABI } from "@/config/abis";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function CreateInvoice() {
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
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Handle decimal places based on token decimals
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
    if (!isConnected) {
      showAlert("Please connect your wallet first.", "error");
      return;
    }

    if (!details.amount || !details.recipient || !details.dueDate) {
      showAlert("Please fill out all fields.", "error");
      return;
    }

    if (!isAddress(details.recipient)) {
      showAlert("Please enter a valid recipient address.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const parsedAmount = parseUnits(
        details.amount.replace(/,/g, ""),
        selectedToken.decimals
      );
      const dueDateTimestamp = Math.floor(details.dueDate.getTime() / 1000);

      const result = await writeContractAsync({
        address: INVOICE_MANAGER_ADDRESS,
        abi: InvoiceManagerABI,
        functionName: "createInvoice",
        args: [
          details.recipient,
          parsedAmount,
          BigInt(dueDateTimestamp),
          selectedToken.address,
        ],
      });

      showAlert("Invoice created successfully!", "success");
      router.push(`/invoice/${result}`);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      showAlert(error.message || "Failed to create invoice", "error");
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

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <label className="text-sm font-jetbrains text-white/60">
                amount
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={details.amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 py-3 
                         text-white placeholder-white/40 border border-white/[0.08] 
                         focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                         transition-all duration-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-jetbrains text-sm">
                {selectedToken.name}
              </span>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <label className="text-sm font-jetbrains text-white/60">
                recipient
              </label>
            </div>
            <input
              type="text"
              value={details.recipient}
              onChange={(e) => handleDetailsChange("recipient", e.target.value)}
              placeholder="Enter recipient address or ENS"
              className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 py-3 
                       text-white placeholder-white/40 border border-white/[0.08] 
                       focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                       transition-all duration-200"
            />
          </div>

          {/* Due Date Input */}
          <div className="space-y-2 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <label className="text-sm font-jetbrains text-white/60">
                due_date
              </label>
            </div>
            <DatePicker
              selected={details.dueDate}
              onChange={(date) => handleDetailsChange("dueDate", date)}
              minDate={new Date()}
              placeholderText="Select due date"
              className="w-full bg-white/[0.02] font-jetbrains rounded-none px-4 py-3 
                       text-white placeholder-white/40 border border-white/[0.08] 
                       focus:border-white/[0.12] focus:bg-white/[0.02] hover:bg-white/[0.04]
                       transition-all duration-200"
            />
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
              {isLoading || isPending ? "processing..." : "create_invoice"}
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
              cat invoice.json
            </span>
          </div>

          {/* JSON-like Preview */}
          <div className="font-jetbrains text-sm space-y-2">
            <div className="text-white/40">{`{`}</div>

            {/* Amount */}
            <div className="pl-4 space-y-1">
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;amount&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/80">{details.amount || "0"}</span>
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

              {/* Recipient */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;recipient&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/80">
                  {details.recipient || "null"}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;due_date&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/80">
                  {details.dueDate
                    ? `"${details.dueDate.toISOString()}"`
                    : "null"}
                </span>
              </div>

              {/* Token */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;token&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-white/80">
                  {`"${selectedToken.address}"`}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-start">
                <span className="text-emerald-500">&quot;status&quot;</span>
                <span className="text-white/40 mx-2">:</span>
                <span className="text-orange-500">&quot;draft&quot;</span>
              </div>
            </div>
            <div className="text-white/40">{`}`}</div>
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

          {/* Validation Messages */}
          {(!details.amount || !details.recipient || !details.dueDate) && (
            <div className="space-y-1 pt-2">
              {!details.amount && (
                <div className="flex items-center gap-2 text-sm font-jetbrains">
                  <span className="text-red-500">!</span>
                  <span className="text-red-500/60">amount required</span>
                </div>
              )}
              {!details.recipient && (
                <div className="flex items-center gap-2 text-sm font-jetbrains">
                  <span className="text-red-500">!</span>
                  <span className="text-red-500/60">recipient required</span>
                </div>
              )}
              {!details.dueDate && (
                <div className="flex items-center gap-2 text-sm font-jetbrains">
                  <span className="text-red-500">!</span>
                  <span className="text-red-500/60">due date required</span>
                </div>
              )}
            </div>
          )}
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
