import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

// Create a single PrismaClient instance and reuse it
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 60,
    staleWhileRevalidate: 30,
  });

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
          { issuerAddress: address.toLowerCase() },
          { clientAddress: address.toLowerCase() },
        ],
      },
      orderBy: {
        issuedDate: "desc",
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

    const formattedInvoices = invoices.map((invoice) => ({
      ...invoice,
      paidDate: invoice.paid
        ? invoice.payments[0]?.createdAt.toISOString()
        : null,
      status: invoice.paid ? "Paid" : "Created",
    }));

    return NextResponse.json({ invoices: formattedInvoices }, { headers });
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
      creationTransactionHash,
      invoiceId,
      teamId,
    } = await request.json();

    // Validate input
    if (
      !issuerAddress ||
      !clientAddress ||
      !tokenAddress ||
      !amount ||
      !dueDate ||
      !invoiceId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create or update users first
    await prisma.$transaction([
      prisma.user.upsert({
        where: { address: issuerAddress.toLowerCase() },
        update: { lastSignIn: new Date() },
        create: {
          address: issuerAddress.toLowerCase(),
          lastSignIn: new Date(),
        },
      }),
      prisma.user.upsert({
        where: { address: clientAddress.toLowerCase() },
        update: { lastSignIn: new Date() },
        create: {
          address: clientAddress.toLowerCase(),
          lastSignIn: new Date(),
        },
      }),
    ]);

    // Create the invoice with proper data structure
    const invoice = await prisma.invoice.create({
      data: {
        invoiceId,
        issuerAddress: issuerAddress.toLowerCase(),
        clientAddress: clientAddress.toLowerCase(),
        tokenAddress,
        amount,
        dueDate: new Date(dueDate),
        issuedDate: new Date(),
        creationTransactionHash,
        paid: false,
        isPending: false,
        ...(teamId ? { teamId } : {}), // Only include teamId if it exists
      },
      include: {
        team: true,
        issuer: true,
        client: true,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      {
        error: "Failed to create invoice",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
