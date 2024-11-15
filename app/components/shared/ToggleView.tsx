"use client";

import { motion } from "framer-motion";

interface ToggleViewProps {
  view: "incoming" | "outgoing";
  onChange: (view: "incoming" | "outgoing") => void;
}

export default function ToggleView({ view, onChange }: ToggleViewProps) {
  return (
    <div className="relative flex p-0.5 rounded-lg bg-white/[0.02] border border-white/[0.08]">
      {/* Sliding background */}
      <motion.div
        className="absolute inset-y-0.5 w-1/2 rounded-md bg-white/[0.08]"
        initial={false}
        animate={{
          x: view === "incoming" ? 2 : "100%",
          translateX: view === "incoming" ? 0 : -2,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Buttons */}
      <button
        onClick={() => onChange("incoming")}
        className={`
          relative z-10 px-4 py-1.5 text-[13px] font-medium rounded-md
          transition-colors duration-200 min-w-[90px]
          ${
            view === "incoming"
              ? "text-white"
              : "text-white/40 hover:text-white/60"
          }
        `}
      >
        Incoming
      </button>

      <button
        onClick={() => onChange("outgoing")}
        className={`
          relative z-10 px-4 py-1.5 text-[13px] font-medium rounded-md
          transition-colors duration-200 min-w-[90px]
          ${
            view === "outgoing"
              ? "text-white"
              : "text-white/40 hover:text-white/60"
          }
        `}
      >
        Outgoing
      </button>
    </div>
  );
}
