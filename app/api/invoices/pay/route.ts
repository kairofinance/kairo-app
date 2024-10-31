import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const headers = getCacheHeaders({
    public: false,
    maxAge: 0,
    mustRevalidate: true,
  });

  try {
    const { invoiceId, paymentTransactionHash } = await request.json();

    console.log("Received payment update request:", {
      invoiceId,
      paymentTransactionHash,
    });

    if (!invoiceId || !paymentTransactionHash) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Update the invoice in the database
    const updatedInvoice = await prisma.invoice.update({
      where: { invoiceId },
      data: {
        paid: true,
        paymentTransactionHash,
      },
    });

    // Create a new payment record
    const payment = await prisma.payment.create({
      data: {
        transactionHash: paymentTransactionHash,
        invoice: { connect: { id: updatedInvoice.id } },
      },
    });

    const formattedInvoice = {
      ...updatedInvoice,
      paidDate: payment.createdAt.toISOString(),
    };

    console.log("Updated invoice in database:", formattedInvoice);

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
    console.error("Error updating invoice payment:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
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
