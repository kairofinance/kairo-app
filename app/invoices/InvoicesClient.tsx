"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager";
import { INVOICE_MANAGER_ADDRESS, getAddress } from "contracts/addresses";
import { sepolia } from "viem/chains";
import { ERC20ABI } from "contracts/ERC20.sol/ERC20";
import { client } from "../../wagmi.config";
import Spinner from "@/components/Spinner";

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
}

interface Token {
  name: string;
  image: string;
  address: string;
  decimals: number;
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

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

const InvoicesClient: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  const { writeContractAsync: payInvoice } = useWriteContract();
  const { writeContractAsync: approveToken } = useWriteContract();

  const fetchInvoices = async () => {
    if (address) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/invoices?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.invoices);
        } else {
          console.error("Failed to fetch invoices");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [address]);

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

  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      const tokenInfo = getTokenInfo(invoice.tokenAddress);
      if (!tokenInfo) {
        throw new Error("Token information not found");
      }

      // Convert the invoice amount to a BigInt
      const invoiceAmount = BigInt(invoice.amount);

      // Calculate the fee (1% of the invoice amount)
      const fee = (invoiceAmount * BigInt(1)) / BigInt(100);

      // Calculate the total amount including 1% fee
      const totalAmount = invoiceAmount + fee;

      console.log("Invoice details:", {
        id: invoice.id,
        invoiceId: invoice.invoiceId,
        amount: formatUnits(invoiceAmount, tokenInfo.decimals),
        fee: formatUnits(fee, tokenInfo.decimals),
        totalAmount: formatUnits(totalAmount, tokenInfo.decimals),
      });

      // Fetch the current allowance
      const currentAllowanceResult = await client.readContract({
        address: invoice.tokenAddress as `0x${string}`,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
      });

      // Safely convert the result to BigInt
      const currentAllowance = BigInt(
        currentAllowanceResult?.toString() || "0"
      );

      console.log(
        "Current allowance:",
        formatUnits(currentAllowance, tokenInfo.decimals)
      );

      // If allowance is insufficient, request approval
      if (currentAllowance < totalAmount) {
        console.log("Requesting token approval...");
        const approveTx = await approveToken({
          address: invoice.tokenAddress as `0x${string}`,
          abi: ERC20ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as `0x${string}`, totalAmount],
        });

        console.log("Approval transaction submitted:", approveTx);
      }

      // Now proceed with paying the invoice
      console.log("Paying invoice...");
      const payTx = await payInvoice({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: InvoiceManagerABI,
        functionName: "payInvoice",
        args: [BigInt(invoice.invoiceId)],
      });

      console.log("Payment transaction submitted:", payTx);

      // Update the invoice status in the database
      console.log("Updating invoice status in database...");
      const response = await fetch("/api/invoices/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.invoiceId,
          transactionHash: payTx,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update invoice status: ${errorData.error}`);
      }

      const updatedInvoice = await response.json();
      console.log("Invoice status updated:", updatedInvoice);

      // Refresh the invoices list
      await fetchInvoices();

      alert("Invoice payment submitted successfully!");
    } catch (error: any) {
      console.error("Error paying invoice:", error);
      let errorMessage = "An error occurred while paying the invoice.";

      if (error.message.includes("InvoiceAlreadyPaid")) {
        errorMessage = "This invoice has already been paid.";
      } else if (error.message.includes("UnauthorizedPayment")) {
        errorMessage = "You are not authorized to pay this invoice.";
      } else if (error.message.includes("InvoiceDoesNotExist")) {
        errorMessage = "This invoice does not exist.";
      } else if (error.message.includes("InsufficientAllowance")) {
        errorMessage = "Insufficient token allowance. Please try again.";
      } else if (error.message.includes("InsufficientBalance")) {
        errorMessage = "Insufficient balance to pay this invoice.";
      } else if (error.message.includes("InsufficientTokenBalance")) {
        errorMessage = "Insufficient token balance to pay this invoice.";
      } else if (error.message.includes("CustomError")) {
        errorMessage = "A custom error occurred. Please try again later.";
      }

      alert(errorMessage);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-b border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800/60 px-4 py-5 sm:px-6 rounded-md mb-8">
        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <h3 className="text-base font-semibold leading-6 dark:text-zinc-100 text-zinc-900">
              Invoices
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              View your current incoming and outgoing invoices
            </p>
          </div>
          <div className="ml-4 mt-4 flex-shrink-0">
            <Link
              href="/"
              className="relative inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Create new invoice
            </Link>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <p className="text-center text-zinc-500">No invoices found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
              {invoices.map((invoice) => {
                const tokenInfo = getTokenInfo(invoice.tokenAddress);
                const isOverdue = new Date(invoice.dueDate) < new Date();
                const isIncoming =
                  invoice.issuerAddress.toLowerCase() !==
                  address?.toLowerCase();
                return (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {invoice.invoiceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {isIncoming ? "Incoming" : "Outgoing"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      <div className="flex items-center">
                        {tokenInfo && (
                          <Image
                            src={tokenInfo.image}
                            alt={tokenInfo.name}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                        )}
                        <span>
                          {formatAmount(invoice.amount, invoice.tokenAddress)}
                        </span>
                        {tokenInfo && (
                          <span className="ml-1">{tokenInfo.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      <div className="flex items-center">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                        {isOverdue && (
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {invoice.paid
                        ? "Paid"
                        : isOverdue
                        ? "Overdue"
                        : "Pending"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {isIncoming && !invoice.paid && (
                        <button
                          onClick={() => handlePayInvoice(invoice)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoicesClient;
