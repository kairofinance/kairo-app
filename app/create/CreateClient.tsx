"use client";

import React, { useState } from "react";
import {
  DocumentPlusIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import CreateInvoice from "./components/CreateInvoice";
import CreateStream from "./components/CreateStream";
import CreateVesting from "./components/CreateVesting";
import { motion } from "framer-motion";

type CreationType = "invoice" | "stream" | "vesting";

const creationOptions = [
  {
    id: "invoice",
    name: "Invoice",
    description: "Generate instant token payments",
    icon: DocumentPlusIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
  },
  {
    id: "stream",
    name: "Token Stream",
    description: "Real-time token streams with flexible rates",
    icon: ArrowPathIcon,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "vesting",
    name: "Vesting Schedule",
    description: "Token vesting with multiple parameters",
    icon: ClockIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

export default function CreateClient() {
  const [selectedType, setSelectedType] = useState<CreationType>("invoice");

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0"
        >
          <div>
            <h2 className="text-lg font-garet font-extrabold text-white">
              Create Payment
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Create instant invoices, token streams, or vesting schedules with
              flexible parameters.
            </p>
          </div>
        </motion.div>

        {/* Type Selection - More minimal version */}
        <div className="flex gap-2 p-1 rounded-lg bg-white/[0.02] border border-white/[0.08] w-fit">
          {creationOptions.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => setSelectedType(option.id as CreationType)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                transition-all duration-200
                ${
                  selectedType === option.id
                    ? "bg-white/[0.08] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option.icon
                className={`w-4 h-4 ${
                  selectedType === option.id ? option.color : "text-current"
                }`}
              />
              {option.name}
            </motion.button>
          ))}
        </div>

        {/* Creation Forms Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-6"
        >
          {selectedType === "invoice" && <CreateInvoice />}
          {selectedType === "stream" && <CreateStream />}
          {selectedType === "vesting" && <CreateVesting />}
        </motion.div>
      </div>
    </div>
  );
}
