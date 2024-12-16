import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add proper type for stream input
interface StreamInput {
  amount: string;
  tokenAddress: string;
  senderAddress: string;
  recipientAddress: string;
  startTime: number | string;
  endTime: number | string;
}

export async function POST(request: NextRequest) {
  try {
    const { streams, creationTxHash, teamId, createdBy } = await request.json();

    // Create all streams in a single transaction
    const createdStreams = await prisma.$transaction(
      streams.flatMap((stream: StreamInput) => [
        // Outgoing flow for sender
        prisma.flow.create({
          data: {
            type: "STREAM",
            amount: stream.amount,
            tokenAddress: stream.tokenAddress,
            status: "ACTIVE",
            senderAddress: stream.senderAddress.toLowerCase(),
            recipientAddress: stream.recipientAddress.toLowerCase(),
            endDate: new Date(stream.endTime),
            teamId,
            creationTransactionHash: creationTxHash,
            isIncoming: false,
            counterpartyAddress: stream.recipientAddress.toLowerCase(),
            streamRate: (
              BigInt(stream.amount) /
              BigInt(
                (new Date(stream.endTime).getTime() -
                  new Date(stream.startTime).getTime()) /
                  3600000
              )
            ).toString(),
          },
        }),
        // Incoming flow for recipient
        prisma.flow.create({
          data: {
            type: "STREAM",
            amount: stream.amount,
            tokenAddress: stream.tokenAddress,
            status: "ACTIVE",
            senderAddress: stream.senderAddress.toLowerCase(),
            recipientAddress: stream.recipientAddress.toLowerCase(),
            endDate: new Date(stream.endTime),
            teamId,
            creationTransactionHash: creationTxHash,
            isIncoming: true,
            counterpartyAddress: stream.senderAddress.toLowerCase(),
            streamRate: (
              BigInt(stream.amount) /
              BigInt(
                (new Date(stream.endTime).getTime() -
                  new Date(stream.startTime).getTime()) /
                  3600000
              )
            ).toString(),
          },
        }),
      ])
    );

    return NextResponse.json({ streams: createdStreams });
  } catch (error) {
    console.error("Error creating streams:", error);
    return NextResponse.json(
      { error: "Failed to create streams" },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching streams
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.toLowerCase();
  const teamId = searchParams.get("teamId");
  const excludeTeams = searchParams.get("excludeTeams") === "true";

  console.log("Stream request params:", { address, teamId, excludeTeams });

  if (!address && !teamId) {
    return NextResponse.json(
      { error: "Either address or teamId is required" },
      { status: 400 }
    );
  }

  try {
    let whereClause: any = {
      AND: [{ status: "ACTIVE" }, { type: "STREAM" }],
    };

    if (teamId) {
      // Team context: Show all streams for this team
      whereClause.AND.push({ teamId });
    } else if (address) {
      // Personal context: Show streams for this address
      whereClause.AND.push({
        OR: [
          // Direct streams
          {
            OR: [{ senderAddress: address }, { recipientAddress: address }],
          },
          // Team streams where the user is the recipient
          {
            AND: [{ recipientAddress: address }, { teamId: { not: null } }],
          },
        ],
      });

      // Exclude team streams in personal view if requested
      if (excludeTeams) {
        whereClause.AND.push({ teamId: null });
      }
    }

    console.log("Query conditions:", whereClause);

    const flows = await prisma.flow.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    console.log("Found flows:", {
      count: flows.length,
      firstFlow: flows[0],
      context: teamId ? "team" : "personal",
    });

    // Transform flows to ensure consistent data structure
    const activities = flows.map((flow) => {
      const isPersonalContext = !teamId;
      const isIncoming = isPersonalContext
        ? flow.recipientAddress === address
        : false;

      // Determine the counterparty based on team context
      const counterpartyAddress = flow.team
        ? flow.team.id // If it's a team stream, use team's ID as counterparty
        : isIncoming
        ? flow.senderAddress
        : flow.recipientAddress;

      return {
        ...flow,
        isIncoming,
        type: flow.type.toLowerCase(),
        status: flow.status.toLowerCase(),
        senderAddress: flow.senderAddress.toLowerCase(),
        recipientAddress: flow.recipientAddress.toLowerCase(),
        counterpartyAddress,
        team: flow.team,
      };
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
