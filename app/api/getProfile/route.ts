import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, User, Profile } from "@prisma/client";
import { createPublicClient, http, Address } from "viem";
import { mainnet } from "viem/chains";
import { verifyMessage } from "viem";

const prisma = new PrismaClient();
const DEFAULT_PROFILE_PICTURE = "/default-profile.png";

// Initialize viem public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

type UserWithProfile = User & { profile: Profile | null };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const addressOrEns = searchParams.get("addressOrEns");

  console.log("Received request for addressOrEns:", addressOrEns);

  if (!addressOrEns) {
    return NextResponse.json(
      { error: "Address or ENS name is required" },
      { status: 400 }
    );
  }

  try {
    let address: Address;
    let ensName: string | null = null;

    // Check if the input is an ENS name or an address
    if (addressOrEns.endsWith(".eth") || !addressOrEns.startsWith("0x")) {
      // It's an ENS name, resolve it to an address
      const resolvedAddress = await publicClient.getEnsAddress({
        name: addressOrEns,
      });
      if (!resolvedAddress) {
        return NextResponse.json(
          { error: "Invalid ENS name" },
          { status: 400 }
        );
      }
      address = resolvedAddress;
      ensName = addressOrEns;
    } else {
      // It's an address, check if it has an associated ENS name
      address = addressOrEns as Address;
      ensName = await publicClient.getEnsName({ address });
    }

    console.log("Resolved address:", address);
    console.log("ENS name:", ensName);

    let user: UserWithProfile | null = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      console.log("User not found, creating new user with profile");
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase(),
          ensName: ensName,
          lastSignIn: new Date(),
          profile: {
            create: {
              nickname: ensName || address,
              username: address,
              profilePicture: DEFAULT_PROFILE_PICTURE,
            },
          },
        },
        include: { profile: true },
      });
    }

    // Ensure the profile picture URL is correct
    if (user.profile && user.profile.profilePicture) {
      user.profile.profilePicture = user.profile.profilePicture.startsWith("/")
        ? user.profile.profilePicture
        : `/${user.profile.profilePicture}`;
    }

    console.log("Returning user data:", user);

    // If the user accessed with an address but has an ENS, suggest a redirect
    const suggestedRoute = ensName && addressOrEns !== ensName ? ensName : null;

    return NextResponse.json({ user, suggestedRoute });
  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch or create profile",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, signature, message } = await request.json();

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Create or update the user
    const user = await prisma.user.upsert({
      where: { address: address.toLowerCase() },
      update: { lastSignIn: new Date() },
      create: {
        address: address.toLowerCase(),
        lastSignIn: new Date(),
      },
    });

    // Fetch the user's profile if it exists
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
