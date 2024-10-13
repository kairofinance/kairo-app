import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// This is a mock function. Use only when USE_PLACEHOLDER_DATA is true.
const getMockStreams = (userId: string) => {
  return [
    {
      id: "1",
      name: "Salary",
      direction: "incoming",
      address: "0x1234...5678",
      token: "USDC",
      amountPerPeriod: 5000,
      period: "month",
      totalStreamed: 15000,
      isWithdrawable: true,
    },
    {
      id: "2",
      name: "Rent",
      direction: "outgoing",
      address: "0x8765...4321",
      token: "DAI",
      amountPerPeriod: 1000,
      period: "month",
      totalStreamed: 3000,
      isWithdrawable: false,
    },
    // Add more mock streams as needed
  ];
};

// Function to get actual streams from the database
const getActualStreams = async (userId: string) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        direction: true,
        address: true,
        token: true,
        amountPerPeriod: true,
        period: true,
        totalStreamed: true,
        isWithdrawable: true,
      },
    });
    return streams;
  } catch (error) {
    console.error("Error fetching streams from database:", error);
    throw error;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const usePlaceholderData = process.env.USE_PLACEHOLDER_DATA === "true";

  try {
    let streams;
    if (usePlaceholderData) {
      streams = getMockStreams(userId);
    } else {
      streams = await getActualStreams(userId);
    }

    return NextResponse.json(streams);
  } catch (error) {
    console.error("Error in GET /api/streams:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
