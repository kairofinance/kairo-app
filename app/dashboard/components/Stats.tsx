import React from "react";

interface Stat {
  name: string;
  value: string;
  change?: string;
  changeType: "positive" | "negative" | "neutral";
}

/**
 * Stats component
 *
 * Displays a grid of statistical data.
 *
 * @param {Object} props - Component props
 * @param {Stat[]} props.stats - Array of stat objects to display
 * @param {boolean} props.isLoading - Loading state of the component
 * @returns {React.ReactElement} Rendered Stats component
 */
const Stats: React.FC<{ stats: Stat[]; isLoading: boolean }> = React.memo(
  ({ stats, isLoading }) => {
    return (
      <div className="border-b border-b-zinc-900/10 lg:border-t lg:border-t-zinc-900/5 dark:border-b-zinc-100/10 dark:lg:border-t-zinc-100/5">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
          {stats.map((stat, statIdx) => (
            <div
              key={stat.name}
              className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-zinc-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 ${
                statIdx % 2 === 1
                  ? "sm:border-l"
                  : statIdx === 2
                  ? "lg:border-l"
                  : ""
              } dark:border-zinc-100/5`}
            >
              <dt className="text-sm font-medium leading-6 text-zinc-500 dark:text-zinc-400">
                {stat.name}
              </dt>
              <dd
                className={`text-xs font-medium ${
                  stat.changeType === "negative"
                    ? "text-rose-600 dark:text-rose-400"
                    : stat.changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-zinc-700 dark:text-zinc-300"
                } transition-opacity duration-300 ease-in-out ${
                  isLoading ? "opacity-50" : "opacity-100"
                }`}
              >
                {stat.change}
              </dd>
              <dd
                className={`w-full flex-none text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-white transition-opacity duration-300 ease-in-out ${
                  isLoading ? "opacity-50" : "opacity-100"
                }`}
              >
                {stat.value}
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
