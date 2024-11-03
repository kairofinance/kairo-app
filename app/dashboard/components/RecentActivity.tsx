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

const statuses = {
  Paid: "text-green-400 bg-green-900/30 ring-green-500/30",
  Created: "text-blue-400 bg-blue-900/30 ring-blue-500/30",
  Incoming: "text-yellow-400 bg-yellow-900/30 ring-yellow-500/30",
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

const RecentActivity: React.FC<{
  invoices: DayInvoices[];
  isLoading: boolean;
  userAddress: string;
  userProfiles: { [key: string]: UserProfile };
  filter: string;
}> = React.memo(
  ({ invoices, isLoading, userAddress, userProfiles, filter }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

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
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
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
          <span className="w-8 text-white/60">
            {isIssuer ? "From:" : "To:"}
          </span>
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

    return (
      <div className="w-full">
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isLoading ? "opacity-50" : "opacity-100"
          }`}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-kairo-black-a20/40 rounded-lg p-4 space-y-4"
                >
                  <Skeleton height={24} />
                  <Skeleton height={20} />
                  <Skeleton height={20} />
                </div>
              ))}
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="text-center text-white/90 py-12">
              No recent activity available
            </div>
          ) : (
            <div className="space-y-8">
              {paginatedInvoices.map((day) => (
                <div key={day.dateTime} className="space-y-4">
                  <div className="relative py-4">
                    <time
                      dateTime={DOMPurify.sanitize(day.dateTime)}
                      className="text-kairo-white/80 text-base font-bold"
                    >
                      {formatDate(DOMPurify.sanitize(day.date))}
                    </time>
                    <div className="absolute inset-0 -z-10 border-b border-kairo-black-a40" />
                  </div>

                  {/* Mobile Grid View */}
                  <div className="block lg:hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {day.invoices.map((invoice) => {
                        const invoiceStatus = getInvoiceStatus(
                          invoice,
                          userAddress
                        );
                        const isUserIssuer =
                          invoice.issuerAddress.toLowerCase() ===
                          userAddress.toLowerCase();
                        return (
                          <div
                            key={invoice.id}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4"
                          >
                            {/* Amount and Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {invoiceStatus === "Paid" ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                ) : (
                                  <DocumentIcon className="h-5 w-5 text-blue-400" />
                                )}
                                <div className="flex items-center text-sm font-bold text-white">
                                  {invoice.tokenAddress && (
                                    <Image
                                      src={`/tokens/${getTokenSymbol(
                                        invoice.tokenAddress
                                      )}.png`}
                                      alt={`${getTokenSymbol(
                                        invoice.tokenAddress
                                      )} logo`}
                                      width={20}
                                      height={20}
                                      className="mr-2"
                                    />
                                  )}
                                  {formatAmount(
                                    invoice.amount,
                                    invoice.tokenAddress
                                  )}
                                </div>
                              </div>
                              <div
                                className={classNames(
                                  statuses[invoiceStatus],
                                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                                )}
                              >
                                {invoiceStatus}
                              </div>
                            </div>

                            {/* Invoice Details */}
                            <div className="space-y-4">
                              <div className="text-sm text-white/60">
                                Invoice #{DOMPurify.sanitize(invoice.invoiceId)}
                              </div>

                              <div className="space-y-2">
                                {renderUserInfo(
                                  isUserIssuer
                                    ? invoice.clientAddress
                                    : invoice.issuerAddress,
                                  !isUserIssuer
                                )}
                                <div className="text-sm text-white/60">
                                  {invoice.status === "Paid"
                                    ? `Paid ${formatRelativeTime(
                                        invoice.paidDate || "N/A"
                                      )}`
                                    : `Created ${formatRelativeTime(
                                        invoice.issuedDate
                                      )}`}
                                </div>
                              </div>

                              {/* View Invoice Button */}
                              <Link
                                href={`/invoice/${invoice.invoiceId}`}
                                className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10 w-full justify-center"
                              >
                                View Invoice
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <table className="w-full">
                      <tbody>
                        {day.invoices.map((invoice) => {
                          const invoiceStatus = getInvoiceStatus(
                            invoice,
                            userAddress
                          );
                          const isUserIssuer =
                            invoice.issuerAddress.toLowerCase() ===
                            userAddress.toLowerCase();

                          return (
                            <tr key={invoice.id} className="group relative">
                              <td className="py-6">
                                <div className="flex items-center justify-between gap-4">
                                  {/* Amount and Invoice Info */}
                                  <div className="flex items-center gap-4 min-w-[250px]">
                                    {invoiceStatus === "Paid" ? (
                                      <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                                    ) : (
                                      <DocumentIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                    )}
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center text-sm font-bold text-white">
                                          {invoice.tokenAddress && (
                                            <Image
                                              src={`/tokens/${getTokenSymbol(
                                                invoice.tokenAddress
                                              )}.png`}
                                              alt={getTokenSymbol(
                                                invoice.tokenAddress
                                              )}
                                              width={24}
                                              height={24}
                                              className="mr-2"
                                            />
                                          )}
                                          {formatAmount(
                                            invoice.amount,
                                            invoice.tokenAddress
                                          )}
                                        </div>
                                        <div
                                          className={classNames(
                                            statuses[invoiceStatus],
                                            "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                                          )}
                                        >
                                          {invoiceStatus}
                                        </div>
                                      </div>
                                      <div className="mt-1 text-sm text-white/60">
                                        Invoice #
                                        {DOMPurify.sanitize(invoice.invoiceId)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* User Info */}
                                  <div className="flex-1 flex justify-center">
                                    <div className="space-y-1">
                                      {renderUserInfo(
                                        isUserIssuer
                                          ? invoice.clientAddress
                                          : invoice.issuerAddress,
                                        !isUserIssuer
                                      )}
                                      <div className="text-sm text-white/60">
                                        {invoice.status === "Paid"
                                          ? `Paid ${formatRelativeTime(
                                              invoice.paidDate || "N/A"
                                            )}`
                                          : `Created ${formatRelativeTime(
                                              invoice.issuedDate
                                            )}`}
                                      </div>
                                    </div>
                                  </div>

                                  {/* View Invoice Button */}
                                  <div className="flex justify-end min-w-[140px]">
                                    <Link
                                      href={`/invoice/${invoice.invoiceId}`}
                                      className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
                                    >
                                      View Invoice
                                    </Link>
                                  </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && allInvoices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  }
);

RecentActivity.displayName = "RecentActivity";

export default RecentActivity;
