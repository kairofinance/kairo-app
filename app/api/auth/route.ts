import { NextRequest, NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import jwt from "jsonwebtoken";

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);
    const isAuthenticated = (decoded as jwt.JwtPayload).address === address;
    return NextResponse.json({ isAuthenticated });
  } catch (error) {
    return NextResponse.json(
      { isAuthenticated: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { address, signature, message } = await request.json();

  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    });

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const token = jwt.sign({ address }, JWT_SECRET as jwt.Secret, {
        expiresIn: "1d",
      });
      return NextResponse.json({ success: true, token });
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
      { status: 500 }
    );
  }
}
