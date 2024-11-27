"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { useIsClient } from "@/hooks/useIsClient";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, ...props },
    ref
  ) => {
    const isClient = useIsClient();

    if (!isClient) {
      return null;
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-kairo-white mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "block w-full rounded-lg border-0 bg-kairo-black-a20 bg-opacity-60",
              "text-kairo-white shadow-sm placeholder:text-zinc-400",
              "focus:ring-2 focus:ring-inset focus:ring-orange-600",
              "sm:text-sm sm:leading-6",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "ring-2 ring-red-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
