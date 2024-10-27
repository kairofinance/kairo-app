import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();

const DEFAULT_PROFILE_PICTURE = "/default-profile.png";
const DEFAULT_BANNER_PICTURE = "/default-banner.png";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const address = formData.get("address") as string;
    const signature = formData.get("signature") as string;
    const message = formData.get("message") as string;
    const profilePicture = formData.get("profilePicture") as File | null;
    const bannerPicture = formData.get("bannerPicture") as File | null;

    const profileData = JSON.parse(formData.get("profileData") as string);

    console.log("Received update request for address:", address);
    console.log("Profile data to update:", profileData);

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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    if (profilePicture) {
      if (profilePicture.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "Profile picture exceeds maximum file size of 30MB" },
          { status: 400 }
        );
      }
      if (!ALLOWED_FILE_TYPES.includes(profilePicture.type)) {
        return NextResponse.json(
          { message: "Invalid file type for profile picture" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 100, compressionLevel: 0 })
        .toBuffer();

      const profilePicturePath = `/uploads/${Date.now()}_profile.png`;
      await writeFile(
        path.join(process.cwd(), "public", profilePicturePath),
        optimizedBuffer
      );
      profileData.profilePicture = profilePicturePath;
    }

    if (bannerPicture) {
      if (bannerPicture.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "Banner picture exceeds maximum file size of 30MB" },
          { status: 400 }
        );
      }
      if (!ALLOWED_FILE_TYPES.includes(bannerPicture.type)) {
        return NextResponse.json(
          { message: "Invalid file type for banner picture" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await bannerPicture.arrayBuffer());
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 100, compressionLevel: 0 })
        .toBuffer();

      const bannerPicturePath = `/uploads/${Date.now()}_banner.png`;
      await writeFile(
        path.join(process.cwd(), "public", bannerPicturePath),
        optimizedBuffer
      );
      profileData.bannerPicture = bannerPicturePath;
    }

    // Add link validation if needed
    if (profileData.link && !isValidUrl(profileData.link)) {
      console.log("Invalid link URL:", profileData.link);
      return NextResponse.json(
        { message: "Invalid link URL" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: { profile: true },
    });

    console.log("Existing user data:", user);

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase(),
          lastSignIn: new Date(),
          profile: {
            create: {
              username: address.toLowerCase(),
              profilePicture:
                profileData.profilePicture || DEFAULT_PROFILE_PICTURE,
              bannerPicture:
                profileData.bannerPicture || DEFAULT_BANNER_PICTURE,
              link: profileData.link,
              ...profileData,
            },
          },
        },
        include: { profile: true },
      });
    } else if (!user.profile) {
      user.profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: user.address,
          profilePicture: profileData.profilePicture || DEFAULT_PROFILE_PICTURE,
          bannerPicture: profileData.bannerPicture || DEFAULT_BANNER_PICTURE,
          link: profileData.link,
          ...profileData,
        },
      });
    } else {
      if (
        profileData.username &&
        profileData.username !== user.profile.username
      ) {
        const existingUser = await prisma.profile.findUnique({
          where: { username: profileData.username },
        });
        if (existingUser) {
          return NextResponse.json(
            { message: "Username is already taken" },
            { status: 400 }
          );
        }
      }

      console.log("Updating profile with data:", profileData);
      user.profile = await prisma.profile.update({
        where: { userId: user.id },
        data: {
          username: profileData.username,
          bio: profileData.bio,
          website: profileData.website,
          email: profileData.email,
          link: profileData.link,
          profilePicture: profileData.profilePicture,
          bannerPicture: profileData.bannerPicture,
        },
      });
    }

    console.log("Profile updated successfully:", user.profile);

    return NextResponse.json(
      { message: "Profile updated successfully", profile: user.profile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Detailed error updating profile:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to validate URLs
function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
