import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface CashFlowOverviewProps {
  incoming: {
    total: string;
    change: number;
  };
  outgoing: {
    total: string;
    change: number;
  };
}

export default function CashFlowOverview({
  incoming,
  outgoing,
}: CashFlowOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Command Line Header */}

      {/* Cashflow Data */}
      <div className="grid grid-cols-2 gap-4">
        {/* Incoming Box */}
        <div className="bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-jetbrains text-white/60">
              incoming
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/tokens/USDC.png"
              alt="USDC"
              width={16}
              height={16}
              className="opacity-80"
            />
            <span className="text-lg font-jetbrains text-white">
              {incoming.total}
            </span>
            <span className="text-sm font-jetbrains text-white/40">/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm ${
                incoming.change >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {incoming.change >= 0 ? "↑" : "↓"} {Math.abs(incoming.change)}%
            </span>
            <span className="text-sm text-white/40">vs. last month</span>
          </div>
        </div>

        {/* Outgoing Box */}
        <div className="bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="w-4 h-4 text-red-500" />
            <span className="text-sm font-jetbrains text-white/60">
              outgoing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/tokens/USDC.png"
              alt="USDC"
              width={16}
              height={16}
              className="opacity-80"
            />
            <span className="text-lg font-jetbrains text-white">
              {outgoing.total}
            </span>
            <span className="text-sm font-jetbrains text-white/40">/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm ${
                outgoing.change >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {outgoing.change >= 0 ? "↑" : "↓"} {Math.abs(outgoing.change)}%
            </span>
            <span className="text-sm text-white/40">vs. last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
