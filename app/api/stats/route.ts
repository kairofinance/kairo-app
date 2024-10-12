import { NextResponse } from "next/server";
import { query, authenticateUser } from "@/app/lib/db";

interface StatsQueryResult {
  revenue: number;
  overdue_invoices: number;
  outstanding_invoices: number;
  expenses: number;
}

export async function GET(request: Request) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = (await query(
      `SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as revenue,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_invoices,
        SUM(CASE WHEN status = 'outstanding' THEN amount ELSE 0 END) as outstanding_invoices,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE user_address = ?`,
      [user]
    )) as StatsQueryResult[];

    const formattedStats = [
      {
        name: "Revenue",
        value: `$${stats[0].revenue.toFixed(2)}`,
        change: "+5%",
        changeType: "positive",
      },
      {
        name: "Overdue invoices",
        value: `$${stats[0].overdue_invoices.toFixed(2)}`,
        change: "-54.02%",
        changeType: "positive",
      },
      {
        name: "Outstanding invoices",
        value: `$${stats[0].outstanding_invoices.toFixed(2)}`,
        change: "+112%",
        changeType: "positive",
      },
      {
        name: "Expenses",
        value: `$${stats[0].expenses.toFixed(2)}`,
        changeType: "neutral",
      },
    ];

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
