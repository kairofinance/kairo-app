import { motion } from "framer-motion";
import { format, eachDayOfInterval, subDays, isSameDay } from "date-fns";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Activity {
  date: Date;
  type: "payment" | "stream" | "invoice";
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
        ] as Activity["type"],
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
    <div className="grid grid-cols-1 gap-6 outline-1 bg-white/[0.02] outline outline-white/[0.2] p-7 relative m-7">
      <h2 className="text-lg absolute z-20 -top-4 font-jetbrains left-6 px-2 backdrop-blur-2xl font-garet font-extrabold text-white">
        Activity
      </h2>
      <div className="space-y-6">
        {dates.map((date) => {
          const dayActivities = sampleData.filter((activity) =>
            isSameDay(activity.date, date)
          );

          if (dayActivities.length === 0) return null;

          return (
            <div key={date.toISOString()}>
              {/* Date Header */}
              <div className="mb-3">
                <span className="text-sm font-semibold text-white/40">
                  {format(date, "MMMM d, yyyy")}
                </span>
              </div>

              {/* Activities */}
              <div className="space-y-2">
                {dayActivities.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-jetbrains text-sm text-white/40">
                          {format(activity.date, "HH:mm")}
                        </span>
                        {activity.type === "payment" && (
                          <CheckCircleIcon className="w-4 h-4 text-[#22c55e]" />
                        )}
                        {activity.type === "stream" && (
                          <ArrowPathIcon className="w-4 h-4 text-orange-500" />
                        )}
                        {activity.type === "invoice" && (
                          <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <span className="text-sm text-white font-semibold">
                        {activity.description}
                      </span>
                    </div>
                    <span className="font-jetbrains text-sm text-white">
                      {activity.amount}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
