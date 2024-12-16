import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";
import { formatUnits } from "viem";
import { USDC_ADDRESS, DAI_ADDRESS } from "../../../contracts/addresses";

const prisma = new PrismaClient();

// Helper function to get token info
function getTokenInfo(tokenAddress: string) {
  const normalizedAddress = tokenAddress.toLowerCase();
  const tokenMap: { [key: string]: { symbol: string; decimals: number } } = {
    [USDC_ADDRESS[11155111].toLowerCase()]: { symbol: "USDC", decimals: 6 },
    [DAI_ADDRESS[11155111].toLowerCase()]: { symbol: "DAI", decimals: 18 },
  };

  return tokenMap[normalizedAddress] || { symbol: "Unknown", decimals: 18 };
}

// Helper function to format amount with proper decimals
function formatAmount(amount: string, tokenAddress: string) {
  const { symbol, decimals } = getTokenInfo(tokenAddress);
  const formattedAmount = formatUnits(BigInt(amount), decimals);

  // Format with appropriate decimal places
  // USDC should show 2 decimal places, DAI should show 4
  const decimalPlaces = symbol === "USDC" ? 2 : 4;
  const formatted = Number(formattedAmount).toFixed(decimalPlaces);

  return { formatted, symbol };
}

// Helper function to get human-readable descriptions
function getActivityDescription(
  type: string,
  isIncoming: boolean,
  counterpartyName: string,
  amount: string,
  symbol: string,
  streamRate?: string
): string {
  const streamRateText = streamRate
    ? `${streamRate} ${symbol}/hr`
    : `${amount} ${symbol}`;

  switch (type) {
    // Invoice activities
    case "invoice_paid":
      return isIncoming
        ? `Received ${amount} ${symbol} payment from ${counterpartyName}`
        : `Paid ${amount} ${symbol} to ${counterpartyName}`;
    case "invoice_created":
      return `Requested ${amount} ${symbol} from ${counterpartyName}`;
    case "invoice_received":
      return `${counterpartyName} requested ${amount} ${symbol}`;

    // Stream activities
    case "stream_started":
      return isIncoming
        ? `${counterpartyName} started streaming at ${streamRateText}`
        : `Started streaming at ${streamRateText} to ${counterpartyName}`;
    case "stream_paused":
      return isIncoming
        ? `${counterpartyName} paused stream of ${streamRateText}`
        : `Paused stream of ${streamRateText} to ${counterpartyName}`;
    case "stream_stopped":
      return isIncoming
        ? `${counterpartyName} stopped stream of ${streamRateText}`
        : `Stopped stream of ${streamRateText} to ${counterpartyName}`;
    case "stream_completed":
      return isIncoming
        ? `Stream from ${counterpartyName} completed (${amount} ${symbol} total)`
        : `Stream to ${counterpartyName} completed (${amount} ${symbol} total)`;

    // Vesting activities
    case "vest_started":
      return isIncoming
        ? `${counterpartyName} started vesting ${amount} ${symbol}`
        : `Started vesting ${amount} ${symbol} to ${counterpartyName}`;
    case "vest_paused":
      return isIncoming
        ? `${counterpartyName} paused vesting of ${amount} ${symbol}`
        : `Paused vesting of ${amount} ${symbol} to ${counterpartyName}`;
    case "vest_stopped":
      return isIncoming
        ? `${counterpartyName} stopped vesting of ${amount} ${symbol}`
        : `Stopped vesting of ${amount} ${symbol} to ${counterpartyName}`;
    case "vest_completed":
      return isIncoming
        ? `Vesting of ${amount} ${symbol} from ${counterpartyName} completed`
        : `Vesting of ${amount} ${symbol} to ${counterpartyName} completed`;

    default:
      console.warn(`Unhandled activity type: ${type}`);
      return `${type.replace(/_/g, " ")} - ${amount} ${symbol}`;
  }
}

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 60,
    staleWhileRevalidate: 30,
  });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.toLowerCase();
  const days = parseInt(searchParams.get("days") || "7");

  if (!address) {
    return NextResponse.json(
      { error: "Address is required" },
      { status: 400, headers }
    );
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all relevant data
    const [invoices, flows] = await Promise.all([
      // Get invoices - exclude team invoices in personal context
      prisma.invoice.findMany({
        where: {
          OR: [{ issuerAddress: address }, { clientAddress: address }],
          AND: [
            { issuedDate: { gte: startDate } },
            { teamId: null }, // Only include personal invoices
          ],
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          issuer: {
            select: {
              profile: true,
            },
          },
          client: {
            select: {
              profile: true,
            },
          },
        },
        orderBy: {
          issuedDate: "desc",
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
        include: {
          team: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Transform the data into ActivityType format
    const activities = [
      // Transform invoices with proper formatting
      ...invoices.map((invoice) => {
        const isIssuer = invoice.issuerAddress.toLowerCase() === address;
        const { formatted, symbol } = formatAmount(
          invoice.amount,
          invoice.tokenAddress
        );
        const counterpartyAddress = isIssuer
          ? invoice.clientAddress
          : invoice.issuerAddress;
        const counterpartyProfile = isIssuer
          ? invoice.client.profile
          : invoice.issuer.profile;
        const counterpartyName =
          counterpartyProfile?.username ||
          `${counterpartyAddress.slice(0, 6)}...${counterpartyAddress.slice(
            -4
          )}`;
        const type = invoice.paid
          ? "invoice_paid"
          : isIssuer
          ? "invoice_created"
          : "invoice_received";

        return {
          id: invoice.id,
          type,
          timestamp: invoice.issuedDate,
          amount: formatted,
          tokenSymbol: symbol,
          tokenAddress: invoice.tokenAddress,
          counterparty: {
            address: counterpartyAddress,
            name: counterpartyProfile?.username,
            image: counterpartyProfile?.profilePicture,
          },
          team: invoice.team,
          description: getActivityDescription(
            type,
            !isIssuer,
            counterpartyName,
            formatted,
            symbol
          ),
          isIncoming: !isIssuer,
        };
      }),

      // Transform flows with proper formatting
      ...flows.map((flow) => {
        const isIncoming = flow.recipientAddress.toLowerCase() === address;
        const { formatted, symbol } = formatAmount(
          flow.amount,
          flow.tokenAddress
        );
        const counterpartyAddress = isIncoming
          ? flow.senderAddress
          : flow.recipientAddress;
        const counterpartyName = `${counterpartyAddress.slice(
          0,
          6
        )}...${counterpartyAddress.slice(-4)}`;
        const type = `${flow.type.toLowerCase()}_${flow.status.toLowerCase()}`;

        let streamRateFormatted;
        if (flow.streamRate) {
          const { formatted: rate } = formatAmount(
            flow.streamRate,
            flow.tokenAddress
          );
          streamRateFormatted = rate;
        }

        return {
          id: flow.id,
          type,
          timestamp: flow.createdAt,
          amount: formatted,
          streamRate: streamRateFormatted,
          tokenSymbol: symbol,
          tokenAddress: flow.tokenAddress,
          counterparty: {
            address: counterpartyAddress,
          },
          team: flow.team,
          description: getActivityDescription(
            type,
            isIncoming,
            counterpartyName,
            formatted,
            symbol,
            streamRateFormatted
          ),
          isIncoming,
        };
      }),
    ];

    // Sort by timestamp in descending order
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return NextResponse.json({ activities }, { headers });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500, headers }
    );
  } finally {
    await prisma.$disconnect();
  }
}
