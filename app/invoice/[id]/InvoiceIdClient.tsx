"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { formatUnits } from "viem";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF"; // Ensure this path is correct

const tokens = [
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

interface InvoiceIdClientProps {
  invoiceId: string;
}

export default function InvoiceIdClient({ invoiceId }: InvoiceIdClientProps) {
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error("Failed to fetch invoice");
        const data = await response.json();

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

    if (invoiceId) fetchInvoice();
  }, [invoiceId, address, router]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    const tokenInfo = tokens.find(
      (token) =>
        token.address.toLowerCase() === invoice.tokenAddress.toLowerCase()
    );

    try {
      const blob = await pdf(
        <InvoicePDF invoice={invoice} tokenInfo={tokenInfo} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again later.");
    }
  };

  if (isLoading) return <Spinner />;
  if (error || !invoice)
    return (
      <div className="text-center text-kairo-white">
        {error || "Invoice not found"}
      </div>
    );

  const tokenInfo = tokens.find(
    (token) =>
      token.address.toLowerCase() === invoice.tokenAddress.toLowerCase()
  );

  const formatAmount = (amount: string): string => {
    if (!tokenInfo) return amount;
    const formattedAmount = formatUnits(BigInt(amount), tokenInfo.decimals);
    return parseFloat(formattedAmount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: tokenInfo.decimals,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-kairo-black-a20 bg-opacity-30 shadow-lg rounded-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-garet-heavy text-kairo-white">
                Invoice #{invoice.invoiceId}
              </h1>
              <p className="text-sm text-kairo-white/60">
                Issued: {new Date(invoice.issuedDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-kairo-white/60">
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
                <p className="text-sm text-kairo-white/60">
                  Paid on: {new Date(invoice.paidDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold text-kairo-white/80 mb-2">
                From
              </h2>
              <p className="text-sm text-kairo-white/60 break-all">
                {invoice.issuerAddress}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-kairo-white/80 mb-2">
                To
              </h2>
              <p className="text-sm text-kairo-white/60 break-all">
                {invoice.clientAddress}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-kairo-white/80 mb-4">
              Payment Details
            </h2>
            <div className="bg-kairo-black-a20 rounded-lg p-4">
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
                    <p className="text-xl font-semibold text-kairo-white">
                      {formatAmount(invoice.amount)} {tokenInfo?.name}
                    </p>
                    <p className="text-sm text-kairo-white/60">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {invoice.transactionHash && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-kairo-white/80 mb-2">
                Transaction Hash
              </h2>
              <p className="text-sm text-kairo-white/60 break-all">
                {invoice.transactionHash}
              </p>
            </div>
          )}
        </div>
        <div className="px-8 py-6 bg-kairo-black-a20">
          <button
            onClick={handleDownloadPDF}
            className="text-kairo-green rounded-full bg-kairo-green-a20 bg-opacity-30 px-3 py-2 text-sm font-semibold shadow-lg hover:bg-kairo-green/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kairo-green"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
