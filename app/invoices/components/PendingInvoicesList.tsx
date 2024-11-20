"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import AddressDisplay from "@/components/shared/AddressDisplay";
import { formatRelativeTime } from "@/utils/date-format";

interface Invoice {
  id: string;
  invoiceId: string;
  amount: string;
  tokenAddress: string;
  clientAddress: string;
  issuerAddress: string;
  dueDate: string;
  issuedDate: string;
}

interface PendingInvoicesListProps {
  invoices: Invoice[];
  isLoading: boolean;
  view: "incoming" | "outgoing";
}

const tokenDecimals: { [key: string]: number } = {
  USDC: 6,
  DAI: 18,
  ETH: 18,
};

function getTokenSymbol(tokenAddress: string): string {
  const tokenMap: { [key: string]: string } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "USDC",
  };
  return tokenMap[tokenAddress] || "Unknown";
}

function formatAmount(amount: string, tokenAddress: string): string {
  const token = getTokenSymbol(tokenAddress);
  const decimals = tokenDecimals[token] || 18;
  const formattedAmount = formatUnits(BigInt(amount), decimals);
  const wholeNumber = parseInt(formattedAmount).toLocaleString();
  return `${wholeNumber} ${token || "Unknown"}`;
}

const statusStyles = {
  incoming: "text-orange-600/90 bg-orange-600/[0.07]",
  outgoing: "text-white/80 bg-white/[0.05]",
};

export default function PendingInvoicesList({
  invoices,
  isLoading,
  view,
}: PendingInvoicesListProps) {
  if (isLoading) {
    return (
      <div className="font-jetbrains">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <span className="text-white/40 text-sm animate-pulse">
            loading_invoices...
          </span>
        </div>
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="font-jetbrains">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <span className="text-white/40 text-sm">
            no_{view}_invoices_found
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/invoice/${invoice.invoiceId}`}
          className="block group"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 font-jetbrains">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              {/* Command and ID */}
              <div className="flex items-center gap-2 min-w-[140px]">
                <span className="text-white/40 text-sm">$</span>
                <span className="text-emerald-500 text-sm">
                  {view === "incoming" ? "receive" : "send"}
                </span>
                <span className="text-white/40 text-sm">
                  #{invoice.invoiceId}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2 min-w-[160px]">
                <Image
                  src={`/tokens/${getTokenSymbol(invoice.tokenAddress)}.png`}
                  alt={getTokenSymbol(invoice.tokenAddress)}
                  width={16}
                  height={16}
                  className="opacity-80"
                />
                <span className="text-sm text-white/80">
                  {formatAmount(invoice.amount, invoice.tokenAddress)}
                </span>
                <span className="text-sm text-white/40">
                  {getTokenSymbol(invoice.tokenAddress)}
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              {/* Address */}
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">
                  {view === "incoming" ? "from" : "to"}
                </span>
                <span className="text-sm text-white/60">
                  {view === "incoming"
                    ? invoice.issuerAddress
                    : invoice.clientAddress}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-sm text-white/40">
                  {formatRelativeTime(invoice.dueDate)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
