import { motion } from "framer-motion";
import { ArrowPathIcon, ClockIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface TokenInflow {
  streams: {
    total: string;
    count: number;
    token: string;
    change: number;
  };
  vests: {
    total: string;
    count: number;
    token: string;
    change: number;
  };
}

export default function TokenInflow() {
  // This will be replaced with real data from your hooks
  const sampleData: TokenInflow = {
    streams: {
      total: "1,234.56",
      count: 3,
      token: "USDC",
      change: 12.5,
    },
    vests: {
      total: "5,678.90",
      count: 2,
      token: "USDC",
      change: -2.3,
    },
  };

  return (
    <div className="space-y-4">
      {/* Command Line Header */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">salaries</span>
      </div>

      {/* Inflow Data */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streams Box */}
        <div className="bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-jetbrains text-white/60">
              streams
            </span>
            <span className="text-sm font-jetbrains text-white/40">
              ({sampleData.streams.count})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={`/tokens/${sampleData.streams.token}.png`}
              alt={sampleData.streams.token}
              width={16}
              height={16}
              className="opacity-80"
            />
            <span className="text-lg font-jetbrains text-white">
              {sampleData.streams.total}
            </span>
            <span className="text-sm font-jetbrains text-white/40">/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm ${
                sampleData.streams.change >= 0
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {sampleData.streams.change >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(sampleData.streams.change)}%
            </span>
            <span className="text-sm text-white/40">vs. last month</span>
          </div>
        </div>

        {/* Vests Box */}
        <div className="bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-jetbrains text-white/60">vests</span>
            <span className="text-sm font-jetbrains text-white/40">
              ({sampleData.vests.count})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={`/tokens/${sampleData.vests.token}.png`}
              alt={sampleData.vests.token}
              width={16}
              height={16}
              className="opacity-80"
            />
            <span className="text-lg font-jetbrains text-white">
              {sampleData.vests.total}
            </span>
            <span className="text-sm font-jetbrains text-white/40">/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm ${
                sampleData.vests.change >= 0
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {sampleData.vests.change >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(sampleData.vests.change)}%
            </span>
            <span className="text-sm text-white/40">vs. last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
