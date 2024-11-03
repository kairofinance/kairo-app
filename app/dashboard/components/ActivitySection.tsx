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
              <h2 className="text-base font-semibold leading-6 text-white lg:mx-0 lg:max-w-none">
                {dictionary.dashboard.recentActivity.title}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {dictionary.dashboard.recentActivity.description}
              </p>
            </div>

            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10">
                <FunnelIcon className="w-4 h-4 text-white/60 mr-2" />
                <span>
                  {
                    filterOptions.find((option) => option.value === filter)
                      ?.label
                  }
                </span>
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute z-50 right-0 mt-2 w-48 origin-top-right rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 shadow-2xl">
                  <div className="px-1 py-1">
                    {filterOptions.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            className={`
                              ${active ? "bg-white/10" : ""}
                              ${
                                filter === option.value
                                  ? "text-orange-600"
                                  : "text-white"
                              }
                              group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all duration-200
                            `}
                            onClick={() => setFilter(option.value)}
                          >
                            {option.label}
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
