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

  const handlePeriodChange = useCallback(
    debounce((newPeriod: string) => {
      setPeriod(newPeriod);
    }, 300),
    []
  );

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
      dashboardStats: statsData
        ? [
            {
              name: "Total Revenue",
              value: statsData.totalRevenue.toFixed(2),
              changeType: "neutral" as const,
            },
            {
              name: "Total Invoices",
              value: statsData.totalInvoices.toString(),
              changeType: "neutral" as const,
            },
            {
              name: "Paid Invoices",
              value: statsData.paidInvoices.toString(),
              changeType: "positive" as const,
            },
            {
              name: "Unpaid Invoices",
              value: statsData.unpaidInvoices.toString(),
              changeType: "negative" as const,
            },
            {
              name: "Clients",
              value: statsData.clientCount.toString(),
              changeType: "neutral" as const,
            },
            {
              name: "Contractors",
              value: statsData.contractorCount.toString(),
              changeType: "neutral" as const,
            },
            {
              name: "Active Projects",
              value: statsData.activeProjects.toString(),
              changeType: "neutral" as const,
            },
            {
              name: "On-Time Payment Rate",
              value: isNaN(statsData.onTimePaymentRate)
                ? "N/A"
                : `${(statsData.onTimePaymentRate * 100).toFixed(2)}%`,
              changeType: "neutral" as const,
            },
          ]
        : [],
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
          onPeriodChange={handlePeriodChange}
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
