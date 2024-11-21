import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      streamId,
      senderAddress,
      recipientAddress,
      tokenAddress,
      amount,
      startTime,
      endTime,
      creationTxHash,
    } = await request.json();

    // Validate required fields
    if (
      !streamId ||
      !senderAddress ||
      !recipientAddress ||
      !tokenAddress ||
      !amount ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create or update users if they don't exist
    await prisma.$transaction([
      prisma.user.upsert({
        where: { address: senderAddress.toLowerCase() },
        update: {},
        create: {
          address: senderAddress.toLowerCase(),
          lastSignIn: new Date(),
        },
      }),
      prisma.user.upsert({
        where: { address: recipientAddress.toLowerCase() },
        update: {},
        create: {
          address: recipientAddress.toLowerCase(),
          lastSignIn: new Date(),
        },
      }),
    ]);

    // Create the stream record
    const stream = await prisma.stream.create({
      data: {
        streamId,
        senderAddress: senderAddress.toLowerCase(),
        recipientAddress: recipientAddress.toLowerCase(),
        tokenAddress,
        amount,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creationTxHash,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ stream });
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { error: "Failed to create stream" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.toLowerCase();
  const status = searchParams.get("status");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  try {
    const streams = await prisma.stream.findMany({
      where: {
        OR: [{ senderAddress: address }, { recipientAddress: address }],
        status: status ? status : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}
