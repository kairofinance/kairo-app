import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 }
    );
  }

  // Ensure the request body is not null
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is empty" },
      { status: 400 }
    );
  }

  // Use the put method to upload the file
  const blob = await put(filename, request.body as ReadableStream<Uint8Array>, {
    access: "public",
  });

  return NextResponse.json(blob);
}
