"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useReadContract, useWriteContract } from "wagmi";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager";
import { INVOICE_MANAGER_ADDRESS, getAddress } from "contracts/addresses";
import { sepolia } from "viem/chains";
import { formatUnits } from "viem";
import Image from "next/image";
import { useEnsName } from "wagmi";
import SpinningLogo from "@/components/SpinningLogo";
import { ERC20ABI } from "contracts/ERC20.sol/ERC20";
import { client } from "../../../wagmi.config";
import ContentSkeleton from "@/components/shared/ui/ContentSkeleton";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { HomeIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import AddressDisplay from "@/components/shared/AddressDisplay";

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

const fadeInVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: custom * 0.05,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

interface Invoice {
  id: string;
  invoiceId: string;
  amount: string;
  tokenAddress: string;
  issuerAddress: string;
  clientAddress: string;
  dueDate: string;
  issuedDate: string;
  paid: boolean;
  paidDate?: string | null;
  paymentTransactionHash?: string | null;
}

const getTokenInfo = (tokenAddress: string | undefined) => {
  const tokenMap: { [key: string]: { symbol: string; decimals: number } } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": {
      symbol: "USDC",
      decimals: 6,
    },
    "0x552ceaDf3B47609897279F42D3B3309B604896f3": {
      symbol: "DAI",
      decimals: 18,
    },
  };
  if (!tokenAddress) return { symbol: "Unknown", decimals: 18 };
  return tokenMap[tokenAddress] || { symbol: "Unknown", decimals: 18 };
};

const formatAmount = (
  amount: string | undefined,
  tokenAddress: string | undefined
): string => {
  if (!amount || !tokenAddress) return "0";
  try {
    const tokenInfo = getTokenInfo(tokenAddress);
    const formattedAmount = formatUnits(BigInt(amount), tokenInfo.decimals);
    return parseFloat(formattedAmount).toLocaleString();
  } catch (error) {
    console.error("Error formatting amount:", error);
    return "0";
  }
};

