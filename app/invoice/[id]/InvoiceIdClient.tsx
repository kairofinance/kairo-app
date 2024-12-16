"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract, useWriteContract } from "wagmi";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager";
import {
  INVOICE_MANAGER_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
  getAddress,
} from "../../../contracts/addresses";
import { sepolia } from "viem/chains";
import { formatUnits } from "viem";
import Image from "next/image";
import { ERC20ABI } from "contracts/ERC20.sol/ERC20";
import { client } from "../../../wagmi.config";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  DocumentIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowUpCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { formatRelativeTime } from "@/utils/date-format";
import Avatar from "@/components/shared/Avatar";
import { decodeEventLog } from "viem";
import { useTeamContext } from "@/components/context/TeamContext";
import Spinner from "@/components/Spinner";
import Card from "@/components/shared/ui/Card";
import ErrorDisplay from "@/components/shared/ui/ErrorDisplay";
import AddressDisplay from "@/components/shared/AddressDisplay";

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

interface Invoice {
  id: string;
  invoiceId: string;
  issuerAddress: string;
  clientAddress: string;
  tokenAddress: string;
  amount: string;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  paid: boolean;
  teamId?: string;
  team?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  createdBy?: string;
}

const tokenMap: { [key: string]: { symbol: string; decimals: number } } = {
  [USDC_ADDRESS[sepolia.id]]: {
    symbol: "USDC",
    decimals: 6,
  },
  [DAI_ADDRESS[sepolia.id]]: {
    symbol: "DAI",
    decimals: 18,
  },
};

const getTokenInfo = (tokenAddress: string) => {
  return tokenMap[tokenAddress] || { symbol: "Unknown", decimals: 18 };
};

