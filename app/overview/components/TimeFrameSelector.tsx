import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

interface TimeFrameOption {
  label: string;
  value: string;
}

interface TimeFrameSelectorProps {
  selectedTimeFrame: string;
  onTimeFrameChange: (timeFrame: string) => void;
}

const timeFrameOptions: TimeFrameOption[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year", value: "year" },
  { label: "All time", value: "all" },
];

export default function TimeFrameSelector({
  selectedTimeFrame,
  onTimeFrameChange,
}: TimeFrameSelectorProps) {
  const selectedOption = timeFrameOptions.find(
    (option) => option.value === selectedTimeFrame
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex justify-end">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
          <CalendarIcon className="w-4 h-4" />
          {selectedOption?.label}
          <ChevronDownIcon className="w-4 h-4" />
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
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-black/80 backdrop-blur-sm border border-white/[0.08] shadow-lg focus:outline-none">
            <div className="p-1">
              {timeFrameOptions.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onTimeFrameChange(option.value)}
                      className={cn(
                        "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors duration-200",
                        active || selectedTimeFrame === option.value
                          ? "bg-white/[0.08] text-white"
                          : "text-white/60"
                      )}
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
  );
}
