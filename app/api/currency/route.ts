import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.currency) {
      throw new Error("Currency data not found in the response");
    }
    return NextResponse.json({ currency: data.currency });
  } catch (error) {
    console.error("Error fetching currency:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch currency",
        details: String(error),
        currency: "USD",
      },
      { status: 500 }
    );
  }
}
