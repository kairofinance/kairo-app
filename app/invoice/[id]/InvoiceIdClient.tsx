"use client";

import "@/lib/pdfjs";

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
import Spinner from "@/components/Spinner";
import { ERC20ABI } from "contracts/ERC20.sol/ERC20";
import { client } from "../../../wagmi.config";
import { PDFViewer } from "@/components/PDFViewer";
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

interface InvoiceAddressDisplayProps {
  address: string | undefined;
  label: string;
}

interface Contact {
  id: string;
  name: string;
  address: string;
}

const InvoiceAddressDisplay = ({
  address,
  label,
}: InvoiceAddressDisplayProps) => {
  const { address: currentAddress } = useAppKitAccount();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactName, setContactName] = useState<string | null>(null);
  const isCurrentUser =
    currentAddress?.toLowerCase() === address?.toLowerCase();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentAddress || !address) return;

      try {
        const response = await fetch(`/api/contacts?address=${currentAddress}`);
        if (!response.ok) throw new Error("Failed to fetch contacts");
        const data = await response.json();
        setContacts(data.contacts);

        // Find matching contact
        const matchingContact = data.contacts.find(
          (contact: Contact) =>
            contact.address.toLowerCase() === address.toLowerCase()
        );
        setContactName(matchingContact?.name || null);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [currentAddress, address]);

  return (
    <div className="space-y-1.5">
      <h2 className="text-kairo-white/70 text-xs sm:text-sm font-medium">
        {label}
      </h2>
      <div className="text-kairo-white text-base sm:text-lg font-medium">
        {!address ? (
          "No Address"
        ) : (
          <div className="space-y-1">
            {contactName ? (
              <>
                <div className="text-kairo-white font-medium">
                  {contactName}
                  {isCurrentUser && (
                    <span className="text-kairo-white/60 text-sm ml-2">
                      (You)
                    </span>
                  )}
                </div>
                <div className="text-kairo-white/60 text-sm">
                  <AddressDisplay address={address} showFull />
                </div>
              </>
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                <AddressDisplay address={address} showFull />
                {isCurrentUser && (
                  <span className="text-kairo-white/60 text-sm">(You)</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add this type definition
type TokenSymbol = "USDC" | "DAI" | "ETH";

interface TokenInfo {
  decimals: number;
  symbol: TokenSymbol;
}

export default function InvoiceIdClient({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<any>(null);
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
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: {
            "x-user-address": address,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 403) {
            setError(
              "You must be either the invoice issuer or recipient to view this invoice"
            );
          } else {
            setError(data.error || "Failed to fetch invoice details");
          }
          return;
        }

        const data = await response.json();
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

  if (!address) {
    return (
      <div className="min-h-screen bg-kairo-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-xl bg-kairo-black-a20/40 p-8 backdrop-blur-sm text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-kairo-white">
              Wallet Not Connected
            </h3>
            <p className="mt-2 text-sm text-kairo-white/70">
              Please connect your wallet to view this invoice
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get token info
  const getTokenInfo = (tokenAddress: string) => {
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
    return tokenMap[tokenAddress] || { symbol: "Unknown", decimals: 18 };
  };

  const formatAmount = (amount: string | undefined): string => {
    if (!amount) return "0";
    try {
      const tokenInfo = getTokenInfo(invoice.tokenAddress);
      const formattedAmount = formatUnits(BigInt(amount), tokenInfo.decimals);
      return parseFloat(formattedAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: tokenInfo.decimals,
      });
    } catch (error) {
      console.error("Error formatting amount:", error);
      return "0";
    }
  };

  const handlePayInvoice = async () => {
    try {
      setError(null);
      setPaymentStep("approving");

      const tokenDecimals: Record<TokenSymbol, number> = {
        USDC: 6,
        DAI: 18,
        ETH: 18,
      };

      const tokenSymbol = (invoice.token || "USDC") as TokenSymbol;
      const decimals = tokenDecimals[tokenSymbol] || 18;
      const invoiceAmount = BigInt(invoice.amount);
      const fee = (invoiceAmount * BigInt(1)) / BigInt(100);
      const totalAmount = invoiceAmount + fee;

      // Check if we need to approve with proper typing
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
        console.log("Token already approved");
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

      console.log("Payment transaction confirmed:", payTx);

      // Only update database after both transactions are confirmed
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

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.invoiceId}/pdf`, {
        headers: {
          "x-user-address": address || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceId}.pdf`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setError("Failed to download PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kairo-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <ContentSkeleton className="h-8 w-48" />
              <ContentSkeleton className="h-4 w-64" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="rounded-xl bg-kairo-black-a20/40 p-6 space-y-6">
                  {/* Amount Skeleton */}
                  <div className="flex items-center gap-4">
                    <ContentSkeleton className="w-10 h-10 rounded-full" />
                    <ContentSkeleton className="h-8 w-48" />
                  </div>

                  {/* Address Sections */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="pt-6 border-t border-kairo-black-a40/50"
                    >
                      <div className="space-y-2">
                        <ContentSkeleton className="h-4 w-24" />
                        <ContentSkeleton className="h-6 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Amount Breakdown Card */}
                <div className="rounded-xl bg-kairo-black-a20/40 p-6 space-y-4">
                  <ContentSkeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <ContentSkeleton className="h-4 w-24" />
                        <div className="flex items-center gap-2">
                          <ContentSkeleton className="w-4 h-4 rounded-full" />
                          <ContentSkeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Card */}
                <div className="rounded-xl bg-kairo-black-a20/40 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <ContentSkeleton className="h-6 w-24" />
                    <ContentSkeleton className="h-6 w-20" />
                  </div>
                  <div className="pt-4 border-t border-kairo-black-a40/50 space-y-4">
                    <div className="space-y-2">
                      <ContentSkeleton className="h-4 w-32" />
                      <ContentSkeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-2">
                      <ContentSkeleton className="h-4 w-36" />
                      <ContentSkeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-kairo-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-xl bg-kairo-black-a20/40 p-8 backdrop-blur-sm text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-kairo-white">
              Access Denied
            </h3>
            <p className="mt-2 text-sm text-kairo-white/70">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-kairo-white">Invoice not found</p>
      </div>
    );
  }

  const getPaymentButtonText = () => {
    switch (paymentStep) {
      case "approving":
        return (
          <div className="flex items-center justify-center gap-2">
            <Spinner inline size={15} />
            <span>Requesting Token Approval...</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center justify-center gap-2">
            <Spinner inline size={15} />
            <span>Preparing Payment...</span>
          </div>
        );
      case "paying":
        return (
          <div className="flex items-center justify-center gap-2">
            <Spinner inline size={15} />
            <span>Confirming Payment...</span>
          </div>
        );
      default:
        const totalAmount =
          BigInt(invoice.amount) +
          (BigInt(invoice.amount) * BigInt(1)) / BigInt(100);
        const needsApproval = currentAllowance < totalAmount;
        return needsApproval ? "Approve & Pay Invoice" : "Pay Invoice";
    }
  };

  return (
    <div className="min-h-screen bg-kairo-black">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Update breadcrumb navigation */}
        <motion.nav
          aria-label="Breadcrumb"
          className="mb-4 sm:mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ol role="list" className="flex items-center space-x-2 sm:space-x-4">
            <li>
              <div>
                <Link
                  href="/dashboard"
                  className="text-kairo-white/60 hover:text-kairo-white transition-colors duration-200"
                >
                  <HomeIcon
                    className="h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="h-5 w-5 flex-shrink-0 text-kairo-white/30"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span
                  className="ml-4 text-sm font-medium text-kairo-white"
                  aria-current="page"
                >
                  Invoice #{invoiceId}
                </span>
              </div>
            </li>
          </ol>
        </motion.nav>

        <motion.div
          className="space-y-6 sm:space-y-8"
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div
            className="flex flex-col gap-1 sm:gap-2"
            variants={fadeInVariant}
            custom={0}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-kairo-white">
              Invoice #{invoiceId}
            </h1>
            <p className="text-sm sm:text-base text-kairo-white/60">
              Created on{" "}
              {new Date(invoice.issuedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column */}
            <motion.div
              className="space-y-4 sm:space-y-6"
              variants={fadeInVariant}
              custom={1}
            >
              <motion.div className="rounded-xl bg-kairo-black-a20/40 p-4 sm:p-6 space-y-4 sm:space-y-6 backdrop-blur-sm">
                {/* Amount Display */}
                <motion.div className="flex items-center gap-3 sm:gap-4">
                  <Image
                    src={`/tokens/${
                      getTokenInfo(invoice.tokenAddress).symbol
                    }.png`}
                    alt={getTokenInfo(invoice.tokenAddress).symbol}
                    width={32}
                    height={32}
                    className="rounded-full sm:w-10 sm:h-10"
                  />
                  <div>
                    <p className="text-xl sm:text-3xl font-bold text-kairo-white">
                      {formatAmount(invoice.amount)}{" "}
                      <span className="text-lg sm:text-2xl">
                        {getTokenInfo(invoice.tokenAddress).symbol}
                      </span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="pt-6 border-t border-kairo-black-a40/50"
                  variants={fadeInVariant}
                  custom={4}
                >
                  <InvoiceAddressDisplay
                    address={invoice.issuerAddress}
                    label="From"
                  />
                </motion.div>

                <motion.div
                  className="pt-6 border-t border-kairo-black-a40/50"
                  variants={fadeInVariant}
                  custom={5}
                >
                  <InvoiceAddressDisplay
                    address={invoice.clientAddress}
                    label="To"
                  />
                </motion.div>

                <motion.div
                  className="pt-6 border-t border-kairo-black-a40/50"
                  variants={fadeInVariant}
                  custom={6}
                >
                  <h2 className="text-kairo-white/70 text-sm font-medium">
                    Due Date
                  </h2>
                  <p className="text-kairo-white text-lg font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </motion.div>

                <motion.div
                  className="pt-6 border-t border-kairo-black-a40/50"
                  variants={fadeInVariant}
                  custom={7}
                >
                  <h2 className="text-kairo-white/70 text-sm font-medium mb-2">
                    Invoice Document
                  </h2>
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-kairo-black-a20/40 hover:bg-kairo-black-a20/60 text-kairo-white/90 hover:text-kairo-white transition-all duration-200 group"
                  >
                    <span className="text-sm">Download PDF</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              className="space-y-4 sm:space-y-6"
              variants={fadeInVariant}
              custom={7}
            >
              {/* Amount Breakdown Card */}
              <motion.div className="rounded-xl bg-kairo-black-a20/40 p-4 sm:p-6 space-y-3 sm:space-y-4 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold text-kairo-white mb-2 sm:mb-4">
                  Amount Breakdown
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-kairo-white/70">Invoice Amount</span>
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={`/tokens/${
                          getTokenInfo(invoice.tokenAddress).symbol
                        }.png`}
                        alt={getTokenInfo(invoice.tokenAddress).symbol}
                        width={16}
                        height={16}
                        className="rounded-full"
                        style={{ width: "auto", height: "auto" }}
                      />
                      <span className="text-kairo-white font-medium">
                        {formatAmount(invoice.amount)}{" "}
                        {getTokenInfo(invoice.tokenAddress).symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-kairo-white/70">Fee (1%)</span>
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={`/tokens/${
                          getTokenInfo(invoice.tokenAddress).symbol
                        }.png`}
                        alt={getTokenInfo(invoice.tokenAddress).symbol}
                        width={16}
                        height={16}
                        className="rounded-full"
                        style={{ width: "auto", height: "auto" }}
                      />
                      <span className="text-kairo-white font-medium">
                        {formatAmount(
                          (
                            (BigInt(invoice.amount) * BigInt(1)) /
                            BigInt(100)
                          ).toString()
                        )}{" "}
                        {getTokenInfo(invoice.tokenAddress).symbol}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-kairo-black-a40/50">
                    <div className="flex justify-between items-center">
                      <span className="text-kairo-white font-medium">
                        Total Amount
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Image
                          src={`/tokens/${
                            getTokenInfo(invoice.tokenAddress).symbol
                          }.png`}
                          alt={getTokenInfo(invoice.tokenAddress).symbol}
                          width={16}
                          height={16}
                          className="rounded-full"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="text-kairo-white font-bold">
                          {formatAmount(
                            (
                              BigInt(invoice.amount) +
                              (BigInt(invoice.amount) * BigInt(1)) / BigInt(100)
                            ).toString()
                          )}{" "}
                          {getTokenInfo(invoice.tokenAddress).symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Status Card */}
              <motion.div className="rounded-xl bg-kairo-black-a20/40 p-4 sm:p-6 space-y-4 sm:space-y-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-kairo-white">Status</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      invoice.paid
                        ? "bg-green-500/10 text-green-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {invoice.paid ? "Paid" : "Pending"}
                  </span>
                </div>

                {invoice.paid && (
                  <motion.div
                    variants={fadeInVariant}
                    custom={10}
                    className="space-y-4 pt-4 border-t border-kairo-black-a40/50"
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-kairo-white/70">
                        Payment Date
                      </h3>
                      <p className="text-kairo-white">
                        {new Date(invoice.paidDate).toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                          hour12: true,
                        })}{" "}
                        UTC
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-kairo-white/70">
                        Transaction Details
                      </h3>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${invoice.paymentTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-kairo-black-a20/40 hover:bg-kairo-black-a20/60 text-kairo-white/90 hover:text-kairo-white transition-all duration-200 group"
                      >
                        <span className="text-sm">View on Etherscan</span>
                        <svg
                          className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </motion.div>
                )}

                {!invoice.paid &&
                  address?.toLowerCase() ===
                    invoice.clientAddress?.toLowerCase() && (
                    <motion.div
                      className="space-y-3"
                      variants={fadeInVariant}
                      custom={10}
                    >
                      <button
                        onClick={handlePayInvoice}
                        disabled={paymentStep !== "idle"}
                        className="w-full mt-4 text-center place-items-center flex items-center justify-center gap-x-1 rounded-md text-kairo-green bg-kairo-green-a20 bg-opacity-30 px-3 py-3 text-sm font-medium shadow-lg hover:bg-kairo-green/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kairo-green disabled:opacity-50 disabled:cursor-not-allowed h-12"
                      >
                        {getPaymentButtonText()}
                      </button>
                      {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-md p-2">
                          {error}
                        </div>
                      )}
                    </motion.div>
                  )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
