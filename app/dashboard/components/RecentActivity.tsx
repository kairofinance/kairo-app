import React from "react";
import { CheckCircleIcon, DocumentIcon } from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";
import Image from "next/image";
import { formatUnits } from "viem";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
  Paid: "text-green-700 bg-green-50 ring-green-600/20 text-green-400 bg-green-900/50 ring-green-500/30",
  Created:
    "text-blue-700 bg-blue-50 ring-blue-600/20 text-blue-400 bg-blue-900/50 ring-blue-500/30",
  Incoming:
    "text-yellow-700 bg-yellow-50 ring-yellow-600/20 text-yellow-400 bg-yellow-900/50 ring-yellow-500/30",
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
      const profile = userProfiles[address.toLowerCase()];
      const prefix = isIssuer ? "From: " : "To: ";
      if (profile && profile.username && profile.pfp) {
        return (
          <div className="flex items-center">
            <span className="mr-1 text-zinc-500 text-zinc-400 font-semibold">
              {prefix}
            </span>
            <Image
              src={profile.pfp}
              alt={`${profile.username}'s profile picture`}
              width={24}
              height={24}
              className="rounded-full mr-2"
            />
            <span>{profile.username}</span>
          </div>
        );
      }
      return (
        <div>
          <span className="mr-1 text-kairo-white">{prefix}</span>
          {DOMPurify.sanitize(address)}
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

    function formatDateTime(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
    }

    const renderSkeletonRow = () => (
      <tr>
        <td className="relative py-5 pr-6">
          <div className="flex gap-x-6">
            <Skeleton circle width={20} height={20} />
            <div className="flex-auto">
              <div className="flex items-start gap-x-3">
                <Skeleton width={100} />
                <Skeleton width={60} />
              </div>
              <div className="mt-1">
                <Skeleton width={80} />
              </div>
            </div>
          </div>
        </td>
        <td className="hidden py-5 pr-6 sm:table-cell">
          <Skeleton width={150} />
          <div className="mt-1">
            <Skeleton width={100} />
          </div>
        </td>
        <td className="py-5 text-right">
          <Skeleton width={50} />
        </td>
      </tr>
    );

    return (
      <table className="w-full text-left">
        <tbody
          className={`transition-opacity duration-300 ease-in-out ${
            isLoading ? "opacity-50" : "opacity-100"
          }`}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <React.Fragment key={index}>
                {index === 0 && (
                  <tr>
                    <th colSpan={3} className="pt-8 pb-4">
                      <Skeleton width={200} />
                    </th>
                  </tr>
                )}
                {renderSkeletonRow()}
              </React.Fragment>
            ))
          ) : filteredInvoices.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-12 text-center text-kairo-white">
                No recent activity available
              </td>
            </tr>
          ) : (
            filteredInvoices.map((day) => (
              <React.Fragment key={day.dateTime}>
                <tr className="text-sm leading-6 text-kairo-white">
                  <th
                    scope="colgroup"
                    colSpan={3}
                    className="relative isolate pt-8 pb-4 font-bold"
                  >
                    <time dateTime={DOMPurify.sanitize(day.dateTime)}>
                      {DOMPurify.sanitize(day.date)}
                    </time>
                    <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-kairo-black-a100" />
                  </th>
                </tr>
                {day.invoices.map((invoice) => {
                  const invoiceStatus = getInvoiceStatus(invoice, userAddress);
                  const isUserIssuer =
                    invoice.issuerAddress.toLowerCase() ===
                    userAddress.toLowerCase();
                  return (
                    <tr key={invoice.id}>
                      <td className="relative py-5 pr-6">
                        <div className="flex gap-x-6">
                          {invoiceStatus === "Paid" ? (
                            <CheckCircleIcon
                              className="hidden h-6 w-5 flex-none text-green-500 sm:block"
                              aria-hidden="true"
                            />
                          ) : (
                            <DocumentIcon
                              className="hidden h-6 w-5 flex-none text-blue-500 sm:block"
                              aria-hidden="true"
                            />
                          )}
                          <div className="flex-auto">
                            <div className="flex items-start gap-x-3">
                              <div className="flex items-center text-sm font-bold leading-6 text-kairo-white">
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
                              <div
                                className={classNames(
                                  statuses[invoiceStatus],
                                  "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                                )}
                              >
                                {invoiceStatus}
                              </div>
                            </div>
                            <div className="mt-1 text-xs leading-5 text-zinc-500 text-zinc-400">
                              Invoice #{DOMPurify.sanitize(invoice.invoiceId)}
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 right-full h-px w-screen bg-kairo-white bg-zinc-700" />
                        <div className="absolute bottom-0 left-0 h-px w-screen bg-kairo-white bg-zinc-700" />
                      </td>
                      <td className="hidden py-5 pr-6 sm:table-cell">
                        <div className="text-sm leading-6 text-kairo-black-a20 text-kairo-white">
                          {isUserIssuer
                            ? renderUserInfo(invoice.clientAddress, false)
                            : renderUserInfo(invoice.issuerAddress, true)}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-zinc-500 text-zinc-400">
                          {invoice.status === "Paid"
                            ? `Paid on ${DOMPurify.sanitize(
                                invoice.paidDate || "N/A"
                              )}`
                            : `Created at ${formatDateTime(
                                invoice.issuedDate
                              )} UTC`}
                        </div>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end">
                          <a
                            href={`/invoice/${invoice.invoiceId}`}
                            className="text-sm font-medium leading-6 text-kairo-green hover:text-kairo-green text-kairo-green-a20 hover:text-kairo-green-a80"
                          >
                            View Invoice
                            <span className="sr-only">
                              , invoice #{DOMPurify.sanitize(invoice.invoiceId)}
                            </span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    );
  }
);

RecentActivity.displayName = "RecentActivity";

export default RecentActivity;
