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
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                  <Skeleton width={120} />
                  <Skeleton width={80} height={30} className="mt-2" />
                </div>
              ))
          : stats.map((stat, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <dt className="truncate text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider">
                  {statNames[index]}
                </dt>
                <dd className="mt-2 flex items-baseline gap-x-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div
                      className={`inline-flex items-baseline rounded-full px-2.5 py-1.5 text-xs sm:text-sm font-medium ${
                        stat.changeType === "increase"
                          ? "text-orange-600"
                          : "text-orange-600/60"
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
