import { NextResponse } from "next/server";

const RATE_LIMIT_REQUESTS = 30;
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds in milliseconds

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const windowData = rateLimitMap.get(ip) || {
    count: 0,
    resetTime: now + RATE_LIMIT_WINDOW,
  };

  if (now > windowData.resetTime) {
    windowData.count = 1;
    windowData.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    windowData.count++;
  }

  rateLimitMap.set(ip, windowData);

  if (windowData.count > RATE_LIMIT_REQUESTS) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  return null;
}
