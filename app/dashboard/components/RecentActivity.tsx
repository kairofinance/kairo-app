import React from "react";
import { CheckCircleIcon, DocumentIcon } from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";
import Image from "next/image";
import { formatUnits } from "viem";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useEnsName } from "wagmi";

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

function AddressDisplay({ address }: { address: string }) {
  const { data: ensName, isLoading } = useEnsName({
    address: address as `0x${string}`,
  });

  if (isLoading) {
    return <Skeleton width={100} />;
  }

  return (
    <span>{ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}</span>
  );
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
            <span>{profile.username}</span>
          </div>
        );
      }

      return (
        <div className="flex items-center">
          <span className="mr-1 text-kairo-white">{prefix}</span>
          <AddressDisplay address={address} />
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
              <td colSpan={3} className="py-12 text-center text-kairo-white/90">
                No recent activity available
              </td>
            </tr>
          ) : (
            filteredInvoices.map((day) => (
              <React.Fragment key={day.dateTime}>
                <tr className="text-sm leading-6">
                  <th
                    scope="colgroup"
                    colSpan={3}
                    className="relative isolate pt-10 pb-4 font-bold"
                  >
                    <time
                      dateTime={DOMPurify.sanitize(day.dateTime)}
                      className="text-kairo-white/80 text-base"
                    >
                      {DOMPurify.sanitize(day.date)}
                    </time>
                    <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-kairo-black-a40" />
                  </th>
                </tr>
                {day.invoices.map((invoice) => {
                  const invoiceStatus = getInvoiceStatus(invoice, userAddress);
                  const isUserIssuer =
                    invoice.issuerAddress.toLowerCase() ===
                    userAddress.toLowerCase();
                  return (
                    <tr
                      key={invoice.id}
                      className="group  transition-colors duration-200"
                    >
                      <td className="relative py-6 pr-6">
                        <div className="flex gap-x-6">
                          {invoiceStatus === "Paid" ? (
                            <CheckCircleIcon
                              className="hidden h-6 w-5 flex-none text-green-400 sm:block"
                              aria-hidden="true"
                            />
                          ) : (
                            <DocumentIcon
                              className="hidden h-6 w-5 flex-none text-blue-400 sm:block"
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
                                  "rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset"
                                )}
                              >
                                {invoiceStatus}
                              </div>
                            </div>
                            <div className="mt-1.5 text-sm leading-5 text-kairo-white/60">
                              Invoice #{DOMPurify.sanitize(invoice.invoiceId)}
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 right-full h-px w-screen bg-kairo-black-a40/50" />
                        <div className="absolute bottom-0 left-0 h-px w-screen bg-kairo-black-a40/50" />
                      </td>
                      <td className="hidden py-6 pr-6 sm:table-cell">
                        <div className="text-sm leading-6 text-kairo-white/90">
                          {isUserIssuer
                            ? renderUserInfo(invoice.clientAddress, false)
                            : renderUserInfo(invoice.issuerAddress, true)}
                        </div>
                        <div className="mt-1.5 text-sm leading-5 text-kairo-white/60">
                          {invoice.status === "Paid"
                            ? `Paid on ${DOMPurify.sanitize(
                                invoice.paidDate || "N/A"
                              )}`
                            : `Created at ${formatDateTime(
                                invoice.issuedDate
                              )} UTC`}
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex justify-end">
                          <a
                            href={`/invoice/${invoice.invoiceId}`}
                            className="relative flex items-center font-semibold gap-x-4 px-4 py-2 text-sm leading-6 hover:bg-kairo-green-a20/50 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full transition-colors duration-200"
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
