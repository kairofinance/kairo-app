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
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-4 animate-pulse">
            <div className="w-20 h-4 bg-white/5 rounded" />
            <div className="flex-1 h-12 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">No {view} invoices pending</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/invoice/${invoice.invoiceId}`}
          className="block group relative cursor-pointer"
        >
          <div className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
            {/* Content - Move to top of stack */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 px-4 sm:py-5 sm:px-6">
              {/* Mobile header */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-2 h-2 rounded-full shrink-0
                      ${view === "incoming" ? "bg-orange-600" : "bg-white/60"}
                    `}
                  />
                  <div className="text-sm tabular-nums text-white/40">
                    {new Date(invoice.issuedDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div
                  className={`
                    px-2.5 py-1 text-xs font-medium rounded-full
                    backdrop-blur-sm transition-colors duration-200
                    ${statusStyles[view]}
                  `}
                >
                  {view === "incoming" ? "Incoming" : "Created"}
                </div>
              </div>

              {/* Desktop status and time */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center">
                  <div
                    className={`
                      w-2 h-2 rounded-full shrink-0
                      ${view === "incoming" ? "bg-orange-600" : "bg-white/60"}
                    `}
                  />
                </div>
                <div className="w-[75px] shrink-0 flex items-center">
                  <div className="text-sm tabular-nums text-white/40">
                    {new Date(invoice.issuedDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 min-w-0">
                  {/* Token Amount */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <Image
                        src={`/tokens/${getTokenSymbol(
                          invoice.tokenAddress
                        )}.png`}
                        alt={getTokenSymbol(invoice.tokenAddress)}
                        width={18}
                        height={18}
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-base font-medium text-white/90 group-hover:text-white transition-colors">
                      {formatAmount(invoice.amount, invoice.tokenAddress)}
                    </span>
                  </div>

                  <span className="text-sm text-white/30">
                    {view === "incoming" ? "requested by" : "requested from"}
                  </span>

                  {/* Address */}
                  <div className="min-w-0 truncate flex items-center">
                    <AddressDisplay
                      address={
                        view === "incoming"
                          ? invoice.issuerAddress
                          : invoice.clientAddress
                      }
                      className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Status Badge - desktop only */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div
                    className={`
                      px-3 py-1 text-sm font-medium rounded-full
                      backdrop-blur-sm transition-colors duration-200
                      ${statusStyles[view]}
                    `}
                  >
                    {view === "incoming" ? "Incoming" : "Created"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
