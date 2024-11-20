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

  return (
    <div className="relative backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-4">
      <div className="space-y-4">
        {/* Command Line Header */}

        {/* Activity List */}
        <div className="pl-4 space-y-4">
          {dates.map((date) => {
            const dayActivities = sampleData.filter((activity) =>
              isSameDay(activity.date, date)
            );

            if (dayActivities.length === 0) return null;

            return (
              <div key={date.toISOString()} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center gap-2">
                  <span className="text-white/40 font-jetbrains text-sm">
                    $
                  </span>
                  <span className="text-sm font-jetbrains text-white/60">
                    {format(date, "MMM dd")}
                  </span>
                </div>

                {/* Activities */}
                <div className="pl-4 space-y-2">
                  {dayActivities.map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-2 bg-white/[0.02] hover:bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 font-jetbrains text-sm">
                            {format(activity.date, "HH:mm")}
                          </span>
                          {activity.type === "payment" && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          )}
                          {activity.type === "stream" && (
                            <ArrowPathIcon className="w-4 h-4 text-orange-500" />
                          )}
                          {activity.type === "invoice" && (
                            <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <span className="text-sm font-jetbrains text-white/80">
                          {activity.description}
                        </span>
                      </div>
                      <span className="text-sm font-jetbrains text-white/60">
                        {activity.amount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Line */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
          <span className="text-white/40 font-jetbrains text-sm">$</span>
          <span className="text-sm font-jetbrains text-white/60">status:</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-jetbrains text-white/40">synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
