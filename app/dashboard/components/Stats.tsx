import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";

export interface Stat {
  name: string;
  value: string | number | React.ReactNode;
  changeType?: "increase" | "decrease";
  change?: string;
}

interface StatsProps {
  statNames: string[];
  stats: Stat[];
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Stats({ statNames, stats, isLoading }: StatsProps) {
  return (
    <div className="mt-4 first:mt-0">
      <motion.dl
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
      >
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-6"
                >
                  <Skeleton
                    width={120}
                    baseColor="rgba(255, 255, 255, 0.05)"
                    highlightColor="rgba(255, 255, 255, 0.1)"
                  />
                  <Skeleton
                    width={80}
                    height={30}
                    className="mt-2"
                    baseColor="rgba(255, 255, 255, 0.05)"
                    highlightColor="rgba(255, 255, 255, 0.1)"
                  />
                </div>
              ))
          : stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] p-6 transition-all duration-300"
              >
                <dt className="truncate text-xs sm:text-sm font-medium text-white/30 uppercase tracking-wider">
                  {statNames[index]}
                </dt>
                <dd className="mt-2 flex items-baseline gap-x-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-garet text-white/90 group-hover:text-white transition-colors">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div
                      className={`
                        inline-flex items-baseline rounded-full px-2.5 py-1 text-xs sm:text-sm font-medium
                        ${
                          stat.changeType === "increase"
                            ? "text-orange-600/90 bg-orange-600/[0.07]"
                            : "text-white/60 bg-white/[0.05]"
                        }
                      `}
                    >
                      {stat.changeType === "increase" ? "+" : "-"}
                      {stat.change}
                    </div>
                  )}
                </dd>
              </motion.div>
            ))}
      </motion.dl>
    </div>
  );
}
