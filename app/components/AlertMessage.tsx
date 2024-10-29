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
  const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
  const textColor =
    type === "success" ? "text-green-800" : "text-kairo-green-a20";
  const iconColor =
    type === "success" ? "text-green-400" : "text-kairo-green-a20";

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
      className={`fixed top-16 left-0 right-0 z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={`rounded-md ${bgColor} p-4 max-w-7xl mx-auto`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircleIcon
                className={`h-5 w-5 ${iconColor}`}
                aria-hidden="true"
              />
            ) : (
              <XCircleIcon
                className={`h-5 w-5 ${iconColor}`}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md ${bgColor} p-1.5 ${textColor} hover:bg-${
                  type === "success" ? "green" : "red"
                }-100 focus:outline-none focus:ring-2 focus:ring-${
                  type === "success" ? "green" : "red"
                }-600 focus:ring-offset-2 focus:ring-offset-${
                  type === "success" ? "green" : "red"
                }-50`}
                onClick={() => setIsVisible(false)}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
