import React from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  action?: React.ReactNode;
  variant?:
    | "minimal"
    | "minimal-dark"
    | "minimal-darker"
    | "minimal-transparent"
    | "minimal-glass";
}

export default function Card({
  title,
  subtitle,
  children,
  className = "",
  headerContent,
  action,
  variant = "minimal",
}: CardProps) {
  const variants = {
    glass: `
      bg-white/[0.02] border-[1px] border-white/10 rounded-none backdrop-blur-md
       [&_h2]:text-white/80 [&_h2]:text-sm
      [&_.header]:border-b [&_.header]:border-white/10 [&_.header]:bg-black/10
      [&_.content]:p-4 hover:border-white/20 transition-colors duration-200
    `,
  };

  return (
    <div className={`${variants["glass"]} ${className}`}>
      <div>
        <div className="header flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">{title}</h2>
            {headerContent && <div>{headerContent}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>

        <div className="content space-y-8">{children}</div>
      </div>
    </div>
  );
}
