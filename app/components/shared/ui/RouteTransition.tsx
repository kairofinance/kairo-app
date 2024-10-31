"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

export default function RouteTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-kairo-green/50 transition-all duration-500",
        isTransitioning ? "opacity-100" : "opacity-0"
      )}
      style={{
        width: isTransitioning ? "100%" : "0%",
      }}
    />
  );
}
