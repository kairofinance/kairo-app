import React from "react";
import Stats, { Stat } from "./Stats";

interface StatsSectionProps {
  firstStatsGroup: string[];
  dashboardStats: Stat[];
  isLoading: boolean;
}

export default function StatsSection({
  firstStatsGroup,
  dashboardStats,
  isLoading,
}: StatsSectionProps) {
  return (
    <div className="">
      <Stats
        statNames={firstStatsGroup}
        stats={dashboardStats}
        isLoading={isLoading}
      />
    </div>
  );
}
