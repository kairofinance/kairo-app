import React from "react";
import Stats, { Stat } from "./Stats";

interface StatsSectionProps {
  firstStatsGroup: string[];
  secondStatsGroup: string[];
  dashboardStats: Stat[];
  isLoading: boolean;
}

export default function StatsSection({
  firstStatsGroup,
  secondStatsGroup,
  dashboardStats,
  isLoading,
}: StatsSectionProps) {
  return (
    <div className="">
      <Stats
        statNames={firstStatsGroup}
        stats={dashboardStats.slice(0, 4)}
        isLoading={isLoading}
      />
      <Stats
        statNames={secondStatsGroup}
        stats={dashboardStats.slice(4)}
        isLoading={isLoading}
      />
    </div>
  );
}
