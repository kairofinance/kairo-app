"use client";

import React from "react";
import TokenBalanceGraph from "./components/TokenBalanceGraph";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import Card from "@/components/shared/ui/Card";

interface FlowData {
  date: Date;
  inflow: number;
  outflow: number;
}

const DailyFlowGraph = ({
  data,
  onHover,
}: {
  data: FlowData[];
  onHover: (data: { inflow: number; outflow: number } | null) => void;
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const limitedData = data.slice(-20);
    return limitedData.map((item) => ({
      ...item,
      date: new Date(item.date),
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col">
        <div className="flex-1 flex items-end justify-between gap-2">
          {[...Array(20)].map((_, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center animate-pulse"
              style={{ width: `${95 / 20}%` }}
            >
              <div className="relative h-[200px] w-10">
                <div className="absolute bottom-0 w-full h-[30%] bg-white/[0.02] rounded-[1px]" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-12" />
      </div>
    );
  }

  const maxValue = Math.max(
    ...processedData.map((d) => Math.max(d.inflow || 0, d.outflow || 0))
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    })
      .format(date)
      .replace(" ", " ");
  };

  const shouldShowLabel = (index: number) => {
    const isRegularLabel =
      index === 0 || index === processedData.length - 1 || index % 5 === 0;

    if (isRegularLabel && hoveredIndex !== null) {
      const isAdjacentToHovered = Math.abs(index - hoveredIndex) <= 1;
      return !isAdjacentToHovered;
    }

    return isRegularLabel;
  };

  return (
    <div className="h-[300px] flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-end justify-between gap-2">
          {processedData.map((item, index) => {
            const hasData = item.inflow > 0 || item.outflow > 0;
            const inflowHeight = (item.inflow / maxValue) * 100;
            const outflowHeight = (item.outflow / maxValue) * 100;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center"
                style={{ width: `${95 / processedData.length}%` }}
              >
                <div
                  className="absolute inset-0 h-[200px] z-10"
                  onMouseEnter={() => {
                    onHover({ inflow: item.inflow, outflow: item.outflow });
                    setHoveredIndex(index);
                  }}
                  onMouseLeave={() => {
                    onHover(null);
                    setHoveredIndex(null);
                  }}
                />

                <div className="relative h-[200px] w-10 flex flex-col-reverse">
                  {hasData ? (
                    <>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${outflowHeight}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="w-full bg-red-500/80 transition-colors rounded-[1px]"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${inflowHeight}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="w-full bg-emerald-500/80 transition-colors rounded-[1px]"
                      />
                    </>
                  ) : (
                    <div className="w-full h-[2px] bg-white/10 absolute bottom-0" />
                  )}
                </div>

                <div className="absolute bottom-0 translate-y-[180%] text-center">
                  <span
                    className={`text-xs font-medium opacity-transition whitespace-nowrap ${
                      hoveredIndex === index
                        ? "text-white opacity-100"
                        : shouldShowLabel(index)
                        ? "text-white/70 opacity-100"
                        : "text-white/70 opacity-0"
                    }`}
                  >
                    {formatDate(item.date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
};

export default function OverviewClient() {
  const { address } = useAppKitAccount();
  const [hoveredData, setHoveredData] = React.useState<{
    inflow: number;
    outflow: number;
  } | null>(null);

  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["monthlyFlows", address],
    queryFn: async () => {
      if (!address) return { dailyData: [], totals: { inflow: 0, outflow: 0 } };
      const response = await fetch(`/api/flows/monthly?address=${address}`);
      if (!response.ok) throw new Error("Failed to fetch monthly flows");
      return response.json();
    },
    enabled: !!address,
  });

  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["activity", address],
    queryFn: async () => {
      if (!address) return { activities: [] };
      const response = await fetch(`/api/activity?address=${address}&days=7`);
      if (!response.ok) throw new Error("Failed to fetch activity");
      return response.json();
    },
    enabled: !!address,
  });

  const displayTotals = hoveredData ||
    monthlyData?.totals || { inflow: 0, outflow: 0 };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Money Flow Graph Section */}
        <div className="p-9 overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Monthly Flow
              </h2>
              <p className="text-white/80 mt-1 text-sm font-semibold">
                {hoveredData
                  ? "Daily breakdown"
                  : "Last 30 days of transactions"}
              </p>
            </div>
            {isLoadingMonthly ? (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end gap-2">
                  <div className="h-4 w-24 bg-white/[0.02] rounded animate-pulse" />
                  <div className="h-8 w-32 bg-white/[0.02] rounded animate-pulse" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-4 w-24 bg-white/[0.02] rounded animate-pulse" />
                  <div className="h-8 w-32 bg-white/[0.02] rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-xs mr-auto text-emerald-500 font-semibold">
                    {hoveredData ? "Daily Inflow" : "Total Inflow"}
                  </span>
                  <motion.p
                    key={displayTotals.inflow}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-white mt-1 mr-auto"
                  >
                    ${displayTotals.inflow.toFixed(2)}
                  </motion.p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs mr-auto text-rose-500 font-semibold">
                    {hoveredData ? "Daily Outflow" : "Total Outflow"}
                  </span>
                  <motion.p
                    key={displayTotals.outflow}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-white mt-1 mr-auto"
                  >
                    ${displayTotals.outflow.toFixed(2)}
                  </motion.p>
                </div>
              </div>
            )}
          </div>

          <DailyFlowGraph
            data={monthlyData?.dailyData || []}
            onHover={setHoveredData}
          />
        </div>

        {/* Activity Feed */}
        <TokenBalanceGraph
          data={activityData?.activities || []}
          days={7}
          isLoading={isLoadingActivity}
        />
      </div>
    </div>
  );
}
