import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export interface Stat {
  name: string;
  value: string;
  changeType: "neutral" | "positive" | "negative";
}

interface StatsProps {
  statNames: string[];
  stats: Stat[];
  isLoading: boolean;
}

/**
 * Stats component
 *
 * Displays a grid of statistical data.
 *
 * @param {Object} props - Component props
 * @param {string[]} props.statNames - Array of stat names to display
 * @param {Stat[]} props.stats - Array of stat objects to display
 * @param {boolean} props.isLoading - Loading state of the component
 * @returns {React.ReactElement} Rendered Stats component
 */
const Stats: React.FC<StatsProps> = React.memo(
  ({ statNames, stats, isLoading }) => {
    return (
      <div className="border-b border-b-kairo-black-a40 ">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
          {statNames.map((name, statIdx) => (
            <div
              key={name}
              className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-kairo-black-a40 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 ${
                statIdx % 2 === 1
                  ? "sm:border-l"
                  : statIdx === 2
                  ? "lg:border-l"
                  : ""
              } border-kairo-white/5`}
            >
              <dt className="text-sm leading-6 text-kairo-white">{name}</dt>
              <dd className="w-full flex-none text-3xl font-bold leading-10 tracking-tight text-kairo-white">
                {isLoading ? (
                  <Skeleton width={100} height={36} />
                ) : (
                  stats[statIdx]?.value || "N/A"
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
);

Stats.displayName = "Stats";

export default Stats;
