import { NextResponse } from "next/server";

const FALLBACK_CURRENCY = "USD";

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      headers: {
        "User-Agent": "YourAppName/1.0",
      },
    });

    if (response.status === 429) {
      console.warn(
        "Rate limit reached for currency API. Using fallback currency."
      );
      return NextResponse.json({
        currency: FALLBACK_CURRENCY,
        source: "fallback",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.currency) {
      throw new Error("Currency data not found in the response");
    }
    return NextResponse.json({ currency: data.currency, source: "api" });
  } catch (error) {
    console.error("Error fetching currency:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to fetch currency",
        details: String(error),
        currency: FALLBACK_CURRENCY,
        source: "error_fallback",
      },
      { status: 500 }
    );
  }
}
