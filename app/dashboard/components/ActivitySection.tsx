import React, { useState } from "react";
import RecentActivity from "./RecentActivity";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

interface ActivitySectionProps {
  dictionary: any;
  groupedInvoices: any[];
  isLoading: boolean;
  userAddress: string;
  userProfiles: { [key: string]: any };
}

interface MenuItemProps {
  active: boolean;
}

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Sent", value: "sent" },
  { label: "Unpaid", value: "received" },
];

export default function ActivitySection({
  dictionary,
  groupedInvoices,
  isLoading,
  userAddress,
  userProfiles,
}: ActivitySectionProps) {
  const [filter, setFilter] = useState<string>("all");

  return (
    <div className="space-y-16 py-16 xl:space-y-20">
      <div>
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold leading-6 text-kairo-white lg:mx-0 lg:max-w-none">
                {dictionary.dashboard.recentActivity.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                {dictionary.dashboard.recentActivity.description}
              </p>
            </div>

            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="px-4 py-2 cursor-pointer bg-kairo-black-a20/60 rounded-lg flex items-center gap-2 text-kairo-white font-medium hover:bg-kairo-black-a20/80 transition-colors duration-200 border border-zinc-800/50 hover:border-zinc-700/50">
                <FunnelIcon className="w-4 h-4 text-kairo-white/70" />
                <span className="text-sm">
                  {
                    filterOptions.find((option) => option.value === filter)
                      ?.label
                  }
                </span>
                <ChevronDownIcon className="w-4 h-4 text-kairo-white/70" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute z-50 right-0 mt-1 w-32 origin-top-right rounded-lg text-kairo-white bg-kairo-black-a20/95 backdrop-blur-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-zinc-800/50">
                  <div className="py-1">
                    {filterOptions.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }: MenuItemProps) => (
                          <button
                            className={`
                              relative w-full text-left px-3 py-1.5 text-sm transition-all duration-200
                              ${
                                active
                                  ? "text-kairo-white"
                                  : "text-kairo-white/90"
                              }
                              ${
                                filter === option.value
                                  ? "bg-kairo-black-a20/40"
                                  : ""
                              }
                              group hover:pl-5
                            `}
                            onClick={() => setFilter(option.value)}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <span
                                className={`
                                absolute left-0 w-0 h-full bg-kairo-green/10 top-0
                                transition-all duration-200 -z-10
                                ${active ? "w-full" : "w-0"}
                              `}
                              />
                              {option.label}
                              {filter === option.value && (
                                <span className="ml-auto text-kairo-green">
                                  •
                                </span>
                              )}
                            </span>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
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
