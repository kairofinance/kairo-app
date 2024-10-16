import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { address, signature, message, ...profileData } = await request.json();

  console.log("Received update request for address:", address);
  console.log("Profile data to update:", profileData);

  try {
    // Verify the signature
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      console.error("Invalid signature for address:", address);
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Check if the user exists, if not create the user
    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase(),
          lastSignIn: new Date(),
        },
      });
    }

    // Update the profile in the database
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: { ...profileData, userId: user.id },
    });

    console.log("Profile updated successfully:", updatedProfile);

    return NextResponse.json(
      { message: "Profile updated successfully", profile: updatedProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Detailed error updating profile:", error);
    return NextResponse.json(
      {
        message: `Internal server error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