export default function InvoiceIdClient({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const { address } = useAppKitAccount();
  const { writeContractAsync: approveToken } = useWriteContract();
  const { writeContractAsync: payInvoice } = useWriteContract();
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "approving" | "approved" | "paying"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const { data: onChainInvoice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: InvoiceManagerABI,
    functionName: "getInvoice",
    args: [BigInt(invoiceId)],
  });

  // Update the allowance query with proper typing
  const { data: currentAllowance = BigInt(0) } = useReadContract({
    address: invoice?.tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: "allowance",
    args:
      address && invoice
        ? [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`]
        : undefined,
  }) as { data: bigint | undefined };

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!address) {
        setError("Please connect your wallet to view this invoice");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Sending request with address:", address.toLowerCase());
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: {
            "x-user-address": address.toLowerCase(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          console.log("Error response:", data);
          if (response.status === 403) {
            setError(
              data.message ||
                "You must be either the invoice issuer or recipient to view this invoice"
            );
          } else {
            setError(data.error || "Failed to fetch invoice details");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Invoice data:", data);

        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Failed to fetch invoice details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, address]);

  const handlePayInvoice = async () => {
    try {
      setError(null);
      setPaymentStep("approving");

      if (!invoice || !address) return;

      const invoiceAmount = BigInt(invoice.amount);
      // Calculate fee with 200 token cap
      const maxFee =
        BigInt(200) * BigInt(10 ** getTokenInfo(invoice.tokenAddress).decimals);
      const calculatedFee = (invoiceAmount * BigInt(15)) / BigInt(1000);
      const fee = calculatedFee > maxFee ? maxFee : calculatedFee;
      const totalAmount = invoiceAmount + fee;

      // Check if we need to approve
      const needsApproval = currentAllowance < totalAmount;

      if (needsApproval) {
        try {
          const approveTx = await approveToken({
            address: invoice.tokenAddress as `0x${string}`,
            abi: ERC20ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESS as `0x${string}`, totalAmount],
          });

          // Wait for approval transaction to be confirmed
          const approvalReceipt = await client.waitForTransactionReceipt({
            hash: approveTx,
          });

          if (approvalReceipt.status !== "success") {
            throw new Error("Approval transaction failed");
          }

          setPaymentStep("approved");
          console.log("Approval transaction confirmed:", approveTx);
        } catch (error: any) {
          setError("Failed to approve token spending. Please try again.");
          setPaymentStep("idle");
          return;
        }
      } else {
        setPaymentStep("approved");
      }

      // Proceed with paying the invoice
      setPaymentStep("paying");
      const payTx = await payInvoice({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: InvoiceManagerABI,
        functionName: "payInvoice",
        args: [BigInt(invoice.invoiceId)],
      });

      // Wait for payment transaction to be confirmed
      const paymentReceipt = await client.waitForTransactionReceipt({
        hash: payTx,
      });

      if (paymentReceipt.status !== "success") {
        throw new Error("Payment transaction failed");
      }

      // Update database after transaction is confirmed
      const response = await fetch("/api/invoices/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.invoiceId,
          paymentTransactionHash: payTx,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update invoice status: ${errorData.error}`);
      }

      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice.invoice);
      setPaymentStep("idle");
    } catch (error: any) {
      console.error("Error paying invoice:", error);
      let errorMessage = "An error occurred while paying the invoice.";

      if (error.message.includes("InvoiceAlreadyPaid")) {
        errorMessage = "This invoice has already been paid.";
      } else if (error.message.includes("UnauthorizedPayment")) {
        errorMessage = "You are not authorized to pay this invoice.";
      } else if (error.message.includes("InvoiceDoesNotExist")) {
        errorMessage = "This invoice does not exist.";
      } else if (error.message.includes("InsufficientAllowance")) {
        errorMessage = "Insufficient token allowance. Please try again.";
      } else if (error.message.includes("InsufficientBalance")) {
        errorMessage = "Insufficient balance to pay this invoice.";
      } else if (error.message.includes("InsufficientTokenBalance")) {
        errorMessage = "Insufficient token balance to pay this invoice.";
      }

      setError(errorMessage);
      setPaymentStep("idle");
    }
  };

  const getPaymentButtonText = () => {
    switch (paymentStep) {
      case "approving":
        return "approving_token_transfer...";
      case "approved":
        return "preparing_payment...";
      case "paying":
        return "confirming_payment...";
      default:
        const totalAmount = invoice
          ? BigInt(invoice.amount) +
            (BigInt(invoice.amount) * BigInt(1)) / BigInt(100)
          : BigInt(0);
        const needsApproval = currentAllowance < totalAmount;
        return needsApproval ? "approve_and_pay" : "pay_invoice";
    }
  };

  // Add safe access to invoice data
  const getInvoiceData = () => {
    if (!invoice) return null;

    // Calculate fee with 200 token cap
    const maxFee =
      BigInt(200) * BigInt(10 ** getTokenInfo(invoice.tokenAddress).decimals);
    const calculatedFee = (BigInt(invoice.amount) * BigInt(15)) / BigInt(1000);
    const feeAmount = calculatedFee > maxFee ? maxFee : calculatedFee;
    const totalAmount = BigInt(invoice.amount) + feeAmount;

    return {
      amount: formatAmount(invoice.amount, invoice.tokenAddress),
      symbol: getTokenInfo(invoice.tokenAddress).symbol,
      status: invoice.paid ? "paid" : "pending",
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      issuedDate: new Date(invoice.issuedDate).toLocaleDateString(),
      paidDate: invoice.paidDate
        ? new Date(invoice.paidDate).toLocaleString()
        : null,
      txHash: invoice.paymentTransactionHash,
      fee: formatAmount(feeAmount.toString(), invoice.tokenAddress),
      total: formatAmount(totalAmount.toString(), invoice.tokenAddress),
    };
  };

  if (!address) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              error
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">$</span>
                <span className="text-sm font-jetbrains text-red-500">
                  wallet_not_connected
                </span>
              </div>
              <p className="text-sm font-jetbrains text-white/60 pl-4">
                Please connect your wallet to view invoice details
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              loading
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <span className="text-sm font-jetbrains text-white/60 animate-pulse">
                fetching_invoice_data...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              error
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">$</span>
                <span className="text-sm font-jetbrains text-red-500">
                  access_denied
                </span>
              </div>
              <p className="text-sm font-jetbrains text-white/60 pl-4">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const invoiceData = getInvoiceData();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link
            href="/invoices"
            className="flex items-center gap-2 text-sm font-jetbrains text-white/40 hover:text-white/60"
          >
            <span>$</span>
            <span>cd ..</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm font-jetbrains text-white/60">
            invoice_{invoiceId}
          </span>
        </div>

        {/* Main Content */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            details
          </h2>

          {invoiceData && (
            <div className="space-y-6">
              {/* Status and Amount Row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 font-jetbrains text-sm">
                    $
                  </span>
                  <span className="text-sm font-jetbrains text-emerald-500">
                    {invoiceData.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src={`/tokens/${invoiceData.symbol}.png`}
                    alt={invoiceData.symbol}
                    width={16}
                    height={16}
                    className="opacity-80"
                  />
                  <span className="text-lg font-jetbrains text-white">
                    {invoiceData.amount} {invoiceData.symbol}
                  </span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="pl-4 space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 font-jetbrains text-sm">
                    $
                  </span>
                  <span className="text-sm font-jetbrains text-white/60">
                    amount_breakdown
                  </span>
                </div>

                <div className="pl-4 space-y-2 overflow-x-auto">
                  {/* Base Amount */}
                  <div className="flex items-center justify-between min-w-[300px]">
                    <span className="text-sm font-jetbrains text-white/40">
                      base_amount
                    </span>
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/tokens/${invoiceData.symbol}.png`}
                        alt={invoiceData.symbol}
                        width={14}
                        height={14}
                        className="opacity-60"
                      />
                      <span className="text-sm font-jetbrains text-white/80">
                        {invoiceData.amount}
                      </span>
                    </div>
                  </div>

                  {/* Platform Fee */}
                  <div className="flex items-center justify-between min-w-[300px]">
                    <span className="text-sm font-jetbrains text-white/40">
                      platform_fee (1.5%)
                    </span>
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/tokens/${invoiceData.symbol}.png`}
                        alt={invoiceData.symbol}
                        width={14}
                        height={14}
                        className="opacity-60"
                      />
                      <span className="text-sm font-jetbrains text-white/80">
                        {invoiceData.fee}
                      </span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] min-w-[300px]">
                    <span className="text-sm font-jetbrains text-white/60">
                      total_amount
                    </span>
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/tokens/${invoiceData.symbol}.png`}
                        alt={invoiceData.symbol}
                        width={14}
                        height={14}
                        className="opacity-80"
                      />
                      <span className="text-sm font-jetbrains text-white font-medium">
                        {invoiceData.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="pl-4 space-y-4 pt-4 border-t border-white/[0.08] overflow-x-auto">
                <div className="flex items-center gap-2 min-w-[300px]">
                  <span className="text-white/40 font-jetbrains text-sm w-16">
                    from:
                  </span>
                  <span className="text-sm font-jetbrains text-white/80 break-all">
                    {invoice?.issuerAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-[300px]">
                  <span className="text-white/40 font-jetbrains text-sm w-16">
                    to:
                  </span>
                  <span className="text-sm font-jetbrains text-white/80 break-all">
                    {invoice?.clientAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-[300px]">
                  <span className="text-white/40 font-jetbrains text-sm w-16">
                    issued:
                  </span>
                  <span className="text-sm font-jetbrains text-white/80 break-all">
                    {invoiceData.issuedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-[300px]">
                  <span className="text-white/40 font-jetbrains text-sm w-16">
                    due:
                  </span>
                  <span className="text-sm font-jetbrains text-white/80 break-all">
                    {invoiceData.dueDate}
                  </span>
                </div>
              </div>

              {/* Payment Details if paid */}
              {invoice?.paid && (
                <div className="pl-4 space-y-4 pt-4 border-t border-white/[0.08] overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-[300px]">
                    <span className="text-white/40 font-jetbrains text-sm w-16">
                      paid:
                    </span>
                    <span className="text-sm font-jetbrains text-white/80 break-all">
                      {invoiceData.paidDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[300px]">
                    <span className="text-white/40 font-jetbrains text-sm w-16">
                      tx:
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${invoiceData.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-jetbrains text-white/60 hover:text-white/80 break-all"
                    >
                      {invoiceData.txHash}
                    </a>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              {!invoice?.paid &&
                address?.toLowerCase() ===
                  invoice?.clientAddress?.toLowerCase() && (
                  <div className="pt-4 border-t border-white/[0.08] flex justify-end">
                    <button
                      onClick={handlePayInvoice}
                      disabled={paymentStep !== "idle"}
                      className="group flex items-center gap-3 px-4 py-3 backdrop-blur-sm 
                               bg-emerald-500/10 hover:bg-emerald-500/20 
                               border border-emerald-500/20 hover:border-emerald-500/30
                               transition-all duration-200 
                               disabled:opacity-50 disabled:cursor-not-allowed 
                               w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <span className="text-emerald-500 font-jetbrains text-sm animate-pulse">
                        $
                      </span>
                      <span className="text-sm font-jetbrains text-emerald-500 group-hover:text-emerald-400 transition-colors">
                        {getPaymentButtonText()}
                      </span>
                      {paymentStep === "idle" && (
                        <span className="ml-1 text-emerald-500 animate-pulse">
                          ▋
                        </span>
                      )}
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
