"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SplashClient() {
  return (
    <div className="min-h-screen p-6">
      <motion.div
        className="relative max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero */}
        <div className="py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl relative"
          >
            <div className="absolute -top-12 left-0 text-6xl opacity-20 font-mono">
              kairo*
            </div>
            <h1 className="text-4xl font-semibold tracking-tight mb-6 text-white">
              Streamline your token operations with kairo*
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              A comprehensive platform for managing token payments, streams, and
              vesting schedules with enterprise-grade security and real-time
              analytics.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 mt-8 text-sm text-white/80 hover:text-white transition-colors"
            >
              Open Dashboard <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="py-24 text-center">
          <p className="text-sm text-white/40">
            Built with security and efficiency in mind
          </p>
        </div>
      </motion.div>
    </div>
  );
}
