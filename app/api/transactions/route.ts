import { NextResponse } from "next/server";
import { query, authenticateUser } from "@/app/lib/db";

export async function GET(request: Request) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "last7days";

  let dateFilter;
  switch (period) {
    case "last30days":
      dateFilter =
        "DATE(transaction_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      break;
    case "alltime":
      dateFilter = "1=1"; // No date filter
      break;
    default: // last7days
      dateFilter =
        "DATE(transaction_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  }

  try {
    const transactions = await query(
      `SELECT 
        id, invoice_number, amount, status, client_name, description, transaction_date
      FROM transactions
      WHERE user_address = ? AND ${dateFilter}
      ORDER BY transaction_date DESC`,
      [user]
    );

    const groupedTransactions = transactions.reduce(
      (acc: any, transaction: any) => {
        const date = new Date(transaction.transaction_date)
          .toISOString()
          .split("T")[0];
        if (!acc[date]) {
          acc[date] = {
            date: new Date(date).toLocaleDateString("en-US", {
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
          invoiceNumber: transaction.invoice_number,
          href: `#`,
          amount: `${transaction.amount.toFixed(2)} USDC`,
          status: transaction.status,
          client: transaction.client_name,
          description: transaction.description,
          icon: "ArrowUpCircleIcon", // You might want to determine this based on the transaction type
        });
        return acc;
      },
      {}
    );

    return NextResponse.json(Object.values(groupedTransactions));
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
