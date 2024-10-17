import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter" },
      { status: 400 }
    );
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { issuer: { address: address.toLowerCase() } },
          { client: { address: address.toLowerCase() } },
        ],
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      issuerAddress,
      clientAddress,
      tokenAddress,
      amount,
      dueDate,
      invoiceHash,
      status,
    } = await request.json();

    console.log("Received data:", {
      issuerAddress,
      clientAddress,
      tokenAddress,
      amount,
      dueDate,
      invoiceHash,
      status,
    });

    if (
      !issuerAddress ||
      !clientAddress ||
      !tokenAddress ||
      !amount ||
      !dueDate ||
      !invoiceHash ||
      !status
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Ensure both issuer and client exist
    await prisma.user.upsert({
      where: { address: issuerAddress.toLowerCase() },
      update: { lastSignIn: new Date() },
      create: { address: issuerAddress.toLowerCase(), lastSignIn: new Date() },
    });

    await prisma.user.upsert({
      where: { address: clientAddress.toLowerCase() },
      update: { lastSignIn: new Date() },
      create: { address: clientAddress.toLowerCase(), lastSignIn: new Date() },
    });

    // Check if invoice with this hash already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceHash },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice with this hash already exists" },
        { status: 409 }
      );
    }

    // Create new invoice
    const newInvoice = await prisma.invoice.create({
      data: {
        issuerAddress: issuerAddress.toLowerCase(),
        clientAddress: clientAddress.toLowerCase(),
        tokenAddress,
        amount,
        dueDate: new Date(dueDate),
        status,
        invoiceHash,
      },
    });

    console.log("Created invoice:", newInvoice);

    return NextResponse.json({ invoice: newInvoice });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
