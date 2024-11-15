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
  // Transform data into the format Recharts expects
  const chartData = data.labels.map((label, index) => ({
    name: label,
    incoming: data.incoming[index],
    outgoing: data.outgoing[index],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-black/90 border border-white/10 px-3 py-2 backdrop-blur-sm">
          <p className="text-[10px] font-medium text-white/60 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-[11px] font-medium text-white">
                {entry.name}: ${entry.value.toLocaleString()}
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
      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] h-[480px]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-medium text-white/60">Monthly Cashflow</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
            <span className="text-[10px] text-white/60">Incoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500/30" />
            <span className="text-[10px] text-white/60">Outgoing</span>
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
              tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }}
              dx={-10}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={CustomTooltip}
              cursor={{
                fill: "rgba(255, 255, 255, 0.02)",
                radius: 4,
              }}
            />
            <Bar
              dataKey="incoming"
              fill="#10b981" // emerald-500
              stroke="#10b981" // matching stroke
              strokeWidth={0.5}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              fillOpacity={0.15}
            />
            <Bar
              dataKey="outgoing"
              fill="#f97316" // orange-500
              stroke="#f97316" // matching stroke
              strokeWidth={0.5}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              fillOpacity={0.15}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
