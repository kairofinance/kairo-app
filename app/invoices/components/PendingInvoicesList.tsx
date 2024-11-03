"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import { DocumentIcon } from "@heroicons/react/20/solid";
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

function renderUserInfo(address: string, isIssuer: boolean) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-white/60 flex-shrink-0">
        {isIssuer ? "From:" : "To:"}
      </span>
      <AddressDisplay
        address={address}
        className="text-white hover:text-white/90 transition-colors duration-200"
      />
    </div>
  );
}

export default function PendingInvoicesList({
  invoices,
  isLoading,
  view,
}: PendingInvoicesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/10 rounded-full" />
                <div className="h-6 bg-white/10 rounded-full w-24" />
              </div>
              <div className="h-4 bg-white/10 rounded-full w-32" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded-full w-48" />
                <div className="h-4 bg-white/10 rounded-full w-36" />
              </div>
              <div className="h-8 bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
        <p className="text-white/60">No {view} invoices pending</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {invoices.map((invoice, index) => (
        <motion.div
          key={invoice.id}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="space-y-4">
            {/* Amount and Invoice ID */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DocumentIcon className="h-5 w-5 text-blue-400" />
                <div className="flex items-center text-sm font-bold text-white">
                  <Image
                    src={`/tokens/${getTokenSymbol(invoice.tokenAddress)}.png`}
                    alt={getTokenSymbol(invoice.tokenAddress)}
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {formatAmount(invoice.amount, invoice.tokenAddress)}
                </div>
              </div>
              <div className="text-sm text-white/60">
                Invoice #{invoice.invoiceId}
              </div>
            </div>

            {/* Address and Date Info */}
            <div className="space-y-2">
              {renderUserInfo(
                view === "incoming"
                  ? invoice.issuerAddress
                  : invoice.clientAddress,
                view === "incoming"
              )}
              <div className="text-sm text-white/60">
                Created {formatRelativeTime(invoice.issuedDate)}
              </div>
            </div>

            {/* Due Date */}
            <div className="text-sm text-white/60">
              Due {formatRelativeTime(invoice.dueDate)}
            </div>

            {/* View Invoice Button */}
            <Link
              href={`/invoice/${invoice.invoiceId}`}
              className="inline-flex items-center justify-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10 w-full"
            >
              View Invoice
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
