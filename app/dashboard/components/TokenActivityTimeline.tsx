import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function TokenActivityTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-full overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-xl" />

      <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
        <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <SparklesIcon className="w-6 h-6 text-orange-500/60" />
        </div>

        <h3 className="text-lg font-medium text-white/80 mb-2">Coming Soon</h3>

        <p className="text-sm text-white/40 max-w-[280px] mb-6">
          We&apos;re building something special here. Have an idea for what
          should go in this space?
        </p>

        <a
          href="https://twitter.com/kairofinance"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-white/[0.02] hover:bg-white/[0.05] 
            border border-white/[0.05] hover:border-white/[0.1]
            transition-all duration-200 group"
        >
          <span className="text-sm text-white/60 group-hover:text-white/80">
            Follow Kairo
          </span>
          <svg
            className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </motion.div>
  );
}
