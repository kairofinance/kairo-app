import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { rateLimit } from "../middleware/rateLimit";

const prisma = new PrismaClient();

// This is a mock function. Use only when USE_PLACEHOLDER_DATA is true.
const getMockTransactions = (period: string) => {
  return [
    {
      date: "Today",
      dateTime: "2023-03-22",
      transactions: [
        {
          id: 1,
          invoiceNumber: "INV-001",
          href: "#",
          amount: "$10,000",
          status: "Paid",
          client: "Tuple Technologies",
          description: "Invoice payment",
          icon: "ArrowUpCircleIcon",
        },
        {
          id: 2,
          invoiceNumber: "INV-002",
          href: "#",
          amount: "$5,000",
          status: "Withdraw",
          client: "SavvyCal",
          description: "Withdrawal to bank account",
          icon: "ArrowDownCircleIcon",
        },
      ],
    },
    {
      date: "Yesterday",
      dateTime: "2023-03-21",
      transactions: [
        {
          id: 3,
          invoiceNumber: "INV-003",
          href: "#",
          amount: "$7,500",
          status: "Paid",
          client: "Reform",
          description: "Invoice payment",
          icon: "ArrowUpCircleIcon",
        },
      ],
    },
  ];
};

// Function to get actual transactions from the database
const getActualTransactions = async (period: string) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        // Add conditions based on the period
        // This is a placeholder and should be adjusted based on your actual data model
        date: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: {
        date: "desc",
      },
      include: {
        client: true,
      },
    });

    // Group transactions by date
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, any[]>);

    // Format the data to match the expected structure
    return Object.entries(groupedTransactions).map(([date, transactions]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      dateTime: date,
      transactions: transactions.map((t) => ({
        id: t.id,
        invoiceNumber: t.invoiceNumber,
        href: `#`,
        amount: `$${t.amount.toFixed(2)}`,
        status: t.status,
        client: t.client.name,
        description: t.description,
        icon: t.amount > 0 ? "ArrowUpCircleIcon" : "ArrowDownCircleIcon",
      })),
    }));
  } catch (error) {
    console.error("Error fetching transactions from database:", error);
    throw error;
  }
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    let url;
    try {
      url = new URL(request.url);
    } catch (error) {
      console.error("Failed to parse URL:", request.url, error);
      return NextResponse.json(
        { error: "Invalid URL", details: "Failed to parse request URL" },
        { status: 400 }
      );
    }

    const period = url.searchParams.get("period") || "last7days";

    const usePlaceholderData = process.env.USE_PLACEHOLDER_DATA === "true";

    let transactions;
    if (usePlaceholderData) {
      transactions = getMockTransactions(period);
    } else {
      transactions = await getActualTransactions(period);
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
