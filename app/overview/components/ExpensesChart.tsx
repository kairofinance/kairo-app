import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

interface ExpensesChartProps {
  data: {
    labels: string[];
    incoming: number[];
    outgoing: number[];
  };
}

export default function ExpensesChart({ data }: ExpensesChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    incoming: data.incoming[index],
    outgoing: data.outgoing[index],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs font-jetbrains text-white/40 mb-1">
            <span className="text-white/40">&gt;</span> {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <span className="text-xs font-jetbrains text-white/40">#</span>
              <p className="text-sm font-jetbrains text-white">
                {entry.name}: {entry.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-7 h-[390px]"
    >
      <div className="flex items-center gap-8 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500" />
            <span className="text-sm font-jetbrains text-white/60">
              incoming
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500" />
            <span className="text-sm font-jetbrains text-white/60">
              outgoing
            </span>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-40px)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid
              strokeDasharray="4"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.03)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255, 255, 255, 0.4)",
                fontSize: 12,
                fontFamily: "JetBrains Mono",
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255, 255, 255, 0.4)",
                fontSize: 12,
                fontFamily: "JetBrains Mono",
              }}
              dx={-10}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip
              content={CustomTooltip}
              cursor={{
                fill: "rgba(255, 255, 255, 0.02)",
              }}
            />
            <Bar
              dataKey="incoming"
              fill="#22c55e"
              stroke="#22c55e"
              strokeWidth={0.5}
              maxBarSize={32}
              fillOpacity={0.2}
            />
            <Bar
              dataKey="outgoing"
              fill="#ef4444"
              stroke="#ef4444"
              strokeWidth={0.5}
              maxBarSize={32}
              fillOpacity={0.2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
