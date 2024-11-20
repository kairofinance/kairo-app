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
        {/* Main Container */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            create
          </h2>

          {/* Type Selection */}
          <div className="flex gap-2">
            {creationOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setSelectedType(option.id as CreationType)}
                className={`group flex items-center gap-2 p-2 backdrop-blur-sm
                  ${
                    selectedType === option.id
                      ? "bg-white/[0.08]"
                      : "bg-white/[0.02]"
                  }
                  hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200`}
              >
                <span className="text-white/40 font-jetbrains text-sm">$</span>
                <span className="text-sm font-jetbrains text-white/60 group-hover:text-white/80">
                  {option.name.toLowerCase().replace(/ /g, "_")}
                </span>
                {selectedType === option.id && (
                  <span className="ml-1 animate-pulse">▋</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Creation Forms Container */}
          <div className="mt-6">
            {selectedType === "invoice" && <CreateInvoice />}
            {selectedType === "stream" && <CreateStream />}
            {selectedType === "vesting" && <CreateVesting />}
          </div>
        </div>
      </div>
    </div>
  );
}
