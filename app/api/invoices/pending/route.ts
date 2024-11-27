import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 60,
    staleWhileRevalidate: 30,
  });

  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const type = searchParams.get("type");
  const teamId = searchParams.get("teamId");

  if (!address) {
    return NextResponse.json(
      { error: "Address is required" },
      {
        status: 400,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // Build the where clause based on type and team context
    const whereClause: any = {
      paid: false,
      ...(type === "incoming"
        ? { clientAddress: address.toLowerCase() }
        : { issuerAddress: address.toLowerCase() }),
    };

    // Add team filter if teamId is provided
    if (teamId) {
      whereClause.teamId = teamId;
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        payments: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedInvoices = invoices.map((invoice) => ({
      ...invoice,
      paidDate:
        invoice.paid && invoice.payments[0]
          ? invoice.payments[0].createdAt.toISOString()
          : null,
      status: invoice.paid ? "Paid" : "Created",
    }));

    return NextResponse.json(
      { invoices: formattedInvoices },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pending invoices:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch invoices",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
