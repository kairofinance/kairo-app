import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "default", size = "default", ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90",
      outline:
        "border border-gray-200 bg-white hover:bg-gray-100 dark:border-gray-800 dark:bg-black dark:hover:bg-gray-800",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-sm",
      lg: "h-10 rounded-md px-8",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button className={combinedClassName} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
