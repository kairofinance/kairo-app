import { NextResponse } from "next/server";
import { query, authenticateUser } from "@/app/lib/db";

interface ClientQueryResult {
  id: number;
  name: string;
  image_url: string;
  last_invoice_date: string | null;
  last_invoice_amount: number | null;
  last_invoice_status: string | null;
}

export async function GET(request: Request) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = (await query(
      `SELECT 
        c.id, c.name, c.image_url,
        t.amount as last_invoice_amount, t.status as last_invoice_status, t.transaction_date as last_invoice_date
      FROM clients c
      LEFT JOIN (
        SELECT client_id, amount, status, transaction_date,
          ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY transaction_date DESC) as rn
        FROM transactions
        WHERE user_address = ? AND type = 'invoice'
      ) t ON c.id = t.client_id AND t.rn = 1
      WHERE c.user_address = ?
      ORDER BY t.transaction_date DESC
      LIMIT 10`,
      [user, user]
    )) as ClientQueryResult[];

    const formattedClients = clients.map((client) => ({
      id: client.id,
      name: client.name,
      imageUrl: client.image_url,
      lastInvoice: client.last_invoice_date
        ? {
            date: new Date(client.last_invoice_date).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            ),
            dateTime: new Date(client.last_invoice_date)
              .toISOString()
              .split("T")[0],
            amount: `$${client.last_invoice_amount?.toFixed(2)}`,
            status: client.last_invoice_status,
          }
        : null,
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
