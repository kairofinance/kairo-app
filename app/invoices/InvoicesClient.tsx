"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import PendingInvoicesList from "./components/PendingInvoicesList";

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: custom * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

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
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <XCircleIcon className="mx-auto h-12 w-12 text-orange-600" />
            <h3 className="mt-2 text-lg font-medium text-white">
              Wallet Not Connected
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Please connect your wallet to view your invoices
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={fadeInVariant}
          custom={0}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Pending Invoices
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Manage your unpaid incoming and outgoing invoices
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-full bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => setView("incoming")}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  view === "incoming"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Incoming
              </button>
              <button
                onClick={() => setView("outgoing")}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  view === "outgoing"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Outgoing
              </button>
            </div>
          </div>

          {/* Invoices List */}
          <PendingInvoicesList
            invoices={invoices?.invoices || []}
            isLoading={isLoading}
            view={view}
          />
        </motion.div>
      </div>
    </div>
  );
}
