import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-lg font-semibold leading-7 text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm leading-6 text-white/40">{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}
