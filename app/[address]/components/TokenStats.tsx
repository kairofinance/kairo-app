import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";
import { USDC_ADDRESS, DAI_ADDRESS } from "../../../contracts/addresses";

interface TokenStatsProps {
  address: string;
}

export default function TokenStats({ address }: TokenStatsProps) {
  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`,
  });

  const { data: usdcBalance } = useBalance({
    address: address as `0x${string}`,
    token: USDC_ADDRESS[11155111],
  });

  return (
    <div className="space-y-6">
      {/* Command Line Header */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">
          get token_balances
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ETH Balance */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-6 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/tokens/ETH.png"
                alt="ETH"
                width={20}
                height={20}
                className="opacity-80"
              />
              <span className="text-sm font-jetbrains text-white/60">
                eth_balance
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">&gt;</span>
              <span className="text-2xl font-jetbrains text-white">
                {ethBalance
                  ? Number(ethBalance.formatted).toFixed(4)
                  : "0.0000"}
              </span>
              <span className="text-sm font-jetbrains text-white/40">ETH</span>
            </div>
          </div>
        </div>

        {/* USDC Balance */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 p-6 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/tokens/USDC.png"
                alt="USDC"
                width={20}
                height={20}
                className="opacity-80"
              />
              <span className="text-sm font-jetbrains text-white/60">
                usdc_balance
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-jetbrains text-sm">&gt;</span>
              <span className="text-2xl font-jetbrains text-white">
                {usdcBalance
                  ? Number(usdcBalance.formatted).toFixed(2)
                  : "0.00"}
              </span>
              <span className="text-sm font-jetbrains text-white/40">USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Line */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
        <span className="text-white/40 font-jetbrains text-sm">$</span>
        <span className="text-sm font-jetbrains text-white/60">status:</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-jetbrains text-white/40">synced</span>
        </div>
      </div>
    </div>
  );
}
