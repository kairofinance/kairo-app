import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

interface AlertMessageProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  type,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out animation before dismissing
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className={`rounded-lg shadow-lg backdrop-blur-sm ${
          type === "success"
            ? "bg-orange-600/10 text-orange-600"
            : "bg-red-500/10 text-red-400"
        } p-4 flex items-center gap-3 min-w-[320px]`}
      >
        <div className="flex-shrink-0">
          {type === "success" ? (
            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <XCircleIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          type="button"
          className={`flex-shrink-0 rounded-md p-1.5 transition-colors duration-200 ${
            type === "success"
              ? "hover:bg-orange-600/20"
              : "hover:bg-red-500/20"
          }`}
          onClick={() => setIsVisible(false)}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default AlertMessage;
