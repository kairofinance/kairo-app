import React, { useState } from "react";
import RecentActivity from "./RecentActivity";

interface ActivitySectionProps {
  dictionary: any;
  groupedInvoices: any[];
  isLoading: boolean;
  userAddress: string;
  userProfiles: { [key: string]: any };
}

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Sent", value: "sent" },
  { label: "Received", value: "received" },
];

export default function ActivitySection({
  dictionary,
  groupedInvoices,
  isLoading,
  userAddress,
  userProfiles,
}: ActivitySectionProps) {
  const [filter, setFilter] = useState<string>("all");

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  return (
    <div className="space-y-16 py-16 xl:space-y-20">
      <div>
        <div className="mx-auto max-w-7xl">
          <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-kairo-white lg:mx-0 lg:max-w-none">
            {dictionary.dashboard.recentActivity.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            {dictionary.dashboard.recentActivity.description}
          </p>
        </div>
        <div className="flex justify-end mb-4">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-zinc-700 bg-kairo-black-a20 text-kairo-white rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-kairo-green focus:border-kairo-green"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <RecentActivity
          invoices={groupedInvoices}
          isLoading={isLoading}
          userAddress={userAddress}
          userProfiles={userProfiles}
          filter={filter}
        />
      </div>
    </div>
  );
}
