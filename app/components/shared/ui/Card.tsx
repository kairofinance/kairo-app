"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useIsClient } from "@/hooks/useIsClient";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  className,
  padding = "md",
}: CardProps) {
  const isClient = useIsClient();

  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-kairo-black-a20 bg-opacity-30 rounded-lg shadow-lg",
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
