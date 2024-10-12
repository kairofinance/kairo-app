import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { db } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  console.log("Received GET request for address:", address);

  if (!address) {
    console.log("No address provided");
    return NextResponse.json(
      { isAuthenticated: false, error: "No address provided" },
      { status: 400 }
    );
  }

  try {
    console.log("Querying database for address:", address);
    const user = await db.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    console.log("Database query result:", user);

    return NextResponse.json({ isAuthenticated: !!user });
  } catch (error) {
    console.error("Error checking authentication:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Internal server error", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, signature, message } = await request.json();
    console.log("Received POST request with:", { address, signature, message });

    if (!address || !signature || !message) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Verifying message...");
    const isValid = await verifyMessage({
      message,
      signature,
      address,
    });
    console.log("Message verification result:", isValid);

    if (!isValid) {
      console.log("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("Upserting user in database...");
    const user = await db.user.upsert({
      where: { address: address.toLowerCase() },
      update: { lastSignIn: new Date() },
      create: { address: address.toLowerCase(), lastSignIn: new Date() },
    });
    console.log("User upserted:", user);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
