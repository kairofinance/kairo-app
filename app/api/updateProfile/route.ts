import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyMessage } from "ethers";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

async function uploadToVercelBlob(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { url } = await put(file.name, buffer, {
    access: "public",
  });

  return url;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const address = formData.get("address") as string;
  const profileData = JSON.parse(formData.get("profileData") as string);
  const signature = formData.get("signature") as string;
  const message = formData.get("message") as string;
  const profilePicture = formData.get("profilePicture") as File | null;

  // Verify the signature
  const recoveredAddress = verifyMessage(message, signature);
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    let profilePictureUrl = profileData.profilePicture;
    if (profilePicture) {
      // Upload the file to Vercel Blob and get its URL
      profilePictureUrl = await uploadToVercelBlob(profilePicture);
    }

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { address },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create the profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...profileData,
        profilePicture: profilePictureUrl,
      },
      create: {
        userId: user.id,
        ...profileData,
        profilePicture: profilePictureUrl,
      },
    });

    return NextResponse.json({ success: true, profilePictureUrl });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
