import { motion } from "framer-motion";
import { format, eachDayOfInterval, subDays, isSameDay } from "date-fns";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef } from "react";

type ActivityType = "payment" | "stream" | "invoice";

interface Activity {
  date: Date;
  type: ActivityType;
  amount: string;
  description: string;
}

interface TokenBalanceGraphProps {
  data?: Activity[];
  days?: number;
}

const activityTypeConfig = {
  payment: {
    icon: CheckCircleIcon,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    label: "Payment",
  },
  stream: {
    icon: ArrowPathIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    label: "Stream",
  },
  invoice: {
    icon: DocumentTextIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Invoice",
  },
};

export default function TokenBalanceGraph({
  data,
  days = 7,
}: TokenBalanceGraphProps) {
  const dates = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  });

  // Generate sample data if none provided
  const sampleData: Activity[] =
    data ||
    dates.flatMap((date) => {
      const numActivities = Math.floor(Math.random() * 2) + 1;
      return Array.from({ length: numActivities }, () => ({
        date,
        type: ["payment", "stream", "invoice"][
          Math.floor(Math.random() * 3)
        ] as ActivityType,
        amount: `$${(Math.random() * 1000).toFixed(2)}`,
        description: [
          "Payment received",
          "Stream started",
          "Invoice created",
          "Payment sent",
          "Stream ended",
          "Invoice paid",
        ][Math.floor(Math.random() * 6)],
      }));
    });

  const [scrollPercentage, setScrollPercentage] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercent =
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setScrollPercentage(scrollPercent);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] h-[275px] overflow-hidden relative"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/60">Recent Activity</h3>
        <div className="flex items-center gap-2">
          {Object.entries(activityTypeConfig).map(([type, config]) => (
            <div
              key={type}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.02]"
              title={config.label}
            >
              <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className={`text-xs ${config.color}`}>
                {sampleData.filter((a) => a.type === type).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Scrollbar Container */}
      <div className="relative h-[calc(100%-2rem)]">
        {/* Scrollbar Track */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-[50%] bg-white/[0.03] rounded-full">
          {/* Scrollbar Thumb */}
          <div
            className="absolute w-full bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-full"
            style={{
              top: `${scrollPercentage}%`,
              height: "20%",
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Content Container */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="space-y-2.5 h-full overflow-y-auto pr-6 scrollbar-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 85%, transparent 100%)",
          }}
        >
          {dates
            .map((date) => {
              const dayActivities = sampleData.filter((activity) =>
                isSameDay(activity.date, date)
              );

              if (dayActivities.length === 0) return null;

              return (
                <div key={date.toISOString()} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs font-medium text-white/40">
                      {format(date, "MMM dd")}
                    </div>
                    <div className="h-[1px] flex-grow bg-white/[0.03]" />
                  </div>
                  <div className="space-y-1.5">
                    {dayActivities.map((activity, idx) => {
                      const config = activityTypeConfig[activity.type];
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`
                          flex items-center gap-2.5 p-2 rounded-lg
                          ${config.bgColor} border ${config.borderColor}
                          cursor-pointer group hover:bg-white/[0.05]
                          transition-all duration-200
                        `}
                        >
                          <config.icon
                            className={`w-4 h-4 ${config.color} shrink-0`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-white/80 truncate">
                              {activity.description}
                            </div>
                            <div className={`text-xs ${config.color}`}>
                              {activity.amount}
                            </div>
                          </div>
                          <div className="text-xs text-white/40">
                            {format(activity.date, "HH:mm")}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      </div>
    </motion.div>
  );
}
