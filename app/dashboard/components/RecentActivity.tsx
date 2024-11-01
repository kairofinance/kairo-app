import React from "react";
import { CheckCircleIcon, DocumentIcon } from "@heroicons/react/20/solid";
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
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    const filteredInvoices = safeInvoices
      .map((day) => ({
        ...day,
        invoices: day.invoices.filter((invoice) => {
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
        }),
      }))
      .filter((day) => day.invoices.length > 0);

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
      const prefix = isIssuer ? "From: " : "To: ";

      return (
        <div className="flex items-center flex-wrap sm:flex-nowrap">
          <span className="mr-1 text-kairo-white/60 whitespace-nowrap">
            {prefix}
          </span>
          <AddressDisplay
            address={address}
            className="text-kairo-white/90 hover:text-kairo-white transition-colors duration-200"
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
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center text-kairo-white/90 py-12">
              No recent activity available
            </div>
          ) : (
            <div className="space-y-8">
              {filteredInvoices.map((day) => (
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
                            className="bg-kairo-black-a20/40 rounded-lg p-4 space-y-4 backdrop-blur-sm"
                          >
                            {/* Amount and Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {invoiceStatus === "Paid" ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                ) : (
                                  <DocumentIcon className="h-5 w-5 text-blue-400" />
                                )}
                                <div className="flex items-center text-sm font-bold text-kairo-white">
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
                                  "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                                )}
                              >
                                {invoiceStatus}
                              </div>
                            </div>

                            {/* Invoice ID */}
                            <div className="text-sm text-kairo-white/60">
                              Invoice #{DOMPurify.sanitize(invoice.invoiceId)}
                            </div>

                            {/* Address Info */}
                            <div className="space-y-1">
                              <div className="text-sm text-kairo-white/90">
                                {isUserIssuer
                                  ? renderUserInfo(invoice.clientAddress, false)
                                  : renderUserInfo(invoice.issuerAddress, true)}
                              </div>
                              <div className="text-sm text-kairo-white/60">
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
                            <div className="pt-2">
                              <Link
                                href={`/invoice/${invoice.invoiceId}`}
                                className="flex items-center justify-center font-semibold gap-x-2 px-3 py-1.5 text-sm leading-6 hover:bg-kairo-green-a20/50 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full transition-colors duration-200"
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
                            <tr
                              key={invoice.id}
                              className="group transition-colors duration-200"
                            >
                              <td className="relative py-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  <div className="flex items-start gap-3 min-w-[200px]">
                                    <div className="hidden sm:block">
                                      {invoiceStatus === "Paid" ? (
                                        <CheckCircleIcon
                                          className="h-6 w-5 flex-none text-green-400"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <DocumentIcon
                                          className="h-6 w-5 flex-none text-blue-400"
                                          aria-hidden="true"
                                        />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center text-sm font-bold leading-6 text-kairo-white">
                                          {invoice.tokenAddress && (
                                            <Image
                                              src={`/tokens/${getTokenSymbol(
                                                invoice.tokenAddress
                                              )}.png`}
                                              alt={`${getTokenSymbol(
                                                invoice.tokenAddress
                                              )} logo`}
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
                                            "rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap"
                                          )}
                                        >
                                          {invoiceStatus}
                                        </div>
                                      </div>
                                      <div className="mt-1 text-sm leading-5 text-kairo-white/60">
                                        Invoice #
                                        {DOMPurify.sanitize(invoice.invoiceId)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 flex justify-center min-w-0">
                                    <div className="flex flex-col justify-center max-w-[300px]">
                                      <div className="text-sm leading-6 text-kairo-white/90">
                                        {isUserIssuer
                                          ? renderUserInfo(
                                              invoice.clientAddress,
                                              false
                                            )
                                          : renderUserInfo(
                                              invoice.issuerAddress,
                                              true
                                            )}
                                      </div>
                                      <div className="mt-1 text-sm leading-5 text-kairo-white/60">
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

                                  <div className="flex justify-end min-w-[140px]">
                                    <Link
                                      href={`/invoice/${invoice.invoiceId}`}
                                      className="relative flex items-center font-semibold gap-x-2 px-3 py-1.5 text-sm leading-6 hover:bg-kairo-green-a20/50 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full transition-colors duration-200 whitespace-nowrap"
                                    >
                                      View Invoice
                                      <span className="sr-only">
                                        , invoice #
                                        {DOMPurify.sanitize(invoice.invoiceId)}
                                      </span>
                                    </Link>
                                  </div>
                                </div>
                                <div className="absolute bottom-0 right-full h-px w-screen bg-kairo-black-a40/50" />
                                <div className="absolute bottom-0 left-0 h-px w-screen bg-kairo-black-a40/50" />
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
      </div>
    );
  }
);

RecentActivity.displayName = "RecentActivity";

export default RecentActivity;
