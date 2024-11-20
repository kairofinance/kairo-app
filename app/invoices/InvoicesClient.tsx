"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import PendingInvoicesList from "./components/PendingInvoicesList";
import ToggleView from "@/components/shared/ToggleView";

export default function InvoicesClient() {
  const { address } = useAppKitAccount();
  const [view, setView] = useState<"incoming" | "outgoing">("incoming");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["pending-invoices", address, view],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(
        `/api/invoices/pending?address=${address}&type=${view}`
      );
      if (!response.ok) throw new Error("Failed to fetch invoices");
      return response.json();
    },
    enabled: !!address,
  });

  if (!address) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative outline-2 outline outline-white/[0.2] p-7">
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              error
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains text-sm">$</span>
                <span className="text-sm font-jetbrains text-red-500">
                  wallet_not_connected
                </span>
              </div>
              <p className="text-sm font-jetbrains text-white/60 pl-4">
                Please connect your wallet to view your invoices
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Main Container */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            invoices
          </h2>

          {/* View Toggle */}
          <div className="flex gap-2 mb-6">
            <motion.button
              onClick={() => setView("incoming")}
              className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                ${view === "incoming" ? "bg-white/[0.08]" : "bg-white/[0.02]"}
                hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
            >
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                incoming
              </span>
              {view === "incoming" && (
                <span className="ml-1 animate-pulse">▋</span>
              )}
            </motion.button>

            <motion.button
              onClick={() => setView("outgoing")}
              className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                ${view === "outgoing" ? "bg-white/[0.08]" : "bg-white/[0.02]"}
                hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
            >
              <span className="text-white/40 font-jetbrains text-sm">$</span>
              <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                outgoing
              </span>
              {view === "outgoing" && (
                <span className="ml-1 animate-pulse">▋</span>
              )}
            </motion.button>
          </div>

          {/* Command Line Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/40 font-jetbrains text-sm">$</span>
            <span className="text-sm font-jetbrains text-white/60">
              {view}_invoices
            </span>
          </div>

          {/* Invoices List */}
          <div className="relative">
            <PendingInvoicesList
              invoices={invoices?.invoices || []}
              isLoading={isLoading}
              view={view}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
