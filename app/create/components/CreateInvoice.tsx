"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { useAlert } from "@/hooks/useAlert";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { INVOICE_MANAGER_ADDRESS } from "../../../contracts/addresses";
import { InvoiceManagerABI } from "../../../contracts/InvoiceManager.sol/InvoiceManager";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { sepolia } from "viem/chains";
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
        address: INVOICE_MANAGER_ADDRESS[sepolia.id],
        abi: InvoiceManagerABI.abi,
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

  useEffect(() => {
    if (details.amount || details.dueDate) {
      onDataUpdate(details.amount, details.dueDate);
    }
  }, [details.amount, details.dueDate, onDataUpdate]);

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

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="text"
                value={details.amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white 
                         placeholder:text-white/20 transition-all duration-200
                         hover:bg-white/[0.04] focus:bg-white/[0.04]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                {selectedToken.name}
              </span>
            </div>
          </div>

          {/* Recipient Input */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Recipient
            </label>
            <input
              type="text"
              value={details.recipient}
              onChange={(e) => handleDetailsChange("recipient", e.target.value)}
              placeholder="Enter recipient address or ENS"
              className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white 
                       placeholder:text-white/20 transition-all duration-200
                       hover:bg-white/[0.04] focus:bg-white/[0.04]"
            />
          </div>

          {/* Due Date Input */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Due Date
            </label>
            <DatePicker
              selected={details.dueDate}
              onChange={(date) => handleDetailsChange("dueDate", date)}
              minDate={new Date()}
              placeholderText="Select due date"
              className="w-full bg-white/[0.02] rounded-lg px-4 py-3 text-white 
                       placeholder:text-white/20 transition-all duration-200
                       hover:bg-white/[0.04] focus:bg-white/[0.04]"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || isPending}
            className="w-full bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 rounded-lg
                     py-3 px-6 text-white font-medium"
          >
            {isLoading || isPending ? "Processing..." : "Create Invoice"}
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
              <span className="text-sm text-white/60">Amount</span>
            </div>
            <span className="text-sm font-medium text-white">
              {details.amount || "0"} {selectedToken.name}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <UserCircleIcon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Recipient</span>
            </div>
            <span className="text-sm font-medium text-white">
              {details.recipient || "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <CalendarIcon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Due Date</span>
            </div>
            <span className="text-sm font-medium text-white">
              {details.dueDate
                ? details.dueDate.toLocaleDateString()
                : "Not set"}
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
