"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: string;
  tokenIcon?: string;
  helper?: string;
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  icon,
  suffix,
  tokenIcon,
  helper,
  containerClassName = "",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="text-sm text-white/40 flex items-center gap-2">
          {icon && <span className="text-white/60">{icon}</span>}
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          className={`
            w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 
            rounded-lg px-4 py-3 text-white border border-white/[0.08]
            placeholder:text-white/20 transition-all duration-200
            focus:outline-none focus:ring-1 focus:ring-white/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${suffix || tokenIcon ? "pr-16" : "pr-4"}
            ${error ? "border-red-500/50 focus:ring-red-500/50" : ""}
            ${className}
          `}
        />

        {(suffix || tokenIcon) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {tokenIcon && (
              <div className="w-4 h-4 rounded-full overflow-hidden">
                <Image
                  src={tokenIcon}
                  alt="Token"
                  width={16}
                  height={16}
                  className="object-cover opacity-80"
                />
              </div>
            )}
            {suffix && <span className="text-white/40 text-sm">{suffix}</span>}
          </div>
        )}
      </div>

      {(error || helper) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm ${error ? "text-red-500" : "text-white/40"}`}
        >
          {error || helper}
        </motion.div>
      )}
    </div>
  );
}
