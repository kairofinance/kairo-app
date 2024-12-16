import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatUnits } from "viem";
import { USDC_ADDRESS, DAI_ADDRESS } from "../../../../contracts/addresses";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

// Helper function to get token info (same as in activity route)
function getTokenInfo(tokenAddress: string) {
  const normalizedAddress = tokenAddress.toLowerCase();
  const tokenMap: { [key: string]: { symbol: string; decimals: number } } = {
    [USDC_ADDRESS[11155111].toLowerCase()]: { symbol: "USDC", decimals: 6 },
    [DAI_ADDRESS[11155111].toLowerCase()]: { symbol: "DAI", decimals: 18 },
  };

  return tokenMap[normalizedAddress] || { symbol: "Unknown", decimals: 18 };
}

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 60,
    staleWhileRevalidate: 30,
  });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.toLowerCase();
  const days = parseInt(searchParams.get("days") || "30");

  if (!address) {
    return NextResponse.json(
      { error: "Address is required" },
      { status: 400, headers }
    );
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all paid invoices and active flows
    const [invoices, flows] = await Promise.all([
      // Get paid invoices - exclude team invoices in personal context
      prisma.invoice.findMany({
        where: {
          OR: [{ issuerAddress: address }, { clientAddress: address }],
          AND: [
            {
              paid: true,
              teamId: null, // Only include personal invoices
              payments: {
                some: {
                  createdAt: {
                    gte: startDate,
                  },
                },
              },
            },
          ],
        },
        include: {
          payments: {
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      }),

      // Get flows - include both personal and team flows where user is recipient
      prisma.flow.findMany({
        where: {
          OR: [
            // Personal flows
            {
              AND: [
                {
                  OR: [
                    { senderAddress: address },
                    { recipientAddress: address },
                  ],
                },
                { teamId: null },
              ],
            },
            // Team flows where user is recipient
            {
              AND: [{ recipientAddress: address }, { teamId: { not: null } }],
            },
          ],
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Create a map for daily totals
    const dailyTotals = new Map<string, { inflow: number; outflow: number }>();

    // Initialize all days in the range
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      dailyTotals.set(dateKey, { inflow: 0, outflow: 0 });
    }

    // Process paid invoices
    invoices.forEach((invoice) => {
      const { decimals } = getTokenInfo(invoice.tokenAddress);
      const amount = Number(formatUnits(BigInt(invoice.amount), decimals));

      // Use the payment date for the flow
      invoice.payments.forEach((payment) => {
        const dateKey = payment.createdAt.toISOString().split("T")[0];
        const current = dailyTotals.get(dateKey) || { inflow: 0, outflow: 0 };

        if (invoice.issuerAddress.toLowerCase() === address) {
          current.inflow += amount;
        } else {
          current.outflow += amount;
        }

        dailyTotals.set(dateKey, current);
      });
    });

    // Process flows (streams and vests)
    flows.forEach((flow) => {
      const { decimals } = getTokenInfo(flow.tokenAddress);
      const streamRatePerDay = flow.streamRate
        ? Number(formatUnits(BigInt(flow.streamRate), decimals)) * 24
        : 0;

      // Calculate daily amounts for the flow's active period
      const startDate = flow.createdAt;
      const endDate = flow.endDate || new Date();

      let currentDate = new Date(startDate);
      while (currentDate <= endDate && currentDate <= new Date()) {
        const dateKey = currentDate.toISOString().split("T")[0];
        const current = dailyTotals.get(dateKey) || { inflow: 0, outflow: 0 };

        if (flow.recipientAddress.toLowerCase() === address) {
          current.inflow += streamRatePerDay;
        } else {
          current.outflow += streamRatePerDay;
        }

        dailyTotals.set(dateKey, current);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Calculate totals
    const totalInflow = Array.from(dailyTotals.values()).reduce(
      (sum, day) => sum + day.inflow,
      0
    );
    const totalOutflow = Array.from(dailyTotals.values()).reduce(
      (sum, day) => sum + day.outflow,
      0
    );

    // Convert to array format for the graph
    const dailyData = Array.from(dailyTotals.entries())
      .map(([date, { inflow, outflow }]) => ({
        date: new Date(date),
        inflow,
        outflow,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return NextResponse.json(
      {
        dailyData,
        totals: {
          inflow: totalInflow,
          outflow: totalOutflow,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching monthly flows:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly flows" },
      { status: 500, headers }
    );
  } finally {
    await prisma.$disconnect();
  }
}
