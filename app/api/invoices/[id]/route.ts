import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

// Create a single PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const userAddress = request.headers.get("x-user-address");

    if (!userAddress) {
      return NextResponse.json(
        { error: "Wallet not connected" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const headers = getCacheHeaders({
      maxAge: 300,
      staleWhileRevalidate: 60,
      mustRevalidate: true,
    });

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
      return NextResponse.json(
        { error: "Invoice not found" },
        {
          status: 404,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Strict address comparison after converting to lowercase
    const isAuthorized =
      userAddress.toLowerCase() === invoice.issuerAddress.toLowerCase() ||
      userAddress.toLowerCase() === invoice.clientAddress.toLowerCase();

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "You must be either the invoice issuer or recipient to view this invoice",
        },
        { status: 403 }
      );
    }

    // Format the response
    const formattedInvoice = {
      ...invoice,
      paidDate:
        invoice.paid && invoice.payments[0]
          ? invoice.payments[0].createdAt.toISOString()
          : null,
    };

    return NextResponse.json(formattedInvoice, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
