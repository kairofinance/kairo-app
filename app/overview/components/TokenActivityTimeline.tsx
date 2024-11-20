import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function TokenActivityTimeline() {
  return (
    <div className="relative outline-2 outline outline-white/[0.2] p-7">
      <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
        activity
      </h2>

      <div className="space-y-4">
        {/* Command Line Header */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-jetbrains text-sm">$</span>
          <span className="text-sm font-jetbrains text-white/60">
            get recent_activity --limit=10
          </span>
        </div>

        {/* Coming Soon Message */}
        <div className="pl-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-jetbrains text-sm">$</span>
            <span className="text-sm font-jetbrains text-orange-500">
              feature_coming_soon
            </span>
          </div>

          <div className="pl-4 space-y-2">
            <span className="text-sm font-jetbrains text-white/60">
              We&apos;re building something special here.
            </span>
            <span className="text-sm font-jetbrains text-white/40">
              Have an idea for what should go in this space?
            </span>
          </div>

          {/* Twitter Link */}
          <div className="flex items-center gap-2 pt-4">
            <span className="text-white/40 font-jetbrains text-sm">$</span>
            <a
              href="https://twitter.com/kairofinance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-jetbrains text-white/60 hover:text-white/80 transition-colors duration-200"
            >
              follow_kairo --platform=twitter
            </a>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.08]">
          <span className="text-white/40 font-jetbrains text-sm">$</span>
          <span className="text-sm font-jetbrains text-white/60">status:</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-jetbrains text-white/40">
              in_development
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
