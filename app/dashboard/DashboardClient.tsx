"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Stats, { Stat } from "./components/Stats";
import RecentActivity from "./components/RecentActivity";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Locale } from "@/utils/i18n-config";
import DOMPurify from "dompurify";
import { debounce } from "lodash";
import "react-loading-skeleton/dist/skeleton.css";

const secondaryNavigation = [
  { name: "Last 7 days", period: "last7days" },
  { name: "Last 30 days", period: "last30days" },
  { name: "All-time", period: "alltime" },
];

interface Transaction {
  id: number;
  invoiceNumber: string;
  href: string;
  amount: string;
  status: string;
  client: string;
  description: string;
  icon: "ArrowUpCircleIcon" | "ArrowDownCircleIcon";
}

interface DayTransactions {
  date: string;
  dateTime: string;
  transactions: Transaction[];
}

interface CurrencyResponse {
  currency: string;
}

const defaultStats: Stat[] = [
  { name: "Total Revenue", value: "$0", changeType: "neutral" },
  { name: "New Clients", value: "0", changeType: "neutral" },
  { name: "Active Projects", value: "0", changeType: "neutral" },
  { name: "Profit Margin", value: "0%", changeType: "neutral" },
];

interface DashboardClientProps {
  initialDictionary: any;
  initialLang: Locale;
}

interface Invoice {
  id: string;
  invoiceId: string;
  amount: string;
  token?: string;
  clientAddress: string;
  issuerAddress: string;
  paid: boolean;
  dueDate: string;
  paidDate?: string | null;
  status: "Paid" | "Created";
  issuedDate: string;
  tokenAddress: string; // Add this line
}

interface DayInvoices {
  date: string;
  dateTime: string;
  invoices: Invoice[];
}

interface UserProfile {
  address: string;
  username: string | null;
  pfp: string | null;
}

