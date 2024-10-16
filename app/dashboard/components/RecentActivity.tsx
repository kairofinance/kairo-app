import React from "react";
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";

interface Transaction {
  id: number;
  invoiceNumber: string;
  href: string;
  amount: string;
  status: string;
  client: string;
  description: string;
  icon: "ArrowUpCircleIcon" | "ArrowDownCircleIcon";
}

interface DayTransactions {
  date: string;
  dateTime: string;
  transactions: Transaction[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const statuses = {
  Paid: "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-900/50 dark:ring-green-500/30",
  Withdraw:
    "text-zinc-600 bg-zinc-50 ring-zinc-500/10 dark:text-zinc-400 dark:bg-zinc-800/50 dark:ring-zinc-400/20",
  Overdue:
    "text-red-700 bg-red-50 ring-red-600/10 dark:text-red-400 dark:bg-red-900/50 dark:ring-red-500/30",
};

/**
 * RecentActivity component
 *
 * Displays a table of recent transactions grouped by day.
 *
 * @param {Object} props - Component props
 * @param {DayTransactions[]} props.transactions - Array of transactions grouped by day
 * @param {boolean} props.isLoading - Loading state of the component
 * @returns {React.ReactElement} Rendered RecentActivity component
 */
const RecentActivity: React.FC<{
  transactions: DayTransactions[];
  isLoading: boolean;
}> = React.memo(({ transactions, isLoading }) => {
  return (
    <table className="w-full text-left">
      <thead className="sr-only">
        <tr>
          <th>Amount</th>
          <th className="hidden sm:table-cell">Client</th>
          <th>More details</th>
        </tr>
      </thead>
      <tbody
        className={`transition-opacity duration-300 ease-in-out ${
          isLoading ? "opacity-50" : "opacity-100"
        }`}
      >
        {transactions.length === 0 ? (
          <tr>
            <td
              colSpan={3}
              className="py-4 text-center text-zinc-500 dark:text-zinc-400"
            >
              No transactions available
            </td>
          </tr>
        ) : (
          transactions.map((day) => (
            <React.Fragment key={day.dateTime}>
              <tr className="text-sm leading-6 text-zinc-900 dark:text-white">
                <th
                  scope="colgroup"
                  colSpan={3}
                  className="relative isolate pt-8 pb-4 font-semibold"
                >
                  <time dateTime={DOMPurify.sanitize(day.dateTime)}>
                    {DOMPurify.sanitize(day.date)}
                  </time>
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-zinc-200 dark:border-zinc-700" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-zinc-200 dark:border-zinc-700" />
                </th>
              </tr>
              {day.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="relative py-5 pr-6">
                    <div className="flex gap-x-6">
                      {transaction.icon === "ArrowUpCircleIcon" ? (
                        <ArrowUpCircleIcon
                          className="hidden h-6 w-5 flex-none text-zinc-400 dark:text-zinc-500 sm:block"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArrowDownCircleIcon
                          className="hidden h-6 w-5 flex-none text-zinc-400 dark:text-zinc-500 sm:block"
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex-auto">
                        <div className="flex items-start gap-x-3">
                          <div className="text-sm font-medium leading-6 text-zinc-900 dark:text-white">
                            {DOMPurify.sanitize(transaction.amount)}
                          </div>
                          <div
                            className={classNames(
                              statuses[
                                transaction.status as keyof typeof statuses
                              ],
                              "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                            )}
                          >
                            {DOMPurify.sanitize(transaction.status)}
                          </div>
                        </div>
                        {transaction.client && (
                          <div className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            {DOMPurify.sanitize(transaction.client)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-full h-px w-screen bg-zinc-100 dark:bg-zinc-700" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-zinc-100 dark:bg-zinc-700" />
                  </td>
                  <td className="hidden py-5 pr-6 sm:table-cell">
                    <div className="text-sm leading-6 text-zinc-900 dark:text-white">
                      {DOMPurify.sanitize(transaction.client)}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {DOMPurify.sanitize(transaction.description)}
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex justify-end">
                      <a
                        href={DOMPurify.sanitize(transaction.href)}
                        className="text-sm font-medium leading-6 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                      >
                        View
                        <span className="hidden sm:inline"> transaction</span>
                        <span className="sr-only">
                          , invoice #
                          {DOMPurify.sanitize(transaction.invoiceNumber)},{" "}
                          {DOMPurify.sanitize(transaction.client)}
                        </span>
                      </a>
                    </div>
                    <div className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      Invoice{" "}
                      <span className="text-zinc-900 dark:text-white">
                        #{DOMPurify.sanitize(transaction.invoiceNumber)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))
        )}
      </tbody>
    </table>
  );
});

RecentActivity.displayName = "RecentActivity";

export default RecentActivity;
