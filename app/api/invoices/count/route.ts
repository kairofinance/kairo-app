import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");

  if (period !== "last24hours") {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching invoice count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
