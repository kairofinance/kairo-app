import { Tab } from "@headlessui/react";
import { cn } from "@/utils/cn";

interface DashboardTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const tabs = [
  { name: "Overview", id: "overview" },
  { name: "Analytics", id: "analytics" },
  { name: "Settings", id: "settings" },
];

export default function DashboardTabs({
  activeTab,
  onTabChange,
}: DashboardTabsProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tab.Group selectedIndex={activeTab} onChange={onTabChange}>
        <Tab.List className="flex space-x-2 rounded-xl bg-white/[0.02] p-1 border border-white/[0.08]">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                cn(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white/60 ring-offset-2 ring-offset-transparent focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white/[0.08] text-white shadow"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
}
