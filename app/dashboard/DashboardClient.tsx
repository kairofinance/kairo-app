"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useInView } from "react-intersection-observer";
import { debounce } from "lodash";
import DashboardHeader from "./components/DashboardHeader";
import { Locale } from "@/utils/i18n-config";
import dynamic from "next/dynamic";
import Spinner from "@/components/Spinner";
import type { Stat } from "./components/Stats";

const secondaryNavigation = [
  { name: "Last 7 days", period: "last7days" },
  { name: "Last 30 days", period: "last30days" },
  { name: "All-time", period: "alltime" },
];

interface DashboardClientProps {
  initialDictionary: any;
  initialLang: Locale;
}

const StatsSection = dynamic(() => import("./components/StatsSection"), {
  loading: () => <Spinner />,
  ssr: false,
});

const ActivitySection = dynamic(() => import("./components/ActivitySection"), {
  loading: () => <Spinner />,
  ssr: false,
});

function groupInvoicesByDate(invoices: any[]) {
  const grouped = invoices.reduce((acc: any, invoice: any) => {
    const date = new Date(invoice.issuedDate).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, dateTime: invoice.issuedDate, invoices: [] };
    }
    acc[date].invoices.push(invoice);
    return acc;
  }, {});

  return Object.values(grouped);
}

const calculatePercentageChange = (
  current: number,
  previous: number
): string => {
  if (previous === 0 || isNaN(current) || isNaN(previous)) return "";
  const change = ((current - previous) / previous) * 100;
  return isNaN(change) ? "" : `${Math.abs(change).toFixed(1)}%`;
};

const formatStats = (data: any): Stat[] => {
  return [
    {
      name: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      changeType:
        data.totalRevenue > data.previousTotalRevenue ? "increase" : "decrease",
      change: calculatePercentageChange(
        data.totalRevenue,
        data.previousTotalRevenue
      ),
    },
    {
      name: "Active Projects",
      value: data.activeProjects,
      changeType:
        data.activeProjects > data.previousActiveProjects
          ? "increase"
          : "decrease",
      change: calculatePercentageChange(
        data.activeProjects,
        data.previousActiveProjects
      ),
    },
    {
      name: "Clients",
      value: data.clientCount,
      changeType:
        data.clientCount > data.previousClientCount ? "increase" : "decrease",
      change: calculatePercentageChange(
        data.clientCount,
        data.previousClientCount
      ),
    },
    {
      name: "Contractors",
      value: data.contractorCount,
      changeType:
        data.contractorCount > data.previousContractorCount
          ? "increase"
          : "decrease",
      change: calculatePercentageChange(
        data.contractorCount,
        data.previousContractorCount
      ),
    },
    {
      name: "Total Invoices",
      value: data.totalInvoices,
      changeType:
        data.totalInvoices > data.previousTotalInvoices
          ? "increase"
          : "decrease",
      change: calculatePercentageChange(
        data.totalInvoices,
        data.previousTotalInvoices
      ),
    },
    {
      name: "Paid Invoices",
      value: data.paidInvoices,
      changeType:
        data.paidInvoices > data.previousPaidInvoices ? "increase" : "decrease",
      change: calculatePercentageChange(
        data.paidInvoices,
        data.previousPaidInvoices
      ),
    },
    {
      name: "Unpaid Invoices",
      value: data.unpaidInvoices,
      changeType:
        data.unpaidInvoices > data.previousUnpaidInvoices
          ? "increase"
          : "decrease",
      change: calculatePercentageChange(
        data.unpaidInvoices,
        data.previousUnpaidInvoices
      ),
    },
  ];
};

export default function DashboardClient({
  initialDictionary,
  initialLang,
}: DashboardClientProps) {
  const [period, setPeriod] = useState<string>("last7days");
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
  });
  const { ref: activityRef, inView: activityInView } = useInView({
    triggerOnce: true,
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["stats", address, period],
    queryFn: async () => {
      if (!address) return null;
      const response = await fetch(
        `/api/stats?address=${address}&period=${period}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    enabled: !!address && statsInView,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", address],
    queryFn: async () => {
      if (!address) return { invoices: [] };
      const response = await fetch(`/api/invoices?address=${address}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    enabled: !!address,
  });

  useEffect(() => {
    if (invoicesData) {
      console.log("Fetched invoices data:", invoicesData);
    }
  }, [invoicesData]);

  const uniqueAddresses = useMemo(() => {
    if (!invoicesData?.invoices) return [];
    const addresses = new Set<string>();
    invoicesData.invoices.forEach((invoice: any) => {
      addresses.add(invoice.issuerAddress.toLowerCase());
      addresses.add(invoice.clientAddress.toLowerCase());
    });
    return Array.from(addresses);
  }, [invoicesData]);

  const userProfileQueries = useQueries({
    queries: uniqueAddresses.map((address) => ({
      queryKey: ["userProfile", address],
      queryFn: async () => {
        const response = await fetch(`/api/users?address=${address}`);
        if (!response.ok && response.status !== 404) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.status === 404 ? null : response.json();
      },
      retry: false,
    })),
  });

  const userProfiles = useMemo(() => {
    const profiles: { [key: string]: any } = {};
    userProfileQueries.forEach((query) => {
      if (query.data) {
        profiles[query.data.address.toLowerCase()] = query.data;
      }
    });
    return profiles;
  }, [userProfileQueries]);

  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
  }, []);

  const debouncedHandlePeriodChange = useMemo(
    () => debounce(handlePeriodChange, 300),
    [handlePeriodChange]
  );

  useEffect(() => {
    return () => {
      debouncedHandlePeriodChange.cancel();
    };
  }, [debouncedHandlePeriodChange]);

  const { statNames, dashboardStats, groupedInvoices } = useMemo(
    () => ({
      statNames: [
        "Total Revenue",
        "Total Invoices",
        "Paid Invoices",
        "Unpaid Invoices",
        "Clients",
        "Contractors",
        "Active Projects",
        "On-Time Payment Rate",
      ],
      dashboardStats: statsData ? formatStats(statsData) : [],
      groupedInvoices: invoicesData?.invoices
        ? groupInvoicesByDate(invoicesData.invoices)
        : [],
    }),
    [statsData, invoicesData]
  );

  const firstStatsGroup = statNames.slice(0, 4);
  const secondStatsGroup = statNames.slice(4);

  useEffect(() => {
    if (statsData) {
      console.log("Fetched stats data:", statsData);
    }
  }, [statsData]);

  if (error) {
    return (
      <div className="bg-red-900 border-red-700 text-kairo-green-a80 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <main className="mt-5 mx-auto max-w-7xl px-5">
      <div className="relative isolate overflow-hidden">
        <DashboardHeader
          title={initialDictionary.dashboard.overview}
          periods={secondaryNavigation}
          currentPeriod={period}
          onPeriodChange={debouncedHandlePeriodChange}
          dictionary={initialDictionary}
        />

        <div ref={statsRef}>
          {statsInView && (
            <StatsSection
              firstStatsGroup={firstStatsGroup}
              secondStatsGroup={secondStatsGroup}
              dashboardStats={dashboardStats}
              isLoading={isLoadingStats}
            />
          )}
        </div>

        <div ref={activityRef}>
          {activityInView && (
            <ActivitySection
              dictionary={initialDictionary}
              groupedInvoices={groupedInvoices}
              isLoading={isLoadingInvoices}
              userAddress={address || ""}
              userProfiles={userProfiles}
            />
          )}
        </div>
      </div>
    </main>
  );
}
