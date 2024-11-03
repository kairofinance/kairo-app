import React from "react";

interface Period {
  name: string;
  period: string;
}

interface DashboardHeaderProps {
  title: string;
  periods: Period[];
  currentPeriod: string;
  onPeriodChange: (period: string) => void;
  dictionary: any;
}

export default function DashboardHeader({
  title,
  periods,
  currentPeriod,
  onPeriodChange,
  dictionary,
}: DashboardHeaderProps) {
  return (
    <header className="pb-4 pt-6 sm:pb-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6">
        <h1 className="text-base font-semibold leading-7 text-white">
          {title}
        </h1>
        <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-white/10 sm:pl-6 sm:leading-7">
          {periods.map((item) => (
            <button
              key={item.name}
              onClick={() => onPeriodChange(item.period)}
              className={`
                transition-colors duration-200
                ${
                  currentPeriod === item.period
                    ? "text-orange-600"
                    : "text-white/60 hover:text-white"
                }
              `}
            >
              {dictionary.dashboard.periods[item.period]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
