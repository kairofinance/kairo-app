"use client";

import "@/lib/pdfjs";
import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import Spinner from "./Spinner";

interface Invoice {
  invoiceId: string;
  issuerAddress: string;
  clientAddress: string;
  tokenAddress: string;
  amount: string;
  dueDate: string;
  issuedDate: string;
  paid: boolean;
  paidDate?: string;
  paymentTransactionHash?: string;
}

interface TokenInfo {
  symbol: string;
  decimals: number;
}

interface PDFDownloadButtonProps {
  invoice: Invoice;
  formatAmount: (amount: string) => string;
  getTokenInfo: (address: string) => TokenInfo;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  invoice,
  formatAmount,
  getTokenInfo,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      // Create the PDF document
      const doc = (
        <InvoicePDF
          invoice={invoice}
          formatAmount={formatAmount}
          getTokenInfo={getTokenInfo}
        />
      );

      // Generate the PDF blob
      const blob = await pdf(doc).toBlob();
      if (!blob) {
        throw new Error("Failed to generate PDF blob");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kairo-invoice-${invoice.invoiceId}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate PDF";
      console.error("PDF Generation Error:", err);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-kairo-black-a20/40 hover:bg-kairo-black-a20/60 text-kairo-white/90 hover:text-kairo-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <Spinner inline size={15} />
            <span>Generating PDF...</span>
          </div>
        ) : (
          <>
            <span className="text-sm">Download Invoice PDF</span>
            <svg
              className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </>
        )}
      </button>
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 rounded-md p-2">
          Failed to generate PDF: {error}
        </div>
      )}
    </div>
  );
};
