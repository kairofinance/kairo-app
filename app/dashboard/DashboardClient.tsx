"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Stats from "./components/Stats";
import RecentActivity from "./components/RecentActivity";
import Streams from "./components/Streams";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { useAccount } from "wagmi";
import { Locale } from "@/utils/i18n-config";

const secondaryNavigation = [
  { name: "Last 7 days", period: "last7days" },
  { name: "Last 30 days", period: "last30days" },
  { name: "All-time", period: "alltime" },
];

interface Stat {
  name: string;
  value: string;
  change?: string;
  changeType: "positive" | "negative" | "neutral";
}

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

  return (
    <main className="mt-5 mx-auto max-w-7xl px-2">
      <div className="relative isolate overflow-hidden">
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-base font-semibold leading-7 text-zinc-900 dark:text-white">
              {dictionary.dashboard.overview}
            </h1>
            <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-zinc-200 sm:pl-6 sm:leading-7">
              {secondaryNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handlePeriodChange(item.period)}
                  className={
                    period === item.period
                      ? "text-red-600 dark:text-red-400"
                      : "text-zinc-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400"
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
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Stats stats={stats} isLoading={isLoading} />

        <div className="space-y-16 py-16 xl:space-y-20">
          {/* Streams section */}
          <div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-zinc-900 dark:text-white lg:mx-0 lg:max-w-none">
                {dictionary.dashboard.streams.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {dictionary.dashboard.streams.description}
              </p>
            </div>
            <div className="overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {address && <Streams userId={address} isLoading={isLoading} />}
              </div>
            </div>
          </div>

          {/* Recent Activity section */}
          <div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-zinc-900 dark:text-white lg:mx-0 lg:max-w-none">
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
                    transactions={transactions}
                    isLoading={isLoading}
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
