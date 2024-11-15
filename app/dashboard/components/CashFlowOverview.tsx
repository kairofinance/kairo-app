import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface CashFlowProps {
  incoming: {
    total: string;
    change: number;
  };
  outgoing: {
    total: string;
    change: number;
  };
}

export default function CashFlowOverview({
  incoming,
  outgoing,
}: CashFlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] h-[180px]"
    >
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <ArrowDownIcon className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-white/60">Incoming</h3>
        </div>
        <div className="space-y-3">
          <p className="text-3xl font-semibold text-white">{incoming.total}</p>
          <div className="flex items-center gap-1 text-sm">
            <span
              className={
                incoming.change >= 0 ? "text-green-500" : "text-red-500"
              }
            >
              {incoming.change > 0 ? "+" : ""}
              {incoming.change}%
            </span>
            <span className="text-white/40 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      <div className="w-px bg-white/[0.08]" />

      <div className="flex-1 pl-4">
        <div className="flex items-center justify-end gap-2 mb-3">
          <h3 className="text-sm font-medium text-white/60">Outgoing</h3>
          <div className="p-2 rounded-lg bg-orange-500/10">
            <ArrowUpIcon className="w-5 h-5 text-orange-500" />
          </div>
        </div>
        <div className="space-y-3 text-right">
          <p className="text-3xl font-semibold text-white">{outgoing.total}</p>
          <div className="flex items-center justify-end gap-1 text-sm">
            <span
              className={
                outgoing.change >= 0 ? "text-green-500" : "text-red-500"
              }
            >
              {outgoing.change > 0 ? "+" : ""}
              {outgoing.change}%
            </span>
            <span className="text-white/40 ml-1">vs last period</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
