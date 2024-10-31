import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Get the ID from the URL instead of params
  const id = request.url.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Invoice ID is required" },
      { status: 400 }
    );
  }

  const headers = getCacheHeaders({
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60,
    mustRevalidate: true,
  });

  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        invoiceId: id,
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
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const formattedInvoice = {
      ...invoice,
      paidDate: invoice.paid
        ? invoice.payments[0]?.createdAt.toISOString()
        : null,
    };

    return NextResponse.json(
      { invoice: formattedInvoice },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
