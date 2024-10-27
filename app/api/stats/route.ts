import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAddress } from "viem";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const period = searchParams.get("period") || "last7days";

  console.log("Received request with params:", { address, period });

  if (!address) {
    console.log("Error: Address is required");
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const normalizedAddress = getAddress(address).toLowerCase();
    console.log("Normalized address:", normalizedAddress);

    const startDate = getStartDate(period);
    console.log("Start date for period:", startDate);

    // Fetch all invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { issuerAddress: normalizedAddress },
          { clientAddress: normalizedAddress },
        ],
        createdAt: { gte: startDate },
      },
      include: {
        payments: true,
      },
    });

    console.log(`Found ${invoices.length} invoices`);

    // Calculate total revenue (from paid invoices where user is the issuer)
    let totalRevenue = 0;
    for (const invoice of invoices) {
      if (invoice.paid && invoice.issuerAddress === normalizedAddress) {
        if (
          invoice.tokenAddress.toLowerCase() ===
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase()
        ) {
          // USDC
          totalRevenue += parseFloat(invoice.amount) / 1e6;
        } else if (
          invoice.tokenAddress.toLowerCase() ===
          "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase()
        ) {
          // DAI
          totalRevenue += parseFloat(invoice.amount) / 1e18;
        }
      }
    }

    // Calculate client count (where user is the issuer)
    const clientCount = new Set(
      invoices
        .filter((inv) => inv.issuerAddress === normalizedAddress)
        .map((inv) => inv.clientAddress)
    ).size;

    // Calculate contractor count (where user is the client)
    const contractorCount = new Set(
      invoices
        .filter((inv) => inv.clientAddress === normalizedAddress)
        .map((inv) => inv.issuerAddress)
    ).size;

    // Calculate active projects (unpaid invoices)
    const activeProjects = invoices.filter((inv) => !inv.paid).length;

    // Calculate total invoices
    const totalInvoices = invoices.length;

    // Calculate paid invoices
    const paidInvoices = invoices.filter((inv) => inv.paid).length;

    // Calculate unpaid invoices
    const unpaidInvoices = totalInvoices - paidInvoices;

    const result = {
      totalRevenue,
      clientCount,
      contractorCount,
      activeProjects,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
    };

    console.log("Returning stats:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "last7days":
      return new Date(now.setDate(now.getDate() - 7));
    case "last30days":
      return new Date(now.setDate(now.getDate() - 30));
    case "alltime":
    default:
      return new Date(0); // Beginning of time
  }
}
