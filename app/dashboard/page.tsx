"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import AuthWrapper from "../AuthWrapper";
import Stats from "./components/Stats";
import RecentActivity from "./components/RecentActivity";

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

const defaultStats: Stat[] = [
  { name: "Total Revenue", value: "$0", changeType: "neutral" },
  { name: "New Clients", value: "0", changeType: "neutral" },
  { name: "Active Projects", value: "0", changeType: "neutral" },
  { name: "Profit Margin", value: "0%", changeType: "neutral" },
];

/**
 * Dashboard component
 *
 * Displays the main dashboard page with stats and recent activity.
 * Fetches and manages data for currency, stats, and transactions.
 *
 * @returns {JSX.Element} The rendered Dashboard component
 */
const Dashboard: React.FC = () => {
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [transactions, setTransactions] = useState<DayTransactions[]>([]);
  const [period, setPeriod] = useState<string>("last7days");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(
    async (dataType: string) => {
      setIsLoading(true);
      try {
        let response, data;
        switch (dataType) {
          case "currency":
            response = await fetch("https://ipapi.co/json/");
            data = await response.json();
            setUserCurrency(data.currency);
            break;
          case "stats":
            response = await fetch("/api/stats");
            data = await response.json();
            setStats(data);
            break;
          case "transactions":
            response = await fetch(`/api/transactions?period=${period}`);
            data = await response.json();
            setTransactions(data);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchData("currency");
    fetchData("stats");
    fetchData("transactions");
  }, [fetchData]);

  const handlePeriodChange = useCallback(
    (newPeriod: string) => {
      setPeriod(newPeriod);
      fetchData("transactions");
    },
    [fetchData]
  );

  const memoizedStats = useMemo(
    () => <Stats stats={stats} isLoading={isLoading} />,
    [stats, isLoading]
  );
  const memoizedRecentActivity = useMemo(
    () => <RecentActivity transactions={transactions} isLoading={isLoading} />,
    [transactions, isLoading]
  );

  return (
    <AuthWrapper>
      <main className="mt-5 mx-auto max-w-7xl px-2">
        <div className="relative isolate overflow-hidden">
          <header className="pb-4 pt-6 sm:pb-6">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-gray-900">
                Cashflow
              </h1>
              <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-gray-200 sm:pl-6 sm:leading-7">
                {secondaryNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handlePeriodChange(item.period)}
                    className={
                      period === item.period
                        ? "text-red-600"
                        : "text-gray-700 hover:text-red-600"
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {memoizedStats}

          <div className="space-y-16 py-16 xl:space-y-20">
            <div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none">
                  Recent activity
                </h2>
              </div>
              <div className="mt-6 overflow-hidden border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                    {memoizedRecentActivity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
};

export default React.memo(Dashboard);
