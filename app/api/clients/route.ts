import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Client {
  id: string;
  name: string;
  imageUrl: string;
  invoices: Array<{
    date: Date;
    amount: number;
    status: string;
  }>;
}

const placeholderClients = [
  {
    id: 1,
    name: "Acme Inc.",
    imageUrl: "https://tailwindui.com/img/logos/48x48/tuple.svg",
    lastInvoice: {
      date: "December 13, 2023",
      dateTime: "2023-12-13",
      amount: "$2,000.00",
      status: "Paid",
    },
  },
  {
    id: 2,
    name: "Globex Corporation",
    imageUrl: "https://tailwindui.com/img/logos/48x48/savvycal.svg",
    lastInvoice: {
      date: "January 22, 2024",
      dateTime: "2024-01-22",
      amount: "$1,500.00",
      status: "Overdue",
    },
  },
  {
    id: 3,
    name: "Soylent Corp",
    imageUrl: "https://tailwindui.com/img/logos/48x48/reform.svg",
    lastInvoice: {
      date: "February 15, 2024",
      dateTime: "2024-02-15",
      amount: "$3,200.00",
      status: "Paid",
    },
  },
];

export async function GET(request: Request) {
  if (process.env.USE_PLACEHOLDER_DATA === "true") {
    return NextResponse.json(placeholderClients);
  }

  try {
    console.log("Fetching clients from database");
    const clients = await db.client.findMany({
      include: {
        invoices: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    console.log("Fetched clients:", clients);

    const formattedClients = clients.map((client: Client) => ({
      id: client.id,
      name: client.name,
      imageUrl: client.imageUrl,
      lastInvoice: client.invoices[0]
        ? {
            date: client.invoices[0].date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            dateTime: client.invoices[0].date.toISOString().split("T")[0],
            amount: `$${client.invoices[0].amount.toFixed(2)}`,
            status: client.invoices[0].status,
          }
        : null,
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
