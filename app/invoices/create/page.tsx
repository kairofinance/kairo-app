"use client";

import { useState } from "react";
import {
  useAccount,
  useSignMessage,
  useContractRead,
  useContractWrite,
} from "wagmi";
import { parseEther } from "viem";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager"; // Adjust the import path as needed
import { INVOICE_MANAGER_ADDRESS, getAddress } from "contracts/addresses";
import { sepolia } from "viem/chains";

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

export default function CreateInvoice() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useContractWrite();
  const [formData, setFormData] = useState({
    clientAddress: "",
    tokenAddress: "",
    amount: "",
    dueDate: "",
  });

  // Read the nextInvoiceId from the contract
  const { data: nextInvoiceId } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: InvoiceManagerABI,
    functionName: "nextInvoiceId",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !nextInvoiceId) return;

    try {
      const parsedAmount = parseEther(formData.amount);
      const dueDateTimestamp = Math.floor(
        new Date(formData.dueDate).getTime() / 1000
      );

      console.log("Generating ZK proof");
      const proofResponse = await fetch("/api/createInvoiceHash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: formData.tokenAddress,
          issuer: address,
          client: formData.clientAddress,
          amount: parsedAmount.toString(),
          dueDate: dueDateTimestamp.toString(),
          nextInvoiceId: nextInvoiceId.toString(),
        }),
      });

      const proofData = await proofResponse.json();
      console.log("Received proof data:", proofData);

      if (proofData.error) {
        throw new Error(`Failed to generate proof: ${proofData.error}`);
      }

      console.log("Creating invoice in database");
      const invoiceResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: address,
          clientAddress: formData.clientAddress,
          tokenAddress: formData.tokenAddress,
          amount: parsedAmount.toString(),
          dueDate: new Date(formData.dueDate).toISOString(),
          invoiceHash: proofData.output[0],
          status: "Pending",
          nextInvoiceId: nextInvoiceId.toString(),
        }),
      });

      const invoiceData = await invoiceResponse.json();
      console.log("Received invoice data:", invoiceData);

      if (invoiceData.error) {
        throw new Error(`Failed to create invoice: ${invoiceData.error}`);
      }

      // Call the smart contract
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: InvoiceManagerABI,
        functionName: "createInvoice",
        args: [
          {
            zkProof: {
              a: proofData.proof.a,
              b: proofData.proof.b,
              c: proofData.proof.c,
              input: proofData.proof.input,
            },
            token: formData.tokenAddress,
            dataIdentifier: invoiceData.invoice.id,
          },
        ],
      });

      console.log("Smart contract call result:", result);
      alert(
        `Invoice creation transaction submitted. Transaction hash: ${result}`
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert(
        `Failed to create invoice: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-kairo-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-zinc-800">
        Create New Invoice
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="clientAddress"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Client Address
          </label>
          <input
            id="clientAddress"
            name="clientAddress"
            value={formData.clientAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-kairo-green focus:border-kairo-green"
          />
        </div>
        <div>
          <label
            htmlFor="tokenAddress"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Token Address
          </label>
          <input
            id="tokenAddress"
            name="tokenAddress"
            value={formData.tokenAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-kairo-green focus:border-kairo-green"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-kairo-green focus:border-kairo-green"
          />
        </div>
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-zinc-700 mb-1"
          >
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-kairo-green focus:border-kairo-green"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-kairo-white bg-kairo-green hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kairo-green"
        >
          Create Invoice
        </button>
      </form>
    </div>
  );
}