export default function DashboardClient({
  initialDictionary,
  initialLang,
}: DashboardClientProps) {
  const [dictionary, setDictionary] = useState(initialDictionary);
  const [lang, setLang] = useState(initialLang);
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [transactions, setTransactions] = useState<DayTransactions[]>([]);
  const [period, setPeriod] = useState<string>("last7days");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const [cache, setCache] = useState<Record<string, any>>({});

  const { data: currencyData, error: currencyError } = useQuery({
    queryKey: ["currency"],
    queryFn: async () => {
      const response = await fetch("/api/currency");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (currencyData) {
      setUserCurrency(currencyData.currency);
    }
    if (currencyError) {
      console.error("Error fetching currency:", currencyError);
      setUserCurrency("USD");
    }
  }, [currencyData, currencyError]);

  const fetchData = useCallback(
    async (dataType: string) => {
      setIsLoading(true);
      setError(null);
      try {
        let response: Response;
        switch (dataType) {
          case "stats":
            if (cache.stats) {
              setStats(cache.stats);
              return;
            }
            response = await fetch("/api/stats");
            const statsData = (await response.json()) as Stat[];
            setStats(statsData);
            setCache((prev) => ({ ...prev, stats: statsData }));
            break;
          case "transactions":
            if (cache[`transactions_${period}`]) {
              setTransactions(cache[`transactions_${period}`]);
              return;
            }
            response = await fetch(
              `/api/transactions?period=${encodeURIComponent(
                DOMPurify.sanitize(period)
              )}`
            );
            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                `HTTP error! status: ${response.status}, message:`,
                errorText
              );
              throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
              );
            }
            const transactionsData =
              (await response.json()) as DayTransactions[];
            setTransactions(transactionsData);
            setCache((prev) => ({
              ...prev,
              [`transactions_${period}`]: transactionsData,
            }));
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
        setError(
          `Failed to fetch ${DOMPurify.sanitize(
            dataType
          )}. Please try again later. Error: ${
            error instanceof Error
              ? DOMPurify.sanitize(error.message)
              : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [period, cache]
  );

  useEffect(() => {
    fetchData("stats");
    fetchData("transactions");
  }, [fetchData]);

  const debouncedFetchTransactions = useMemo(
    () => debounce(() => fetchData("transactions"), 300),
    [fetchData]
  );

  const handlePeriodChange = useCallback(
    (newPeriod: string) => {
      setPeriod(newPeriod);
      debouncedFetchTransactions();
    },
    [debouncedFetchTransactions]
  );

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", address],
    queryFn: async () => {
      if (!address) return { invoices: [] };
      const response = await fetch(`/api/invoices?address=${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw invoices data:", data); // Debug log
      return data;
    },
    enabled: !!address,
  });

  const groupedInvoices = useMemo(() => {
    console.log("Grouping invoices. Raw data:", invoicesData); // Debug log
    if (!invoicesData?.invoices) return [];
    const grouped: Record<string, Invoice[]> = {};
    invoicesData.invoices.forEach((invoice: Invoice) => {
      console.log("Processing invoice:", invoice); // Debug log for each invoice
      const date = new Date(invoice.issuedDate).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(invoice);
    });
    const result = Object.entries(grouped)
      .map(([date, invoices]) => ({
        date: new Date(date).toLocaleDateString(lang, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        dateTime: date,
        invoices,
      }))
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
    console.log("Grouped invoices:", result); // Debug log for final grouped result
    return result;
  }, [invoicesData, lang]);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["stats", address, period],
    queryFn: async () => {
      if (!address) return null;
      const response = await fetch(
        `/api/stats?address=${address}&period=${period}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching stats:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.error}`
        );
      }
      return response.json();
    },
    enabled: !!address,
  });

  useEffect(() => {
    if (statsError) {
      console.error("Stats query error:", statsError);
    }
  }, [statsError]);

  const statNames = useMemo(
    () => [
      "Total Revenue",
      "Total Invoices",
      "Paid Invoices",
      "Unpaid Invoices",
      "Clients",
      "Contractors",
      "Active Projects",
      "On-Time Payment Rate",
    ],
    []
  ); // Empty dependency array as these names don't change

  const dashboardStats = useMemo(() => {
    if (!statsData) return [];
    return [
      {
        value: `$${statsData.totalRevenue?.toFixed(2) || "0.00"}`,
        changeType: "neutral" as const,
      },
      {
        value: statsData.totalInvoices?.toString() || "0",
        changeType: "neutral" as const,
      },
      {
        value: statsData.paidInvoices?.toString() || "0",
        changeType: "positive" as const,
      },
      {
        value: statsData.unpaidInvoices?.toString() || "0",
        changeType: "negative" as const,
      },
      {
        value: statsData.clientCount?.toString() || "0",
        changeType: "neutral" as const,
      },
      {
        value: statsData.contractorCount?.toString() || "0",
        changeType: "neutral" as const,
      },
      {
        value: statsData.activeProjects?.toString() || "0",
        changeType: "neutral" as const,
      },
      {
        value:
          statsData.paidInvoices && statsData.paidInvoices > 0
            ? statsData.onTimePaymentRate !== undefined
              ? `${statsData.onTimePaymentRate.toFixed(1)}%`
              : "N/A"
            : "No paid invoices yet",
        changeType: "neutral" as const,
      },
    ] as Stat[];
  }, [statsData]);

  const firstStatsGroup = useMemo(() => statNames.slice(0, 4), [statNames]);
  const secondStatsGroup = useMemo(() => statNames.slice(4), [statNames]);

  useEffect(() => {
    // Log debugging information when groupedInvoices changes
    console.log("Rendering RecentActivity with:", {
      groupedInvoices,
      isLoadingInvoices,
      userAddress: address,
    });
  }, [groupedInvoices, isLoadingInvoices, address]);

  // Fetch user profiles for all unique addresses in invoices
  const uniqueAddresses = useMemo(() => {
    if (!invoicesData?.invoices) return [];
    const addresses = new Set<string>();
    invoicesData.invoices.forEach((invoice: Invoice) => {
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
        if (!response.ok) {
          if (response.status === 404) {
            // User not found, return null
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
      retry: false, // Don't retry if user is not found
    })),
  });

  const userProfiles = useMemo(() => {
    const profiles: { [key: string]: UserProfile } = {};
    userProfileQueries.forEach((query) => {
      if (query.data) {
        profiles[query.data.address.toLowerCase()] = query.data;
      }
    });
    return profiles;
  }, [userProfileQueries]);

  return (
    <main className="mt-5 mx-auto max-w-7xl px-2">
      <div className="relative isolate overflow-hidden">
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-base font-semibold leading-7 text-kairo-black-a20 dark:text-kairo-white">
              {dictionary.dashboard.overview}
            </h1>
            <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-zinc-200 sm:pl-6 sm:leading-7">
              {secondaryNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handlePeriodChange(item.period)}
                  className={
                    period === item.period
                      ? "text-red-600 dark:text-kairo-green-a20"
                      : "text-zinc-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-kairo-green-a20"
                  }
                >
                  {dictionary.dashboard.periods[item.period]}
                </button>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div
            className="bg-kairo-green-a80 border border-kairo-green-a20 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-kairo-green-a80"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div>
          <Stats
            statNames={firstStatsGroup}
            stats={dashboardStats.slice(0, 4)}
            isLoading={isLoadingStats}
          />
          <Stats
            statNames={secondStatsGroup}
            stats={dashboardStats.slice(4)}
            isLoading={isLoadingStats}
          />
        </div>

        <div className="space-y-16 py-16 xl:space-y-20">
          {/* Recent Activity section */}
          <div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-kairo-black-a20 dark:text-kairo-white lg:mx-0 lg:max-w-none">
                {dictionary.dashboard.recentActivity.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {dictionary.dashboard.recentActivity.description}
              </p>
            </div>
            <div className="mt-6 overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                  <RecentActivity
                    invoices={groupedInvoices}
                    isLoading={isLoadingInvoices}
                    userAddress={address || ""}
                    userProfiles={userProfiles}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
