import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

interface Transaction {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  description: string;
  date: Date;
  client: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
}

interface GroupedTransaction {
  date: string;
  dateTime: string;
  transactions: Array<{
    id: string;
    invoiceNumber: string;
    href: string;
    amount: string;
    status: string;
    client: string;
    description: string;
    icon: string;
  }>;
}

interface GroupedTransactions {
  [date: string]: GroupedTransaction;
}

/**
 * Handles GET requests for transactions.
 * Groups transactions by date and returns them in a structured format.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with grouped transactions or error
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "last7days";

  // Determine the date filter based on the requested period
  const dateFilter = getDateFilter(period);

  try {
    // Fetch transactions from the database
    const transactions: Transaction[] = await db.transaction.findMany({
      where: {
        date: dateFilter,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group transactions by date
    const groupedTransactions = groupTransactionsByDate(transactions);

    return NextResponse.json(Object.values(groupedTransactions));
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Determines the date filter based on the requested period.
 *
 * @param {string} period - The requested period (e.g., "last7days", "last30days", "alltime")
 * @returns {object} The date filter object for the database query
 */
function getDateFilter(period: string): object {
  switch (period) {
    case "last30days":
      return { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    case "alltime":
      return {}; // No date filter
    default: // last7days
      return { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  }
}

/**
 * Groups transactions by date.
 *
 * @param {Transaction[]} transactions - The array of transactions to group
 * @returns {GroupedTransactions} The transactions grouped by date
 */
function groupTransactionsByDate(
  transactions: Transaction[]
): GroupedTransactions {
  return transactions.reduce<GroupedTransactions>((acc, transaction) => {
    const date = transaction.date.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        date: transaction.date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        dateTime: date,
        transactions: [],
      };
    }
    acc[date].transactions.push({
      id: transaction.id,
      invoiceNumber: transaction.invoiceNumber,
      href: `#`,
      amount: `${transaction.amount.toFixed(2)} USDC`,
      status: transaction.status,
      client: transaction.client.name,
      description: transaction.description,
      icon:
        transaction.amount > 0 ? "ArrowUpCircleIcon" : "ArrowDownCircleIcon",
    });
    return acc;
  }, {});
}
