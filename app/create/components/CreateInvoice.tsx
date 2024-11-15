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
import { DocumentTextIcon, CalendarIcon } from "@heroicons/react/24/outline";

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

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm text-white/40">Amount</label>
          <div className="relative">
            <input
              type="text"
              value={details.amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white placeholder-white/40 
                       border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.04]
                       transition-all duration-200"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {selectedToken.name}
            </span>
          </div>
        </div>

        {/* Recipient Input */}
        <div className="space-y-2">
          <label className="text-sm text-white/40">Recipient</label>
          <input
            type="text"
            value={details.recipient}
            onChange={(e) => handleDetailsChange("recipient", e.target.value)}
            placeholder="Enter recipient address or ENS"
            className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white placeholder-white/40 
                     border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.04]
                     transition-all duration-200"
          />
        </div>

        {/* Due Date Input */}
        <div className="space-y-2 flex flex-col">
          <label className="text-sm text-white/40">Due Date</label>
          <DatePicker
            selected={details.dueDate}
            onChange={(date) => handleDetailsChange("dueDate", date)}
            minDate={new Date()}
            placeholderText="Select due date"
            className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white placeholder-white/40 
                     border border-white/[0.08] focus:border-white/[0.12] focus:bg-white/[0.04]
                     transition-all duration-200"
          />
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
              Creating Invoice...
            </span>
          ) : (
            "Create Invoice"
          )}
        </motion.button>
      </div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">
              Invoice Preview
            </h3>
            <DocumentTextIcon className="w-5 h-5 text-white/40" />
          </div>

          {/* Preview Content */}
          <div className="space-y-4">
            {/* Amount Preview */}
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="text-sm text-white/40 mb-1">Amount</div>
              <div className="flex items-center gap-2">
                <Image
                  src={selectedToken.image}
                  width={24}
                  height={24}
                  alt={selectedToken.name}
                  className="opacity-80"
                />
                <span className="text-xl font-light text-white">
                  {details.amount || "0"} {selectedToken.name}
                </span>
              </div>
            </div>

            {/* Recipient Preview */}
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="text-sm text-white/40 mb-1">To</div>
              <div className="text-white truncate">
                {details.recipient || "No recipient selected"}
              </div>
            </div>

            {/* Due Date Preview */}
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="text-sm text-white/40 mb-1">Due Date</div>
              <div className="flex items-center gap-2 text-white">
                <CalendarIcon className="w-4 h-4 text-white/60" />
                {details.dueDate
                  ? details.dueDate.toLocaleDateString()
                  : "No date selected"}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-sm text-white/40">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Draft Invoice</span>
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
