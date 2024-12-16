import React from "react";
import { motion } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

export default function ErrorDisplay({
  title = "Error",
  message,
  icon = <ExclamationTriangleIcon className="w-6 h-6 text-white/40" />,
}: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[50vh] flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="flex justify-center">{icon}</div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white/80">{title}</h3>
          <p className="text-sm text-white/40">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
