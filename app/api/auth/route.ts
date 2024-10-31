import { NextRequest, NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import jwt from "jsonwebtoken";
import { getCacheHeaders } from "@/utils/cache-headers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { isAuthenticated: false, error: "No token provided" },
      { status: 401 }
    );
  }

  const headers = getCacheHeaders({
    public: false,
    maxAge: 0,
    mustRevalidate: true,
  });

  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);
    const isAuthenticated = (decoded as jwt.JwtPayload).address === address;
    return NextResponse.json(
      { isAuthenticated },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { isAuthenticated: false, error: "Invalid token" },
      {
        status: 401,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const { address, signature, message } = await request.json();

  const headers = getCacheHeaders({
    public: false,
    maxAge: 0,
    mustRevalidate: true,
  });

  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    });

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const token = jwt.sign({ address }, JWT_SECRET as jwt.Secret, {
        expiresIn: "1d",
      });
      return NextResponse.json(
        { success: true, token },
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      {
        status: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
