import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const headers = getCacheHeaders({
    public: false,
    maxAge: 0,
    mustRevalidate: true,
  });

  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { address: address.toLowerCase() },
      update: {},
      create: {
        address: address.toLowerCase(),
        lastSignIn: new Date(),
      },
    });

    return NextResponse.json(
      { user },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
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

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60,
  });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        address: address.toLowerCase(),
      },
      select: {
        address: true,
        profile: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = {
      address: user.address,
      username: user.profile?.username || null,
      pfp: user.profile?.profilePicture || null,
    };

    return NextResponse.json(response, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
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
