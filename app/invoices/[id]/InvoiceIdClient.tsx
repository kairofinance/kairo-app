"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF";

interface Token {
  name: string;
  image: string;
  address: string;
  decimals: number;
}

interface Invoice {
  id: string;
  invoiceId: string;
  issuerAddress: string;
  clientAddress: string;
  tokenAddress: string;
  amount: string;
  dueDate: string;
  issuedDate: string;
  transactionHash: string;
  paid: boolean;
  paidDate?: string;
}

interface PDFRenderProps {
  loading: boolean;
  url: string | null;
  error: Error | null;
  blob: Blob | null;
}

const tokens: Token[] = [
  {
    name: "USDC",
    image: "/tokens/USDC.png",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
  },
  {
    name: "DAI",
    image: "/tokens/DAI.png",
    address: "0x552ceaDf3B47609897279F42D3B3309B604896f3",
    decimals: 18,
  },
];

const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-kairo-green hover:bg-kairo-green-a20 text-kairo-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
  >
    Download PDF
  </button>
);

const InvoiceIdClient = ({ invoiceId }: { invoiceId: string }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const getTokenInfo = (tokenAddress: string): Token | undefined => {
    return tokens.find(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  };

  const formatAmount = (amount: string, tokenAddress: string): string => {
    const tokenInfo = getTokenInfo(tokenAddress);
    if (tokenInfo) {
      const formattedAmount = formatUnits(BigInt(amount), tokenInfo.decimals);
      return parseFloat(formattedAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: tokenInfo.decimals,
      });
    }
    return amount;
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch invoice");
        }
        const data = await response.json();

        // Check if the user is authorized to view this invoice
        if (
          address?.toLowerCase() !== data.invoice.issuerAddress.toLowerCase() &&
          address?.toLowerCase() !== data.invoice.clientAddress.toLowerCase()
        ) {
          router.push("/invoices");
          return;
        }

        setInvoice(data.invoice);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, address, router]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !invoice) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-kairo-black dark:text-kairo-white">
          {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  const tokenInfo = getTokenInfo(invoice.tokenAddress);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-kairo-white dark:bg-kairo-black-a20 shadow-lg rounded-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-garet-heavy text-kairo-black dark:text-kairo-white">
                Invoice #{invoice.invoiceId}
              </h1>
              <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60">
                Issued: {new Date(invoice.issuedDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    invoice.paid
                      ? "text-kairo-green"
                      : new Date(invoice.dueDate) < new Date()
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {invoice.paid
                    ? "Paid"
                    : new Date(invoice.dueDate) < new Date()
                    ? "Overdue"
                    : "Pending"}
                </span>
              </p>
              {invoice.paid && invoice.paidDate && (
                <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60">
                  Paid on: {new Date(invoice.paidDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold text-kairo-black-a80 dark:text-kairo-white/80 mb-2">
                From
              </h2>
              <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60 break-all">
                {invoice.issuerAddress}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-kairo-black-a80 dark:text-kairo-white/80 mb-2">
                To
              </h2>
              <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60 break-all">
                {invoice.clientAddress}
              </p>
            </div>
          </div>

          {/* Amount and Token */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-kairo-black-a80 dark:text-kairo-white/80 mb-4">
              Payment Details
            </h2>
            <div className="bg-zinc-50 dark:bg-kairo-black-a40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {tokenInfo && (
                    <Image
                      src={tokenInfo.image}
                      alt={tokenInfo.name}
                      width={32}
                      height={32}
                      className="mr-3"
                    />
                  )}
                  <div>
                    <p className="text-xl font-semibold text-kairo-black dark:text-kairo-white">
                      {formatAmount(invoice.amount, invoice.tokenAddress)}{" "}
                      {tokenInfo?.name}
                    </p>
                    <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {invoice.transactionHash && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-kairo-black-a80 dark:text-kairo-white/80 mb-2">
                Transaction Hash
              </h2>
              <p className="text-sm text-kairo-black-a60 dark:text-kairo-white/60 break-all">
                {invoice.transactionHash}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 py-6 bg-zinc-50 dark:bg-kairo-black-a40">
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} tokenInfo={tokenInfo} />}
            fileName={`invoice-${invoice.invoiceId}.pdf`}
          >
            <DownloadButton onClick={() => {}} />
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
};

export default InvoiceIdClient;
