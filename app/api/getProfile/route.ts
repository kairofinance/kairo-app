import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    console.log("Searching for user with address:", address);
    let user = await prisma.user.findUnique({
      where: { address },
      include: { profile: true },
    });

    if (!user) {
      console.log("User not found, creating new user");
      user = await prisma.user.create({
        data: {
          address,
          lastSignIn: new Date(),
          profile: {
            create: {}, // Create an empty profile
          },
        },
        include: { profile: true },
      });
      console.log("New user created:", user);
    } else {
      console.log("Existing user found:", user);
    }

    // Ensure the profile picture URL is absolute
    if (user.profile && user.profile.profilePicture) {
      user.profile.profilePicture = new URL(
        user.profile.profilePicture,
        process.env.NEXT_PUBLIC_BASE_URL
      ).toString();
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch or create profile",
        details: error.message,
        stack: error.stack,
        name: error.name,
      },
      { status: 500 }
    );
  }
}
