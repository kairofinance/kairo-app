import React, { useState } from "react";
import {
  CheckCircleIcon,
  DocumentIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";
import Image from "next/image";
import { formatUnits } from "viem";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/utils/date-format";
import AddressDisplay from "@/components/shared/AddressDisplay";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import { motion } from "framer-motion";

interface Invoice {
  id: string;
  invoiceId: string;
  amount: string;
  token?: string;
  clientAddress: string;
  issuerAddress: string;
  paid: boolean;
  dueDate: string;
  paidDate?: string | null;
  status: "Paid" | "Created";
  issuedDate: string;
  tokenAddress: string;
}

interface DayInvoices {
  date: string;
  dateTime: string;
  invoices: Invoice[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const statusStyles = {
  Paid: "text-orange-600/90 bg-orange-600/[0.07]",
  Created: "text-white/80 bg-white/[0.05]",
  Incoming: "text-white/90 bg-white/[0.08]",
};

const tokenDecimals: { [key: string]: number } = {
  USDC: 6,
  DAI: 18,
  ETH: 18,
};

interface UserProfile {
  address: string;
  username: string | null;
  pfp: string | null;
}

interface RecentActivityProps {
  invoices: DayInvoices[];
  isLoading: boolean;
  userAddress: string;
  userProfiles: { [key: string]: UserProfile };
  filter: string;
}

function formatCustomDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
}

export default function RecentActivity({
  invoices,
  isLoading,
  userAddress,
  userProfiles,
  filter,
}: RecentActivityProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // First, flatten and filter all invoices
  const allInvoices = invoices
    .flatMap((day) => day.invoices)
    .filter((invoice) => {
      if (filter === "paid") return invoice.paid;
      if (filter === "sent")
        return (
          invoice.issuerAddress.toLowerCase() === userAddress.toLowerCase()
        );
      if (filter === "received")
        return (
          invoice.clientAddress.toLowerCase() === userAddress.toLowerCase()
        );
      return true; // "all"
    });

  // Calculate pagination
  const totalPages = Math.ceil(allInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageInvoices = allInvoices.slice(startIndex, endIndex);

  // Group current page invoices by date
  const groupedInvoices = currentPageInvoices.reduce(
    (groups: { [key: string]: any[] }, invoice) => {
      const date = new Date(invoice.issuedDate).toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(invoice);
      return groups;
    },
    {}
  );

  // Convert grouped invoices back to DayInvoices format and sort by date
  const paginatedInvoices: DayInvoices[] = Object.entries(groupedInvoices)
    .map(([date, invoices]) => ({
      date,
      dateTime: date,
      invoices: invoices.sort(
        (a, b) =>
          new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
      ),
    }))
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

  function formatAmount(amount: string, tokenAddress: string): string {
    const token = getTokenSymbol(tokenAddress);
    const decimals = tokenDecimals[token] || 18;
    const formattedAmount = formatUnits(BigInt(amount), decimals);
    const wholeNumber = parseInt(formattedAmount).toLocaleString();
    return `${wholeNumber} ${token || "Unknown"}`;
  }

  function getTokenSymbol(tokenAddress: string): string {
    const tokenMap: { [key: string]: string } = {
      "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "USDC",
    };
    return tokenMap[tokenAddress] || "Unknown";
  }

  function renderUserInfo(address: string, isIssuer: boolean) {
    return (
      <div className="flex items-center">
        <span className="w-8 text-white/60">{isIssuer ? "From:" : "To:"}</span>
        <AddressDisplay
          address={address}
          className="text-white hover:text-white/90 transition-colors duration-200"
        />
      </div>
    );
  }

  function getInvoiceStatus(
    invoice: Invoice,
    userAddress: string
  ): "Paid" | "Created" | "Incoming" {
    if (invoice.paid) return "Paid";
    return invoice.issuerAddress.toLowerCase() === userAddress.toLowerCase()
      ? "Created"
      : "Incoming";
  }

  // Update the text description based on status
  function getActionText(
    status: "Paid" | "Created" | "Incoming",
    isUserIssuer: boolean
  ): string {
    if (status === "Paid") {
      return isUserIssuer ? "received by" : "paid to";
    }
    if (status === "Created") {
      return "requested from";
    }
    return "requested by";
  }

  // Update the status badge text function
  function getStatusText(status: "Paid" | "Created" | "Incoming"): string {
    return "Invoice" + " " + status;
  }

  return (
    <div className="w-full">
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isLoading ? "opacity-50" : "opacity-100"
        }`}
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4 animate-pulse">
                <div className="w-20 h-4 bg-white/5 rounded" />
                <div className="flex-1 h-12 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        ) : paginatedInvoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No recent activity available</p>
          </div>
        ) : (
          <div className="relative">
            <div className="space-y-6 pr-6">
              {paginatedInvoices.map((day) => (
                <div key={day.dateTime}>
                  <div className="mb-3">
                    <time
                      dateTime={day.dateTime}
                      className="text-sm font-medium text-white/30 uppercase tracking-wider"
                    >
                      {formatDate(day.date)}
                    </time>
                  </div>

                  <div className="space-y-2">
                    {day.invoices.map((invoice) => {
                      const status = getInvoiceStatus(invoice, userAddress);
                      const isUserIssuer =
                        invoice.issuerAddress.toLowerCase() ===
                        userAddress.toLowerCase();

                      return (
                        <Link
                          key={invoice.id}
                          href={`/invoice/${invoice.invoiceId}`}
                          className="block group relative"
                        >
                          <div className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                            {/* Main container - make it stack on mobile */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 px-4 sm:py-5 sm:px-6">
                              {/* Top row for mobile - time and status */}
                              <div className="flex items-center justify-between sm:hidden">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`
                                      w-2 h-2 rounded-full shrink-0
                                      ${
                                        status === "Paid"
                                          ? "bg-orange-600"
                                          : status === "Created"
                                          ? "bg-white/60"
                                          : "bg-white"
                                      }
                                    `}
                                  />
                                  <div className="text-sm tabular-nums text-white/40">
                                    {
                                      formatCustomDateTime(
                                        invoice.issuedDate
                                      ).split(" ")[1]
                                    }
                                  </div>
                                </div>
                                <div
                                  className={`
                                    px-2.5 py-1 text-xs font-medium rounded-full
                                    backdrop-blur-sm transition-colors duration-200
                                    ${statusStyles[status]}
                                  `}
                                >
                                  {getStatusText(status)}
                                </div>
                              </div>

                              {/* Desktop status icon and time */}
                              <div className="hidden sm:flex items-center gap-4">
                                <div className="flex items-center">
                                  <div
                                    className={`
                                      w-2 h-2 rounded-full shrink-0
                                      ${
                                        status === "Paid"
                                          ? "bg-orange-600"
                                          : status === "Created"
                                          ? "bg-white/60"
                                          : "bg-white"
                                      }
                                    `}
                                  />
                                </div>
                                <div className="w-[75px] shrink-0 flex items-center">
                                  <div className="text-sm tabular-nums text-white/40">
                                    {
                                      formatCustomDateTime(
                                        invoice.issuedDate
                                      ).split(" ")[1]
                                    }
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
                                        alt={getTokenSymbol(
                                          invoice.tokenAddress
                                        )}
                                        width={18}
                                        height={18}
                                        className="rounded-full"
                                      />
                                    </div>
                                    <span className="text-base font-medium text-white/90 group-hover:text-white transition-colors">
                                      {formatAmount(
                                        invoice.amount,
                                        invoice.tokenAddress
                                      )}
                                    </span>
                                  </div>

                                  <span className="text-sm text-white/30">
                                    {getActionText(status, isUserIssuer)}
                                  </span>

                                  {/* Address */}
                                  <div className="min-w-0 truncate flex items-center">
                                    <AddressDisplay
                                      address={
                                        isUserIssuer
                                          ? invoice.clientAddress
                                          : invoice.issuerAddress
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
                                      ${statusStyles[status]}
                                    `}
                                  >
                                    {getStatusText(status)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isLoading && allInvoices.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
