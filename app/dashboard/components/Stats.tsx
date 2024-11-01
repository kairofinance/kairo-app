import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export interface Stat {
  name: string;
  value: string | number;
  changeType?: "increase" | "decrease";
  change?: string;
}

interface StatsProps {
  statNames: string[];
  stats: Stat[];
  isLoading: boolean;
}

export default function Stats({ statNames, stats, isLoading }: StatsProps) {
  return (
    <div className="mt-4 first:mt-0">
      <dl className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-kairo-black-a20/30 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 xl:px-8 rounded-lg"
                >
                  <Skeleton width={120} />
                  <Skeleton width={80} height={30} className="mt-2" />
                </div>
              ))
          : stats.map((stat, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-kairo-black-a20/30 px-3 py-4 sm:px-4 sm:py-5 lg:px-6 rounded-lg transition-all duration-300 hover:bg-kairo-black-a20/50"
              >
                <dt className="truncate text-xs sm:text-sm font-medium text-kairo-white/70">
                  {statNames[index]}
                </dt>
                <dd className="mt-2 flex items-baseline gap-x-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-kairo-white">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div
                      className={`inline-flex items-baseline rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium ${
                        stat.changeType === "increase"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {stat.change}
                    </div>
                  )}
                </dd>
              </div>
            ))}
      </dl>
    </div>
  );
}
