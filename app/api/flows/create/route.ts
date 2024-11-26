import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      type,
      amount,
      tokenAddress,
      senderAddress,
      recipientAddress,
      endDate,
      streamRate,
      cliffDate,
      teamId,
      transactionHash,
    } = await request.json();

    // Validate required fields
    if (
      !type ||
      !amount ||
      !tokenAddress ||
      !senderAddress ||
      !recipientAddress
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create the flow record
    const flow = await prisma.flow.create({
      data: {
        type,
        amount,
        tokenAddress,
        senderAddress: senderAddress.toLowerCase(),
        recipientAddress: recipientAddress.toLowerCase(),
        status: "ACTIVE",
        endDate: endDate ? new Date(endDate) : null,
        streamRate,
        cliffDate: cliffDate ? new Date(cliffDate) : null,
        teamId,
        creationTransactionHash: transactionHash,
      },
    });

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error creating flow:", error);
    return NextResponse.json(
      { error: "Failed to create flow" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
