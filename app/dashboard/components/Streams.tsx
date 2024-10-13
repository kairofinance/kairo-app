"use client";
import React, { useEffect, useState, useRef } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";

interface Stream {
  id: string;
  name: string;
  direction: "incoming" | "outgoing";
  address: string;
  token: "USDC" | "DAI" | "USDT";
  amountPerPeriod: number;
  period: "month" | "week" | "day" | "year";
  totalStreamed: number;
  isWithdrawable: boolean;
}

interface StreamsProps {
  userId: string;
  isLoading: boolean;
}

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({
  content,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && tooltipRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceBelow < tooltipHeight + 10 ? "top" : "bottom");
      }
    };

    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <div
        ref={tooltipRef}
        className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md shadow-sm dark:bg-zinc-700 transition-all duration-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        } ${
          position === "top" ? "bottom-full mb-2" : "top-full mt-2"
        } left-1/2 transform -translate-x-1/2`}
      >
        {content}
        <div
          className={`absolute w-2 h-2 bg-zinc-900 dark:bg-zinc-700 transform rotate-45 left-1/2 -translate-x-1/2 ${
            position === "top" ? "bottom-[-4px]" : "top-[-4px]"
          }`}
        ></div>
      </div>
    </div>
  );
};

const Streams: React.FC<StreamsProps> = ({
  userId,
  isLoading: parentIsLoading,
}) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/streams?userId=${encodeURIComponent(
            DOMPurify.sanitize(userId)
          )}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStreams(data);
      } catch (error) {
        console.error("Error fetching streams:", error);
        setError("Failed to fetch streams. Please try again later.");
        setStreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, [userId]);

  const formatAmount = (amount: number, token: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatter.format(amount)} ${DOMPurify.sanitize(token)}`;
  };

  const hasStreams = streams.length > 0;

  if (parentIsLoading || isLoading) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading streams...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-sm text-red-500 dark:text-red-400">
        {error}
      </p>
    );
  }

  if (!hasStreams) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        No streams available
      </p>
    );
  }

  return (
    <div className="">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-white sm:pl-0"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white"
                  >
                    Direction
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white"
                  >
                    Token
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white"
                  >
                    Total Streamed
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-white"
                  >
                    Withdrawable
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {streams.map((stream) => (
                  <tr key={stream.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-white sm:pl-0">
                      {stream.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <Tooltip
                        content={
                          stream.direction === "incoming"
                            ? "Incoming stream"
                            : "Outgoing stream"
                        }
                      >
                        <div className="relative inline-block">
                          {stream.direction === "incoming" ? (
                            <ArrowDownIcon
                              className="h-5 w-5 text-green-500 dark:text-green-400"
                              aria-label="Incoming stream"
                            />
                          ) : (
                            <ArrowUpIcon
                              className="h-5 w-5 text-red-500 dark:text-red-400"
                              aria-label="Outgoing stream"
                            />
                          )}
                        </div>
                      </Tooltip>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {stream.address}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {stream.token}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatAmount(stream.amountPerPeriod, stream.token)} per{" "}
                      {stream.period}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatAmount(stream.totalStreamed, stream.token)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {stream.isWithdrawable ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streams;
