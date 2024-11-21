import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params
    const teamId = await Promise.resolve(params.id);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "File size must be less than 4MB" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Generate a unique filename
    const timestamp = Date.now();
    const extension = file.type.split("/")[1];
    const filename = `teams/${teamId}/profile-${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    // Update team with new image URL
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        profilePicture: blob.url,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    });

    return Response.json({ team });
  } catch (error) {
    // Simplified error handling
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "Failed to upload profile picture", details: message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