const formatAmount = (amount: string, tokenAddress: string): string => {
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
  const { address, status } = useAppKitAccount();
  const { writeContractAsync: approveToken } = useWriteContract();
  const { writeContractAsync: payInvoice } = useWriteContract();
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "approving" | "approved" | "paying"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const isConnectingOrReconnecting =
    status === "connecting" || status === "reconnecting";

  const { data: currentAllowance } = useReadContract({
    address: invoice?.tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: "allowance",
    args:
      address && invoice
        ? [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`]
        : undefined,
  }) as { data: bigint | undefined };

  const { data: tokenBalance = BigInt(0), isError: isBalanceError } =
    useReadContract({
      address: invoice?.tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: address ? [address as `0x${string}`] : undefined,
      query: {
        enabled: !!address && !!invoice?.tokenAddress,
      },
    }) as { data: bigint; isError: boolean };

  const getTotalRequired = () => {
    if (!invoice) return BigInt(0);
    const amount = BigInt(invoice.amount);
    const maxFee =
      BigInt(200) * BigInt(10 ** getTokenInfo(invoice.tokenAddress).decimals);
    const calculatedFee = (amount * BigInt(15)) / BigInt(1000);
    const fee = calculatedFee > maxFee ? maxFee : calculatedFee;
    return amount + fee;
  };

  const totalRequired = getTotalRequired();
  const hasEnoughBalance =
    typeof tokenBalance === "bigint" ? tokenBalance >= totalRequired : false;

  const formatTokenAmount = (amount: unknown) => {
    if (!invoice || !amount || typeof amount !== "bigint") return "0";
    const decimals = getTokenInfo(invoice.tokenAddress).decimals;
    return parseFloat(formatUnits(amount, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!address) {
          if (status === "disconnected") {
            setIsLoading(false);
          }
          return;
        }

        console.log("Fetching invoice with ID:", invoiceId);
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: {
            "x-user-address": address.toLowerCase(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: "Failed to fetch invoice details" };
          }

          if (response.status === 403) {
            setError(
              errorData.message ||
                "You must be either the invoice issuer or recipient to view this invoice"
            );
          } else if (response.status === 404) {
            setError("Invoice not found. Please check the invoice ID.");
          } else {
            setError(errorData.message || "Failed to fetch invoice details");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched invoice data:", data);
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Failed to fetch invoice details");
      } finally {
        setIsLoading(false);
      }
    };

    if (address || status === "disconnected") {
      fetchInvoice();
    }
  }, [invoiceId, address, status]);

  const handlePayInvoice = async () => {
    try {
      setError(null);
      setPaymentStep("approving");

      if (!invoice || !address) return;

      // First, get the invoice ID from the creation transaction
      const txReceipt = await client.getTransactionReceipt({
        hash: invoice.creationTransactionHash as `0x${string}`,
      });

      // Find the InvoiceCreated event
      const invoiceCreatedEvent = txReceipt.logs.find((log) => {
        try {
          const event = decodeEventLog({
            abi: InvoiceManagerABI.abi,
            data: log.data,
            topics: log.topics,
          });
          return event.eventName === "InvoiceCreated";
        } catch {
          return false;
        }
      });

      if (!invoiceCreatedEvent) {
        throw new Error("Could not find invoice creation event");
      }

      // Decode the event to get the invoice ID
      const decodedEvent = decodeEventLog({
        abi: InvoiceManagerABI.abi,
        data: invoiceCreatedEvent.data,
        topics: invoiceCreatedEvent.topics,
      });

      const onChainInvoiceId = (decodedEvent.args as any).invoiceId;

      if (!onChainInvoiceId) {
        throw new Error("Could not find invoice ID in event");
      }

      const invoiceAmount = BigInt(invoice.amount);
      const maxFee =
        BigInt(200) * BigInt(10 ** getTokenInfo(invoice.tokenAddress).decimals);
      const calculatedFee = (invoiceAmount * BigInt(15)) / BigInt(1000);
      const fee = calculatedFee > maxFee ? maxFee : calculatedFee;
      const totalAmount = invoiceAmount + fee;

      // Check if we need to approve
      const needsApproval = (currentAllowance || BigInt(0)) < totalAmount;

      if (needsApproval) {
        try {
          const approveTx = await approveToken({
            address: invoice.tokenAddress as `0x${string}`,
            abi: ERC20ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESS as `0x${string}`, totalAmount],
          });

          const approvalReceipt = await client.waitForTransactionReceipt({
            hash: approveTx,
          });

          if (approvalReceipt.status !== "success") {
            throw new Error("Approval transaction failed");
          }

          setPaymentStep("approved");
        } catch (error: any) {
          setError("Failed to approve token spending. Please try again.");
          setPaymentStep("idle");
          return;
        }
      } else {
        setPaymentStep("approved");
      }

      // Proceed with paying the invoice using the event-derived ID
      setPaymentStep("paying");
      const payTx = await payInvoice({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: InvoiceManagerABI.abi,
        functionName: "payInvoice",
        args: [onChainInvoiceId],
      });

      const paymentReceipt = await client.waitForTransactionReceipt({
        hash: payTx,
      });

      if (paymentReceipt.status !== "success") {
        throw new Error("Payment transaction failed");
      }

      // Update database after successful payment
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
      }

      setError(errorMessage);
      setPaymentStep("idle");
    }
  };

  const getPaymentButtonText = () => {
    switch (paymentStep) {
      case "approving":
        return "Approving Token Transfer";
      case "approved":
        return "Preparing Payment";
      case "paying":
        return "Confirming Payment";
      default:
        const totalAmount = invoice
          ? BigInt(invoice.amount) +
            (BigInt(invoice.amount) * BigInt(1)) / BigInt(100)
          : BigInt(0);
        const needsApproval = (currentAllowance || BigInt(0)) < totalAmount;
        return needsApproval ? "Approve & Pay" : "Pay Invoice";
    }
  };

  const isOverdue = invoice && new Date(invoice.dueDate) < new Date();

  const { selectedTeam } = useTeamContext();

  const InvoiceHeader = ({ invoice }: { invoice: Invoice }) => {
    const isIssuer =
      address?.toLowerCase() === invoice.issuerAddress.toLowerCase();
    const counterpartyAddress = isIssuer
      ? invoice.clientAddress
      : invoice.issuerAddress;

    return (
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 text-sm font-medium rounded-full
                ${
                  invoice.paid
                    ? "text-emerald-500/90 bg-emerald-500/[0.07]"
                    : isIssuer
                    ? "text-orange-500/90 bg-orange-500/[0.07]"
                    : "text-blue-500/90 bg-blue-500/[0.07]"
                }`}
            >
              {invoice.paid
                ? "Paid"
                : isIssuer
                ? "Awaiting Payment"
                : "Payment Required"}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Show team avatar if invoice was created in team context */}
            {invoice.teamId ? (
              <div className="relative">
                {invoice.team?.profilePicture ? (
                  <Image
                    src={invoice.team.profilePicture}
                    alt={invoice.team.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/10">
                    <span className="text-sm font-medium text-white/60">
                      {invoice.team.name.slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <Avatar address={invoice.issuerAddress} size="lg" />
            )}
            <div>
              <h1 className="text-xl font-medium text-white">
                {invoice.teamId ? invoice.team.name : `Invoice #${invoice.id}`}
              </h1>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Created by</span>
                <AddressDisplay
                  address={invoice.createdBy || invoice.issuerAddress}
                  className="text-white/40 hover:text-white/60"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-white/40">Due Date</div>
              <div className="text-white font-medium">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InvoiceAmount = ({ invoice }: { invoice: Invoice }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={`/tokens/${getTokenSymbol(invoice.tokenAddress)}.png`}
              alt={getTokenSymbol(invoice.tokenAddress)}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-2xl font-medium text-white">
              {formatUnits(
                BigInt(invoice.amount),
                getTokenDecimals(invoice.tokenAddress)
              )}{" "}
              {getTokenSymbol(invoice.tokenAddress)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/[0.02]">
            <div className="text-sm text-white/40 mb-1">From</div>
            <div className="flex items-center gap-3">
              {invoice.teamId ? (
                <>
                  {invoice.team?.profilePicture ? (
                    <Image
                      src={invoice.team.profilePicture}
                      alt={invoice.team.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/[0.02] flex items-center justify-center">
                      <span className="text-xs text-white/60">
                        {invoice.team.name.slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <span className="text-white">{invoice.team.name}</span>
                </>
              ) : (
                <>
                  <Avatar address={invoice.issuerAddress} size="sm" />
                  <AddressDisplay
                    address={invoice.issuerAddress}
                    className="text-white hover:text-white/80"
                  />
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/[0.02]">
            <div className="text-sm text-white/40 mb-1">To</div>
            <div className="flex items-center gap-3">
              <Avatar address={invoice.clientAddress} size="sm" />
              <AddressDisplay
                address={invoice.clientAddress}
                className="text-white hover:text-white/80"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isConnectingOrReconnecting) {
    return (
      <div className="min-h-screen p-6 ">
        <div className="mx-auto max-w-6xl">
          <div className="bg-white/[0.02] rounded-xl p-8 flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <ErrorDisplay
        title="Wallet Not Connected"
        message="Please connect your wallet to view invoice details"
        icon={<WalletIcon className="w-6 h-6 text-white/40" />}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white/[0.02] rounded-xl p-8 text-center">
            <div className="mb-4">
              <DocumentIcon className="w-12 h-12 text-red-500/40 mx-auto" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">Error</h2>
            <p className="text-white/60">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const isClient =
    address?.toLowerCase() === invoice.clientAddress.toLowerCase();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="py-8">
          <Link
            href="/view"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors mb-6 font-jetbrains text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>

          {/* Visual Status Section - Updated to match Teams style */}
          <div className="relative overflow-hidden bg-white/[0.02] rounded-xl mb-10">
            {/* Backdrop Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-emerald-500/10" />

            <div className="relative p-8">
              <div className="relative">
                {/* Flow Line with Gradient */}
                <div
                  className={`absolute left-1/2 top-[60px] bottom-[60px] w-0.5 
                    ${
                      invoice.paid
                        ? "bg-gradient-to-b from-emerald-500/20 via-emerald-500 to-emerald-500/20"
                        : isOverdue
                        ? "bg-gradient-to-b from-red-500/20 via-red-500 to-red-500/20"
                        : "bg-gradient-to-b from-orange-500/20 via-orange-500 to-orange-500/20"
                    }`}
                />

                <div className="grid grid-cols-2 gap-24">
                  {/* Issuer Side */}
                  <div className="flex flex-col items-end pr-16">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mb-3 w-full max-w-xs border border-white/[0.05]">
                      {invoice.teamId ? (
                        // Team Context Display
                        <div className="space-y-3">
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-right">
                              <div className="text-white/80 font-garet text-sm">
                                {invoice.team?.name}
                              </div>
                              <div className="text-white/40 font-jetbrains text-xs">
                                Team
                              </div>
                            </div>
                            {invoice.team?.profilePicture ? (
                              <Image
                                src={invoice.team.profilePicture}
                                alt={invoice.team.name || "Team"}
                                width={40}
                                height={40}
                                className="rounded-full border border-white/10"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/10">
                                <span className="text-sm font-medium text-white/60">
                                  {invoice.team?.name?.slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-white/[0.05] pt-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="text-right">
                                <div className="text-white/40 font-jetbrains text-xs mb-0.5">
                                  Created by
                                </div>
                                <div className="text-white/60 font-jetbrains text-xs">
                                  {invoice.createdBy
                                    ? `${invoice.createdBy.slice(
                                        0,
                                        6
                                      )}...${invoice.createdBy.slice(-4)}`
                                    : `${invoice.issuerAddress.slice(
                                        0,
                                        6
                                      )}...${invoice.issuerAddress.slice(-4)}`}
                                </div>
                              </div>
                              <Avatar
                                address={
                                  invoice.createdBy || invoice.issuerAddress
                                }
                                size="sm"
                                className="opacity-80"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Personal Account Display
                        <div className="flex items-center justify-end gap-3">
                          <div className="text-right">
                            <div className="text-white/80 font-garet text-sm">
                              Personal Account
                            </div>
                            <div className="text-white/60 font-jetbrains text-xs">
                              {`${invoice.issuerAddress.slice(
                                0,
                                6
                              )}...${invoice.issuerAddress.slice(-4)}`}
                            </div>
                          </div>
                          <Avatar
                            address={invoice.issuerAddress}
                            size="md"
                            className="border border-white/10"
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-jetbrains text-white/40 pr-2">
                      Issued {new Date(invoice.issuedDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Status Circle */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                      className={`rounded-full p-3 border ${
                        invoice.paid
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : isOverdue
                          ? "bg-red-500/10 border-red-500/20"
                          : "bg-orange-500/10 border-orange-500/20"
                      }`}
                    >
                      {invoice.paid ? (
                        <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                      ) : isOverdue ? (
                        <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
                      ) : (
                        <ClockIcon className="w-8 h-8 text-orange-500" />
                      )}
                    </div>
                  </div>

                  {/* Client Side */}
                  <div className="flex flex-col items-start pl-16">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mb-3 w-full max-w-xs border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <Avatar
                          address={invoice.clientAddress}
                          size="md"
                          className="border border-white/10"
                        />
                        <div>
                          <div className="text-white/80 font-garet text-sm">
                            Client
                          </div>
                          <div className="text-white/60 font-jetbrains text-xs">
                            {`${invoice.clientAddress.slice(
                              0,
                              6
                            )}...${invoice.clientAddress.slice(-4)}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-jetbrains pl-2 ${
                        invoice.paid
                          ? "text-emerald-500"
                          : isOverdue
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {invoice.paid
                        ? `Paid on ${new Date(
                            invoice.paidDate!
                          ).toLocaleDateString()}`
                        : formatRelativeTime(invoice.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-white/[0.05]">
                    <Image
                      src={`/tokens/${
                        getTokenInfo(invoice.tokenAddress).symbol
                      }.png`}
                      alt={getTokenInfo(invoice.tokenAddress).symbol}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                    <span className="font-jetbrains text-sm text-white">
                      {formatAmount(invoice.amount, invoice.tokenAddress)}{" "}
                      {getTokenInfo(invoice.tokenAddress).symbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Using Card Component */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Details Card */}
            <Card title="Payment Details">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <BanknotesIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">Amount</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {formatAmount(invoice.amount, invoice.tokenAddress)}{" "}
                    {getTokenInfo(invoice.tokenAddress).symbol}
                  </span>
                </div>

                {isClient && !invoice.paid && (
                  <button
                    onClick={handlePayment}
                    disabled={!hasEnoughBalance || isPending}
                    className="w-full flex items-center justify-center gap-2 p-4 
                             rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-emerald-500 hover:text-emerald-400
                             transition-all duration-200"
                  >
                    {isPending ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <ArrowUpCircleIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isPending ? "Processing..." : "Pay Invoice"}
                    </span>
                  </button>
                )}

                {isClient && (
                  <div
                    className="flex items-center justify-between p-4 rounded-lg 
                                bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200 
                                border border-white/[0.05]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.05]">
                        <Image
                          src={`/tokens/${
                            getTokenInfo(invoice.tokenAddress).symbol
                          }.png`}
                          alt={getTokenInfo(invoice.tokenAddress).symbol}
                          width={16}
                          height={16}
                        />
                      </div>
                      <span className="text-sm text-white/60">
                        Your Balance
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        hasEnoughBalance ? "text-white" : "text-red-500"
                      }`}
                    >
                      {formatTokenAmount(tokenBalance)}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Important Dates Card */}
            <Card title="Important Dates">
              <div className="space-y-4">
                <div
                  className="flex items-center justify-between p-4 rounded-lg 
                              bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <CalendarIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">Issue Date</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {new Date(invoice.issuedDate).toLocaleDateString()}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between p-4 rounded-lg 
                              bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <ClockIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">Due Date</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isOverdue ? "text-red-500" : "text-white"
                    }`}
                  >
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {invoice.paid && invoice.paidDate && (
                  <div
                    className="flex items-center justify-between p-4 rounded-lg 
                                bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.05]">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-sm text-white/60">
                        Payment Date
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-500">
                      {new Date(invoice.paidDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
