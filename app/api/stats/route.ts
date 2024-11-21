import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAddress } from "viem";
import { getCacheHeaders } from "@/utils/cache-headers";
import { USDC_ADDRESS, DAI_ADDRESS } from "../../../contracts/addresses";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 300,
    staleWhileRevalidate: 60,
  });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const period = searchParams.get("period") || "last7days";

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const normalizedAddress = getAddress(address).toLowerCase();
    const startDate = getStartDate(period);
    const previousStartDate = getPreviousPeriodStartDate(period);

    // Current period data
    const currentPeriodData = await getPeriodStats(
      normalizedAddress,
      startDate
    );

    // Previous period data for comparison
    const previousPeriodData = await getPeriodStats(
      normalizedAddress,
      previousStartDate,
      startDate
    );

    const result = {
      // Current period stats
      balances: currentPeriodData.balances,
      totalCreated: currentPeriodData.totalCreated,
      contactCount: currentPeriodData.contactCount,
      activeStreams: 3, // Placeholder for now

      // Previous period stats
      previousBalances: previousPeriodData.balances,
      previousTotalCreated: previousPeriodData.totalCreated,
      previousContactCount: previousPeriodData.contactCount,
      previousActiveStreams: 2, // Placeholder for now
    };

    return NextResponse.json(result, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function getPeriodStats(
  address: string,
  startDate: Date,
  endDate?: Date
) {
  const dateFilter = endDate
    ? { gte: startDate, lt: endDate }
    : { gte: startDate };

  // Get all invoices where user is issuer
  const invoices = await prisma.invoice.findMany({
    where: {
      issuerAddress: address,
      createdAt: dateFilter,
    },
    include: {
      payments: true,
    },
  });

  // Calculate balances by token
  const balances = {
    USDC: 0,
    DAI: 0,
  };

  invoices.forEach((invoice) => {
    if (invoice.paid) {
      if (
        invoice.tokenAddress.toLowerCase() ===
        USDC_ADDRESS[11155111].toLowerCase()
      ) {
        // USDC (6 decimals)
        balances.USDC += Number(invoice.amount) / 1e6;
      } else if (
        invoice.tokenAddress.toLowerCase() ===
        DAI_ADDRESS[11155111].toLowerCase()
      ) {
        // DAI (18 decimals)
        balances.DAI += Number(invoice.amount) / 1e18;
      }
    }
  });

  // Get contact count from contacts API
  const contacts = await prisma.contact.count({
    where: {
      user: {
        address: address,
      },
    },
  });

  // Count total invoices/streams created by user
  const totalCreated = await prisma.invoice.count({
    where: {
      issuerAddress: address,
      createdAt: dateFilter,
    },
  });

  return {
    balances,
    totalCreated,
    contactCount: contacts,
  };
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
      return new Date(0);
  }
}

function getPreviousPeriodStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "last7days":
      return new Date(now.setDate(now.getDate() - 14)); // Previous 7 days
    case "last30days":
      return new Date(now.setDate(now.getDate() - 60)); // Previous 30 days
    case "alltime":
    default:
      return new Date(0);
  }
}
