import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 60,
    staleWhileRevalidate: 30,
  });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.toLowerCase();
  const type = searchParams.get("type"); // "incoming" or "outgoing"
  const teamId = searchParams.get("teamId");

  if (!address) {
    return NextResponse.json(
      { error: "Address is required" },
      { status: 400, headers }
    );
  }

  try {
    // Get streams and vesting schedules
    const flows = await prisma.flow.findMany({
      where: {
        AND: [
          // Filter by address based on direction
          type === "incoming"
            ? { recipientAddress: address }
            : { senderAddress: address },
          // Filter by team if provided
          teamId ? { teamId } : {},
          // Only active flows
          { status: "ACTIVE" },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get pending invoices with team context
    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          // Filter by address based on direction
          type === "incoming"
            ? { clientAddress: address }
            : { issuerAddress: address },
          // Filter by team if provided
          teamId ? { teamId } : {},
          // Only unpaid invoices
          { paid: false },
        ],
      },
      include: {
        team: true, // Include team data if needed
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform flows and invoices to match the expected format
    const activities = [
      ...flows.map((flow) => ({
        ...flow,
        isIncoming: type === "incoming",
        counterpartyAddress:
          type === "incoming" ? flow.senderAddress : flow.recipientAddress,
      })),
      ...invoices.map((invoice) => ({
        id: invoice.id,
        type: "invoice" as const,
        amount: invoice.amount,
        tokenAddress: invoice.tokenAddress,
        status: "active",
        isIncoming: type === "incoming",
        counterpartyAddress:
          type === "incoming" ? invoice.issuerAddress : invoice.clientAddress,
        dueDate: invoice.dueDate.toISOString(),
      })),
    ];

    return NextResponse.json(
      { activities },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { activities: [] },
      {
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
